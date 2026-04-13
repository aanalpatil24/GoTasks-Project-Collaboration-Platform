import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useTaskStore } from '../store/taskStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { Plus, Search, Filter } from 'lucide-react'
import TaskModal from './TaskModal'

// Maps column statuses to specific border accent colors from our tailwind config
const columns = {
  TODO: { title: 'TO DO', color: 'bg-surface/60 border-border border-t-text-muted' },
  IN_PROGRESS: { title: 'IN PROGRESS', color: 'bg-surface/60 border-border border-t-accent-purple' },
  DONE: { title: 'DONE', color: 'bg-surface/60 border-border border-t-primary-green' },
}

export default function KanbanBoard({ projectId, userRole }) {
  const { tasks, fetchTasks, updateTaskStatus, optimisticUpdate } = useTaskStore()
  const { isConnected } = useWebSocket(projectId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Fetches initial board state on mount
  useEffect(() => {
    fetchTasks(projectId)
  }, [projectId, fetchTasks])

  // Handles drag-and-drop logic with instant local UI updates and API fallbacks
  const onDragEnd = async (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    
    optimisticUpdate(draggableId, { status: destination.droppableId })
    try {
      await updateTaskStatus(draggableId, destination.droppableId)
    } catch (error) {
      fetchTasks(projectId)
    }
  }

  // Filters local task state based on the search bar and priority dropdown
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-text-light">Task Board</h2>
          {/* WebSocket connection status indicator */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-primary-green/20 text-primary-green' : 'bg-accent-red/20 text-accent-red'}`}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        {isAdmin && (
          <button onClick={() => { setSelectedTask(null); setIsModalOpen(true); }} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Styled to match the custom dark theme background and border definitions */}
      <div className="bg-surface p-3 rounded-lg border border-border mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border border-border text-text-light rounded-md focus:ring-1 focus:ring-primary-green outline-none transition-shadow"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm bg-background border border-border text-text-light rounded-md py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary-green outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {Object.entries(columns).map(([status, config]) => {
            const columnTasks = filteredTasks.filter(t => t.status === status)
            return (
              <div key={status} className={`rounded-xl p-4 flex flex-col min-h-[500px] border-t-4 border-l border-r border-b border-l-transparent border-r-transparent border-b-transparent backdrop-blur-md ${config.color}`}>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h3 className="font-mono text-xs tracking-wider text-text-muted font-bold">{config.title}</h3>
                  <span className="text-text-muted text-xs font-mono">[{columnTasks.length}]</span>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-3 ${snapshot.isDraggingOver ? 'bg-background/50 rounded-lg' : ''}`}>
                      {columnTasks.map((task, index) => (
                        // Casts task.id to String because @hello-pangea/dnd crashes on integer IDs
                        <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                              className={`bg-background p-4 rounded-lg border border-border cursor-pointer hover:border-primary-green/50 transition-all ${snapshot.isDragging ? 'shadow-[0_0_20px_rgba(55,183,90,0.15)] border-primary-green z-50' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                {/* Color-codes priority badges dynamically */}
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${task.priority === 'HIGH' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-primary-green/10 text-primary-green border-primary-green/20'}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <h4 className="text-text-light mb-4 line-clamp-2 leading-tight">{task.title}</h4>
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                                {task.assigned_to ? (
                                  <div className="w-6 h-6 rounded border border-border bg-surface flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-light transition-colors" title={task.assigned_to.email}>
                                    {task.assigned_to.first_name?.[0] || task.assigned_to.email[0].toUpperCase()}
                                  </div>
                                ) : <div className="w-6 h-6 rounded border border-dashed border-border bg-transparent" title="Unassigned" />}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={selectedTask} projectId={projectId} userRole={userRole} />
      )}
    </div>
  )
}