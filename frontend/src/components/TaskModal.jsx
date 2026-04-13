import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Send, Trash2 } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import SimpleMdeReact from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

export default function TaskModal({ isOpen, onClose, task, projectId, userRole }) {
  const { createTask, updateTask, deleteTask, comments, fetchComments, addComment } = useTaskStore()
  const { currentProject } = useProjectStore()
  const { user } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const taskComments = task ? comments[task.id] || [] : []

  // Internal state for form handling to manage controlled inputs
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM', assigned_to: '', due_date: '',
  })

  // Syncs modal state with task data and triggers comment retrieval for existing tasks
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title, description: task.description || '', status: task.status,
        priority: task.priority, assigned_to: task.assigned_to?.id || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      })
      fetchComments(task.id)
    } else {
      setFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assigned_to: '', due_date: '' })
    }
  }, [task, fetchComments])

  // Handles both creation and updates using the task existence as a toggle
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = { ...formData, project: projectId }
      if (task) await updateTask(task.id, data)
      else await createTask(data)
      onClose()
    } catch (error) {
      // Errors are globally handled via toast in the taskStore
    } finally {
      setIsLoading(false)
    }
  }

  // Submits a new comment and resets the local input buffer
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !task) return
    await addComment(task.id, newComment)
    setNewComment('')
  }

  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Implements high-contrast backdrop for focus management */}
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl w-full bg-surface border border-border rounded-xl shadow-2xl flex h-[85vh] overflow-hidden">
          
          {/* Main Task Configuration Area */}
          <div className="flex-1 overflow-y-auto border-r border-border flex flex-col bg-background">
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
              <Dialog.Title className="text-xl font-bold text-text-light">{task ? 'Edit Task' : 'New Task'}</Dialog.Title>
              {!task && <button onClick={onClose} className="text-text-muted hover:text-text-light"><X className="w-5 h-5" /></button>}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-surface border border-border text-text-light rounded-md px-4 py-2 text-lg focus:ring-1 focus:ring-primary-green outline-none" 
                  placeholder="Task title" 
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">Description</label>
                <div className="prose-dark">
                  <SimpleMdeReact 
                    value={formData.description} 
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    options={{ status: false, spellChecker: false, minHeight: "200px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-surface border border-border text-text-light rounded-md px-3 py-2 outline-none">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-surface border border-border text-text-light rounded-md px-3 py-2 outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-2">Assign To</label>
                  <select value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full bg-surface border border-border text-text-light rounded-md px-3 py-2 outline-none">
                    <option value="">Unassigned</option>
                    {currentProject?.members?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.first_name || m.user.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-2">Due Date</label>
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full bg-surface border border-border text-text-light rounded-md px-3 py-2 outline-none" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                {task && isAdmin && (
                  <button type="button" onClick={() => { if(confirm('Delete task?')) { deleteTask(task.id); onClose(); } }} className="text-accent-red hover:text-accent-red/80 flex items-center gap-2 text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-text-muted hover:text-text-light transition-colors">Cancel</button>
                  <button type="submit" disabled={isLoading} className="btn-primary min-w-[120px]">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </div>
            </form>
          </div>

          {/* Activity Feed and Real-time Comments Section */}
          {task && (
            <div className="w-96 bg-surface flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">Activity Feed</h3>
                <button onClick={onClose} className="text-text-muted hover:text-text-light"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {taskComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <p className="text-sm font-mono mt-2">Zero transmissions</p>
                  </div>
                ) : (
                  taskComments.map((comment) => (
                    <div key={comment.id} className={`flex flex-col ${comment.author.id === user?.id ? 'items-end' : 'items-start'}`}>
                      <div className="text-[10px] text-text-muted mb-1 flex items-center space-x-1 font-mono">
                        <span className="text-primary-green">{comment.author.first_name || 'user'}</span>
                        <span>•</span>
                        <span>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${comment.author.id === user?.id ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background border border-border text-text-light'}`}>
                        {comment.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-border bg-background">
                <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-surface border border-border text-text-light rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary-green outline-none"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="bg-primary-green text-background p-2 rounded-md hover:bg-primary-green/90 disabled:opacity-30 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}