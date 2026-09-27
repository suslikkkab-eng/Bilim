import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Edit3, Save, X, LogOut, BookOpen,
  MessageSquare, Trophy, Star, Camera, Shield, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button, Input, Avatar, Stat, ProgressBar } from '../components/ui'
import useAuthStore from '../store/authStore'
import { SUBJECTS, getLevel, ROLE_LABELS } from '../utils/constants'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { updateProfile, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' })

  const level = getLevel(user?.totalScore || 0)
  const progress = user?.progress || {}
  const topSubjects = SUBJECTS
    .map(s => ({ ...s, pct: progress[s.id] || 0 }))
    .filter(s => s.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Аты-жөні бос болмауы керек')
      return
    }
    updateProfile({ name: form.name.trim(), bio: form.bio.trim() })
    setEditing(false)
    toast.success('Профиль жаңартылды ✓')
  }

  const handleCancel = () => {
    setForm({ name: user?.name || '', bio: user?.bio || '' })
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Жүйеден шықтыңыз')
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Сурет 2MB-тан аспауы керек')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ avatar: reader.result })
      toast.success('Аватар жаңартылды!')
    }
    reader.readAsDataURL(file)
  }

  const memberDays = user?.createdAt
    ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-text mb-1">Профиль</h1>
        <p className="text-text-2 text-sm">Жеке аккаунтыңызды басқарыңыз</p>
      </div>

      {/* Main profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-accent/15 to-accent-purple/10 pointer-events-none" />

          <div className="relative">
            {/* Avatar + edit toggle */}
            <div className="flex items-end justify-between mb-5">
              <div className="relative group">
                <Avatar user={user} size="xl" />
                <label className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="flex gap-2">
                {!editing ? (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)} icon={<Edit3 size={14} />}>
                    Өзгерту
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancel} icon={<X size={14} />}>Болдырмау</Button>
                    <Button size="sm" onClick={handleSave} icon={<Save size={14} />}>Сақтау</Button>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            {!editing ? (
              <div>
                <h2 className="font-display font-bold text-2xl text-text mb-1">{user?.name}</h2>
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <Badge color={user?.role === 'teacher' ? 'purple' : 'blue'}>
                    {ROLE_LABELS[user?.role]}
                  </Badge>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border font-semibold" style={{ color: level.color, borderColor: level.color + '40' }}>
                    ⭐ {level.label}
                  </span>
                </div>
                <p className="text-text-2 text-sm flex items-center gap-1.5">
                  <Mail size={13} className="text-text-3" /> {user?.email}
                </p>
                {user?.bio && (
                  <p className="text-text-2 text-sm mt-2 leading-relaxed">{user.bio}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Аты-жөні"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  icon={<User size={15} />}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-2">Өзіңіз туралы</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Қысқаша өзіңіз туралы жазыңыз..."
                    rows={3}
                    maxLength={200}
                    className="w-full glass rounded-2xl px-4 py-3 text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all text-sm resize-none border border-border"
                  />
                  <span className="text-xs text-text-3 text-right">{form.bio.length}/200</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        <Stat label="Балл" value={user?.totalScore || 0} icon={<Trophy size={16} />} color="gold" />
        <Stat label="Тест" value={user?.testsCompleted || 0} icon={<BookOpen size={16} />} color="blue" />
        <Stat label="Чат" value={user?.chatSessions || 0} icon={<MessageSquare size={16} />} color="purple" />
        <Stat label="Күн" value={memberDays} icon={<Calendar size={16} />} color="green" />
      </motion.div>

      {/* Top subjects */}
      {topSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <Card>
            <h3 className="font-bold text-text mb-4 flex items-center gap-2">
              <Star size={16} className="text-accent-gold" /> Үздік пәндер
            </h3>
            <div className="space-y-3">
              {topSubjects.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-text-3 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-lg flex-shrink-0">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-text">{s.name}</span>
                      <span className="text-sm font-bold text-accent-green">{s.pct}%</span>
                    </div>
                    <ProgressBar value={s.pct} max={100} color="green" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Account section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="font-bold text-text mb-4 flex items-center gap-2">
            <Shield size={16} className="text-text-3" /> Аккаунт
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 glass rounded-2xl">
              <Mail size={16} className="text-text-3" />
              <div className="flex-1">
                <div className="text-xs text-text-3">Email</div>
                <div className="text-sm text-text">{user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-2xl">
              <User size={16} className="text-text-3" />
              <div className="flex-1">
                <div className="text-xs text-text-3">Рөл</div>
                <div className="text-sm text-text">{ROLE_LABELS[user?.role]}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="danger"
              onClick={handleLogout}
              icon={<LogOut size={15} />}
              className="w-full"
            >
              Жүйеден шығу
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
