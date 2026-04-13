import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen relative flex flex-col items-center pb-20 w-full overflow-x-hidden">
      {/* Implements the fixed grid background defined in tailwind.config.js */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-sm -z-10 pointer-events-none" />

      {/* Main Navigation bar with glassmorphism border logic */}
      <nav className="w-full max-w-7xl px-10 py-6 flex justify-between items-center border-b border-border mb-16 bg-background/50 backdrop-blur-md">
        <Link to="/" className="text-primary-green font-extrabold text-2xl font-mono tracking-tight">GoTasks.sys</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/login" className="text-text-muted hover:text-text-light transition-colors text-sm font-medium">Log in</Link>
          <Link to="/register" className="bg-text-light text-background px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity text-sm">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section using the red-wave accent for visual depth */}
      <header className="flex flex-col items-center text-center mb-24 relative w-full max-w-4xl px-6">
        <h1 className="text-6xl md:text-7xl font-black text-text-light mb-6 leading-[1.1] tracking-tight">
          Code Together,<br/>
          <span className="text-primary-green">Anywhere.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl leading-relaxed">
          The high-performance project management system designed for developers. 
          Real-time synchronization, Kanban workflows, and built-in collaboration.
        </p>
        
        <div className="relative z-10">
          <Link to="/register" className="btn-primary px-10 py-4 text-lg shadow-lg shadow-primary-green/20">
            Initialize Workspace
          </Link>
        </div>
        
        {/* Visual glow element utilizing the red-wave utility */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-wave opacity-20 blur-[100px] -z-10 pointer-events-none" />
      </header>

      {/* Feature Grid utilizing the glass-card component class */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 mb-32 relative z-10">
        <div className="glass-card items-start p-8 hover:border-primary-green/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green mb-6 border border-primary-green/20">
            <span className="font-mono text-lg group-hover:scale-110 transition-transform">&lt;/&gt;</span>
          </div>
          <h3 className="text-xl font-bold text-text-light mb-3">Sync Engine</h3>
          <p className="text-text-muted leading-relaxed text-sm">Real-time task updates powered by WebSockets for zero-latency team coordination.</p>
        </div>

        <div className="glass-card items-start p-8 hover:border-primary-green/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green mb-6 border border-primary-green/20">
            <span className="font-mono text-lg group-hover:scale-110 transition-transform">#</span>
          </div>
          <h3 className="text-xl font-bold text-text-light mb-3">Kanban Control</h3>
          <p className="text-text-muted leading-relaxed text-sm">Advanced drag-and-drop boards to visualize workflow and bottleneck distribution.</p>
        </div>

        <div className="glass-card items-start p-8 hover:border-primary-green/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green mb-6 border border-primary-green/20">
            <span className="font-mono text-lg group-hover:scale-110 transition-transform">&#123;..&#125;</span>
          </div>
          <h3 className="text-xl font-bold text-text-light mb-3">Dev First</h3>
          <p className="text-text-muted leading-relaxed text-sm">Markdown support, hotkeys, and an IDE-inspired interface for maximum focus.</p>
        </div>
      </section>

      {/* Simple FAQ section for landing conversion mapping to empty anchors */}
      <section className="w-full max-w-4xl px-6 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-text-light mb-4 tracking-tight">System FAQ</h2>
          <p className="text-text-muted">Quick answers to common deployment questions.</p>
        </div>
        <div className="flex flex-col gap-3">
          {["How does real-time sync work?", "Is GoTasks open source?", "Can I self-host this system?"].map((q, i) => (
            <div key={i} className="glass-card flex-row justify-between items-center px-6 py-5 cursor-pointer hover:bg-surface/50 transition-all border-border/50">
              <span className="text-text-light font-medium">{q}</span>
              <span className="text-primary-green opacity-50 font-mono">›</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}