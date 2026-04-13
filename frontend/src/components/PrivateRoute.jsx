import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  // Shows theme-consistent spinner while Zustand initializes the auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-green"></div>
      </div>
    )
  }

  // Renders children (if provided as a wrapper) or Outlet (for nested route definitions)
  if (isAuthenticated) {
    return children ? children : <Outlet />
  }

  // Forces redirect to login if session is invalid or expired
  return <Navigate to="/login" replace />
}