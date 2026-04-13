import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, LogOut, User, Bell } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Clears local state/tokens and forcibly redirects to the login screen
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    // Establishes the global dark background and base text color for all nested standard routes
    <div className="min-h-screen bg-background text-text-light font-sans selection:bg-primary-green/30">
      <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              
              {/* Brand Logo routing to Dashboard */}
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-primary-green/10 border border-primary-green/20 rounded-lg flex items-center justify-center transition-colors group-hover:border-primary-green/50">
                  <span className="text-primary-green font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold tracking-tight">GoTasks.</span>
              </Link>
              
              <div className="hidden md:flex ml-10 space-x-8">
                {/* Syncs with the App.jsx routing schema */}
                <Link to="/dashboard" className="flex items-center space-x-2 text-text-muted hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification bell with theme-compliant red accent dot */}
              <button className="p-2 text-text-muted hover:text-text-light relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full border-2 border-surface"></span>
              </button>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-text-light leading-none mb-1">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-text-muted font-mono">{user?.email}</p>
                </div>
                
                {/* User Avatar styled as a subtle surface element */}
                <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center">
                  <User className="w-4 h-4 text-text-muted" />
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="p-2 ml-2 text-text-muted hover:text-accent-red transition-colors rounded-md hover:bg-accent-red/10"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Renders nested routes (like Dashboard.jsx) inside this constrained container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}