import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import ProjectCard from '../components/ProjectCard'
import { Plus, Search, CheckCircle2, Clock } from 'lucide-react'
import NewProjectModal from '../components/NewProjectModal'

export default function Dashboard() {
  const { projects, fetchProjects } = useProjectStore()
  const { myTasks, fetchTasks } = useTaskStore()
  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState('projects')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Syncs projects and personalized task list on component mount
  useEffect(() => {
    fetchProjects()
    if (user?.id) fetchTasks(null, user.id)
  }, [fetchProjects, fetchTasks, user])

  // Filters project list based on user search input dynamically
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filters assigned tasks by search query and excludes completed items
  const filteredTasks = myTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) && t.status !== 'DONE'
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-light tracking-tight">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-text-muted text-sm mt-1">
            You have {projects.length} active projects and {filteredTasks.length} pending tasks.
          </p>
        </div>
        
        {/* Only displays the project creation trigger when the Projects tab is active */}
        {activeTab === 'projects' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Tab navigation styled with the primary-green accent system */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'projects' ? 'border-primary-green text-primary-green' : 'border-transparent text-text-muted hover:text-text-light'}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('my_work')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === 'my_work' ? 'border-primary-green text-primary-green' : 'border-transparent text-text-muted hover:text-text-light'}`}
          >
            <span>My Work</span>
            <span className="bg-surface text-text-muted py-0.5 px-2 rounded-full text-[10px] font-mono border border-border">
              {filteredTasks.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Search container styled to match the dark surface theme */}
      <div className="flex items-center space-x-4 bg-surface p-4 rounded-lg border border-border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'projects' ? "Filter projects..." : "Search assigned tasks..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-1 focus:ring-primary-green outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Conditional rendering switches between Project Grid and Task List views */}
      {activeTab === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {filteredTasks.map((task) => (
              <li key={task.id} className="p-4 hover:bg-background/50 transition-colors">
                <Link to={`/projects/${task.project}/board`} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-text-light">{task.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-[10px] font-mono uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded border ${task.priority === 'HIGH' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 'bg-primary-green/10 text-primary-green border-primary-green/20'}`}>
                        {task.priority}
                      </span>
                      <span className="flex items-center text-text-muted"><CheckCircle2 className="w-3 h-3 mr-1" /> {task.status.replace('_', ' ')}</span>
                      {task.due_date && <span className="flex items-center text-yellow-500/80"><Clock className="w-3 h-3 mr-1" /> Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className="text-primary-green text-xs font-semibold hover:underline">Board &rarr;</span>
                </Link>
              </li>
            ))}
            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-text-muted text-sm font-mono opacity-50">
                SYSTEM_IDLE: No pending tasks found.
              </div>
            )}
          </ul>
        </div>
      )}

      {/* Global project creation modal injected at the root of the dashboard */}
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}