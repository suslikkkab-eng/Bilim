import { useState, useEffect } from 'react'
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, BookOpen, BarChart3,
  User, LogOut, Menu, X, Zap, ChevronRight, Sparkles, Bookmark, Trophy, Swords
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { Avatar, Badge } from '../ui'
import { ROLE_LABELS } from '../../utils/constants'

const navItems = [
  { to: '/app', icon: Home, label: 'Басты бет', end: true, color: 'accent' },
  { to: '/app/chat', icon: MessageSquare, label: 'AI Репетитор', end: false, color: 'accent-purple' },
  { to: '/app/learn', icon: BookOpen, label: 'Оқу', end: false, color: 'accent-cyan' },
  { to: '/app/progress', icon: BarChart3, label: 'Прогресс', end: false, color: 'accent-green' },
  { to: '/app/bookmarks', icon: Bookmark, label: 'Сақталғандар', end: false, color: 'accent-gold' },
  { to: '/app/leaderboard', icon: Trophy, label: 'Лидер кестесі', end: false, color: 'accent-gold' },
  { to: '/app/duel', icon: Swords, label: 'Дуэль', end: false, color: 'accent-purple' },
  { to: '/app/profile', icon: User, label: 'Профиль', end: false, color: 'accent' },
]

const colorMap = {
  accent: 'text-accent bg-accent/15 shadow-glow-sm',
  'accent-purple': 'text-accent-purple bg-accent-purple/15 shadow-glow-purple',
  'accent-cyan': 'text-accent-cyan bg-accent-cyan/15 shadow-glow-cyan',
  'accent-green': 'text-accent-green bg-accent-green/15 shadow-glow-green',
  'accent-gold': 'text-accent-gold bg-accent-gold/15 shadow-glow-gold',
}

// Floating particles background
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-10px',
          }}
          animate={{
            y: [0, -window.innerHeight - 50],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    setSidebarOpen(false)
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10 flex-shrink-0">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative">
            <motion.div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow-sm"
              animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.4)', '0 0 30px rgba(139,92,246,0.6)', '0 0 15px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap size={18} className="text-white" fill="white" />
            </motion.div>
            {/* Orbit dot */}
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-accent-pink"
              style={{ top: -2, right: -2 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <div className="font-display font-extrabold text-gradient text-base">БілімAI</div>
            <div className="text-xs text-text-3">ЕНТ платформасы</div>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end, color }, i) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}>
            {({ isActive }) => (
              <motion.div
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium
                  transition-all duration-200 group cursor-pointer relative overflow-hidden
                  ${isActive
                    ? 'glass-card border border-accent/20 text-text'
                    : 'text-text-2 hover:text-text hover:bg-surface/60'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-purple/5 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? colorMap[color] : 'text-text-3 group-hover:text-text-2 group-hover:bg-surface'}`}>
                  <Icon size={16} />
                </div>
                <span className="relative">{label}</span>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-auto"
                  >
                    <ChevronRight size={14} className="text-accent/60" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}

        {/* AI badge */}
        <div className="pt-4 pb-2">
          <motion.div
            className="mx-1 p-3 rounded-2xl border border-accent-purple/20 bg-accent-purple/5 relative overflow-hidden"
            animate={{ borderColor: ['rgba(139,92,246,0.2)', 'rgba(217,70,239,0.3)', 'rgba(139,92,246,0.2)'] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-purple/10 rounded-full blur-xl" />
            <div className="relative flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-accent-purple" />
              <span className="text-xs font-display font-bold text-accent-purple">Gemini AI</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            </div>
            <p className="text-xs text-text-3">Онлайн және дайын</p>
          </motion.div>
        </div>
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <motion.div
          className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-surface/60 transition-colors cursor-pointer group"
          whileHover={{ scale: 1.01 }}
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text truncate">{user?.name}</div>
            <div className="text-xs text-text-3 truncate">{ROLE_LABELS[user?.role]}</div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-xl text-text-3 hover:text-accent-red hover:bg-accent-red/10 transition-colors"
            title="Шығу"
          >
            <LogOut size={15} />
          </motion.button>
        </motion.div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-bg grid-bg">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
      </div>

      {/* SIDEBAR — desktop */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass-strong border-r border-white/10 z-20">
        <SidebarContent />
      </aside>

      {/* MOBILE sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-30 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={{ duration: 0.12 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-white/10 z-40 flex flex-col lg:hidden"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300, pointerEvents: 'none' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280, duration: 0.14 }}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  onClick={() => setSidebarOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-surface text-text-3 hover:text-text transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 glass-strong border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl hover:bg-surface/60 text-text-2 transition-colors"
          >
            <Menu size={20} />
          </motion.button>
          <div className="flex items-center gap-2 flex-1">
            <motion.div
              className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow-sm"
              animate={{ boxShadow: ['0 0 10px rgba(99,102,241,0.4)', '0 0 20px rgba(139,92,246,0.6)', '0 0 10px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Zap size={13} className="text-white" fill="white" />
            </motion.div>
            <span className="font-display font-extrabold text-gradient text-sm">БілімAI</span>
          </div>
          <Avatar user={user} size="sm" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}