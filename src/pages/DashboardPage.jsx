import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, BookOpen, BarChart3, Trophy, ArrowRight, Star, TrendingUp, Zap, Sparkles } from 'lucide-react'
import { Card, Badge, ProgressBar, Button, Stat } from '../components/ui'
import useAuthStore from '../store/authStore'
import { SUBJECTS, getLevel, ROLE_LABELS } from '../utils/constants'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const progress = user?.progress || {}
  const level = getLevel(user?.totalScore || 0)

  const topSubjects = SUBJECTS
    .map(s => ({ ...s, pct: progress[s.id] || 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Қайырлы таң' : hour < 17 ? 'Қайырлы күн' : 'Қайырлы кеш'
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'

  const quickActions = [
    {
      icon: <MessageSquare size={24} />,
      title: 'AI Репетитор',
      desc: 'Gemini AI-мен сөйлесіңіз',
      gradient: 'from-accent/20 to-accent-purple/10',
      iconGrad: 'from-accent to-accent-purple',
      glow: 'shadow-glow-sm',
      path: '/app/chat',
      badge: 'Жаңа',
      badgeColor: 'blue',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Тест тапсыру',
      desc: 'Білімді тексеріңіз',
      gradient: 'from-accent-purple/20 to-accent-pink/10',
      iconGrad: 'from-accent-purple to-accent-pink',
      glow: 'shadow-glow-purple',
      path: '/app/learn',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Прогресс',
      desc: 'Нәтижелерді қараңыз',
      gradient: 'from-accent-green/20 to-teal-500/10',
      iconGrad: 'from-accent-green to-teal-400',
      glow: 'shadow-glow-green',
      path: '/app/progress',
    },
  ]

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      variants={container} initial="hidden" animate="show"
    >
      {/* Hero welcome */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden glass-card rounded-3xl p-7 border border-accent/15">
          {/* BG gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent-purple/5 to-transparent pointer-events-none" />
          <motion.div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.8), transparent)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating emoji */}
          <motion.div
            className="absolute top-6 right-6 text-5xl hidden sm:block"
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {greetEmoji}
          </motion.div>

          <div className="relative">
            <motion.p
              className="text-text-2 text-sm mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {greeting}! 👋
            </motion.p>
            <motion.h1
              className="font-display font-extrabold text-3xl lg:text-4xl text-text mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {user?.name?.split(' ')[0]}
            </motion.h1>
            <div className="flex items-center gap-2 mb-6">
              <Badge color="blue">{ROLE_LABELS[user?.role]}</Badge>
              <span className="text-xs text-text-3">•</span>
              <motion.span
                className="text-sm font-display font-bold"
                style={{ color: level.color }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ⭐ {level.label}
              </motion.span>
              <span className="text-xs text-text-3">•</span>
              <span className="font-display font-bold text-gradient">{user?.totalScore || 0} балл</span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => navigate('/app/chat')} size="md">
                <Sparkles size={16} />
                AI Репетитор
                <ArrowRight size={14} />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/app/learn')} size="md">
                <BookOpen size={16} />
                Тест тапсыру
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Тест" value={user?.testsCompleted || 0} icon={<Trophy size={16} />} color="gold" />
        <Stat label="Чат сессия" value={user?.chatSessions || 0} icon={<MessageSquare size={16} />} color="blue" />
        <Stat label="Пән" value={SUBJECTS.length} icon={<BookOpen size={16} />} color="purple" />
        <Stat label="Деңгей" value={level.label.split(' ')[0]} icon={<Star size={16} />} color="green" />
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <h2 className="font-display font-bold text-lg text-text mb-4 flex items-center gap-2">
          <Zap size={18} className="text-accent" /> Жылдам кіру
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.title}
              onClick={() => navigate(a.path)}
              className={`glass-card rounded-3xl p-6 cursor-pointer border border-white/8 bg-gradient-to-br ${a.gradient} relative overflow-hidden group`}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {a.badge && (
                <div className="absolute top-4 right-4">
                  <Badge color={a.badgeColor} size="sm">{a.badge}</Badge>
                </div>
              )}
              <motion.div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.iconGrad} flex items-center justify-center mb-4 text-white ${a.glow}`}
                whileHover={{ scale: 1.15, rotate: 5 }}
              >
                {a.icon}
              </motion.div>
              <div className="font-display font-bold text-text mb-1">{a.title}</div>
              <div className="text-sm text-text-2 mb-4">{a.desc}</div>
              <div className="flex items-center gap-1 text-xs text-text-3 group-hover:text-accent transition-colors duration-200">
                Ашу <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight size={12} /></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Subject progress */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <BarChart3 size={18} className="text-accent-green" /> Пәндер прогресі
          </h2>
          <motion.button
            onClick={() => navigate('/app/progress')}
            className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            whileHover={{ x: 3 }}
          >
            Барлығы <ArrowRight size={14} />
          </motion.button>
        </div>
        <Card>
          <div className="space-y-5">
            {topSubjects.map((s, i) => (
              <motion.div
                key={s.id}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-xl flex-shrink-0 border border-white/10"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  {s.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-2 truncate">{s.name}</span>
                    <span className={`text-xs font-display font-bold flex-shrink-0 ml-2 ${
                      s.pct > 70 ? 'text-accent-green' : s.pct > 40 ? 'text-accent' : 'text-text-3'
                    }`}>{s.pct}%</span>
                  </div>
                  <ProgressBar value={s.pct} max={100} color={s.pct > 70 ? 'green' : s.pct > 40 ? 'blue' : 'orange'} />
                </div>
              </motion.div>
            ))}
            {topSubjects.every(s => s.pct === 0) && (
              <motion.div
                className="text-center py-8 text-text-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-4xl mb-3">🚀</div>
                <p className="text-sm">Тест тапсырып прогресіңізді бастаңыз!</p>
                <Button size="sm" className="mt-4" onClick={() => navigate('/app/learn')}>
                  Бастау <ArrowRight size={14} />
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
