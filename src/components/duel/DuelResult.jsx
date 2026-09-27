// src/components/duel/DuelResult.jsx
import { motion } from 'framer-motion'
import { Trophy, RefreshCw, Home, Star, Zap } from 'lucide-react'
import useDuelStore from '../../store/duelStore'
import { useNavigate } from 'react-router-dom'

export default function DuelResult() {
  const { duelWinner, playerName, opponentName, playerScore, opponentScore, playerHP, opponentHP, resetDuel } = useDuelStore()
  const navigate = useNavigate()

  const isWin = duelWinner === 'player'
  const isDraw = duelWinner === null

  const primaryColor = isWin ? '#f59e0b' : isDraw ? '#6366f1' : '#6b7280'
  const glowColor = isWin ? 'rgba(245,158,11,0.4)' : isDraw ? 'rgba(99,102,241,0.4)' : 'rgba(107,114,128,0.3)'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8 px-4 max-w-sm mx-auto"
    >
      {/* Result icon */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: isWin ? [0, -10, 10, -5, 0] : [0, 5, -5, 0] }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
          style={{
            background: `radial-gradient(circle, ${glowColor}, transparent)`,
            border: `2px solid ${primaryColor}40`,
            boxShadow: `0 0 40px ${glowColor}`,
          }}
        >
          {isWin ? '🏆' : isDraw ? '🤝' : '💀'}
        </motion.div>

        {isWin && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
                  y: [0, -20 - i * 10],
                }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1, repeat: Infinity, repeatDelay: 1.5 }}
                style={{ top: '50%', left: '50%' }}
              >
                <Star size={10} fill={primaryColor} color={primaryColor} />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* Result title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2
          className="text-3xl font-black mb-1"
          style={{
            fontFamily: 'Orbitron, monospace',
            color: primaryColor,
            textShadow: `0 0 20px ${glowColor}`,
          }}
        >
          {isWin ? 'ЖЕҢІС!' : isDraw ? 'ТЕҢ!' : 'ЖЕҢІЛІС'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isWin
            ? `${playerName} өз үстемдігін дәлелдеді`
            : isDraw
            ? 'Екеуіңнің күші тең!'
            : `${opponentName} бұл жолы жеңді`}
        </p>
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="flex">
          <div className={`flex-1 flex flex-col items-center py-5 px-4 ${isWin ? 'bg-yellow-500/5' : ''}`}>
            <span className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Сен</span>
            <span
              className="text-3xl font-black"
              style={{ fontFamily: 'Orbitron, monospace', color: isWin ? '#f59e0b' : '#94a3b8' }}
            >
              {playerScore}
            </span>
            <span className="text-xs text-slate-500 mt-1">ұпай</span>
            <div className="mt-2 text-sm" style={{ color: playerHP > opponentHP ? '#3ecf8e' : '#f96060' }}>
              {playerHP} HP
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-3">
            <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-slate-500 text-xs py-2 font-bold">VS</span>
            <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <div className={`flex-1 flex flex-col items-center py-5 px-4 ${!isWin && !isDraw ? 'bg-red-500/5' : ''}`}>
            <span className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Қарсылас</span>
            <span
              className="text-3xl font-black"
              style={{ fontFamily: 'Orbitron, monospace', color: !isWin && !isDraw ? '#f96060' : '#94a3b8' }}
            >
              {opponentScore}
            </span>
            <span className="text-xs text-slate-500 mt-1">ұпай</span>
            <div className="mt-2 text-sm" style={{ color: opponentHP > playerHP ? '#3ecf8e' : '#f96060' }}>
              {opponentHP} HP
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP earned */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full"
        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        <Zap size={14} className="text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-300">
          +{isWin ? 50 : isDraw ? 25 : 10} XP жиналды
        </span>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full"
      >
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${glowColor}` }}
          whileTap={{ scale: 0.98 }}
          onClick={resetDuel}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' }}
        >
          <RefreshCw size={18} />
          Қайта ойнау
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => { resetDuel(); navigate('/app') }}
          className="w-full py-3.5 rounded-2xl font-semibold text-slate-400 text-sm flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Home size={16} />
          Басты бетке
        </motion.button>
      </motion.div>
    </motion.div>
  )
}