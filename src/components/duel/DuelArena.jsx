// src/components/duel/DuelArena.jsx
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Clock } from 'lucide-react'
import useDuelStore from '../../store/duelStore'
import DuelCharacter, { JudgeSVG } from './DuelCharacter'

function HPBar({ hp, flipped, name }) {
  const pct = Math.max(0, Math.min(100, hp))
  const color = pct > 60 ? '#3ecf8e' : pct > 30 ? '#f59e0b' : '#f96060'

  return (
    <div className={`flex flex-col gap-1 ${flipped ? 'items-end' : 'items-start'}`} style={{ minWidth: 130 }}>
      <div className={`flex items-center gap-1.5 text-xs font-semibold text-slate-300 ${flipped ? 'flex-row-reverse' : ''}`}>
        <Shield size={12} style={{ color }} />
        <span>{name}</span>
        <span style={{ color }} className="font-black">{hp}HP</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  )
}

function AnswerOption({ label, text, index, selectedIndex, correctIndex, opponentIndex, onSelect, disabled }) {
  const isSelected = selectedIndex === index
  const isCorrect = correctIndex !== undefined && index === correctIndex
  const isWrong = selectedIndex === index && index !== correctIndex
  const isOpponent = opponentIndex === index && selectedIndex !== null

  let bg = 'rgba(255,255,255,0.05)'
  let border = 'rgba(255,255,255,0.12)'
  let textColor = '#cbd5e1'
  let shadow = 'none'

  if (selectedIndex !== null) {
    if (isCorrect) {
      bg = 'rgba(62,207,142,0.15)'; border = '#3ecf8e'; textColor = '#3ecf8e'; shadow = '0 0 20px rgba(62,207,142,0.3)'
    } else if (isWrong) {
      bg = 'rgba(249,96,96,0.15)'; border = '#f96060'; textColor = '#f96060'; shadow = '0 0 20px rgba(249,96,96,0.3)'
    } else if (isOpponent) {
      bg = 'rgba(168,85,247,0.12)'; border = 'rgba(168,85,247,0.5)'; textColor = '#c4b5fd'
    }
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-300"
      style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, boxShadow: shadow, cursor: disabled ? 'default' : 'pointer' }}
    >
      <span
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
        style={{
          background: isCorrect ? 'rgba(62,207,142,0.2)' : isWrong ? 'rgba(249,96,96,0.2)' : 'rgba(255,255,255,0.08)',
          color: isCorrect ? '#3ecf8e' : isWrong ? '#f96060' : '#94a3b8',
        }}
      >
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{text}</span>

      {isOpponent && selectedIndex !== null && (
        <span className="ml-auto text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(168,85,247,0.15)' }}>
          қарсылас
        </span>
      )}
      {isSelected && (
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: isCorrect ? 'rgba(62,207,142,0.15)' : 'rgba(249,96,96,0.15)', color: isCorrect ? '#3ecf8e' : '#f96060' }}>
          сен
        </span>
      )}
    </motion.button>
  )
}

function ScoreBadge({ score, label, highlight }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={score}
        initial={{ scale: 1.5, color: '#f59e0b' }}
        animate={{ scale: 1, color: highlight ? '#fbbf24' : '#94a3b8' }}
        className="text-2xl font-black"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        {score}
      </motion.span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function DuelArena() {
  const {
    questions, currentQuestionIndex,
    playerScore, opponentScore,
    playerHP, opponentHP,
    playerAnsweredIndex, opponentAnsweredIndex,
    playerState, opponentState,
    judgeMessage,
    playerName, opponentName,
    timeLeft, roundActive,
    submitAnswer, tickTimer,
  } = useDuelStore()

  const timerRef = useRef(null)
  const question = questions[currentQuestionIndex]

  useEffect(() => {
    if (roundActive) {
      timerRef.current = setInterval(tickTimer, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [roundActive, currentQuestionIndex])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  if (!question) return null

  const answered = playerAnsweredIndex !== null
  const timerPct = (timeLeft / question.timeLimit) * 100
  const timerColor = timeLeft > 8 ? '#3ecf8e' : timeLeft > 4 ? '#f59e0b' : '#f96060'

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-2">

      {/* Scoreboard */}
      <div className="flex items-center justify-between px-2">
        <ScoreBadge score={playerScore} label={playerName} highlight={playerScore > opponentScore} />
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Раунд</span>
          <span className="text-lg font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
        <ScoreBadge score={opponentScore} label={opponentName} highlight={opponentScore > playerScore} />
      </div>

      {/* HP bars */}
      <div className="flex items-center justify-between gap-3 px-1">
        <HPBar hp={playerHP} name={playerName} />
        <div className="flex-shrink-0">
          <Zap size={16} className="text-yellow-400" />
        </div>
        <HPBar hp={opponentHP} name={opponentName} flipped />
      </div>

      {/* Characters stage */}
      <div
        className="relative flex items-end justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 24,
          minHeight: 220,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.1))' }} />

        <DuelCharacter name={playerName} state={playerState} hp={playerHP} side="left" />

        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center z-10">
          <JudgeSVG message={judgeMessage} />
        </div>

        <DuelCharacter name={opponentName} state={opponentState} hp={opponentHP} side="right" flipped />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 px-1">
        <Clock size={14} style={{ color: timerColor }} />
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full transition-all"
            animate={{ width: `${timerPct}%` }}
            style={{
              background: `linear-gradient(90deg, ${timerColor}80, ${timerColor})`,
              boxShadow: `0 0 6px ${timerColor}`,
            }}
          />
        </div>
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-sm font-black w-6 text-right"
          style={{ color: timerColor, fontFamily: 'Orbitron, monospace' }}
        >
          {timeLeft}
        </motion.span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
              {question.subject}
            </span>
          </div>
          <p className="text-base font-semibold text-slate-100 leading-relaxed mb-5">
            {question.question}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {['A', 'B', 'C', 'D'].map((label, i) => (
              <AnswerOption
                key={i}
                label={label}
                text={question.options[i]}
                index={i}
                selectedIndex={playerAnsweredIndex}
                correctIndex={answered ? question.correct : undefined}
                opponentIndex={answered ? opponentAnsweredIndex : undefined}
                onSelect={submitAnswer}
                disabled={answered}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}