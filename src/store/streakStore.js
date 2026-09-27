// src/store/streakStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStreakStore = create(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null, // 'YYYY-MM-DD'
      totalActiveDays: 0,

      // Вызывать каждый раз когда пользователь тапсырды тест
      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastActiveDate, currentStreak, longestStreak, totalActiveDays } = get()

        if (lastActiveDate === today) return // уже записали сегодня

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const newStreak = lastActiveDate === yesterdayStr ? currentStreak + 1 : 1
        const newLongest = Math.max(longestStreak, newStreak)

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          totalActiveDays: totalActiveDays + 1,
        })

        return newStreak
      },

      // Проверить не сломался ли стрик (вызывать при открытии приложения)
      checkStreak: () => {
        const { lastActiveDate, currentStreak } = get()
        if (!lastActiveDate || currentStreak === 0) return

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        // Если последняя активность не сегодня и не вчера — стрик сломан
        if (lastActiveDate !== today && lastActiveDate !== yesterdayStr) {
          set({ currentStreak: 0 })
        }
      },
    }),
    {
      name: 'bilimai-streak',
    }
  )
)

export default useStreakStore
