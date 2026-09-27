// src/pages/DuelPage.jsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import useDuelStore from '../store/duelStore'
import DuelLobby from '../components/duel/DuelLobby'
import DuelArena from '../components/duel/DuelArena'
import DuelResult from '../components/duel/DuelResult'

// ── Animated background ────────────────────────────────────────────────────
function ArenaBackground({ screen }) {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 4,
  }))

  const isArena = screen === 'arena'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isArena
            ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(236,72,153,0.12) 0%, transparent 50%), linear-gradient(180deg, #0d0d2b 0%, #0a0a1a 100%)'
            : 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), linear-gradient(180deg, #0d0d2b 0%, #0a0a1a 100%)',
        }}
      />
      {isArena && (
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(99,102,241,0.6)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.id % 3 === 0 ? '#6366f1' : p.id % 3 === 1 ? '#a855f7' : '#ec4899',
          }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {isArena && (
        <>
          <motion.div className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.5), transparent)' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute right-0 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(168,85,247,0.5), transparent)' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        </>
      )}
    </div>
  )
}

// ── Music controller ───────────────────────────────────────────────────────
// 📁 Файлдарыңды /public/music/ папкасына салыңыз:
//    - public/music/lobby.mp3   ← лобби / ойын аяқталғандағы музыка
//    - public/music/arena.mp3   ← дуэль кезіндегі музыка
//
// Егер бір ғана трек болса — екеуіне де бірдей жолды жазыңыз.
// Форматтар: mp3, ogg, wav, webm — бәрі жұмыс жасайды.

const MUSIC_LOBBY = '/music/dragon.mp3'
const MUSIC_ARENA = '/music/Miles.mp3'

// src/pages/DuelPage.jsx — замените функцию useDuelMusic на эту:

function useDuelMusic(screen) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const targetSrc = screen === 'arena' ? MUSIC_ARENA : MUSIC_LOBBY

  // Инициализация audio — ТОЛЬКО ОДИН РАЗ
  useEffect(() => {
    console.log('🎵 INIT: Creating audio element')
    const audio = new Audio()
    audio.loop = true
    audio.volume = 0.35
    audio.preload = 'auto'
    
    audioRef.current = audio
    setIsInitialized(true)
    
    console.log('🎵 Audio created:', audio)
    
    return () => {
      console.log('🎵 CLEANUP: Destroying audio')
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, []) // Пустой массив = только при монтировании

  // Загрузка трека при изменении screen
  useEffect(() => {
    if (!isInitialized || !audioRef.current) {
      console.log('🎵 Waiting for initialization...')
      return
    }
    
    const audio = audioRef.current
    const currentSrc = audio.src
    
    // Проверяем, нужно ли менять трек
    if (currentSrc.includes(targetSrc)) {
      console.log('🎵 Same track, no change')
      return
    }
    
    console.log(`🎵 Loading track: ${targetSrc}`)
    audio.src = targetSrc
    audio.load()
    
    // Пробуем играть если не muted
    if (!muted) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('🎵 Playing!'))
          .catch(err => console.warn('🎵 Autoplay blocked:', err.message))
      }
    }
  }, [targetSrc, isInitialized])

  // Обработка mute/unmute
  useEffect(() => {
    if (!isInitialized || !audioRef.current) return
    
    const audio = audioRef.current
    audio.muted = muted
    
    if (!muted && audio.paused && audio.src) {
      console.log('🎵 Unmuted, trying to play')
      audio.play().catch(err => console.warn('🎵 Still blocked:', err.message))
    } else if (muted) {
      console.log('🎵 Muted')
    }
  }, [muted, isInitialized])

  const toggleMute = () => {
    console.log('🎵 Toggle mute:', !muted)
    setMuted(prev => !prev)
  }

  return { muted, toggleMute }
}

// ── DuelPage ───────────────────────────────────────────────────────────────
export default function DuelPage() {
  const screen = useDuelStore(s => s.screen)
  const { muted, toggleMute } = useDuelMusic(screen)

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: 'Onest, sans-serif' }}>
      <ArenaBackground screen={screen} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {screen === 'arena' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-1.5">
              {['ДУЭЛЬ', 'ТІКЕЛЕЙ', 'ЭФИРДЕ'].map((word, i) => (
                <motion.span
                  key={word}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: i % 2 === 0 ? '#6366f1' : '#a855f7' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="p-2.5 rounded-xl transition-all"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: muted ? '#475569' : '#818cf8',
          }}
          title={muted ? 'Музыканы қосу' : 'Музыканы өшіру'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </motion.button>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 pb-8">
        <AnimatePresence mode="wait">
          {screen === 'lobby' || screen === 'waiting' ? (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DuelLobby />
            </motion.div>
          ) : screen === 'arena' ? (
            <motion.div key="arena" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <DuelArena />
            </motion.div>
          ) : screen === 'result' ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DuelResult />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}