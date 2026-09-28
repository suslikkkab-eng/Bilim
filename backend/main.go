package main

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
	_ "modernc.org/sqlite"
)

var db databaseAPI
var jwtSecret []byte

type databaseAPI interface {
	Exec(query string, args ...any) (sql.Result, error)
	Query(query string, args ...any) (*sql.Rows, error)
	QueryRow(query string, args ...any) *sql.Row
	Ping() error
	Close() error
}

type compatDB struct {
	*sql.DB
	useSQLite bool
}

func (d *compatDB) Exec(query string, args ...any) (sql.Result, error) {
	if d.useSQLite {
		query = rewritePlaceholders(query)
	}
	return d.DB.Exec(query, args...)
}

func (d *compatDB) Query(query string, args ...any) (*sql.Rows, error) {
	if d.useSQLite {
		query = rewritePlaceholders(query)
	}
	return d.DB.Query(query, args...)
}

func (d *compatDB) QueryRow(query string, args ...any) *sql.Row {
	if d.useSQLite {
		query = rewritePlaceholders(query)
	}
	return d.DB.QueryRow(query, args...)
}

func rewritePlaceholders(query string) string {
	re := regexp.MustCompile(`\$(\d+)`)
	return re.ReplaceAllString(query, "?")
}

type CodeData struct {
	Code      string
	ExpiresAt time.Time
	Attempts  int
}

// DuelQuestion — один вопрос дуэли (отправляется обоим игрокам одинаковым)
type DuelQuestion struct {
	Subject   string   `json:"subject"`
	Question  string   `json:"question"`
	Options   []string `json:"options"`
	Correct   int      `json:"correct"`
	TimeLimit int      `json:"timeLimit"`
}

type DuelRoom struct {
	Code        string
	Host        string // email хоста
	HostUserID  int
	HostName    string // отображаемое имя
	Guest       string // email гостя
	GuestUserID int
	GuestName   string
	CreatedAt   time.Time
	Status      string // "waiting", "active", "finished"
	Started     bool

	// Общий набор вопросов (выбирается один раз при старте)
	Questions         []DuelQuestion
	CurrentIdx        int       // индекс текущего вопроса
	QuestionStartedAt time.Time // когда начался текущий вопрос (для таймера)

	// Состояние ТЕКУЩЕГО раунда (сбрасывается каждый вопрос)
	HostAnswer    int // -1 = ещё не ответил
	GuestAnswer   int
	RoundResolved bool      // раунд завершён (оба ответили или вышло время)
	ResolvedAt    time.Time // момент завершения раунда (для паузы-показа результата)

	// Накопительное
	HostScore  int
	GuestScore int
	HostHP     int
	GuestHP    int

	Finished bool
	Winner   string // "host" | "guest" | "draw" | ""
}

const duelNumQuestions = 5
const duelRevealDelay = 3 * time.Second // пауза показа результата раунда
const duelAnswerGrace = 1 * time.Second // запас после таймера на долетающий ответ

// duelQuestionBank — банк вопросов на сервере (одинаковый источник для обоих).
var duelQuestionBank = []DuelQuestion{
	{Subject: "Математика", Question: "Мәнін табыңыз: log₂(32) + log₃(81)", Options: []string{"7", "9", "11", "13"}, Correct: 1, TimeLimit: 15},
	{Subject: "Математика", Question: "lim(x→0) sin(x)/x шегі неге тең?", Options: []string{"0", "1", "∞", "жоқ"}, Correct: 1, TimeLimit: 15},
	{Subject: "Физика", Question: "Вакуумдағы жарық жылдамдығы қанша?", Options: []string{"3×10⁸ м/с", "3×10⁶ м/с", "3×10¹⁰ м/с", "3×10⁴ м/с"}, Correct: 0, TimeLimit: 15},
	{Subject: "Тарих", Question: "Қазақстан қай жылы тәуелсіздік алды?", Options: []string{"1989", "1990", "1991", "1992"}, Correct: 2, TimeLimit: 15},
	{Subject: "Математика", Question: "∫2x dx интегралы неге тең?", Options: []string{"x² + C", "2x² + C", "x + C", "2 + C"}, Correct: 0, TimeLimit: 15},
	{Subject: "Химия", Question: "Судың химиялық формуласы қандай?", Options: []string{"CO₂", "H₂O", "O₂", "NaCl"}, Correct: 1, TimeLimit: 15},
	{Subject: "Биология", Question: "Адам ағзасында неше хромосома бар?", Options: []string{"23", "44", "46", "48"}, Correct: 2, TimeLimit: 15},
	{Subject: "Физика", Question: "Ньютонның екінші заңы: F = ?", Options: []string{"ma", "mv", "mgh", "½mv²"}, Correct: 0, TimeLimit: 15},
	{Subject: "Математика", Question: "Тік бұрышты үшбұрышта: a² + b² = ?", Options: []string{"c", "2c", "c²", "c³"}, Correct: 2, TimeLimit: 15},
	{Subject: "География", Question: "Қазақстанның астанасы қай қала?", Options: []string{"Алматы", "Астана", "Шымкент", "Қарағанды"}, Correct: 1, TimeLimit: 15},
}

var (
	codes      = make(map[string]CodeData)
	rateLimits = make(map[string][]time.Time)
	duelRooms  = make(map[string]*DuelRoom)
	mu         sync.Mutex
)

// ---------- UTILS ----------

func jsonResponse(w http.ResponseWriter, status int, data map[string]interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

var allowedOrigins = map[string]bool{
	"http://localhost:5173":            true,
	"https://suslikkkab-eng.github.io": true,
	"http://localhost:5500":            true,
	"http://127.0.0.1:5500":            true,
	"http://localhost:3000":            true,
	"http://127.0.0.1:3000":            true,
}

// loadAllowedOrigins добавляет источники из переменной окружения ALLOWED_ORIGINS
// (через запятую) — чтобы при деплое разрешить адрес задеплоенного фронтенда
// без перекомпиляции. Пример: ALLOWED_ORIGINS=https://bilim.example.com,https://www.bilim.example.com
func loadAllowedOrigins() {
	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		return
	}
	for _, o := range strings.Split(raw, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			allowedOrigins[o] = true
			log.Println("CORS: разрешён источник", o)
		}
	}
}

func corsWithOrigin(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")

	log.Println("METHOD:", r.Method, "PATH:", r.URL.Path, "ORIGIN:", origin)

	if origin == "" {
		return false
	}

	if !allowedOrigins[origin] {
		jsonResponse(w, 403, map[string]interface{}{"error": "Origin not allowed"})
		return true
	}

	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Vary", "Origin")

	if r.Method == "OPTIONS" {
		w.WriteHeader(204)
		return true
	}
	return false
}

func getIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		return strings.Split(ip, ",")[0]
	}
	return strings.Split(r.RemoteAddr, ":")[0]
}

func checkRateLimit(key string, max int, window time.Duration) bool {
	now := time.Now()
	cutoff := now.Add(-window)

	mu.Lock()
	defer mu.Unlock()

	var fresh []time.Time
	for _, t := range rateLimits[key] {
		if t.After(cutoff) {
			fresh = append(fresh, t)
		}
	}

	if len(fresh) >= max {
		return false
	}

	rateLimits[key] = append(fresh, now)
	return true
}

func generateCode() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return fmt.Sprintf("%06d", n.Int64())
}

// ---------- EMAIL ----------

func sendEmail(to, code string) error {
	from := os.Getenv("SMTP_EMAIL")
	pass := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPortStr := os.Getenv("SMTP_PORT")
	useSSL := strings.EqualFold(os.Getenv("SMTP_SSL"), "true")

	// sensible defaults (Gmail) but configurable via env
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	smtpPort := 587
	if smtpPortStr != "" {
		if p, err := strconv.Atoi(smtpPortStr); err == nil {
			smtpPort = p
		}
	}
	if smtpPort == 465 {
		useSSL = true
	}

	if from == "" || pass == "" {
		log.Printf("⚠️ SMTP credentials are not configured, skipping email send. Verification code for %s: %s\n", to, code)
		return nil
	}

	m := gomail.NewMessage()
	m.SetAddressHeader("From", from, "BiLim AI service")
	m.SetAddressHeader("Reply-To", from, "BiLim AI service")
	m.SetHeader("To", to)
	m.SetHeader("Subject", "BiLim AI service — растау код")
	m.SetBody("text/plain", fmt.Sprintf("Сәлем!\n\nBiLim AI service жүйесінен сізге растау коды жіберілді:\n\n%s\n\nЕгер бұл талапты сіз жібермеген болсаңыз, хабарламаны елемеңіз.", code))
	m.AddAlternative("text/html", fmt.Sprintf("<p>Сәлем!</p><p>BiLim AI service жүйесінен сізге растау коды жіберілді:</p><h2>%s</h2><p>Егер бұл талапты сіз жібермеген болсаңыз, хабарламаны елемеңіз.</p>", code))

	d := gomail.NewDialer(smtpHost, smtpPort, from, pass)
	d.SSL = useSSL
	d.TLSConfig = &tls.Config{ServerName: smtpHost}

	err := d.DialAndSend(m)
	if err != nil {
		log.Printf("❌ EMAIL ERROR for %s: %v\n", to, err)
		return err
	}

	log.Printf("✅ Email sent successfully to %s with code %s\n", to, code)
	return nil
}

// ---------- JWT ----------

func generateJWT(email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})
	return token.SignedString(jwtSecret)
}

func parseJWT(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		// FIX: проверяем алгоритм подписи — без этого можно подделать токен с alg=none
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid claims")
	}
	email, ok := claims["email"].(string)
	if !ok || email == "" {
		return "", fmt.Errorf("invalid email in claims")
	}
	return email, nil
}

// ---------- DB ----------

func initDB() {
	var err error
	dsn := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	useSQLite := false
	driver := "postgres"
	if dsn == "" {
		dsn = "file:./bilimai_local.db?mode=rwc&_busy_timeout=5000"
		useSQLite = true
		driver = "sqlite"
		log.Println("⚠️ DATABASE_URL not set, using local SQLite database")
	} else if strings.HasPrefix(strings.ToLower(dsn), "sqlite") || strings.HasPrefix(strings.ToLower(dsn), "file:") || strings.HasPrefix(strings.ToLower(dsn), "./") || strings.HasPrefix(strings.ToLower(dsn), ".\\") {
		useSQLite = true
		driver = "sqlite"
	}

	sqlDB, err := sql.Open(driver, dsn)
	if err != nil {
		log.Printf("⚠️ Failed to open configured DB (%s): %v. Falling back to local SQLite.\n", driver, err)
		useSQLite = true
		driver = "sqlite"
		dsn = "file:./bilimai_local.db?mode=rwc&_busy_timeout=5000"
		sqlDB, err = sql.Open(driver, dsn)
		if err != nil {
			log.Fatal(err)
		}
	}

	db = &compatDB{DB: sqlDB, useSQLite: useSQLite}
	if err := db.Ping(); err != nil {
		log.Printf("⚠️ Configured DB unavailable (%v). Falling back to local SQLite.\n", err)
		useSQLite = true
		driver = "sqlite"
		dsn = "file:./bilimai_local.db?mode=rwc&_busy_timeout=5000"
		sqlDB, err = sql.Open(driver, dsn)
		if err != nil {
			log.Fatal(err)
		}
		db = &compatDB{DB: sqlDB, useSQLite: true}
		if err := db.Ping(); err != nil {
			log.Fatal(err)
		}
	}

	if useSQLite {
		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE,
			password_hash TEXT,
			verified BOOLEAN DEFAULT FALSE
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS profiles (
			user_id INTEGER UNIQUE,
			name TEXT,
			avatar_url TEXT
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS test_results (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			subject TEXT,
			score INTEGER,
			total INTEGER,
			percent INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS refresh_tokens (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			token TEXT UNIQUE,
			expires_at TIMESTAMP
		)`); err != nil {
			log.Println("DB error:", err)
		}
	} else {
		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email TEXT UNIQUE,
			password_hash TEXT,
			verified BOOLEAN DEFAULT FALSE
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS profiles (
			user_id INTEGER UNIQUE,
			name TEXT,
			avatar_url TEXT
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS test_results (
			id SERIAL PRIMARY KEY,
			user_id INTEGER,
			subject TEXT,
			score INTEGER,
			total INTEGER,
			percent INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`); err != nil {
			log.Println("DB error:", err)
		}

		if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS refresh_tokens (
			id SERIAL PRIMARY KEY,
			user_id INTEGER,
			token TEXT UNIQUE,
			expires_at TIMESTAMP
		)`); err != nil {
			log.Println("DB error:", err)
		}
	}

	fmt.Println("Database connected")
}

func generateRefreshToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// ---------- MIDDLEWARE ----------

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if corsWithOrigin(w, r) {
			return
		}

		auth := r.Header.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			jsonResponse(w, 401, map[string]interface{}{"error": "No token"})
			return
		}

		// FIX: используем TrimPrefix вместо Replace, чтобы не срезать случайно что лишнее
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		if tokenStr == "" {
			jsonResponse(w, 401, map[string]interface{}{"error": "Empty token"})
			return
		}

		email, err := parseJWT(tokenStr)
		if err != nil {
			jsonResponse(w, 401, map[string]interface{}{"error": "Invalid token"})
			return
		}

		// FIX: проверяем, что пользователь реально существует и верифицирован в БД
		var verified bool
		err = db.QueryRow("SELECT verified FROM users WHERE email=$1", email).Scan(&verified)
		if err != nil || !verified {
			jsonResponse(w, 401, map[string]interface{}{"error": "User not found or not verified"})
			return
		}

		ctx := context.WithValue(r.Context(), contextKey("userEmail"), email)
		next(w, r.WithContext(ctx))
	}
}

// FIX: используем типизированный ключ контекста вместо строки — избегаем коллизий
type contextKey string

// ---------- AUTH ----------

func sendCodeHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	// FIX: снизили лимит с 200 до 5 — 200 было практически без ограничений
	if !checkRateLimit("send:"+ip, 5, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many requests"})
		return
	}

	email := r.URL.Query().Get("email")
	if email == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Email required"})
		return
	}

	log.Printf("📧 Sending verification code to: %s", email)

	code := generateCode()

	mu.Lock()
	codes[email] = CodeData{Code: code, ExpiresAt: time.Now().Add(10 * time.Minute)}
	mu.Unlock()

	if err := sendEmail(email, code); err != nil {
		log.Printf("❌ Failed to send email to %s: %v", email, err)
		// FIX: не фейлим регистрацию из-за ошибки SMTP — просто логируем и продолжаем
		jsonResponse(w, 200, map[string]interface{}{"status": "sent", "warning": "email_failed"})
		return
	}

	log.Printf("✅ Successfully sent verification code to %s", email)
	jsonResponse(w, 200, map[string]interface{}{"status": "sent"})
}

func verifyCodeHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("verify:"+ip, 5, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many attempts"})
		return
	}

	email := r.URL.Query().Get("email")
	code := r.URL.Query().Get("code")

	if email == "" || code == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Email and code required"})
		return
	}

	mu.Lock()
	data, exists := codes[email]
	mu.Unlock()

	// FIX: проверяем существование кода ДО проверки времени
	if !exists {
		jsonResponse(w, 400, map[string]interface{}{"error": "No code sent for this email"})
		return
	}

	if time.Now().After(data.ExpiresAt) {
		mu.Lock()
		delete(codes, email) // чистим просроченный код
		mu.Unlock()
		jsonResponse(w, 400, map[string]interface{}{"error": "expired"})
		return
	}

	if data.Code != code {
		jsonResponse(w, 400, map[string]interface{}{"error": "invalid"})
		return
	}

	// Код верный — удаляем и помечаем юзера верифицированным
	mu.Lock()
	delete(codes, email)
	mu.Unlock()

	if _, err := db.Exec("UPDATE users SET verified=true WHERE email=$1", email); err != nil {
		log.Println("DB error:", err)
		jsonResponse(w, 500, map[string]interface{}{"error": "DB error"})
		return
	}
	jsonResponse(w, 200, map[string]interface{}{"status": "verified"})
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("register:"+ip, 3, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many registrations"})
		return
	}

	email := r.FormValue("email")
	pass := r.FormValue("password")

	if email == "" || pass == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Email and password required"})
		return
	}
	if len(pass) < 6 {
		jsonResponse(w, 400, map[string]interface{}{"error": "Password too short"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "Server error"})
		return
	}

	// FIX: если email уже есть но НЕ верифицирован — разрешаем повторную регистрацию
	// (обновляем хэш пароля, verified остаётся false)
	// Если верифицирован — блокируем с ошибкой "exists"
	var existingVerified bool
	err = db.QueryRow("SELECT verified FROM users WHERE email=$1", email).Scan(&existingVerified)
	if err == nil {
		// Пользователь найден
		if existingVerified {
			// Аккаунт уже полностью зарегистрирован — блокируем
			jsonResponse(w, 400, map[string]interface{}{"error": "exists"})
			return
		}
		// Не верифицирован — обновляем пароль и даём попробовать снова
		if _, err = db.Exec("UPDATE users SET password_hash=$1 WHERE email=$2", string(hash), email); err != nil {
			jsonResponse(w, 500, map[string]interface{}{"error": "Server error"})
			return
		}
		jsonResponse(w, 200, map[string]interface{}{"status": "ok"})
		return
	}

	// Пользователя нет — создаём нового
	_, err = db.Exec("INSERT INTO users (email,password_hash,verified) VALUES ($1,$2,false)", email, string(hash))
	if err != nil {
		jsonResponse(w, 400, map[string]interface{}{"error": "exists"})
		return
	}

	jsonResponse(w, 200, map[string]interface{}{"status": "ok"})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("login:"+ip, 5, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many login attempts"})
		return
	}

	email := r.FormValue("email")
	pass := r.FormValue("password")

	if email == "" || pass == "" {
		// FIX: возвращаем 401, а не 400
		jsonResponse(w, 401, map[string]interface{}{"error": "invalid"})
		return
	}

	var hash string
	var verified bool

	err := db.QueryRow("SELECT password_hash,verified FROM users WHERE email=$1", email).Scan(&hash, &verified)
	if err != nil {
		// FIX: пользователь не найден — 401, не 400
		// Важно: НЕ раскрываем, что именно неверно (email или пароль) — это защита от перебора
		jsonResponse(w, 401, map[string]interface{}{"error": "invalid"})
		return
	}

	// FIX: сначала проверяем пароль, потом verified
	// Если сначала verified — раскрываем факт существования аккаунта
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(pass)) != nil {
		jsonResponse(w, 401, map[string]interface{}{"error": "invalid"})
		return
	}

	if !verified {
		// FIX: отдельный код ошибки для неверифицированных — фронт покажет нужное сообщение
		jsonResponse(w, 403, map[string]interface{}{"error": "not_verified"})
		return
	}

	token, err := generateJWT(email)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "Token generation failed"})
		return
	}

	var id int
	db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id)

	refresh := generateRefreshToken()
	if _, err = db.Exec(
		"INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
		id, refresh, time.Now().Add(72*24*time.Hour),
	); err != nil {
		log.Println("DB error:", err)
		jsonResponse(w, 500, map[string]interface{}{"error": "Session error"})
		return
	}

	jsonResponse(w, 200, map[string]interface{}{"token": token, "refresh": refresh})
}

// FIX: meHandler теперь обёрнут в authMiddleware (см. main)
// Сам хэндлер просто читает email из контекста — middleware уже всё проверила
func meHandler(w http.ResponseWriter, r *http.Request) {
	email := r.Context().Value(contextKey("userEmail")).(string)
	jsonResponse(w, 200, map[string]interface{}{"email": email})
}

// ---------- PROFILE ----------

func profileHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("profile:"+ip, 10, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many requests"})
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var id int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	if r.Method == "POST" {
		name := r.FormValue("name")
		avatar := r.FormValue("avatar")

		if _, err := db.Exec(`INSERT INTO profiles (user_id,name,avatar_url)
		VALUES($1,$2,$3)
		ON CONFLICT (user_id) DO UPDATE SET name=$2,avatar_url=$3`,
			id, name, avatar); err != nil {
			log.Println("DB error:", err)
		}

		jsonResponse(w, 200, map[string]interface{}{"status": "updated"})
		return
	}

	var name, avatar string
	db.QueryRow("SELECT name,avatar_url FROM profiles WHERE user_id=$1", id).Scan(&name, &avatar)

	jsonResponse(w, 200, map[string]interface{}{"name": name, "avatar": avatar})
}

// ---------- TEST RESULTS ----------

func addResultHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("tests:"+ip, 10, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many test submissions"})
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var id int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	subject := r.FormValue("subject")
	score := r.FormValue("score")
	total := r.FormValue("total")

	var scoreInt, totalInt int
	fmt.Sscanf(score, "%d", &scoreInt)
	fmt.Sscanf(total, "%d", &totalInt)

	if subject == "" || totalInt <= 0 || scoreInt < 0 {
		jsonResponse(w, 400, map[string]interface{}{"error": "invalid data"})
		return
	}

	percent := 0
	if totalInt > 0 {
		percent = (scoreInt * 100) / totalInt
	}

	if _, err := db.Exec("INSERT INTO test_results (user_id,subject,score,total,percent) VALUES ($1,$2,$3,$4,$5)",
		id, subject, scoreInt, totalInt, percent); err != nil {
		log.Println("DB error:", err)
	}

	jsonResponse(w, 200, map[string]interface{}{"status": "saved"})
}

func getResultsHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var id int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	rows, err := db.Query("SELECT subject,score,total,percent FROM test_results WHERE user_id=$1", id)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "DB error"})
		return
	}
	defer rows.Close()

	var results []map[string]interface{}

	for rows.Next() {
		var s string
		var sc, t, p int
		if err := rows.Scan(&s, &sc, &t, &p); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"subject": s,
			"score":   sc,
			"total":   t,
			"percent": p,
		})
	}

	jsonResponse(w, 200, map[string]interface{}{"results": results})
}

// ---------- STATS ----------

func statsHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var id int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	var count int
	var avg float64

	db.QueryRow("SELECT COUNT(*),COALESCE(AVG(percent),0) FROM test_results WHERE user_id=$1", id).Scan(&count, &avg)

	jsonResponse(w, 200, map[string]interface{}{
		"total_tests": count,
		"avg_score":   avg,
	})
}

// ---------- LEADERBOARD ----------

func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	rows, err := db.Query(`
SELECT u.email,
       COALESCE(p.name, '') as name,
       COALESCE(p.avatar_url, '') as avatar,
       COALESCE(AVG(t.percent), 0) as avg_score,
       COUNT(t.id) as total_tests
FROM users u
LEFT JOIN test_results t ON u.id = t.user_id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.verified = true
GROUP BY u.id, p.name, p.avatar_url
ORDER BY avg_score DESC, total_tests DESC
LIMIT 20
`)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "DB error"})
		return
	}
	defer rows.Close()

	var list []map[string]interface{}

	rank := 1

	for rows.Next() {
		var email string
		var name string
		var avatar string
		var avg float64
		var count int

		if err := rows.Scan(&email, &name, &avatar, &avg, &count); err != nil {
			continue
		}

		list = append(list, map[string]interface{}{
			"rank":        rank,
			"email":       email,
			"name":        name,
			"avatar":      avatar,
			"avg_score":   avg,
			"total_tests": count,
		})
		rank++
	}

	jsonResponse(w, 200, map[string]interface{}{
		"leaderboard": list,
	})
}

// ---------- DUEL ----------

func generateDuelRoomCode() string {
	chars := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	code := make([]byte, 6)
	for i := 0; i < 6; i++ {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		code[i] = chars[n.Int64()]
	}
	return string(code)
}

func createDuelRoomHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)
	name := strings.TrimSpace(r.FormValue("name"))
	if name == "" {
		name = "Ойыншы"
	}

	var userID int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&userID); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	code := generateDuelRoomCode()

	mu.Lock()
	duelRooms[code] = &DuelRoom{
		Code:        code,
		Host:        email,
		HostUserID:  userID,
		HostName:    name,
		CreatedAt:   time.Now(),
		Status:      "waiting",
		HostAnswer:  -1,
		GuestAnswer: -1,
		HostHP:      100,
		GuestHP:     100,
	}
	mu.Unlock()

	jsonResponse(w, 200, map[string]interface{}{
		"code": code,
	})
}

func joinDuelRoomHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)
	code := strings.ToUpper(strings.TrimSpace(r.FormValue("code")))
	name := strings.TrimSpace(r.FormValue("name"))
	if name == "" {
		name = "Ойыншы"
	}

	if code == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Room code required"})
		return
	}

	var userID int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&userID); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "user not found"})
		return
	}

	mu.Lock()
	room, exists := duelRooms[code]
	if !exists {
		mu.Unlock()
		jsonResponse(w, 404, map[string]interface{}{"error": "Room not found"})
		return
	}

	// Повторный вход того же игрока (например, переподключение) — не считаем "комната занята"
	if room.Guest != "" && room.Guest != email {
		mu.Unlock()
		jsonResponse(w, 400, map[string]interface{}{"error": "Room is full"})
		return
	}
	if email == room.Host {
		mu.Unlock()
		jsonResponse(w, 400, map[string]interface{}{"error": "You are the host"})
		return
	}

	room.Guest = email
	room.GuestUserID = userID
	room.GuestName = name
	mu.Unlock()

	jsonResponse(w, 200, map[string]interface{}{
		"status": "joined",
	})
}

func getDuelRoomHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)
	code := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("code")))
	if code == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Room code required"})
		return
	}

	mu.Lock()
	room, exists := duelRooms[code]
	if !exists {
		mu.Unlock()
		jsonResponse(w, 404, map[string]interface{}{"error": "Room not found"})
		return
	}

	if email != room.Host && email != room.Guest {
		mu.Unlock()
		jsonResponse(w, 403, map[string]interface{}{"error": "Not in room"})
		return
	}

	// Сервер продвигает состояние дуэли (резолв раунда / переход / финал)
	tickDuel(room)
	resp := duelStateResponse(room)
	mu.Unlock()

	jsonResponse(w, 200, resp)
}

// tickDuel продвигает состояние комнаты. Вызывать ТОЛЬКО под mu.Lock().
func tickDuel(room *DuelRoom) {
	if !room.Started || room.Finished {
		return
	}
	if room.CurrentIdx >= len(room.Questions) {
		finishDuel(room)
		return
	}

	q := room.Questions[room.CurrentIdx]

	if !room.RoundResolved {
		bothAnswered := room.HostAnswer != -1 && room.GuestAnswer != -1
		timedOut := time.Since(room.QuestionStartedAt) >= time.Duration(q.TimeLimit)*time.Second+duelAnswerGrace
		if bothAnswered || timedOut {
			hostCorrect := room.HostAnswer == q.Correct
			guestCorrect := room.GuestAnswer == q.Correct
			if hostCorrect {
				room.HostScore++
			}
			if guestCorrect {
				room.GuestScore++
			}
			if hostCorrect && !guestCorrect {
				room.GuestHP -= 25
			} else if guestCorrect && !hostCorrect {
				room.HostHP -= 25
			}
			if room.HostHP < 0 {
				room.HostHP = 0
			}
			if room.GuestHP < 0 {
				room.GuestHP = 0
			}
			room.RoundResolved = true
			room.ResolvedAt = time.Now()
		}
		return
	}

	// Раунд завершён — ждём паузы показа результата, затем переходим дальше
	if time.Since(room.ResolvedAt) >= duelRevealDelay {
		isLast := room.CurrentIdx >= len(room.Questions)-1
		someoneDead := room.HostHP <= 0 || room.GuestHP <= 0
		if isLast || someoneDead {
			finishDuel(room)
		} else {
			room.CurrentIdx++
			room.HostAnswer = -1
			room.GuestAnswer = -1
			room.RoundResolved = false
			room.QuestionStartedAt = time.Now()
		}
	}
}

func finishDuel(room *DuelRoom) {
	room.Finished = true
	room.Status = "finished"
	switch {
	case room.HostHP > room.GuestHP:
		room.Winner = "host"
	case room.GuestHP > room.HostHP:
		room.Winner = "guest"
	case room.HostScore > room.GuestScore:
		room.Winner = "host"
	case room.GuestScore > room.HostScore:
		room.Winner = "guest"
	default:
		room.Winner = "draw"
	}
}

// duelStateResponse строит полное состояние. Вызывать ТОЛЬКО под mu.Lock().
func duelStateResponse(room *DuelRoom) map[string]interface{} {
	timeLeft := 0
	if room.Started && !room.Finished && !room.RoundResolved && room.CurrentIdx < len(room.Questions) {
		q := room.Questions[room.CurrentIdx]
		tl := q.TimeLimit - int(time.Since(room.QuestionStartedAt).Seconds())
		if tl < 0 {
			tl = 0
		}
		timeLeft = tl
	}

	return map[string]interface{}{
		"code":          room.Code,
		"host":          room.Host,
		"guest":         room.Guest,
		"hostName":      room.HostName,
		"guestName":     room.GuestName,
		"status":        room.Status,
		"started":       room.Started,
		"finished":      room.Finished,
		"winner":        room.Winner,
		"questions":     room.Questions,
		"currentIndex":  room.CurrentIdx,
		"timeLeft":      timeLeft,
		"roundResolved": room.RoundResolved,
		"hostAnswer":    room.HostAnswer,
		"guestAnswer":   room.GuestAnswer,
		"hostScore":     room.HostScore,
		"guestScore":    room.GuestScore,
		"hostHP":        room.HostHP,
		"guestHP":       room.GuestHP,
	}
}

func startDuelHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)
	code := r.FormValue("code")

	if code == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Room code required"})
		return
	}

	mu.Lock()
	room, exists := duelRooms[code]
	if !exists {
		mu.Unlock()
		jsonResponse(w, 404, map[string]interface{}{"error": "Room not found"})
		return
	}

	if room.Host != email {
		mu.Unlock()
		jsonResponse(w, 403, map[string]interface{}{"error": "Only host can start"})
		return
	}

	if room.Guest == "" {
		mu.Unlock()
		jsonResponse(w, 400, map[string]interface{}{"error": "Guest has not joined"})
		return
	}

	if room.Started {
		mu.Unlock()
		jsonResponse(w, 200, map[string]interface{}{"status": "started"})
		return
	}

	// Выбираем ОБЩИЙ набор вопросов один раз — оба игрока получат идентичные
	room.Questions = pickDuelQuestions(duelNumQuestions)
	room.CurrentIdx = 0
	room.QuestionStartedAt = time.Now()
	room.HostAnswer = -1
	room.GuestAnswer = -1
	room.RoundResolved = false
	room.HostScore = 0
	room.GuestScore = 0
	room.HostHP = 100
	room.GuestHP = 100
	room.Finished = false
	room.Winner = ""
	room.Status = "active"
	room.Started = true
	mu.Unlock()

	jsonResponse(w, 200, map[string]interface{}{
		"status": "started",
	})
}

// duelCleanupLoop периодически удаляет завершённые/застарелые комнаты из памяти.
func duelCleanupLoop() {
	ticker := time.NewTicker(2 * time.Minute)
	for range ticker.C {
		now := time.Now()
		mu.Lock()
		for code, room := range duelRooms {
			old := now.Sub(room.CreatedAt) > 2*time.Hour
			finishedOld := room.Finished && now.Sub(room.ResolvedAt) > 5*time.Minute
			if old || finishedOld {
				delete(duelRooms, code)
			}
		}
		mu.Unlock()
	}
}

// pickDuelQuestions возвращает n случайных вопросов из банка (перемешанных).
func pickDuelQuestions(n int) []DuelQuestion {
	pool := make([]DuelQuestion, len(duelQuestionBank))
	copy(pool, duelQuestionBank)
	// Fisher–Yates на crypto/rand
	for i := len(pool) - 1; i > 0; i-- {
		jBig, _ := rand.Int(rand.Reader, big.NewInt(int64(i+1)))
		j := int(jBig.Int64())
		pool[i], pool[j] = pool[j], pool[i]
	}
	if n > len(pool) {
		n = len(pool)
	}
	return pool[:n]
}

func submitDuelAnswerHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)
	code := strings.ToUpper(strings.TrimSpace(r.FormValue("code")))
	answerStr := r.FormValue("answer")

	if code == "" || answerStr == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "code and answer required"})
		return
	}

	var answer int
	fmt.Sscanf(answerStr, "%d", &answer)

	mu.Lock()
	room, exists := duelRooms[code]
	if !exists {
		mu.Unlock()
		jsonResponse(w, 404, map[string]interface{}{"error": "Room not found"})
		return
	}

	if email != room.Host && email != room.Guest {
		mu.Unlock()
		jsonResponse(w, 403, map[string]interface{}{"error": "Not in room"})
		return
	}

	// Принимаем ответ только в активном незавершённом раунде
	if room.Started && !room.Finished && !room.RoundResolved {
		if email == room.Host && room.HostAnswer == -1 {
			room.HostAnswer = answer
		} else if email == room.Guest && room.GuestAnswer == -1 {
			room.GuestAnswer = answer
		}
		// Сразу пробуем закрыть раунд (если оба ответили)
		tickDuel(room)
	}

	resp := duelStateResponse(room)
	mu.Unlock()

	jsonResponse(w, 200, resp)
}

// ---------- REFRESH / LOGOUT ----------

func refreshHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	ip := getIP(r)
	if !checkRateLimit("refresh:"+ip, 10, 5*time.Minute) {
		jsonResponse(w, 429, map[string]interface{}{"error": "Too many requests"})
		return
	}

	refresh := r.FormValue("refresh")
	if refresh == "" {
		jsonResponse(w, 400, map[string]interface{}{"error": "Refresh token required"})
		return
	}

	var userID int
	err := db.QueryRow(
		"SELECT user_id FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()",
		refresh,
	).Scan(&userID)

	if err != nil {
		jsonResponse(w, 401, map[string]interface{}{"error": "invalid refresh"})
		return
	}

	_, err = db.Exec("DELETE FROM refresh_tokens WHERE token=$1", refresh)
	if err != nil {
		log.Println("DB error:", err)
	}

	newRefresh := generateRefreshToken()

	_, err = db.Exec(
		"INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
		userID, newRefresh, time.Now().Add(72*time.Hour),
	)
	if err != nil {
		log.Println("DB error:", err)
		jsonResponse(w, 500, map[string]interface{}{"error": "Session error"})
		return
	}

	var email string
	db.QueryRow("SELECT email FROM users WHERE id=$1", userID).Scan(&email)

	newToken, err := generateJWT(email)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "Token generation failed"})
		return
	}

	jsonResponse(w, 200, map[string]interface{}{
		"token":   newToken,
		"refresh": newRefresh,
	})
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var userID int
	if err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&userID); err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "User not found"})
		return
	}

	refresh := r.FormValue("refresh")

	if refresh != "" {
		// Удаляем конкретный refresh токен
		if _, err := db.Exec("DELETE FROM refresh_tokens WHERE token=$1 AND user_id=$2", refresh, userID); err != nil {
			log.Println("DB error:", err)
		}
	} else {
		// FIX: если refresh не передан — удаляем ВСЕ сессии пользователя
		// Это гарантирует logout даже если клиент не передал токен
		if _, err := db.Exec("DELETE FROM refresh_tokens WHERE user_id=$1", userID); err != nil {
			log.Println("DB error:", err)
		}
	}

	jsonResponse(w, 200, map[string]interface{}{
		"status": "logged out",
	})
}

// ---------- MY RANK ----------

func myRankHandler(w http.ResponseWriter, r *http.Request) {
	if corsWithOrigin(w, r) {
		return
	}

	email := r.Context().Value(contextKey("userEmail")).(string)

	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&userID)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "User not found"})
		return
	}

	row := db.QueryRow(`
SELECT rank FROM (
	SELECT u.id,
	       RANK() OVER (ORDER BY COALESCE(AVG(t.percent),0) DESC, COUNT(t.id) DESC) as rank
	FROM users u
	LEFT JOIN test_results t ON u.id = t.user_id
	WHERE u.verified = true
	GROUP BY u.id
) ranked
WHERE id = $1
`, userID)

	var rank int
	err = row.Scan(&rank)
	if err != nil {
		jsonResponse(w, 500, map[string]interface{}{"error": "Rank not found"})
		return
	}

	jsonResponse(w, 200, map[string]interface{}{
		"rank": rank,
	})
}

// ---------- MAIN ----------

func main() {
	godotenv.Load()

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "bilimai-local-dev-secret-change-me"
		log.Println("⚠️ JWT_SECRET not set, using local fallback secret")
	}
	jwtSecret = []byte(secret)

	loadAllowedOrigins()

	initDB()

	go duelCleanupLoop()

	http.HandleFunc("/api/auth/send-code", sendCodeHandler)
	http.HandleFunc("/api/auth/verify-code", verifyCodeHandler)
	http.HandleFunc("/api/auth/register", registerHandler)
	http.HandleFunc("/api/auth/login", loginHandler)
	// FIX: /api/auth/me теперь обёрнут в authMiddleware — без валидного токена вернёт 401
	http.HandleFunc("/api/auth/me", authMiddleware(meHandler))

	http.HandleFunc("/api/profile", authMiddleware(profileHandler))

	http.HandleFunc("/api/tests/add", authMiddleware(addResultHandler))
	http.HandleFunc("/api/tests/list", authMiddleware(getResultsHandler))

	http.HandleFunc("/api/stats", authMiddleware(statsHandler))
	http.HandleFunc("/api/leaderboard", authMiddleware(leaderboardHandler))
	http.HandleFunc("/api/my-rank", authMiddleware(myRankHandler))
	http.HandleFunc("/api/refresh", refreshHandler)
	http.HandleFunc("/api/logout", authMiddleware(logoutHandler))

	// Duel endpoints
	http.HandleFunc("/api/duel/create", authMiddleware(createDuelRoomHandler))
	http.HandleFunc("/api/duel/join", authMiddleware(joinDuelRoomHandler))
	http.HandleFunc("/api/duel/room", authMiddleware(getDuelRoomHandler))
	http.HandleFunc("/api/duel/start", authMiddleware(startDuelHandler))
	http.HandleFunc("/api/duel/answer", authMiddleware(submitDuelAnswerHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Server running on", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("Server error:", err)
	}
}
