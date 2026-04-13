import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Components
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Optional: Prevent a flash of the login screen while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center text-[#37b75a] font-mono">
        INITIALIZING_SESSION...
      </div>
    )
  }

  return (
    <Routes>
      {/* 1. PUBLIC ROUTES (Redirect to dashboard if already logged in) */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      
      {/* 2. STANDARD PROTECTED ROUTES (Uses the <Layout /> wrapper) */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other standard layout pages here (e.g., /profile, /settings) */}
      </Route>

      {/* 3. FULL-SCREEN PROTECTED ROUTES (Bypasses <Layout /> for the IDE feel) */}
      {/* We still use PrivateRoute to protect it, but drop the Layout so the IDE takes up 100% of the window */}
      <Route element={<PrivateRoute />}>
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/board" element={<ProjectDetail />} />
      </Route>
    </Routes>
  )
}

export default App