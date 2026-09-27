// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../components/ui'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  // FIX: редиректим на страницу, с которой нас выбросило, или на /app по умолчанию
  const from = location.state?.from?.pathname || '/app'

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await login(email, password)
    if (ok) {
      toast.success('Қош келдіңіз! 👋')
      // FIX: replace: true — чтобы нельзя было вернуться на /login кнопкой "назад"
      navigate(from, { replace: true })
    }
    // FIX: убрали toast.error здесь — ошибка уже в store.error и рендерится в UI
    // Двойное отображение ошибки (toast + блок) было запутывающим
  }

  // Demo fill
  const demoFill = () => {
    setEmail('demo@bilimai.kz')
    setPassword('demo123')
    toast('Demo аккаунтқа кіресіз', { icon: '💡' })
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center p-4">
      {/* BG glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-xl text-text-3 hover:text-text hover:bg-surface/60 transition-colors"
            title="Басты бетке"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-lg shadow-accent/30">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="font-display font-extrabold text-xl text-gradient">БілімAI</span>
        </Link>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display font-bold text-2xl text-text mb-1">Кіру</h1>
          <p className="text-text-2 text-sm mb-7">Аккаунтыңызға қайта оралыңыз</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              icon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-2">Пароль <span className="text-accent-red">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full glass rounded-2xl pl-10 pr-11 py-3 text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all text-sm border border-border focus:border-accent/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              >
                {/* FIX: показываем ссылку на верификацию если аккаунт не подтверждён */}
                {error === 'Email расталмаған. Алдымен растаңыз' ? (
                  <>
                    ⚠️ {error}{' '}
                    <Link
                      to="/register"
                      state={{ step: 2, email }}
                      className="underline font-semibold"
                    >
                      Верификацияны жалғастыру
                    </Link>
                  </>
                ) : (
                  <>⚠️ {error}</>
                )}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full mt-2"
              size="lg"
            >
              Кіру <ArrowRight size={16} />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-3">немесе</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo button */}
          <button
            type="button"
            onClick={demoFill}
            className="w-full glass rounded-2xl px-4 py-3 text-sm text-text-2 hover:text-text hover:border-accent/25 transition-all text-center border border-border"
          >
            💡 Demo аккаунт толтыру
          </button>
        </div>

        <p className="text-center text-text-3 text-sm mt-6">
          Аккаунт жоқ па?{' '}
          <Link to="/register" className="text-accent hover:text-accent/80 font-semibold transition-colors">
            Тіркелу
          </Link>
        </p>
      </motion.div>
    </div>
  )
}