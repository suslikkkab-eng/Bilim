// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, GraduationCap, BookOpen, Check, Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../components/ui'
import useAuthStore from '../store/authStore'

const ROLES = [
  {
    id: 'student',
    label: 'Оқушы',
    desc: 'ЕНТ-ке дайындалатын оқушымын',
    icon: <GraduationCap size={22} />,
    activeColor: 'border-accent bg-accent/15',
  },
  {
    id: 'teacher',
    label: 'Мұғалім',
    desc: 'Оқушыларды оқытатын мұғаліммін',
    icon: <BookOpen size={22} />,
    activeColor: 'border-accent-purple bg-accent-purple/15',
  },
]

// Шаг 1: форма регистрации
function Step1({ onNext }) {
  const { register, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [showPwd, setShowPwd] = useState(false)

  const set = (field) => (e) => {
    clearError()
    setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Пароль кем дегенде 6 таңба болуы керек')
      return
    }
    clearError()
    const ok = await register(form)
    if (ok) {
      onNext(form.email, form.password)
    } else {
      toast.error('Тіркелу сәтсіз')
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-2xl">
      <h1 className="font-display font-bold text-2xl text-text mb-1">Тіркелу</h1>
      <p className="text-text-2 text-sm mb-7">Жаңа аккаунт жасаңыз</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-2">Рөліңізді таңдаңыз</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.id }))}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  form.role === r.id ? r.activeColor : 'border-border glass'
                }`}
              >
                {form.role === r.id && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
                <div className={`mb-2 ${form.role === r.id ? 'text-accent' : 'text-text-3'}`}>{r.icon}</div>
                <div className={`font-bold text-sm ${form.role === r.id ? 'text-text' : 'text-text-2'}`}>{r.label}</div>
                <div className="text-xs text-text-3 mt-0.5 leading-tight">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Аты-жөні"
          type="text"
          value={form.name}
          onChange={set('name')}
          placeholder="Аты Жөні"
          icon={<User size={16} />}
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
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
              value={form.password}
              onChange={set('password')}
              placeholder="Кем дегенде 6 таңба"
              required
              minLength={6}
              autoComplete="new-password"
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
          {form.password && (
            <div className="flex gap-1 mt-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                  form.password.length >= i * 2
                    ? form.password.length >= 8 ? 'bg-accent-green' : form.password.length >= 6 ? 'bg-accent-gold' : 'bg-accent-red'
                    : 'bg-surface-3'
                }`} />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" loading={isLoading} className="w-full mt-2" size="lg">
          Жалғастыру <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  )
}

// Шаг 2: верификация email
function Step2({ email, password: initialPassword, onSuccess, onBack }) {
  const { sendVerificationCode, verifyAndLogin, isLoading, error, clearError } = useAuthStore()
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [password, setPassword] = useState(initialPassword || '')
  const [showPwd, setShowPwd] = useState(false)

  const handleSendCode = async () => {
    setSending(true)
    const ok = await sendVerificationCode(email)
    setSending(false)
    if (ok) {
      setSent(true)
      toast.success('Код жіберілді! Поштаңызды тексеріңіз 📧')
    } else {
      toast.error('Email жіберу сәтсіз аяқталды')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    clearError()
    if (code.length !== 6) {
      toast.error('6 таңбалы код енгізіңіз')
      return
    }
    if (password.length < 6) {
      toast.error('Пароль кем дегенде 6 таңба болуы керек')
      return
    }
    const ok = await verifyAndLogin(email, code, password)
    if (ok) {
      toast.success('Тіркелу сәтті! Қош келдіңіз! 🎉')
      onSuccess()
    } else {
      toast.error('Верификация сәтсіз')
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center">
          <Shield size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-text">Email растау</h1>
          <p className="text-text-3 text-xs">{email}</p>
        </div>
      </div>

      {!sent ? (
        <div className="text-center py-4">
          <p className="text-text-2 text-sm mb-6">
            Растау кодын алу үшін email-ге жіберу керек
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleSendCode}
            loading={sending}
            className="w-full"
            size="lg"
          >
            <Mail size={16} />
            Кодты жіберу
          </Button>

          {/* FIX: кнопка "назад" вместо ссылки на /login — возвращает на шаг 1 */}
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-3 text-sm text-text-3 hover:text-text-2 transition-colors py-2 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} /> Артқа қайту
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-text-2 text-sm">
            <span className="font-semibold text-text">{email}</span> адресіне 6 таңбалы код жіберілді
          </p>

          {!initialPassword && (
            <Input
              label="Пароль"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Кем дегенде 6 таңба"
              icon={<Lock size={16} />}
              required
              autoComplete="new-password"
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-2">Код</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              className="w-full glass rounded-2xl px-4 py-4 text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all text-2xl font-display font-bold text-center tracking-[0.3em] border border-border focus:border-accent/40"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            Растау <Check size={16} />
          </Button>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className="w-full text-sm text-text-3 hover:text-accent transition-colors py-2"
          >
            {sending ? 'Жіберілуде...' : 'Кодты қайта жіберу'}
          </button>

          {/* FIX: кнопка назад тоже здесь — но НЕ ссылка на /login */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-text-3 hover:text-text-2 transition-colors py-2 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} /> Артқа қайту
          </button>
        </form>
      )}
    </div>
  )
}

// ---------- MAIN ----------
export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingPassword, setPendingPassword] = useState('')

  useEffect(() => {
    if (location.state?.step === 2 && location.state?.email) {
      setPendingEmail(location.state.email)
      setPendingPassword(location.state.password || '')
      setStep(2)
    }
  }, [location.state])

  const handleStep1Done = (email, password) => {
    setPendingEmail(email)
    setPendingPassword(password)
    setStep(2)
  }

  // FIX: возврат на шаг 1 — пользователь не теряется и не уходит на /login
  const handleBack = () => {
    setStep(1)
    setPendingEmail('')
    setPendingPassword('')
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center p-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-accent-purple/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= n ? 'bg-accent text-white' : 'bg-surface-2 text-text-3'
              }`}>
                {step > n ? <Check size={14} /> : n}
              </div>
              {n < 2 && <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${step > n ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Step1 onNext={handleStep1Done} />
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Step2
                email={pendingEmail}
                password={pendingPassword}
                onSuccess={() => navigate('/app')}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIX: ссылка "Кіру" только на шаге 1 — на шаге 2 её нет */}
        {step === 1 && (
          <p className="text-center text-text-3 text-sm mt-6">
            Аккаунт бар ма?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Кіру
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}