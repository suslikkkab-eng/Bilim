// src/components/layout/AuthGuard.jsx
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function AuthGuard({ children }) {
  const checkAuth = useAuthStore(s => s.checkAuth)
  const location = useLocation()

  // checkAuth() проверяет и наличие user, и истечение JWT
  if (!checkAuth()) {
    // Запоминаем куда хотел попасть — после логина редиректнем обратно
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function GuestGuard({ children }) {
  const checkAuth = useAuthStore(s => s.checkAuth)

  // Если токен протух — считаем гостем, пускаем на /login и /register
  if (checkAuth()) {
    return <Navigate to="/app" replace />
  }

  return children
}