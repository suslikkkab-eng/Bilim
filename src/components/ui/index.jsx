import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// =================== BUTTON ===================
export function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, icon, onClick, type = 'button', disabled
}) {
  const base = 'relative inline-flex items-center justify-center gap-2 font-display font-semibold rounded-2xl transition-all duration-300 focus:outline-none select-none overflow-hidden group'

  const variants = {
    primary: 'btn-gradient text-white active:scale-95',
    secondary: 'glass border border-white/10 text-text-2 hover:text-text hover:border-accent/30 active:scale-95 hover:bg-surface-2/80',
    ghost: 'text-text-2 hover:text-text hover:bg-surface/60 active:scale-95',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 active:scale-95 shadow-glow-pink',
    success: 'bg-gradient-to-r from-accent-green to-teal-500 text-white hover:opacity-90 active:scale-95 shadow-glow-green',
    cyan: 'bg-gradient-to-r from-accent-cyan to-blue-500 text-white hover:opacity-90 active:scale-95 shadow-glow-cyan',
  }

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg',
    icon: 'p-2.5',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Shine effect */}
      {variant === 'primary' && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
        </span>
      )}
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Жүктелуде...
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  )
}

// =================== INPUT ===================
export function Input({
  label, error, icon, type = 'text', className = '',
  hint, required, ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-2">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none group-focus-within:text-accent transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`
            w-full glass-card rounded-2xl px-4 py-3 text-text placeholder:text-text-3
            focus:outline-none transition-all duration-300 text-sm
            border border-white/8 focus:border-accent/40
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-accent-red/50' : ''}
          `}
          {...props}
        />
        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-full" />
      </div>
      {error && <p className="text-xs text-accent-red mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-text-3">{hint}</p>}
    </div>
  )
}

// =================== CARD ===================
export function Card({ children, className = '', hover = false, glow = false, onClick, gradient }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -3, scale: 1.01 } : {}}
      className={`
        glass-card rounded-3xl p-6 shadow-card
        ${hover ? 'cursor-pointer' : ''}
        ${glow ? 'hover:shadow-glow-sm' : ''}
        ${gradient ? `bg-gradient-to-br ${gradient}` : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// =================== BADGE ===================
export function Badge({ children, color = 'blue', size = 'sm' }) {
  const colors = {
    blue: 'bg-accent/10 text-accent border-accent/20',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
    gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
    red: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    pink: 'bg-accent-pink/10 text-accent-pink border-accent-pink/20',
    gray: 'bg-surface text-text-2 border-border',
  }

  return (
    <span className={`
      inline-flex items-center gap-1 border rounded-full font-medium
      ${colors[color]}
      ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'}
    `}>
      {children}
    </span>
  )
}

// =================== PROGRESS BAR ===================
export function ProgressBar({ value, max = 100, color = 'blue', showLabel = false, size = 'md' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors = {
    blue: 'from-accent to-accent-purple',
    green: 'from-accent-green to-teal-400',
    orange: 'from-accent-orange to-yellow-400',
    gold: 'from-accent-gold to-amber-400',
    pink: 'from-accent-pink to-purple-500',
    cyan: 'from-accent-cyan to-blue-500',
  }
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-surface-3/60 rounded-full overflow-hidden ${heights[size]} relative`}>
        <motion.div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${colors[color]} relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
      {showLabel && <span className="text-xs text-text-2 w-8 text-right font-medium">{pct}%</span>}
    </div>
  )
}

// =================== SPINNER ===================
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} border-2 border-accent/20 border-t-accent rounded-full animate-spin ${className}`} />
  )
}

// =================== AVATAR ===================
export function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  }

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-2xl object-cover ring-2 ring-accent/30 shadow-glow-sm ${className}`}
      />
    )
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const gradients = [
    'from-accent to-accent-purple',
    'from-accent-purple to-accent-pink',
    'from-accent-green to-accent-cyan',
    'from-accent-gold to-accent-orange',
    'from-accent-cyan to-accent',
  ]
  const idx = user?.name ? user.name.charCodeAt(0) % gradients.length : 0

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        ${sizes[size]} rounded-2xl bg-gradient-to-br ${gradients[idx]}
        flex items-center justify-center font-display font-bold text-white
        ring-2 ring-accent/20 flex-shrink-0 shadow-glow-sm ${className}
      `}
    >
      {initials}
    </motion.div>
  )
}

// =================== STAT ===================
export function Stat({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'text-accent bg-accent/10 shadow-glow-sm',
    purple: 'text-accent-purple bg-accent-purple/10 shadow-glow-purple',
    green: 'text-accent-green bg-accent-green/10 shadow-glow-green',
    gold: 'text-accent-gold bg-accent-gold/10 shadow-glow-gold',
    cyan: 'text-accent-cyan bg-accent-cyan/10 shadow-glow-cyan',
    pink: 'text-accent-pink bg-accent-pink/10 shadow-glow-pink',
  }
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex items-center gap-3 p-3 glass-card rounded-2xl shadow-card"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-text-3">{label}</div>
        <div className="font-display font-bold text-text">{value}</div>
      </div>
    </motion.div>
  )
}

// =================== MODAL ===================
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${sizes[size]} glass-strong rounded-3xl shadow-2xl border border-accent/15`}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
                <h2 className="font-display font-bold text-lg text-text">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors text-text-3 hover:text-text">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
