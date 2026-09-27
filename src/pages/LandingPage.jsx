import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Zap, ArrowRight, BookOpen, MessageSquare, BarChart3, Trophy, Sparkles, Shield, Cpu, Star, Check } from 'lucide-react'
import { Button, Badge } from '../components/ui'
import useAuthStore from '../store/authStore'

const SUBJECTS = [
  { emoji: '🔢', name: 'Математика', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', glow: 'rgba(59,130,246,0.3)' },
  { emoji: '📜', name: 'Тарих', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', glow: 'rgba(249,115,22,0.3)' },
  { emoji: '🌍', name: 'География', color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.3)' },
  { emoji: '🧬', name: 'Биология', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', glow: 'rgba(139,92,246,0.3)' },
  { emoji: '⚗️', name: 'Химия', color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20', glow: 'rgba(234,179,8,0.3)' },
  { emoji: '⚡', name: 'Физика', color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', glow: 'rgba(239,68,68,0.3)' },
  { emoji: '🇰🇿', name: 'Қазақ тілі', color: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/20', glow: 'rgba(20,184,166,0.3)' },
  { emoji: '🌐', name: 'Ағылшын', color: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-500/20', glow: 'rgba(14,165,233,0.3)' },
]

const FEATURES = [
  {
    icon: <Cpu size={24} />,
    title: 'Gemini AI Репетитор',
    desc: 'Google-дің соңғы Gemini 2.0 Flash моделі қазақша жауап береді',
    gradient: 'from-accent/20 via-accent/5 to-transparent',
    iconGrad: 'from-accent to-accent-purple',
    glow: 'shadow-glow-sm',
  },
  {
    icon: <BookOpen size={24} />,
    title: 'ЕНТ Тест жүйесі',
    desc: 'ЕНТ форматына сай тестер, нәтижелер мен кері байланыс',
    gradient: 'from-accent-purple/20 via-accent-purple/5 to-transparent',
    iconGrad: 'from-accent-purple to-accent-pink',
    glow: 'shadow-glow-purple',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Прогресс бақылау',
    desc: 'Барлық пәндер бойынша егжей-тегжейлі статистика',
    gradient: 'from-accent-green/20 via-accent-green/5 to-transparent',
    iconGrad: 'from-accent-green to-teal-400',
    glow: 'shadow-glow-green',
  },
  {
    icon: <Shield size={24} />,
    title: 'Жеке профиль',
    desc: 'Оқушы немесе мұғалім — бәріне арналған жеке кабинет',
    gradient: 'from-accent-gold/20 via-accent-gold/5 to-transparent',
    iconGrad: 'from-accent-gold to-accent-orange',
    glow: 'shadow-glow-gold',
  },
]

const STATS = [
  { value: '9+', label: 'Пән', icon: '📚' },
  { value: '500+', label: 'Тест сұрағы', icon: '✏️' },
  { value: '24/7', label: 'AI қолжетімді', icon: '🤖' },
  { value: '100%', label: 'Тегін', icon: '🎁' },
]

// SVG Book component
function SvgBook({ color1 = '#6366f1', color2 = '#8b5cf6', accent = '#c084fc', width = 52, height = 68 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book shadow */}
      <ellipse cx="26" cy="64" rx="16" ry="3" fill="rgba(0,0,0,0.3)" />
      {/* Book back cover */}
      <rect x="8" y="4" width="38" height="56" rx="3" fill={color2} opacity="0.6" />
      {/* Book spine */}
      <rect x="4" y="2" width="10" height="58" rx="3" fill={color1} />
      <rect x="4" y="2" width="10" height="58" rx="3" fill="url(#spineGrad)" />
      {/* Book front cover */}
      <rect x="10" y="2" width="38" height="58" rx="3" fill={color1} />
      <rect x="10" y="2" width="38" height="58" rx="3" fill="url(#coverGrad)" />
      {/* Pages edge */}
      <rect x="44" y="5" width="3" height="52" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Book lines decoration */}
      <rect x="17" y="16" width="24" height="2.5" rx="1.2" fill={accent} opacity="0.8" />
      <rect x="17" y="23" width="18" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="17" y="29" width="22" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="17" y="35" width="16" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="17" y="41" width="20" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Bookmark */}
      <path d="M38 2 L38 14 L34 11 L30 14 L30 2 Z" fill={accent} opacity="0.9" />
      <defs>
        <linearGradient id="spineGrad" x1="4" y1="2" x2="14" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </linearGradient>
        <linearGradient id="coverGrad" x1="10" y1="2" x2="48" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const BOOKS = [
  { color1: '#6366f1', color2: '#4f46e5', accent: '#c084fc', x: '4%',  y: '8%',  w: 48, h: 62, duration: 9,  delay: 0,   rotate: -18, glow: 'rgba(99,102,241,0.5)'  },
  { color1: '#8b5cf6', color2: '#7c3aed', accent: '#f472b6', x: '87%', y: '6%',  w: 40, h: 52, duration: 11, delay: 1.5, rotate: 14,  glow: 'rgba(139,92,246,0.5)' },
  { color1: '#22d3ee', color2: '#0891b2', accent: '#6366f1', x: '91%', y: '42%', w: 36, h: 46, duration: 8,  delay: 3,   rotate: 22,  glow: 'rgba(34,211,238,0.5)' },
  { color1: '#34d399', color2: '#059669', accent: '#22d3ee', x: '2%',  y: '52%', w: 44, h: 56, duration: 13, delay: 0.8, rotate: -10, glow: 'rgba(52,211,153,0.5)' },
  { color1: '#f472b6', color2: '#db2777', accent: '#fbbf24', x: '76%', y: '75%', w: 38, h: 50, duration: 10, delay: 2,   rotate: 16,  glow: 'rgba(244,114,182,0.5)'},
  { color1: '#fb923c', color2: '#ea580c', accent: '#fbbf24', x: '16%', y: '80%', w: 34, h: 44, duration: 7,  delay: 4,   rotate: -22, glow: 'rgba(251,146,60,0.5)' },
  { color1: '#818cf8', color2: '#6366f1', accent: '#34d399', x: '48%', y: '3%',  w: 30, h: 38, duration: 12, delay: 1,   rotate: 6,   glow: 'rgba(129,140,248,0.5)'},
  { color1: '#fbbf24', color2: '#d97706', accent: '#f472b6', x: '33%', y: '86%', w: 36, h: 46, duration: 9,  delay: 3.5, rotate: -12, glow: 'rgba(251,191,36,0.5)' },
  { color1: '#6366f1', color2: '#8b5cf6', accent: '#22d3ee', x: '63%', y: '18%', w: 32, h: 40, duration: 14, delay: 0.5, rotate: 20,  glow: 'rgba(99,102,241,0.5)' },
  { color1: '#34d399', color2: '#6366f1', accent: '#f472b6', x: '10%', y: '30%', w: 28, h: 36, duration: 11, delay: 2.5, rotate: -28, glow: 'rgba(52,211,153,0.5)' },
]

// Animated background — soft beautiful gradient
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft top glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)', filter: 'blur(40px)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating soft orbs */}
      {[
        { color: 'rgba(99,102,241,0.25)', size: 350, x: '5%',  y: '10%', duration: 14 },
        { color: 'rgba(139,92,246,0.18)', size: 280, x: '70%', y: '5%',  duration: 17 },
        { color: 'rgba(34,211,238,0.1)',  size: 220, x: '62%', y: '60%', duration: 11 },
        { color: 'rgba(217,70,239,0.12)', size: 200, x: '2%',  y: '58%', duration: 15 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: 'blur(60px)',
            left: orb.x, top: orb.y,
          }}
          animate={{ x: [0, 30, -15, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 2.5 }}
        />
      ))}

      {/* Subtle stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: i % 6 === 0 ? 2 : 1,
            height: i % 6 === 0 ? 2 : 1,
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
          }}
          animate={{ opacity: [0.05, i % 3 === 0 ? 0.7 : 0.35, 0.05] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: (i * 0.3) % 6 }}
        />
      ))}

      {/* Floating SVG books */}
      {BOOKS.map((book, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: book.x, top: book.y,
            filter: `drop-shadow(0 0 10px ${book.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`,
          }}
          initial={{ opacity: 0, rotate: book.rotate }}
          animate={{
            y: [0, -20, 8, -14, 0],
            x: [0, 5, -4, 7, 0],
            rotate: [book.rotate, book.rotate + 6, book.rotate - 4, book.rotate + 2, book.rotate],
            opacity: [0.25, 0.55, 0.35, 0.55, 0.25],
          }}
          transition={{ duration: book.duration, repeat: Infinity, ease: 'easeInOut', delay: book.delay }}
        >
          <SvgBook color1={book.color1} color2={book.color2} accent={book.accent} width={book.w} height={book.h} />
        </motion.div>
      ))}
    </div>
  )
}

// Orbiting subjects — uses CSS keyframes to avoid framer transform conflict
function OrbitingSubjects() {
  const subjects = SUBJECTS.slice(0, 6)
  const SIZE = 340
  const CENTER = SIZE / 2
  const R = 130

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <style>{`
        @keyframes orbitFloat0 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) + 6px),calc(var(--oy) - 8px))} }
        @keyframes orbitFloat1 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) - 7px),calc(var(--oy) + 5px))} }
        @keyframes orbitFloat2 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) + 8px),calc(var(--oy) + 7px))} }
        @keyframes orbitFloat3 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) - 6px),calc(var(--oy) - 6px))} }
        @keyframes orbitFloat4 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) + 9px),calc(var(--oy) + 4px))} }
        @keyframes orbitFloat5 { 0%,100%{transform:translate(var(--ox),var(--oy))} 50%{transform:translate(calc(var(--ox) - 5px),calc(var(--oy) + 9px))} }
        .orbit-pill { opacity: 0.8; transition: opacity 0.2s, transform 0.2s; }
        .orbit-pill:hover { opacity: 1 !important; }
      `}</style>

      {/* Glow ring bg */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)'
      }} />

      {/* Decorative orbit rings */}
      <motion.div className="absolute rounded-full border border-dashed border-white/8"
        style={{ inset: 0 }} animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div className="absolute rounded-full border border-accent/10"
        style={{ inset: 20 }} animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Center icon */}
      <motion.div
        className="absolute rounded-3xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center z-10"
        style={{
          width: 88, height: 88,
          top: CENTER - 44, left: CENTER - 44,
        }}
        animate={{
          boxShadow: [
            '0 0 30px rgba(99,102,241,0.5), 0 0 60px rgba(139,92,246,0.2)',
            '0 0 60px rgba(99,102,241,0.8), 0 0 100px rgba(217,70,239,0.4)',
            '0 0 30px rgba(99,102,241,0.5), 0 0 60px rgba(139,92,246,0.2)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Zap size={38} className="text-white" fill="white" />
      </motion.div>

      {/* Pills — positioned with CSS vars, animated with CSS keyframes */}
      {subjects.map((s, i) => {
        const angle = (i / subjects.length) * Math.PI * 2 - Math.PI / 2
        const ox = Math.round(Math.cos(angle) * R)
        const oy = Math.round(Math.sin(angle) * R)
        const duration = 3.5 + i * 0.6
        const delay = i * 0.5
        return (
          <div
            key={s.name}
            className="orbit-pill absolute flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-white/10 text-sm font-display font-semibold text-text-2 backdrop-blur-xl cursor-default"
            style={{
              left: CENTER,
              top: CENTER,
              '--ox': `calc(${ox}px - 50%)`,
              '--oy': `calc(${oy}px - 50%)`,
              transform: `translate(calc(${ox}px - 50%), calc(${oy}px - 50%))`,
              background: 'rgba(15,20,50,0.92)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(120,130,255,0.1)',
              whiteSpace: 'nowrap',
              animation: `orbitFloat${i} ${duration}s ease-in-out ${delay}s infinite`,
              zIndex: 5,
            }}
          >
            <span className="text-base">{s.emoji}</span>
            <span>{s.name}</span>
          </div>
        )
      })}
    </div>
  )
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

export default function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden" style={{ background: '#05070f' }}>
      {/* GLOBAL BG — fixed behind everything */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Base deep space */}
        <div className="absolute inset-0" style={{
          background: '#070b1a'
        }} />
        {/* Top purple aurora */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(79,46,220,0.28) 0%, transparent 70%)'
        }} />
        {/* Left soft glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 0% 35%, rgba(99,102,241,0.14) 0%, transparent 65%)'
        }} />
        {/* Right pink accent */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 40% at 100% 50%, rgba(168,85,247,0.1) 0%, transparent 65%)'
        }} />
        {/* Bottom subtle cyan */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 35% at 50% 100%, rgba(34,211,238,0.06) 0%, transparent 70%)'
        }} />
      </div>
      {/* HEADER - fixed at top, full width container with inner centering */}
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <motion.header
          className="w-full max-w-[1100px] pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <div className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between border border-accent/15"
          style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset' }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow-sm"
              whileHover={{ scale: 1.1, rotate: 10 }}
              animate={{ boxShadow: ['0 0 10px rgba(99,102,241,0.4)', '0 0 20px rgba(139,92,246,0.6)', '0 0 10px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Zap size={15} className="text-white" fill="white" />
            </motion.div>
            <span className="font-display font-extrabold text-gradient text-base">БілімAI</span>
            <Badge color="cyan" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Gemini 2.0
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={() => navigate('/app')} size="md">
                Дашборд <ArrowRight size={15} />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Кіру</Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Тіркелу <ArrowRight size={14} />
                </Button>
              </>
            )}
          </div>
        </div>
        </motion.header>
      </div>

      {/* HERO */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center relative overflow-hidden" style={{ zIndex: 1 }}>
        <HeroBackground />

        <motion.div
          className="max-w-5xl mx-auto relative z-10"
          style={{ y: heroY }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
            className="mb-8"
          >
            <Badge color="purple" size="md">
              <Sparkles size={12} />
              <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              ЕНТ-ке AI-мен дайындалыңыз — тегін!
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display font-extrabold leading-[1.1] tracking-tight mb-8"
            style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-text block">Қазақстанның</span>
            <motion.span
              className="block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6, #818cf8)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              ең ақылды ЕНТ
            </motion.span>
            <span className="text-text block">платформасы</span>
          </motion.h1>

          <motion.p
            className="text-lg text-text-2 max-w-xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Gemini AI репетитормен сұхбаттасыңыз, тест тапсырыңыз, прогресіңізді бақылаңыз.
            Барлығы — бір платформада, қазақ тілінде.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button size="xl" onClick={() => navigate(user ? '/app' : '/register')} className="shadow-glow-md">
              <Sparkles size={18} />
              Тегін бастау
              <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" size="xl" onClick={() => navigate('/login')}>
              Кіру
            </Button>
          </motion.div>

          {/* Orbiting subjects */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <OrbitingSubjects />
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-16 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="glass-card rounded-2xl px-6 py-4 text-center min-w-[110px] border border-white/8"
              whileHover={{ y: -6, scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-extrabold text-2xl text-gradient">{s.value}</div>
              <div className="text-sm text-text-3 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SUBJECTS */}
      <section className="py-20 px-4 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge color="blue" size="md" className="mb-4">📚 Барлық пәндер</Badge>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-4">
              9 пән бойынша дайындалыңыз
            </h2>
            <p className="text-text-2">AI репетитор мен тест сұрақтары — бәрі бір жерде</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {SUBJECTS.map((s) => (
              <motion.div
                key={s.name}
                variants={item}
                className={`glass-card rounded-3xl p-5 text-center cursor-pointer border ${s.border} bg-gradient-to-br ${s.color} relative overflow-hidden group`}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(user ? '/app/chat' : '/register')}
              >
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  style={{ background: `radial-gradient(circle at center, ${s.glow}, transparent 70%)` }}
                />
                <motion.div
                  className="text-4xl mb-3 relative z-10"
                  whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {s.emoji}
                </motion.div>
                <div className="text-sm font-display font-bold text-text relative z-10">{s.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge color="purple" size="md" className="mb-4">⚡ Мүмкіндіктер</Badge>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-4">Неге БілімAI?</h2>
            <p className="text-text-2 max-w-lg mx-auto">Жаңа технологиялар мен заманауи оқу тәжірибесі</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className={`glass-card rounded-3xl p-7 bg-gradient-to-br ${f.gradient} border border-white/8 relative overflow-hidden group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.iconGrad} flex items-center justify-center mb-5 text-white ${f.glow}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="font-display font-bold text-xl text-text mb-3">{f.title}</h3>
                <p className="text-text-2 leading-relaxed">{f.desc}</p>

                {/* Corner decoration */}
                <motion.div
                  className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Star size={40} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative" style={{ zIndex: 1 }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="glass-card rounded-3xl p-12 text-center border border-accent/20 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent-purple/5 to-accent-pink/10 pointer-events-none" />
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15), transparent 70%)' }}
            />

            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-6 relative z-10 inline-block"
            >
              🏆
            </motion.div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-text mb-5 relative z-10">
              ЕНТ-ті жоғары балмен тапсырыңыз
            </h2>
            <p className="text-text-2 mb-10 leading-relaxed relative z-10 text-lg">
              Бүгіннен бастап дайындалыңыз. БілімAI сізге барлық жолда жолдас болады.
            </p>

            {/* Features list */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 relative z-10">
              {['Тегін', 'Қазақ тілінде', 'Gemini AI'].map(f => (
                <div key={f} className="flex items-center gap-2 text-text-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <Check size={11} className="text-accent-green" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <Button
              size="xl"
              onClick={() => navigate(user ? '/app' : '/register')}
              className="relative z-10 shadow-glow-lg"
            >
              <Sparkles size={20} />
              Қазір бастау — тегін!
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ zIndex: 1 }} className="relative border-t border-white/6 py-8 px-4 text-center text-text-3 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow-sm">
            <Zap size={12} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-text-2">БілімAI</span>
        </div>
        <p>© 2025 БілімAI — Қазақстан оқушыларына арналған</p>
      </footer>
    </div>
  )
}