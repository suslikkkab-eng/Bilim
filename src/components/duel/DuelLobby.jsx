// src/components/duel/DuelLobby.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Copy, Check, LogIn, Plus, ArrowLeft } from 'lucide-react'
import useDuelStore from '../../store/duelStore'
import toast from 'react-hot-toast'

export default function DuelLobby() {
  const [tab, setTab] = useState('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const { createRoom, joinRoom, leaveRoom, screen, roomCode, startDuel, isHost } = useDuelStore()

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Атыңды жаз!')
    setLoading(true)
    try {
      await createRoom(name.trim())
      toast.success('Бөлме жасалды! Досыңды күт!')
    } catch (err) {
      toast.error(err?.message || 'Қателік болды')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!name.trim()) return toast.error('Атыңды жаз!')
    if (code.trim().length < 4) return toast.error('Бөлме кодын жаз!')
    setLoading(true)
    try {
      await joinRoom(code.trim(), name.trim())
      toast.success('Бөлмеге кірдіңіз!')
    } catch (err) {
      toast.error(err?.message || 'Қателік болды')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Код көшірілді!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartDuel = async () => {
    setLoading(true)
    try {
      await startDuel()
    } catch (err) {
      toast.error('Дуэльді бастау сәтсіз')
    } finally {
      setLoading(false)
    }
  }

  // ── Waiting screen ─────────────────────────────────────────────────────────
  if (screen === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-8 py-12"
      >
        {/* Back button — FIXES the bug where you couldn't leave the waiting screen */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={leaveRoom}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
          }}
        >
          <ArrowLeft size={15} />
          Артқа
        </motion.button>

        {/* Pulsing icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 0 40px rgba(99,102,241,0.5)',
          }}
        >
          <Swords size={44} className="text-white" />
        </motion.div>

        <div className="text-center">
          <p className="text-lg text-slate-400 mb-2">Бөлме коды</p>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-black tracking-widest"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {roomCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl transition-all"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              {copied
                ? <Check size={18} className="text-green-400" />
                : <Copy size={18} className="text-indigo-400" />}
            </button>
          </div>
          <p className="text-slate-500 mt-2 text-sm">Кодты досыңа жібер, дуэль басталсын!</p>
        </div>

        {/* Waiting dots */}
        <div className="flex items-center gap-3 text-slate-400">
          <span>Қарсыласты күтуде</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-indigo-400"
              />
            ))}
          </div>
        </div>

        {/* Host can start for demo */}
        {isHost && (
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={handleStartDuel}
            disabled={loading}
            className="px-8 py-3 rounded-2xl font-bold text-white text-lg transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Дуэль басталуда...' : 'Дуэльді бастау'}
          </motion.button>
        )}
      </motion.div>
    )
  }

  // ── Lobby screen ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}
        >
          <Swords size={32} className="text-white" />
        </motion.div>
        <h1
          className="text-3xl font-black mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          <span
            style={{
              background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ДУЭЛЬ
          </span>
        </h1>
        <p className="text-slate-400">ҰБТ білімінде досыңмен кездес</p>
      </div>

      {/* Name input */}
      <div className="mb-5">
        <label className="block text-sm text-slate-400 mb-2">Атың</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Атыңды жаз..."
          maxLength={20}
          className="w-full px-4 py-3 rounded-2xl text-white text-base outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(99,102,241,0.3)',
            fontFamily: 'Onest, sans-serif',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.8)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.3)')}
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {[
          { key: 'create', label: 'Дуэль жасау', icon: Plus },
          { key: 'join', label: 'Кодпен кіру', icon: LogIn },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:
                tab === key ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
              color: tab === key ? 'white' : '#94a3b8',
              boxShadow: tab === key ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'create' ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <div
              className="rounded-3xl p-5 mb-5"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <p className="text-slate-300 text-sm leading-relaxed">
                Бөлме жаса — бірегей код аласың. Кодты досыңа жібер, ол кірсе — дуэль басталады!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 12px 40px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <Swords size={22} />
              {loading ? 'Күтуде...' : 'Бөлме жасау'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Бөлме коды</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="KZ9X2A"
                maxLength={8}
                className="w-full px-4 py-3 rounded-2xl text-white text-xl font-bold text-center tracking-widest outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  fontFamily: 'Orbitron, monospace',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.8)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.3)')}
              />
            </div>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 12px 40px rgba(168,85,247,0.5)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 8px 30px rgba(168,85,247,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <LogIn size={22} />
              {loading ? 'Күтуде...' : 'Дуэльге кіру'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}