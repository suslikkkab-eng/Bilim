import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Trash2, Bot, User, ChevronDown, Sparkles, Plus, Bookmark, Copy, Youtube
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Avatar, Spinner } from '../components/ui'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import { SUBJECTS } from '../utils/constants'
import { sendChatMessage, searchYouTubeVideos } from '../services/aiService'
import MathRenderer from '../components/MathRenderer'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4">
      <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-white" />
      </div>
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-2 h-2 rounded-full bg-accent"></span>
        <span className="typing-dot w-2 h-2 rounded-full bg-accent"></span>
        <span className="typing-dot w-2 h-2 rounded-full bg-accent"></span>
      </div>
    </div>
  )
}

function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-2 rounded-xl hover:bg-surface transition-all group"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text line-clamp-2 group-hover:text-accent transition-colors">
          {video.title}
        </p>
        <p className="text-xs text-text-3 mt-1 flex items-center gap-1">
          <Youtube size={10} className="text-red-500" />
          {video.channel}
        </p>
      </div>
    </a>
  )
}

function Message({ msg, user, activeSubject }) {
  const isAI = msg.role === 'ai'
  const { addBookmark, removeBookmark, isBookmarked } = useChatStore()
  const [hovered, setHovered] = useState(false)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [showVideos, setShowVideos] = useState(false)
  const bookmarked = isBookmarked(msg.id)

  const subject = SUBJECTS.find(s => s.id === activeSubject)

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(msg.id)
      toast('Бетбелгіден алынды', { icon: '' })
    } else {
      addBookmark(msg, activeSubject)
      toast.success('Сақталды! ')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    toast.success('Көшірілді!')
  }

  const handleVideos = async () => {
    if (showVideos) {
      setShowVideos(false)
      return
    }
    if (videos.length > 0) {
      setShowVideos(true)
      return
    }
    setLoadingVideos(true)
    const results = await searchYouTubeVideos(msg.content.slice(0, 100), subject?.name)
    setVideos(results)
    setLoadingVideos(false)
    setShowVideos(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-3 px-4 ${isAI ? '' : 'flex-row-reverse'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isAI ? (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center flex-shrink-0 mb-0.5">
          <Bot size={14} className="text-white" />
        </div>
      ) : (
        <Avatar user={user} size="sm" className="flex-shrink-0 mb-0.5" />
      )}

      <div className={`max-w-[80%] lg:max-w-[65%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className={`
          px-4 py-3 rounded-3xl text-sm leading-relaxed
          ${isAI
            ? 'glass rounded-bl-md text-text prose-ai'
            : 'bg-gradient-to-br from-accent to-accent-purple text-white rounded-br-md'
          }
        `}>
          {isAI ? (
            <MathRenderer text={msg.content} />
          ) : (
            msg.content
          )}
        </div>

        {/* YouTube видеолар */}
        {isAI && showVideos && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 glass rounded-2xl p-3 w-full"
          >
            <p className="text-xs font-medium text-text-2 mb-2 flex items-center gap-1">
              <Youtube size={12} className="text-red-500" />
              Тақырыпқа қатысты видеолар
            </p>
            {loadingVideos ? (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            ) : videos.length > 0 ? (
              <div className="space-y-1">
                {videos.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            ) : (
              <p className="text-xs text-text-3 text-center py-2">Видео табылмады</p>
            )}
          </motion.div>
        )}

        <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? '' : 'flex-row-reverse'}`}>
          <span className="text-xs text-text-3">
            {new Date(msg.timestamp).toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}
          </span>

          {isAI && (
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1"
                >
                  {/* YouTube кнопкасы */}
                  <button
                    onClick={handleVideos}
                    className={`p-1.5 rounded-lg transition-all ${
                      showVideos
                        ? 'text-red-500 bg-red-500/15'
                        : 'text-text-3 hover:text-red-500 hover:bg-red-500/10'
                    }`}
                    title="Видео қара"
                  >
                    {loadingVideos
                      ? <Spinner size="sm" />
                      : <Youtube size={12} />
                    }
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-lg transition-all ${
                      bookmarked
                        ? 'text-accent bg-accent/15'
                        : 'text-text-3 hover:text-accent hover:bg-accent/10'
                    }`}
                    title={bookmarked ? 'Бетбелгіден алу' : 'Сақтау'}
                  >
                    <Bookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-text-3 hover:text-text hover:bg-surface transition-all"
                    title="Көшіру"
                  >
                    <Copy size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const user = useAuthStore(s => s.user)
  const incrementChatSessions = useAuthStore(s => s.incrementChatSessions)
  const { sessions, activeSubject, setActiveSubject, addMessage, clearSession, getMemoryContext } = useChatStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSubjects, setShowSubjects] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const messages = sessions[activeSubject] || []
  const subject = SUBJECTS.find(s => s.id === activeSubject)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')
    textareaRef.current?.focus()

    addMessage(activeSubject, { role: 'user', content: userMsg })
    setIsTyping(true)

    try {
      const memoryContext = getMemoryContext(activeSubject)
      const allMessages = [...memoryContext, { role: 'user', content: userMsg }]

      const reply = await sendChatMessage({
        messages: allMessages,
        subjectName: subject?.name,
        userName: user?.name,
      })

      addMessage(activeSubject, { role: 'ai', content: reply })
      incrementChatSessions()
    } catch (err) {
      addMessage(activeSubject, {
        role: 'ai',
        content: 'Қате орын алды. Қайтадан көріңіз немесе интернет байланысын тексеріңіз.',
      })
      toast.error('Жіберу сәтсіз аяқталды')
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, activeSubject, sessions, subject, user, addMessage, incrementChatSessions])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubjectChange = (subjectId) => {
    setActiveSubject(subjectId)
    setShowSubjects(false)
  }

  const handleClear = () => {
    clearSession(activeSubject)
    toast.success('Чат тазартылды')
  }

  const welcomeMsg = {
    id: 'welcome-static',
    role: 'ai',
    content: `Сәлеметсіз бе! Мен БілімAI — ${subject?.name} пәні бойынша репетиторыңызбын.\n\nСұрақ қойыңыз, тақырып сұраңыз немесе есеп шешейік — мен дайынмын! 🎯`,
    timestamp: Date.now(),
  }

  const displayMessages = messages.length === 0 ? [welcomeMsg] : messages

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-text">AI Репетитор</h1>
          <p className="text-sm text-text-2">Сұрақ қойыңыз, жауап алыңыз</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-2.5 rounded-2xl glass text-text-3 hover:text-accent-red hover:bg-accent-red/10 transition-all"
            title="Тазарту"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subject selector */}
      <div className="relative mb-4 flex-shrink-0">
        <button
          onClick={() => setShowSubjects(!showSubjects)}
          className="w-full glass rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-accent/25 transition-all"
        >
          <span className="text-xl">{subject?.emoji}</span>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-text">{subject?.name}</div>
            <div className="text-xs text-text-3">Пән таңдалды</div>
          </div>
          <ChevronDown
            size={16}
            className={`text-text-3 transition-transform duration-200 ${showSubjects ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {showSubjects && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl border border-border z-30 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="p-2 grid grid-cols-3 gap-1 max-h-64 overflow-y-auto">
                {SUBJECTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectChange(s.id)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all
                      ${s.id === activeSubject
                        ? 'bg-accent/15 text-accent border border-accent/25'
                        : 'text-text-2 hover:bg-surface hover:text-text'
                      }
                    `}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-center leading-tight">{s.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass rounded-3xl p-4 space-y-4 min-h-0">
        {displayMessages.map((msg) => (
          <Message key={msg.id || msg.timestamp} msg={msg} user={user} activeSubject={activeSubject} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="flex gap-2 mt-3 flex-wrap flex-shrink-0">
          {[
            `${subject?.name} бойынша негізгі формулалар`,
            'ЕНТ-те жиі кездесетін сұрақтар',
            'Оңай есеп бер',
          ].map(p => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs glass rounded-xl px-3 py-2 text-text-2 hover:text-text hover:border-accent/25 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={11} className="text-accent" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex-shrink-0">
        <div className="glass rounded-2xl flex items-end gap-2 p-2 border border-border focus-within:border-accent/40 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={`${subject?.name} туралы сұраңыз...`}
            rows={1}
            disabled={isTyping}
            className="flex-1 bg-transparent text-text placeholder:text-text-3 resize-none focus:outline-none text-sm py-2 px-2 max-h-32 disabled:opacity-50"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`
              p-2.5 rounded-xl transition-all flex-shrink-0
              ${input.trim() && !isTyping
                ? 'bg-gradient-to-br from-accent to-accent-purple text-white hover:opacity-90 shadow-lg shadow-accent/25'
                : 'bg-surface text-text-3 cursor-not-allowed'
              }
            `}
          >
            {isTyping ? <Spinner size="sm" className="border-white/30 border-t-white" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-text-3 text-center mt-2">
          Enter — жіберу · Shift+Enter — жаңа жол
        </p>
      </div>
    </div>
  )
}
