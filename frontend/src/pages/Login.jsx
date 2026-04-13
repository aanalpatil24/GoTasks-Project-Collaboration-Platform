import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  // Intercepts form submission to trigger the Zustand-managed authentication flow
  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(email, password)
    // Synchronous redirect ensures the user hits the private dashboard immediately
    if (success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Renders the global architectural grid pattern defined in Tailwind config */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm z-0 pointer-events-none" />

      {/* Left Column: Interactive Authentication Interface */}
      <section className="relative z-10 flex flex-col justify-center p-12 lg:p-20 border-r border-border/50 bg-background/80 backdrop-blur-sm">
        <h2 className="text-5xl lg:text-6xl font-black text-text-light mb-16 leading-tight tracking-tight">
          Work together<br/>now on <span className="text-primary-green">GoTasks</span>
        </h2>
        
        <form className="flex flex-col gap-6 max-w-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-text-muted text-xs font-mono uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface border border-border text-text-light p-4 rounded-xl focus:outline-none focus:border-primary-green transition-colors font-sans" 
              placeholder="developer@gotasks.sys"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-text-muted text-xs font-mono uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface border border-border text-text-light p-4 rounded-xl focus:outline-none focus:border-primary-green transition-colors font-sans" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-gradient mt-4 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'SECURE_CONNECTING...' : 'Initialize Session'} 
            {!isLoading && <span className="text-white/70 ml-2">→</span>}
          </button>

          <p className="mt-6 text-text-muted text-sm">
            New to the system? <Link to="/register" className="text-primary-green hover:underline">Register local account</Link>
          </p>
        </form>
      </section>

      {/* Right Column: Visual System Capabilities Display */}
      <section className="relative z-10 hidden lg:flex items-center justify-center p-20 bg-background/30">
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Component: Real-time status visualization */}
          <div className="glass-card justify-start p-6 border-border/40">
            <p className="text-primary-green text-[10px] font-mono mb-1 uppercase tracking-tighter">System.Monitor</p>
            <div className="w-full h-32 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden mb-4">
              <div className="flex gap-3 text-text-muted font-mono text-xs items-center animate-pulse">
                <span>&lt; /&gt;</span>
                <div className="w-16 h-1 bg-primary-green/30 rounded-full"></div>
              </div>
            </div>
            <h4 className="text-lg font-bold text-text-light">Real-time Sync</h4>
            <p className="text-xs text-text-muted leading-relaxed">Low-latency task updates via WebSocket protocol.</p>
          </div>

          {/* Component: Live Kanban board preview */}
          <div className="glass-card justify-start p-6 border-border/40">
            <p className="text-primary-green text-[10px] font-mono mb-1 uppercase tracking-tighter">Workflow.Engine</p>
            <div className="w-full h-32 bg-background/50 rounded-lg border border-border/50 flex flex-col justify-center gap-3 p-4 mb-4">
              <div className="flex gap-2 items-center">
                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                 <div className="w-12 h-1 bg-border rounded-full"></div>
              </div>
              <div className="w-20 h-1 bg-border rounded-full"></div>
            </div>
            <h4 className="text-lg font-bold text-text-light">Live Kanban</h4>
            <p className="text-xs text-text-muted leading-relaxed">Dynamic boards for agile development tracking.</p>
          </div>

          {/* Component: Collaborative workspace visualization */}
          <div className="glass-card justify-start p-6 border-border/40">
            <p className="text-primary-green text-[10px] font-mono mb-1 uppercase tracking-tighter">Group.Namespace</p>
            <div className="w-full h-32 bg-background/50 rounded-lg border border-border/50 flex gap-4 items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-green to-emerald-800 border border-primary-green/20"></div>
                <div className="w-10 h-10 rounded-lg bg-surface border border-border"></div>
            </div>
            <h4 className="text-lg font-bold text-text-light">Shared Workspace</h4>
            <p className="text-xs text-text-muted leading-relaxed">Secure silos for departmental collaboration.</p>
          </div>

          {/* Component: Technical core visualization */}
          <div className="glass-card justify-start p-6 border-border/40">
            <p className="text-primary-green text-[10px] font-mono mb-1 uppercase tracking-tighter">Socket.Auth</p>
            <div className="w-full h-32 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center mb-4">
               <span className="font-mono text-4xl font-black bg-clip-text text-transparent bg-gradient-button">&gt;_</span>
            </div>
            <h4 className="text-lg font-bold text-text-light">JWT Secured</h4>
            <p className="text-xs text-text-muted leading-relaxed">Stateless authentication with automatic refresh rotation.</p>
          </div>

        </div>
      </section>
    </div>
  )
}