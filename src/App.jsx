// src/App.jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import LearnPage from './pages/LearnPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import BookmarksPage from './pages/BookmarksPage'
import LeaderboardPage from './pages/LeaderboardPage'
import DuelPage from './pages/DuelPage'

// Layout & Guards
import AppLayout from './components/layout/AppLayout'
import AuthGuard, { GuestGuard } from './components/layout/AuthGuard'

// Store
import useAuthStore from './store/authStore'

export default function App() {
  const syncFromServer = useAuthStore(s => s.syncFromServer)
  const checkAuth = useAuthStore(s => s.checkAuth)

  useEffect(() => {
    // checkAuth() заодно вызывает api.setToken() — восстанавливает токен в памяти api
    // после перезагрузки страницы
    if (checkAuth()) {
      syncFromServer()
    }
  }, []) // eslint-disable-line

  return (
    <HashRouter>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#151f3a',
            color: '#e8eeff',
            border: '1px solid rgba(99,179,237,0.15)',
            borderRadius: '16px',
            fontSize: '14px',
            fontFamily: 'Onest, sans-serif',
            backdropFilter: 'blur(20px)',
          },
          success: {
            iconTheme: { primary: '#3ecf8e', secondary: '#151f3a' },
          },
          error: {
            iconTheme: { primary: '#f96060', secondary: '#151f3a' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        } />

        <Route path="/register" element={
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        } />

        {/* Protected app routes */}
        <Route path="/app" element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage/>} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="duel" element={<DuelPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}