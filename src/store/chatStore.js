import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MEMORY_LIMIT = 20 // AI есінде ұстайтын хабарлама саны

const useChatStore = create(
  persist(
    (set, get) => ({
      sessions: {}, // { [subject]: Message[] }
      activeSubject: 'math',
      bookmarks: [], // сақталған маңызды жауаптар

      setActiveSubject: (subject) => set({ activeSubject: subject }),

      getMessages: (subject) => {
        return get().sessions[subject] || []
      },

      // AI-ге жіберу үшін соңғы MEMORY_LIMIT хабарламаны қайтарады
      getMemoryContext: (subject) => {
        const messages = get().sessions[subject] || []
        return messages.slice(-MEMORY_LIMIT)
      },

      addMessage: (subject, message) => {
        const sessions = get().sessions
        const existing = sessions[subject] || []
        set({
          sessions: {
            ...sessions,
            [subject]: [...existing, { ...message, id: crypto.randomUUID(), timestamp: Date.now() }],
          },
        })
      },

      clearSession: (subject) => {
        const sessions = get().sessions
        set({ sessions: { ...sessions, [subject]: [] } })
      },

      clearAll: () => set({ sessions: {} }),

      // ── Bookmarks ──────────────────────────────────────────
      addBookmark: (message, subject) => {
        const bookmarks = get().bookmarks
        const already = bookmarks.find(b => b.id === message.id)
        if (already) return false // бұрыннан бар

        set({
          bookmarks: [
            {
              id: message.id,
              content: message.content,
              subject,
              savedAt: Date.now(),
            },
            ...bookmarks,
          ],
        })
        return true
      },

      removeBookmark: (id) => {
        set({ bookmarks: get().bookmarks.filter(b => b.id !== id) })
      },

      isBookmarked: (id) => {
        return get().bookmarks.some(b => b.id === id)
      },
    }),
    {
      name: 'bilimai-chat',
    }
  )
)

export default useChatStore
