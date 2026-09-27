// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/api'
import { SUBJECTS } from '../utils/constants'

// Строим объект progress из массива результатов бэкенда
function buildProgress(results = []) {
  const progress = {}
  SUBJECTS.forEach(s => { progress[s.id] = 0 })

  for (const r of results) {
    const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0
    if (!progress[r.subject] || pct > progress[r.subject]) {
      progress[r.subject] = pct
    }
  }
  return progress
}

// FIX: Проверяем JWT на истечение локально, без запроса к серверу
// Это предотвращает использование протухшего токена из localStorage
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp в JWT — Unix timestamp в секундах
    return Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null, // FIX: храним refresh токен для корректного logout и обновления сессии
      isLoading: false,
      error: null,

      // ---------- REGISTER ----------
      // Шаг 1: создаём аккаунт в БД
      register: async ({ name, email, password, role }) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.register(email, password)
          if (!result?.ok) {
            const msg = result?.status === 429
              ? 'Тым көп сұраныс. 5 минуттан кейін қайталаңыз'
              : result?.data?.error === 'exists'
              ? 'Бұл email тіркелген'
              : 'Тіркелу қатесі'
            set({ isLoading: false, error: msg })
            return false
          }

          // Сохраняем name/role локально для шага верификации
          localStorage.setItem('bilimai_pending', JSON.stringify({ name, role, email }))
          set({ isLoading: false })
          return true
        } catch (e) {
          set({ isLoading: false, error: 'Сервер қолжетімсіз' })
          return false
        }
      },

      // Шаг 2: отправить код на email
      sendVerificationCode: async (email) => {
        set({ isLoading: true, error: null })
        try {
          console.log(`📧 Sending verification code to: ${email}`)
          const result = await api.sendCode(email)
          console.log(`sendVerificationCode response:`, result)
          
          if (!result?.ok) {
            let msg = 'Email жіберу қатесі'
            if (result?.status === 429) {
              msg = 'Тым көп сұраныс. 5 минуттан кейін қайталаңыз'
            } else if (result?.status === 500) {
              msg = 'Email серверінде қате. Админге хабарласыңыз'
            } else if (result?.data?.error) {
              msg = result.data.error
            }
            console.error(`❌ Email send failed:`, result?.data?.error || result?.status)
            set({ isLoading: false, error: msg })
            return false
          }
          console.log(`✅ Verification code sent successfully to ${email}`)
          set({ isLoading: false })
          return true
        } catch (e) {
          console.error(`❌ Email send exception:`, e)
          set({ isLoading: false, error: 'Email жіберу жүйесі істемейді' })
          return false
        }
      },

      // Шаг 3: подтвердить код → автологин
      verifyAndLogin: async (email, code, password) => {
        set({ isLoading: true, error: null })
        try {
          // Верифицируем код
          const verifyResult = await api.verifyCode(email, code)
          if (!verifyResult?.ok) {
            const msg = verifyResult?.data?.error === 'expired'
              ? 'Код мерзімі өтті'
              : 'Қате код'
            set({ isLoading: false, error: msg })
            return false
          }

          // Логинимся — получаем токены
          const loginResult = await api.login(email, password)
          if (!loginResult?.ok) {
            set({ isLoading: false, error: 'Кіру қатесі' })
            return false
          }

          // FIX: извлекаем оба токена из ответа сервера
          const { token, refresh } = loginResult.data
          if (!token) {
            set({ isLoading: false, error: 'Сервер токен қайтармады' })
            return false
          }

          // Устанавливаем токен в api перед вызовом защищённых эндпоинтов
          api.setToken(token)

          // Восстанавливаем pending данные (name, role)
          const pending = JSON.parse(localStorage.getItem('bilimai_pending') || '{}')
          localStorage.removeItem('bilimai_pending')

          // Сохраняем профиль на бэкенд
          await api.updateProfile(pending.name || email.split('@')[0], '')

          const user = {
            email,
            name: pending.name || email.split('@')[0],
            role: pending.role || 'student',
            avatar: null,
            bio: '',
            progress: buildProgress([]),
            totalScore: 0,
            testsCompleted: 0,
            chatSessions: 0,
            createdAt: Date.now(),
          }

          set({ user, token, refreshToken: refresh || null, isLoading: false })
          return true
        } catch {
          set({ isLoading: false, error: 'Сервер қолжетімсіз' })
          return false
        }
      },

      // ---------- LOGIN ----------
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.login(email, password)

          // FIX: явно проверяем response.ok — не логиним при любой ошибке
          if (!result?.ok) {
            let msg
            if (result?.status === 429) {
              msg = 'Тым көп сұраныс. 5 минуттан кейін қайталаңыз'
            } else if (result?.status === 403 && result?.data?.error === 'not_verified') {
              // FIX: отдельно обрабатываем неверифицированный аккаунт
              msg = 'Email расталмаған. Алдымен растаңыз'
            } else {
              msg = 'Email немесе пароль қате'
            }
            set({ isLoading: false, error: msg })
            return false
          }

          // FIX: проверяем, что токен реально пришёл в ответе
          const { token, refresh } = result.data || {}
          if (!token) {
            set({ isLoading: false, error: 'Сервер токен қайтармады' })
            return false
          }

          // Устанавливаем токен ДО защищённых запросов
          api.setToken(token)

          // Грузим профиль и результаты параллельно
          const [profileResult, resultsResult, statsResult] = await Promise.all([
            api.getProfile(),
            api.getTestResults(),
            api.getStats(),
          ])

          const profile = profileResult?.data || {}
          const results = resultsResult?.data?.results || []
          const stats = statsResult?.data || {}

          const progress = buildProgress(results)
          const totalScore = Math.round(stats.avg_score || 0) * (stats.total_tests || 0)

          const user = {
            email,
            name: profile.name || email.split('@')[0],
            avatar: profile.avatar || null,
            role: 'student',
            bio: '',
            progress,
            totalScore,
            testsCompleted: stats.total_tests || 0,
            chatSessions: 0,
            createdAt: Date.now(),
          }

          // FIX: сохраняем refreshToken в стор — нужен для корректного logout
          set({ user, token, refreshToken: refresh || null, isLoading: false })
          return true
        } catch {
          set({ isLoading: false, error: 'Сервер қолжетімсіз' })
          return false
        }
      },

      // ---------- LOGOUT ----------
      logout: async () => {
        const { refreshToken } = get()
        try {
          // FIX: передаём refresh токен на сервер, чтобы он его инвалидировал в БД
          await api.logout(refreshToken)
        } catch {
          // Даже если запрос упал — всё равно очищаем локальный стейт
        } finally {
          // FIX: полностью очищаем всё — токен, юзера, refresh
          api.clearToken()
          set({ user: null, token: null, refreshToken: null, error: null })
        }
      },

      // ---------- UPDATE PROFILE ----------
      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        const updatedUser = { ...user, ...updates }
        set({ user: updatedUser })

        try {
          await api.updateProfile(
            updates.name || user.name,
            updates.avatar || user.avatar || ''
          )
        } catch {
          // локальный стейт всё равно обновлён
        }
      },

      // ---------- UPDATE PROGRESS ----------
      updateProgress: async (subject, score, total) => {
        const { user } = get()
        if (!user) return

        try {
          await api.addTestResult(subject, score, total)
        } catch {
          // ignore
        }

        const pct = total > 0 ? Math.round((score / total) * 100) : score
        const newProgress = {
          ...user.progress,
          [subject]: Math.max(user.progress?.[subject] || 0, pct),
        }

        set({
          user: {
            ...user,
            progress: newProgress,
            testsCompleted: (user.testsCompleted || 0) + 1,
            totalScore: (user.totalScore || 0) + pct,
          }
        })
      },

      // ---------- СИНХРОНИЗАЦИЯ ----------
      // Вызывается при загрузке приложения
      syncFromServer: async () => {
        const { user, token } = get()
        if (!user || !token) return

        // FIX: проверяем истечение токена ЛОКАЛЬНО перед любым запросом
        if (isTokenExpired(token)) {
          // Пробуем обновить токен через refresh
          const refreshed = await get().tryRefreshToken()
          if (!refreshed) {
            // Refresh тоже не работает — разлогиниваем
            api.clearToken()
            set({ user: null, token: null, refreshToken: null })
            return
          }
        }

        try {
          const [profileResult, resultsResult, statsResult] = await Promise.all([
            api.getProfile(),
            api.getTestResults(),
            api.getStats(),
          ])

          const profile = profileResult?.data || {}
          const results = resultsResult?.data?.results || []
          const stats = statsResult?.data || {}

          const progress = buildProgress(results)
          const totalScore = Math.round(stats.avg_score || 0) * (stats.total_tests || 0)

          set({
            user: {
              ...user,
              name: profile.name || user.name,
              avatar: profile.avatar || user.avatar,
              progress,
              totalScore,
              testsCompleted: stats.total_tests || 0,
            }
          })
        } catch {
          // Если сервер недоступен — работаем с кешем
        }
      },

      // FIX: новая функция — обновление токена через refresh
      tryRefreshToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const result = await api.refresh(refreshToken)
          if (!result?.ok || !result.data?.token) return false

          const { token: newToken, refresh: newRefresh } = result.data
          api.setToken(newToken)
          set({ token: newToken, refreshToken: newRefresh || null })
          return true
        } catch {
          return false
        }
      },

      // FIX: проверка токена при загрузке приложения
      // Возвращает true если пользователь авторизован и токен валидный
      checkAuth: () => {
        const { user, token } = get()
        if (!user || !token) return false
        if (isTokenExpired(token)) return false
        // Устанавливаем токен в api (он мог быть сброшен при перезагрузке страницы)
        api.setToken(token)
        return true
      },

      incrementChatSessions: () => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, chatSessions: (user.chatSessions || 0) + 1 } })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bilimai-auth',
      // FIX: добавляем refreshToken в persisted state — без него logout не работает после перезагрузки
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
    }
  )
)

export default useAuthStore