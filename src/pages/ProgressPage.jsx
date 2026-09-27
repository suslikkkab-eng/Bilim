// src/pages/ProgressPage.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Trophy, Target, BookOpen, MessageSquare, Award, Flame, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Card, ProgressBar, Stat } from '../components/ui'
import useAuthStore from '../store/authStore'
import useStreakStore from '../store/streakStore'
import api from '../api/api'
import { SUBJECTS, getLevel, LEVEL_THRESHOLDS } from '../utils/constants'

// История тестов по каждому предмету
function SubjectHistory({ subject, results }) {
  const [expanded, setExpanded] = useState(false)
  const subjectResults = results.filter(r => r.subject === subject.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const best = subjectResults.length > 0 ? Math.max(...subjectResults.map(r => r.percent)) : 0
  const pct = best

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface/50 transition-colors"
        onClick={() => subjectResults.length > 0 && setExpanded(e => !e)}
      >
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${subject.gradient}`}>
          {subject.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text">{subject.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {pct >= 80 && <Trophy size={13} className="text-accent-gold" />}
              <span className={`text-sm font-bold ${pct >= 80 ? 'text-accent-green' : pct >= 60 ? 'text-accent' : pct > 0 ? 'text-accent-orange' : 'text-text-3'}`}>
                {pct > 0 ? `${pct}%` : '—'}
              </span>
            </div>
          </div>
          <ProgressBar value={pct} max={100} color={pct >= 80 ? 'green' : pct >= 60 ? 'blue' : pct > 0 ? 'orange' : 'blue'} size="md" />
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-text-3">
              {pct === 0 ? 'Тест тапсырылмаған' : pct >= 80 ? '✨ Тамаша!' : pct >= 60 ? '👍 Жақсы' : '📚 Жалғастырыңыз'}
            </div>
            {subjectResults.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-text-3">
                <span>{subjectResults.length} тест</span>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* История попыток */}
      <AnimatePresence>
        {expanded && subjectResults.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-3 space-y-2 bg-surface/30">
              {subjectResults.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 glass rounded-xl">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    r.percent >= 80 ? 'bg-accent-green/15 text-accent-green' :
                    r.percent >= 60 ? 'bg-accent/15 text-accent' :
                    'bg-accent-orange/15 text-accent-orange'
                  }`}>
                    {r.percent}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text">{r.score} / {r.total} дұрыс</div>
                    {r.created_at && (
                      <div className="text-xs text-text-3 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(r.created_at).toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="text-lg flex-shrink-0">
                    {r.percent >= 80 ? '🏆' : r.percent >= 60 ? '🎯' : '💪'}
                  </div>
                </div>
              ))}
              {subjectResults.length > 5 && (
                <p className="text-xs text-text-3 text-center py-1">+{subjectResults.length - 5} тест тағы</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProgressPage() {
  const user = useAuthStore(s => s.user)
  const { currentStreak, longestStreak, totalActiveDays } = useStreakStore()
  const progress = user?.progress || {}
  const level = getLevel(user?.totalScore || 0)

  const [allResults, setAllResults] = useState([])
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getTestResults()
        if (res?.ok) setAllResults(res.data?.results || [])
      } catch {}
      finally { setLoadingResults(false) }
    }
    load()
  }, [])

  const subjectProgress = SUBJECTS.map(s => ({ ...s, pct: progress[s.id] || 0 }))
  const attempted = subjectProgress.filter(s => s.pct > 0)
  const avgScore = attempted.length > 0
    ? Math.round(attempted.reduce((acc, s) => acc + s.pct, 0) / attempted.length) : 0
  const nextLevel = LEVEL_THRESHOLDS.find(l => (user?.totalScore || 0) < l.min)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-text mb-2">Прогресс</h1>
        <p className="text-text-2">Барлық пәндер бойынша нәтижелер</p>
      </div>

      {/* Streak card */}
      {currentStreak > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-3xl p-5 border border-accent-gold/20 bg-gradient-to-br from-accent-gold/10 to-accent-orange/5">
            <div className="flex items-center gap-4">
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔥
              </motion.div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl text-accent-gold">{currentStreak} күн қатарынан!</h3>
                <p className="text-text-2 text-sm">Үзбей оқуды жалғастырыңыз</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-3 mb-1">Рекорд</div>
                <div className="font-display font-bold text-text">{longestStreak} күн</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Level card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass rounded-3xl p-6 bg-gradient-to-br from-accent-gold/10 to-accent-orange/5 border border-accent-gold/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 text-[120px] leading-none opacity-10 pointer-events-none">🏆</div>
          <div className="flex items-start justify-between gap-4 relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={18} className="text-accent-gold" />
                <span className="text-sm text-text-2">Ағымдағы деңгей</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl mb-1" style={{ color: level.color }}>{level.label}</h2>
              <p className="text-text-2 text-sm">{user?.totalScore || 0} жалпы балл</p>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-4xl text-gradient">{user?.totalScore || 0}</div>
              <div className="text-xs text-text-3">балл</div>
            </div>
          </div>
          {nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-2 mb-1.5">
                <span>Келесі деңгейге дейін</span>
                <span>{nextLevel.min - (user?.totalScore || 0)} балл қалды</span>
              </div>
              <ProgressBar value={(user?.totalScore || 0) - (level.min || 0)} max={nextLevel.min - (level.min || 0)} color="gold" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Stat label="Тест саны" value={user?.testsCompleted || 0} icon={<Trophy size={16} />} color="gold" />
        <Stat label="Орташа балл" value={`${avgScore}%`} icon={<Target size={16} />} color="blue" />
        <Stat label="Streak" value={`${currentStreak}🔥`} icon={<Flame size={16} />} color="orange" />
        <Stat label="Пән" value={`${attempted.length}/${SUBJECTS.length}`} icon={<BookOpen size={16} />} color="green" />
      </motion.div>

      {/* Subject history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-display font-bold text-lg text-text mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" />
          Пәндер бойынша нәтижелер
          <span className="text-xs text-text-3 font-normal ml-1">(басып тарихын қараңыз)</span>
        </h2>
        <div className="space-y-2">
          {loadingResults ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse h-20" />
            ))
          ) : (
            SUBJECTS.map((s) => (
              <SubjectHistory key={s.id} subject={s} results={allResults} />
            ))
          )}
        </div>
      </motion.div>

      {/* Level ladder */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display font-bold text-lg text-text mb-4">Деңгей жүйесі</h2>
        <Card className="space-y-3">
          {LEVEL_THRESHOLDS.map((l) => {
            const isActive = level.min === l.min
            const isPassed = (user?.totalScore || 0) >= l.min
            return (
              <div key={l.label} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? 'bg-surface-2' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPassed ? 'bg-accent-gold/15' : 'bg-surface'}`}>
                  <Award size={18} className={isPassed ? 'text-accent-gold' : 'text-text-3'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isActive ? 'text-text' : isPassed ? 'text-text-2' : 'text-text-3'}`} style={isActive ? { color: l.color } : {}}>
                      {l.label}
                    </span>
                    {isActive && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: l.color + '20', color: l.color }}>Ағымдағы</span>}
                  </div>
                  <span className="text-xs text-text-3">{l.min}+ балл</span>
                </div>
                {isPassed && <span className="text-accent-green text-lg">✓</span>}
              </div>
            )
          })}
        </Card>
      </motion.div>
    </div>
  )
}
