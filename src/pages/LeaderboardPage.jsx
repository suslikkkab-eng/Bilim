// src/pages/LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Crown, TrendingUp, BookOpen, Star, RefreshCw } from 'lucide-react'
import { Card, Badge, Avatar, Stat } from '../components/ui'
import useAuthStore from '../store/authStore'
import api from '../api/api'
import { getLevel } from '../utils/constants'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
      <Crown size={18} className="text-white" fill="white" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30 flex-shrink-0">
      <Medal size={18} className="text-white" fill="white" />
    </div>
  )
  if (rank === 3) return (
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-600/30 flex-shrink-0">
      <Medal size={18} className="text-white" fill="white" />
    </div>
  )
  return (
    <div className="w-9 h-9 rounded-2xl bg-surface-2 flex items-center justify-center flex-shrink-0 border border-border">
      <span className="text-sm font-bold text-text-3">#{rank}</span>
    </div>
  )
}

export default function LeaderboardPage() {
  const user = useAuthStore(s => s.user)
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [lbResult, rankResult, statsResult] = await Promise.all([
        api.getLeaderboard(),
        api.getMyRank(),
        api.getStats(),
      ])

      if (lbResult?.ok) {
        setLeaderboard(lbResult.data?.leaderboard || [])
      }
      if (rankResult?.ok) {
        setMyRank(rankResult.data?.rank)
      }
      if (statsResult?.ok) {
        setMyStats(statsResult.data)
      }
    } catch {
      setError('Деректерді жүктеу қатесі')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const myEntry = leaderboard.find(e => e.email === user?.email)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text flex items-center gap-2">
            <Trophy size={22} className="text-accent-gold" />
            Лидер кестесі
          </h1>
          <p className="text-text-2 text-sm mt-1">Үздік оқушылар рейтингі</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-xl glass text-text-3 hover:text-accent transition-colors disabled:opacity-50"
        >
          <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={16} />
          </motion.div>
        </button>
      </div>

      {/* My stats */}
      {myStats && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-3xl p-5 border border-accent/15 bg-gradient-to-br from-accent/8 to-accent-purple/5">
            <p className="text-xs text-text-3 mb-3 font-medium uppercase tracking-wider">Менің нәтижем</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="font-display font-extrabold text-2xl text-gradient">
                  {myRank ? `#${myRank}` : '—'}
                </div>
                <div className="text-xs text-text-3 mt-0.5">Орын</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="font-display font-extrabold text-2xl text-accent-green">
                  {Math.round(myStats.avg_score || 0)}%
                </div>
                <div className="text-xs text-text-3 mt-0.5">Орташа балл</div>
              </div>
              <div className="text-center">
                <div className="font-display font-extrabold text-2xl text-accent">
                  {myStats.total_tests || 0}
                </div>
                <div className="text-xs text-text-3 mt-0.5">Тест</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-surface-2" />
                <div className="w-10 h-10 rounded-2xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-2 rounded-xl w-32" />
                  <div className="h-3 bg-surface-2 rounded-xl w-20" />
                </div>
                <div className="h-6 bg-surface-2 rounded-xl w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="text-center py-10">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-text-2">{error}</p>
          <button onClick={load} className="mt-4 text-sm text-accent hover:text-accent/80 transition-colors">
            Қайталау
          </button>
        </Card>
      ) : leaderboard.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-text-2 font-medium">Әлі ешкім жоқ</p>
          <p className="text-text-3 text-sm mt-1">Тест тапсырып бірінші болыңыз!</p>
        </Card>
      ) : (
        <motion.div className="space-y-2.5" variants={container} initial="hidden" animate="show">
          {leaderboard.map((entry) => {
            const isMe = entry.email === user?.email
            const level = getLevel(Math.round(entry.avg_score) * entry.total_tests)
            const displayName = entry.name || entry.email.split('@')[0]

            return (
              <motion.div
                key={entry.email}
                variants={item}
                className={`glass rounded-2xl p-4 transition-all duration-200 ${
                  isMe
                    ? 'border border-accent/30 bg-accent/5'
                    : entry.rank <= 3
                    ? 'border border-accent-gold/15 bg-accent-gold/3'
                    : 'hover:bg-surface-2/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={entry.rank} />

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/30 to-accent-purple/20 flex items-center justify-center flex-shrink-0 text-lg font-bold text-text border border-white/10">
                    {entry.avatar
                      ? <img src={entry.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                      : displayName[0]?.toUpperCase()
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm truncate ${isMe ? 'text-accent' : 'text-text'}`}>
                        {displayName}
                        {isMe && <span className="text-xs ml-1 text-accent/70">(сіз)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BookOpen size={11} className="text-text-3" />
                      <span className="text-xs text-text-3">{entry.total_tests} тест</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className={`font-display font-bold text-lg ${
                      entry.rank === 1 ? 'text-accent-gold' :
                      entry.rank === 2 ? 'text-slate-300' :
                      entry.rank === 3 ? 'text-amber-600' :
                      isMe ? 'text-accent' : 'text-text'
                    }`}>
                      {Math.round(entry.avg_score)}%
                    </div>
                    <div className="text-xs text-text-3">орташа</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
