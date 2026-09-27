// src/store/duelStore.js
// Сервер (Go backend) — единый источник правды для дуэли.
// Стор только опрашивает состояние комнаты и отображает его с точки зрения "я / соперник".
import { create } from 'zustand'
import api from '../api/api'

const POLL_MS = 700

const initialDuelState = {
  screen: 'lobby', // 'lobby' | 'waiting' | 'arena' | 'result'
  roomCode: '',
  playerName: '',
  opponentName: '',
  isHost: false,

  questions: [],
  currentQuestionIndex: 0,
  playerScore: 0,
  opponentScore: 0,
  playerHP: 100,
  opponentHP: 100,
  playerAnsweredIndex: null,
  opponentAnsweredIndex: null,
  playerState: 'idle',
  opponentState: 'idle',
  judgeMessage: '',
  timeLeft: 15,
  roundActive: false,
  duelWinner: null,
}

let pollTimer = null

const useDuelStore = create((set, get) => {
  const stopPoll = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const startPoll = () => {
    stopPoll()
    pollTimer = setInterval(async () => {
      const { roomCode } = get()
      if (!roomCode) {
        stopPoll()
        return
      }
      let res
      try {
        res = await api.getDuelRoom(roomCode)
      } catch (err) {
        return // временная сетевая ошибка — попробуем на следующем тике
      }
      if (!res || !res.ok) return
      get().applyRoom(res.data)
    }, POLL_MS)
  }

  return {
    ...initialDuelState,

    setPlayerName: (name) => set({ playerName: name }),

    // Применить состояние комнаты с сервера к локальному состоянию "я / соперник"
    applyRoom: (room) => {
      const isHost = get().isHost

      const myAnswer = isHost ? room.hostAnswer : room.guestAnswer
      const oppAnswer = isHost ? room.guestAnswer : room.hostAnswer
      const myHP = isHost ? room.hostHP : room.guestHP
      const oppHP = isHost ? room.guestHP : room.hostHP
      const myScore = isHost ? room.hostScore : room.guestScore
      const oppScore = isHost ? room.guestScore : room.hostScore
      const oppName = (isHost ? room.guestName : room.hostName) || 'Қарсылас'

      // ── Дуэль завершена ─────────────────────────────────────────────
      if (room.finished) {
        const myWin =
          (room.winner === 'host' && isHost) ||
          (room.winner === 'guest' && !isHost)
        const isDraw = room.winner === 'draw' || !room.winner
        stopPoll()
        set({
          screen: 'result',
          questions: room.questions || [],
          currentQuestionIndex: room.currentIndex || 0,
          playerHP: myHP,
          opponentHP: oppHP,
          playerScore: myScore,
          opponentScore: oppScore,
          opponentName: oppName,
          duelWinner: isDraw ? null : myWin ? 'player' : 'opponent',
          playerState: isDraw ? 'idle' : myWin ? 'victory' : 'defeat',
          opponentState: isDraw ? 'idle' : myWin ? 'defeat' : 'victory',
          judgeMessage: isDraw
            ? '🤝 Тең! Сіздер күші тең!'
            : myWin
            ? '🏆 Жеңіс! Керемет дуэль!'
            : '💀 Жеңіліс. Көбірек жаттық!',
          roundActive: false,
        })
        return
      }

      // ── Ожидание соперника / старта ─────────────────────────────────
      if (!room.started) {
        set({
          screen: 'waiting',
          opponentName: room.guest ? oppName : 'Қарсыласты күтудеміз...',
        })
        return
      }

      // ── Арена (дуэль идёт) ──────────────────────────────────────────
      const questions = room.questions || []
      const q = questions[room.currentIndex]
      const resolved = room.roundResolved

      // Сброс ответа при переходе на новый вопрос; до этого держим "оптимистичный" ответ
      const isNewRound = room.currentIndex !== get().currentQuestionIndex
      const serverMine = myAnswer === -1 ? null : myAnswer
      let playerAnsweredIndex
      if (serverMine !== null) playerAnsweredIndex = serverMine
      else if (isNewRound || resolved) playerAnsweredIndex = null
      else playerAnsweredIndex = get().playerAnsweredIndex // ещё не долетел до сервера

      let playerState = 'idle'
      let opponentState = 'idle'
      let judgeMessage = ''
      let opponentAnsweredIndex = null

      if (resolved && q) {
        opponentAnsweredIndex = oppAnswer === -1 ? null : oppAnswer
        const iCorrect = myAnswer === q.correct
        const oppCorrect = oppAnswer === q.correct
        if (iCorrect && !oppCorrect) {
          playerState = 'correct'
          opponentState = 'damaged'
          judgeMessage = '🔥 Керемет! Дәл соққы!'
        } else if (!iCorrect && oppCorrect) {
          playerState = 'wrong'
          opponentState = 'correct'
          judgeMessage = '⚡ Қарсылас озып кетті!'
        } else if (iCorrect && oppCorrect) {
          playerState = 'correct'
          opponentState = 'correct'
          judgeMessage = '🤝 Екеуі де дұрыс жауап берді!'
        } else {
          playerState = 'wrong'
          opponentState = 'wrong'
          judgeMessage = '😅 Екеуі де қателесті!'
        }
      } else {
        judgeMessage =
          playerAnsweredIndex !== null
            ? '⏳ Қарсыластың жауабын күтудеміз...'
            : 'Жауабыңды таңда!'
      }

      set({
        screen: 'arena',
        opponentName: oppName,
        questions,
        currentQuestionIndex: room.currentIndex,
        timeLeft: room.timeLeft,
        roundActive: !resolved,
        playerAnsweredIndex,
        opponentAnsweredIndex,
        playerHP: myHP,
        opponentHP: oppHP,
        playerScore: myScore,
        opponentScore: oppScore,
        playerState,
        opponentState,
        judgeMessage,
      })
    },

    // Создать комнату (на бэкенде) и ждать соперника
    createRoom: async (name) => {
      const playerName = name || 'Ойыншы'
      const res = await api.createDuelRoom(playerName)
      if (!res || !res.ok) {
        throw new Error(res?.data?.error || 'Бөлме жасау сәтсіз')
      }
      set({
        ...initialDuelState,
        playerName,
        opponentName: 'Қарсыласты күтудеміз...',
        roomCode: res.data.code,
        isHost: true,
        screen: 'waiting',
      })
      startPoll()
    },

    // Войти в комнату по коду
    joinRoom: async (code, name) => {
      const playerName = name || 'Ойыншы'
      const res = await api.joinDuelRoom(code, playerName)
      if (!res || !res.ok) {
        throw new Error(res?.data?.error || 'Бөлмеге кіру сәтсіз')
      }
      set({
        ...initialDuelState,
        playerName,
        opponentName: 'Қарсылас',
        roomCode: code.toUpperCase(),
        isHost: false,
        screen: 'waiting',
      })
      startPoll()
    },

    // Хост запускает дуэль; гость перейдёт в арену автоматически через опрос
    startDuel: async () => {
      const { roomCode } = get()
      const res = await api.startDuel(roomCode)
      if (!res || !res.ok) {
        throw new Error(res?.data?.error || 'Дуэльді бастау сәтсіз')
      }
    },

    // Отправить ответ (оптимистично показываем выбор, сервер подтвердит)
    submitAnswer: async (index) => {
      if (get().playerAnsweredIndex !== null || !get().roundActive) return
      set({ playerAnsweredIndex: index })
      try {
        const res = await api.submitDuelAnswer(get().roomCode, index)
        if (res && res.ok) get().applyRoom(res.data)
      } catch (err) {
        // ответ не ушёл — опрос всё равно поправит состояние
      }
    },

    // Локальный таймер (для плавности; сервер сам резолвит по тайм-ауту)
    tickTimer: () => {
      const { timeLeft, roundActive } = get()
      if (!roundActive) return
      if (timeLeft > 0) set({ timeLeft: timeLeft - 1 })
    },

    leaveRoom: () => {
      stopPoll()
      set({ ...initialDuelState })
    },

    resetDuel: () => {
      stopPoll()
      set({ ...initialDuelState })
    },
  }
})

export default useDuelStore
