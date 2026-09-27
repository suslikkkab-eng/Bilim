// src/pages/BookmarksPage.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, BookOpen, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import useChatStore from '../store/chatStore'
import MathRenderer from '../components/MathRenderer'
import { SUBJECTS } from '../utils/constants'

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useChatStore()

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Көшірілді!')
  }

  const handleDelete = (id) => {
    removeBookmark(id)
    toast.success('Жойылды')
  }

  const getSubjectName = (subjectId) => {
    return SUBJECTS.find(s => s.id === subjectId)?.name || subjectId
  }

  const getSubjectEmoji = (subjectId) => {
    return SUBJECTS.find(s => s.id === subjectId)?.emoji || '📚'
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-xl text-text flex items-center gap-2">
          <Bookmark size={20} className="text-accent" />
          Сақталған жауаптар
        </h1>
        <p className="text-sm text-text-2 mt-1">
          Маңызды деп белгілеген AI жауаптарың
        </p>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-12 text-center"
        >
          <BookOpen size={48} className="text-text-3 mx-auto mb-4" />
          <p className="text-text-2 font-medium">Әлі ештеңе сақталмаған</p>
          <p className="text-text-3 text-sm mt-1">
            Чатта AI жауабының үстіне апарып 🔖 белгісін басыңыз
          </p>
        </motion.div>
      )}

      {/* Bookmarks list */}
      <div className="space-y-4">
        <AnimatePresence>
          {bookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-4"
            >
              {/* Subject badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs glass rounded-xl px-3 py-1 text-text-2 flex items-center gap-1.5">
                  <span>{getSubjectEmoji(bookmark.subject)}</span>
                  {getSubjectName(bookmark.subject)}
                </span>
                <span className="text-xs text-text-3">
                  {new Date(bookmark.savedAt).toLocaleDateString('kk-KZ', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Content */}
              <div className="text-sm text-text leading-relaxed mb-3">
                <MathRenderer text={bookmark.content} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleCopy(bookmark.content)}
                  className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text transition-colors px-2 py-1 rounded-lg hover:bg-surface"
                >
                  <Copy size={12} />
                  Көшіру
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="flex items-center gap-1.5 text-xs text-text-3 hover:text-accent-red transition-colors px-2 py-1 rounded-lg hover:bg-accent-red/10 ml-auto"
                >
                  <Trash2 size={12} />
                  Жою
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
