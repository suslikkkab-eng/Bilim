// src/pages/LearnPage.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, CheckCircle, XCircle, ChevronRight, Trophy,
  RotateCcw, Zap, Layers, GraduationCap, ChevronLeft,
  FlipHorizontal, Flame
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, ProgressBar } from '../components/ui'
import useAuthStore from '../store/authStore'
import useStreakStore from '../store/streakStore'
import { SUBJECTS, QUESTIONS_DB } from '../utils/constants'

// =================== CONFETTI ===================
function Confetti({ active }) {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: ['#4f9cf9', '#3ecf8e', '#f5c842', '#f96060', '#7b5cf9', '#f97b4f'][i % 6],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1,
    size: Math.random() * 8 + 4,
    rotate: Math.random() * 360,
  }))

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color, left: `${p.x}%`, top: -20 }}
          animate={{ y: ['0vh', '110vh'], rotate: [p.rotate, p.rotate + 720], opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// =================== MODE SELECTOR ===================
function ModeSelector({ subject, onSelect, onBack }) {
  const modes = [
    {
      id: 'quiz',
      icon: <GraduationCap size={28} />,
      title: 'Тест режимі',
      desc: 'Сұрақтарға жауап беріп балл жина',
      gradient: 'from-accent/20 to-accent-purple/10',
      iconColor: 'from-accent to-accent-purple',
    },
    {
      id: 'flashcard',
      icon: <Layers size={28} />,
      title: 'Флэшкарта',
      desc: 'Карточкаларды аударып үйрен',
      gradient: 'from-accent-green/20 to-teal-500/10',
      iconColor: 'from-accent-green to-teal-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl glass text-text-2 hover:text-text transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-text">{subject.emoji} {subject.name}</h2>
          <p className="text-sm text-text-2">Режим таңдаңыз</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {modes.map((m) => (
          <motion.div
            key={m.id}
            onClick={() => onSelect(m.id)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`glass-card rounded-3xl p-6 cursor-pointer border border-white/8 bg-gradient-to-br ${m.gradient} group`}
          >
            <motion.div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.iconColor} flex items-center justify-center mb-4 text-white`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              {m.icon}
            </motion.div>
            <h3 className="font-display font-bold text-text mb-1">{m.title}</h3>
            <p className="text-sm text-text-2">{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// =================== FLASHCARD ===================
function Flashcard({ subject, onBack }) {
  const questions = QUESTIONS_DB[subject.id] || []
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState([])
  const [unknown, setUnknown] = useState([])
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-5xl mb-4">🔧</div>
        <p className="text-text-2">Карточкалар дайындалуда</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">Артқа</Button>
      </Card>
    )
  }

  const q = questions[current]
  const total = questions.length

  const next = (isKnown) => {
    if (isKnown) setKnown(k => [...k, q.id])
    else setUnknown(u => [...u, q.id])
    setFlipped(false)
    setTimeout(() => {
      if (current < total - 1) setCurrent(c => c + 1)
      else setDone(true)
    }, 150)
  }

  if (done) {
    const knownPct = Math.round((known.length / total) * 100)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="text-center py-10">
          <div className="text-6xl mb-4">{knownPct >= 70 ? '🎉' : '📚'}</div>
          <h2 className="font-display font-bold text-2xl text-text mb-2">Аяқталды!</h2>
          <p className="text-text-2 mb-6">
            <span className="text-accent-green font-bold">{known.length}</span> білдім •{' '}
            <span className="text-accent-red font-bold">{unknown.length}</span> білмедім
          </p>
          <div className="relative w-28 h-28 mx-auto mb-6">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,179,237,0.1)" strokeWidth="12" />
              <motion.circle
                cx="60" cy="60" r="50" fill="none"
                stroke={knownPct >= 70 ? '#3ecf8e' : '#4f9cf9'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - knownPct / 100)}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - knownPct / 100)}` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-extrabold text-2xl text-text">{knownPct}%</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false) }}>
              <RotateCcw size={16} /> Қайталау
            </Button>
            <Button onClick={onBack}>Артқа <ChevronRight size={16} /></Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl glass text-text-2 hover:text-text transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-text-2 mb-2">
            <span>{subject.emoji} Флэшкарта</span>
            <span>{current + 1} / {total}</span>
          </div>
          <ProgressBar value={current + 1} max={total} color="green" />
        </div>
      </div>

      {/* Card flip */}
      <div style={{ perspective: '1000px' }}>
        <motion.div
          className="relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            className="glass-card rounded-3xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center border border-accent/20"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs text-text-3 mb-4 uppercase tracking-wider font-medium flex items-center gap-1.5">
              <FlipHorizontal size={12} /> Сұрақ · басып аударыңыз
            </div>
            <p className="text-lg font-medium text-text leading-relaxed">{q.question}</p>
          </div>
          <div
            className="glass-card rounded-3xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center border border-accent-green/30 bg-accent-green/5 absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs text-accent-green mb-4 uppercase tracking-wider font-medium">✓ Дұрыс жауап</div>
            <p className="text-xl font-bold text-text mb-3">{q.options[q.answer]}</p>
            <p className="text-sm text-text-2 leading-relaxed">{q.explanation}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => next(false)}
          className="flex-1 py-4 rounded-2xl border-2 border-accent-red/30 bg-accent-red/5 text-accent-red font-bold text-sm hover:bg-accent-red/10 transition-all">
          ✗ Білмедім
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => next(true)}
          className="flex-1 py-4 rounded-2xl border-2 border-accent-green/30 bg-accent-green/5 text-accent-green font-bold text-sm hover:bg-accent-green/10 transition-all">
          ✓ Білдім
        </motion.button>
      </div>
    </div>
  )
}

// =================== QUIZ ===================
function Quiz({ subject, onFinish }) {
  const questions = QUESTIONS_DB[subject.id] || []
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  if (questions.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-5xl mb-4">🔧</div>
        <h3 className="font-bold text-text mb-2">Сұрақтар дайындалуда</h3>
        <Button variant="secondary" onClick={() => onFinish(null, null)} className="mt-6">Артқа</Button>
      </Card>
    )
  }

  const q = questions[current]
  const totalQ = questions.length

  const handleNext = () => {
    const isCorrect = selected === q.answer
    const newAnswers = [...answers, { questionId: q.id, selected, correct: isCorrect }]
    setAnswers(newAnswers)

    if (current < totalQ - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      const correctCount = newAnswers.filter(a => a.correct).length
      const score = Math.round((correctCount / totalQ) * 100)
      setFinalScore(score)
      setShowResult(true)
      if (score >= 80) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
  }

  if (showResult) {
    const correct = answers.filter(a => a.correct).length
    const stars = finalScore >= 80 ? 3 : finalScore >= 60 ? 2 : 1
    return (
      <>
        <Confetti active={showConfetti} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Card className="py-10">
            <motion.div className="text-6xl mb-4"
              animate={finalScore >= 80 ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}>
              {finalScore >= 80 ? '🏆' : finalScore >= 60 ? '🎯' : '💪'}
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-text mb-2">
              {finalScore >= 80 ? 'Тамаша!' : finalScore >= 60 ? 'Жақсы!' : 'Жалғастырыңыз!'}
            </h2>
            <p className="text-text-2 mb-6">{correct} / {totalQ} дұрыс жауап</p>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,179,237,0.1)" strokeWidth="12" />
                <motion.circle cx="60" cy="60" r="50" fill="none"
                  stroke={finalScore >= 80 ? '#3ecf8e' : finalScore >= 60 ? '#4f9cf9' : '#f97b4f'}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - finalScore / 100)}`}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - finalScore / 100)}` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-extrabold text-3xl text-text">{finalScore}%</span>
              </div>
            </div>
            <div className="flex justify-center gap-2 mb-8">
              {[1,2,3].map(i => (
                <motion.div key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: i <= stars ? 1 : 0.6, opacity: i <= stars ? 1 : 0.3 }}
                  transition={{ delay: 0.8 + i * 0.15, type: 'spring' }}>
                  <Trophy size={28} className={i <= stars ? 'text-accent-gold' : 'text-text-3'} fill={i <= stars ? 'currentColor' : 'none'} />
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => { setCurrent(0); setSelected(null); setAnswers([]); setShowResult(false); setFinalScore(null) }}>
                <RotateCcw size={16} /> Қайталау
              </Button>
              <Button onClick={() => onFinish(correct, totalQ)}>
                Пәнге оралу <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
          <div className="mt-4 space-y-3">
            <h3 className="font-bold text-text text-left">Жауаптарды қарау</h3>
            {questions.map((question, i) => {
              const ans = answers[i]
              if (!ans) return null
              return (
                <Card key={question.id} className={`text-left ${ans.correct ? 'border-accent-green/20 bg-accent-green/5' : 'border-accent-red/20 bg-accent-red/5'}`}>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {ans.correct ? <CheckCircle size={18} className="text-accent-green" /> : <XCircle size={18} className="text-accent-red" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text mb-2">{question.question}</p>
                      {!ans.correct && <p className="text-xs text-accent-green mb-1">✓ Дұрыс: {question.options[question.answer]}</p>}
                      <p className="text-xs text-text-2 bg-surface/50 rounded-xl px-3 py-2 mt-2">{question.explanation}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-text-2 mb-2">
          <span>{subject.emoji} {subject.name}</span>
          <span>{current + 1} / {totalQ}</span>
        </div>
        <ProgressBar value={current + 1} max={totalQ} color="blue" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <Card className="mb-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent font-bold text-sm mt-0.5">{current + 1}</div>
              <p className="text-text font-medium leading-relaxed">{q.question}</p>
            </div>
          </Card>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              let style = 'glass hover:border-accent/30 hover:bg-surface-2/80'
              if (selected !== null) {
                if (i === q.answer) style = 'bg-accent-green/10 border-accent-green/40'
                else if (i === selected && i !== q.answer) style = 'bg-accent-red/10 border-accent-red/40'
                else style = 'opacity-50 glass'
              }
              return (
                <motion.button key={i}
                  whileHover={selected === null ? { x: 4 } : {}}
                  whileTap={selected === null ? { scale: 0.99 } : {}}
                  onClick={() => selected === null && setSelected(i)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-2xl border border-border text-sm text-text transition-all duration-200 ${style} flex items-center gap-3`}>
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selected !== null && i === q.answer ? 'bg-accent-green text-white' :
                    selected === i && i !== q.answer ? 'bg-accent-red text-white' : 'bg-surface-2 text-text-2'
                  }`}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {selected !== null && i === q.answer && <CheckCircle size={16} className="ml-auto text-accent-green flex-shrink-0" />}
                  {selected === i && i !== q.answer && <XCircle size={16} className="ml-auto text-accent-red flex-shrink-0" />}
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence>
            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 glass rounded-2xl px-4 py-3 border border-accent/20 bg-accent/5">
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-2">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      <Button onClick={handleNext} disabled={selected === null} className="w-full" size="lg">
        {current < totalQ - 1 ? 'Келесі сұрақ' : 'Нәтиже'} <ChevronRight size={16} />
      </Button>
    </div>
  )
}

// =================== SUBJECT CARD ===================
function SubjectCard({ subject, progress, onClick }) {
  const questions = QUESTIONS_DB[subject.id] || []
  const pct = progress?.[subject.id] || 0
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={() => onClick(subject)}
      className="glass rounded-3xl p-5 cursor-pointer hover:border-accent/25 transition-all duration-300 hover:bg-surface-2/80 group">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {subject.emoji}
      </div>
      <h3 className="font-bold text-text mb-1">{subject.name}</h3>
      <p className="text-xs text-text-3 mb-3">{questions.length} сұрақ</p>
      <ProgressBar value={pct} max={100} color={pct > 70 ? 'green' : pct > 40 ? 'blue' : 'orange'} size="sm" showLabel />
      {pct > 0 && <p className="text-xs text-text-3 mt-1.5">Соңғы нәтиже: {pct}%</p>}
    </motion.div>
  )
}

// =================== STREAK BANNER ===================
function StreakBanner() {
  const { currentStreak, longestStreak } = useStreakStore()
  if (currentStreak === 0) return null
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-4 py-3 border border-accent-gold/20 bg-gradient-to-r from-accent-gold/10 to-accent-orange/5 flex items-center gap-3 mb-6">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl">🔥</motion.div>
      <div className="flex-1">
        <span className="font-display font-bold text-accent-gold">{currentStreak} күн қатарынан!</span>
        <span className="text-text-3 text-sm ml-2">Рекорд: {longestStreak} күн</span>
      </div>
      <Flame size={16} className="text-accent-gold" />
    </motion.div>
  )
}

// =================== MAIN ===================
export default function LearnPage() {
  const user = useAuthStore(s => s.user)
  const updateProgress = useAuthStore(s => s.updateProgress)
  const recordActivity = useStreakStore(s => s.recordActivity)
  const checkStreak = useStreakStore(s => s.checkStreak)
  const [activeSubject, setActiveSubject] = useState(null)
  const [activeMode, setActiveMode] = useState(null)

  useEffect(() => { checkStreak() }, [])

  const handleFinish = async (score, total) => {
    if (score !== null && total !== null && activeSubject) {
      await updateProgress(activeSubject.id, score, total)
      const newStreak = recordActivity()
      const pct = Math.round((score / total) * 100)
      if (pct >= 80) toast.success(`Тамаша! ${pct}% 🏆${newStreak > 1 ? ` · 🔥 ${newStreak} күн!` : ''}`)
      else if (pct >= 60) toast.success(`Жақсы нәтиже: ${pct}%`)
      else toast(`Нәтиже: ${pct}%. Жалғастырыңыз! 💪`, { icon: '📚' })
    }
    setActiveSubject(null)
    setActiveMode(null)
  }

  if (activeSubject && activeMode === 'flashcard') {
    return <div className="max-w-2xl mx-auto"><Flashcard subject={activeSubject} onBack={() => setActiveMode(null)} /></div>
  }

  if (activeSubject && activeMode === 'quiz') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveMode(null)} className="p-2 rounded-xl glass text-text-2 hover:text-text transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-text">{activeSubject.name}</h1>
            <p className="text-sm text-text-2">Тест тапсырыңыз</p>
          </div>
        </div>
        <Quiz subject={activeSubject} onFinish={handleFinish} />
      </div>
    )
  }

  if (activeSubject && !activeMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <ModeSelector subject={activeSubject} onSelect={setActiveMode} onBack={() => setActiveSubject(null)} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text mb-2">Оқу бөлімі</h1>
        <p className="text-text-2">Пән таңдап, тест немесе флэшкарта режимін пайдаланыңыз</p>
      </div>
      <StreakBanner />
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>
        {SUBJECTS.map(s => (
          <motion.div key={s.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <SubjectCard subject={s} progress={user?.progress} onClick={setActiveSubject} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
