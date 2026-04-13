import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  // Validates password parity before hitting the registration endpoint
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    
    const success = await register(formData)
    // Redirects to login only after successful API verification
    if (success) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4">
      {/* Renders the global architectural grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm z-0 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 glass-card p-8 border-border/60">
        <div className="text-center">
          {/* Brand identifier using the primary-green system color */}
          <div className="mx-auto h-12 w-12 bg-primary-green/10 border border-primary-green/20 rounded-lg flex items-center justify-center">
            <span className="text-primary-green font-bold text-2xl font-mono">G</span>
          </div>
          <h2 className="mt-6 text-3xl font-black text-text-light tracking-tight">
            Join the Network
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Already authorized?{' '}
            <Link to="/login" className="font-medium text-primary-green hover:underline">
              Initialize login
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Implements multi-column layout for name fields to reduce vertical scroll */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="bg-surface border border-border text-text-light px-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="bg-surface border border-border text-text-light px-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-surface border border-border text-text-light pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Username"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-surface border border-border text-text-light pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-surface border border-border text-text-light pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="password"
              placeholder="Verify Security Key"
              required
              value={formData.password_confirm}
              onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
              className="w-full bg-surface border border-border text-text-light pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-green transition-colors text-sm"
            />
          </div>

          {/* Primary registration trigger with integrated loader state */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gradient py-4 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create System Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}