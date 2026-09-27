// src/api/api.js
// Все запросы к Go бэкенду

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ---------- HELPERS ----------

function getToken() {
  return localStorage.getItem('bilimai_token')
}

function setToken(token) {
  localStorage.setItem('bilimai_token', token)
}

function setTokens(token, refresh) {
  localStorage.setItem('bilimai_token', token)
  if (refresh) localStorage.setItem('bilimai_refresh', refresh)
}

function clearToken() {
  localStorage.removeItem('bilimai_token')
  localStorage.removeItem('bilimai_refresh')
}

// Алиас для обратной совместимости
const clearTokens = clearToken

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = new URLSearchParams(body).toString()
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body,
  })

  // Если 401 — пробуем refresh (но не для самого логина/рефреша)
  if (res.status === 401 && path !== '/api/auth/login' && path !== '/api/refresh') {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return request(path, options)
    } else {
      clearToken()
      window.location.href = '/login'
      return null
    }
  }

  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

async function tryRefresh() {
  const refresh = localStorage.getItem('bilimai_refresh')
  if (!refresh) return false

  try {
    const res = await fetch(`${BASE}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh }).toString(),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.token, data.refresh)
    return true
  } catch {
    return false
  }
}

// ---------- AUTH ----------

export const api = {
  // Отправить код на email
  sendCode: (email) =>
    request(`/api/auth/send-code?email=${encodeURIComponent(email)}`),

  // Подтвердить код
  verifyCode: (email, code) =>
    request(`/api/auth/verify-code?email=${encodeURIComponent(email)}&code=${code}`),

  // Регистрация
  register: (email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    }),

  // Вход — сохраняет токены в localStorage автоматически
  login: async (email, password) => {
    const result = await request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (result?.ok && result.data?.token) {
      setTokens(result.data.token, result.data.refresh)
    }
    return result
  },

  // Обновить токен через refresh
  refresh: async (refreshToken) => {
    const token = refreshToken || localStorage.getItem('bilimai_refresh')
    if (!token) return { ok: false }
    const res = await fetch(`${BASE}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh: token }).toString(),
    })
    const data = await res.json()
    if (res.ok && data.token) {
      setTokens(data.token, data.refresh)
    }
    return { ok: res.ok, status: res.status, data }
  },

  // Получить текущего пользователя
  me: () => request('/api/auth/me'),

  // Выход — передаём refresh токен серверу для инвалидации
  logout: async (refreshToken) => {
    const refresh = refreshToken || localStorage.getItem('bilimai_refresh')
    if (refresh) {
      await request('/api/logout', {
        method: 'POST',
        body: { refresh },
      })
    }
    clearToken()
  },

  // ---------- PROFILE ----------

  getProfile: () => request('/api/profile'),

  updateProfile: (name, avatar = '') =>
    request('/api/profile', {
      method: 'POST',
      body: { name, avatar },
    }),

  // ---------- ТЕСТЫ ----------

  addTestResult: (subject, score, total) =>
    request('/api/tests/add', {
      method: 'POST',
      body: { subject, score: String(score), total: String(total) },
    }),

  getTestResults: () => request('/api/tests/list'),

  // ---------- СТАТИСТИКА ----------

  getStats: () => request('/api/stats'),

  // ---------- ЛИДЕРБОРД ----------

  getLeaderboard: () => request('/api/leaderboard'),

  getMyRank: () => request('/api/my-rank'),

  // ---------- ДУЭЛЬ ----------

  // Создать комнату дуэли
  createDuelRoom: (name) =>
    request('/api/duel/create', {
      method: 'POST',
      body: { name: name || '' },
    }),

  // Присоединиться к комнате дуэли
  joinDuelRoom: (code, name) =>
    request('/api/duel/join', {
      method: 'POST',
      body: { code, name: name || '' },
    }),

  // Получить статус комнаты
  getDuelRoom: (code) =>
    request(`/api/duel/room?code=${encodeURIComponent(code)}`),

  // Начать дуэль (только хост)
  startDuel: (code) =>
    request('/api/duel/start', {
      method: 'POST',
      body: { code },
    }),

  // Отправить ответ во время дуэли
  submitDuelAnswer: (code, answer) =>
    request('/api/duel/answer', {
      method: 'POST',
      body: { code, answer: String(answer) },
    }),

  // ---------- УТИЛИТЫ ----------
  // Методы которые вызывает authStore:
  getToken,
  setToken,      // authStore вызывает api.setToken(token)
  setTokens,
  clearToken,    // authStore вызывает api.clearToken()
  clearTokens,
  isLoggedIn: () => !!getToken(),
}

export default api