import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import KanbanBoard from '../components/KanbanBoard'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const [consoleInput, setConsoleInput] = useState("")
  const [terminalLogs, setTerminalLogs] = useState([])
  const { currentProject, fetchProjectDetail } = useProjectStore()
  const { fetchTasks } = useTaskStore()

  // Pulls full project context and task list on mount for the IDE workspace
  useEffect(() => {
    fetchProjectDetail(projectId)
    fetchTasks(projectId)
    
    // Simulates an initial boot sequence for the terminal UI
    setTerminalLogs([
      { id: 1, type: 'system', text: 'Connected to workspace cluster node_01.' },
      { id: 2, type: 'info', text: `$ Loading activity streams for project_${projectId}...` }
    ])
  }, [projectId, fetchProjectDetail, fetchTasks])

  // Handles simulated terminal chat submissions
  const handleTerminalSubmit = (e) => {
    if (e.key === 'Enter' && consoleInput.trim()) {
      setTerminalLogs(prev => [...prev, { id: Date.now(), type: 'user', text: `> ${consoleInput}` }])
      setConsoleInput("")
    }
  }

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-2 lg:p-6 overflow-hidden">
      
      {/* Implements the high-fidelity macOS window aesthetic with custom shadows */}
      <div className="w-full max-w-[1600px] h-full bg-[#1e1e1e] border border-[#333] rounded-xl flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        
        <header className="h-9 bg-[#2c2c2e] border-b border-[#333] flex items-center px-4 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff4742]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c940]"></div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar icons utilize the monospaced terminal font for a technical feel */}
          <aside className="w-[72px] bg-[#1e1e20] border-r border-border flex flex-col items-center py-5 shrink-0 z-20 relative">
             <div className="w-11 h-11 rounded-lg flex items-center justify-center text-text-muted hover:text-white cursor-pointer mb-4 transition-colors">
                <span className="font-mono text-xl">[]</span>
             </div>
             <div className="w-11 h-11 rounded-lg flex items-center justify-center text-primary-green bg-primary-green/10 cursor-pointer mb-4">
                <span className="font-mono text-xl">/&gt;</span>
             </div>
             
             <div className="flex-1 w-full border-t border-border mt-auto pt-4 px-2 flex flex-col gap-3 items-center">
                 <div className="w-8 h-8 rounded bg-[#333] text-xs flex items-center justify-center font-mono border border-border cursor-pointer text-text-light">P1</div>
                 <div className="w-8 h-8 rounded bg-background text-xs flex items-center justify-center font-mono border border-border text-text-muted cursor-pointer">P2</div>
             </div>
          </aside>

          <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
            
            <div className="h-12 bg-[#212123] border-b border-border flex justify-between items-center px-5 shrink-0">
               <div className="flex items-center gap-4">
                   {/* Dynamically displays project namespace in the terminal breadcrumb */}
                   <div className="text-primary-green font-mono text-sm tracking-wide uppercase">
                     PROJECT://{currentProject?.name?.replace(/\s+/g, '-') || 'LOADING'}/BOARD
                   </div>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-green/10 border border-primary-green/20 rounded text-primary-green text-[10px] font-bold tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse"></div> LIVE_SYNC
                   </div>
               </div>
               <div className="flex items-center gap-4 text-text-muted">
                   <span className="cursor-pointer hover:text-white text-xs font-mono">SETTINGS.CFG</span>
                   <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden border border-border">
                       <img src={`https://ui-avatars.com/api/?name=${currentProject?.name}&background=37b75a&color=fff`} alt="Project" />
                   </div>
               </div>
            </div>

            <div className="flex-1 grid grid-cols-[1fr_350px] grid-rows-[1fr_200px] overflow-hidden">
                
                {/* INJECTED: Replaced static columns with the fully functional interactive KanbanBoard component */}
                <section className="col-start-1 col-end-2 row-start-1 row-end-2 border-r border-b border-border bg-[#1c1c1e] p-4 overflow-y-auto relative z-10">
                   <KanbanBoard projectId={projectId} userRole={currentProject?.user_role} />
                </section>

                {/* Simulated Markdown/Code Editor pane for task documentation */}
                <section className="col-start-2 col-end-3 row-start-1 row-end-2 bg-[#1e1e20] flex flex-col border-b border-border z-20">
                   <div className="h-9 bg-[#212123] border-b border-border flex items-center px-4 justify-between">
                      <div className="flex items-center gap-2 text-text-light text-[10px] font-mono tracking-wider">
                         <span className="text-primary-green">{'{}'}</span> DOC_EDITOR.MD
                      </div>
                      <span className="text-text-muted cursor-pointer hover:text-white transition-colors">×</span>
                   </div>
                   
                   <div className="flex-1 p-4 font-mono text-[13px] leading-relaxed text-text-light overflow-y-auto whitespace-pre">
                      <div className="flex gap-4"><span className="text-[#4e4e50] w-6 text-right select-none">1</span><span className="text-primary-green"># Documentation</span></div>
                      <div className="flex gap-4"><span className="text-[#4e4e50] w-6 text-right select-none">2</span><span>Initialize project parameters...</span></div>
                      <div className="flex gap-4"><span className="text-[#4e4e50] w-6 text-right select-none">3</span><span>&gt; WebSocket handshakes verified.</span></div>
                   </div>

                   <div className="h-9 border-t border-border flex justify-between items-center px-4 text-[10px] font-mono text-text-muted">
                      <span>UTF-8</span>
                      <span>MD_SYNTAX_ENABLED</span>
                   </div>
                </section>

                {/* Real-time Shared Console for team communication and system logs */}
                <section className="col-start-1 col-end-2 row-start-2 row-end-3 bg-[#121214] border-r border-border flex flex-col z-20 relative">
                   <div className="h-10 border-b border-border flex justify-between items-center px-5 text-[10px] font-bold font-mono text-text-muted">
                      <span>TERMINAL_OUTPUT <span className="text-primary-green animate-pulse ml-2">● ONLINE</span></span>
                   </div>
                   
                   <div className="flex-1 p-4 font-mono text-[12px] leading-relaxed overflow-y-auto flex flex-col justify-end">
                      {terminalLogs.map(log => (
                        <div key={log.id} className={`${log.type === 'system' ? 'text-primary-green font-bold' : log.type === 'user' ? 'text-text-light' : 'text-text-muted'} mb-1`}>
                          {log.text}
                        </div>
                      ))}
                   </div>

                   <div className="h-12 border-t border-border flex items-center px-4 gap-3">
                      <span className="text-primary-green font-bold leading-none">➜</span>
                      {/* Wired up onKeyDown to handle actual terminal submissions */}
                      <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[13px] placeholder:text-text-muted/40" 
                        placeholder="Broadcast message to team..." 
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        onKeyDown={handleTerminalSubmit}
                      />
                   </div>
                </section>

                {/* Active Membership pane displaying real-time presence indicators */}
                <section className="col-start-2 col-end-3 row-start-2 row-end-3 bg-[#1c1c1e] p-5 flex flex-col z-20">
                   <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-[0.2em] mb-4">MEMBER_PRESENCE</h3>
                   <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                      {currentProject?.members?.map((member) => (
                          <div key={member.user.id} className="flex items-center gap-3 group">
                              <div className="w-8 h-8 rounded-lg border border-border bg-[#333] overflow-hidden group-hover:border-primary-green transition-colors">
                                  <img src={`https://ui-avatars.com/api/?name=${member.user.first_name || member.user.username}&background=212123&color=37b75a`} alt="Avatar" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-mono text-text-light uppercase tracking-tight">{member.user.first_name || member.user.username}</span>
                                <span className="text-[9px] font-mono text-primary-green/60">{member.role}</span>
                              </div>
                          </div>
                      ))}
                   </div>
                   <button className="btn-gradient w-full py-2.5 text-[10px] font-mono tracking-widest mt-auto border border-white/5 uppercase hover:opacity-90 transition-opacity">
                     Join Voice Channel
                   </button>
                </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}