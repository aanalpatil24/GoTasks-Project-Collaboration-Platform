import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'

export default function NewProjectModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { createProject } = useProjectStore()

  // Triggers the project creation flow and resets local state on success
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createProject({ name, description })
      setName('')
      setDescription('')
      onClose()
    } catch (error) {
      // Error handling is managed via toast notifications in projectStore
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Implements high-transparency backdrop for consistent dark-mode depth */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-surface border border-border rounded-xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-text-light">New Project</Dialog.Title>
            <button onClick={onClose} className="text-text-muted hover:text-text-light transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border text-text-light rounded-md px-4 py-2 focus:ring-1 focus:ring-primary-green outline-none transition-shadow"
                placeholder="e.g., Alpha Development"
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border text-text-light rounded-md px-4 py-2 focus:ring-1 focus:ring-primary-green outline-none resize-none"
                placeholder="High-level project goals..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm text-text-muted hover:text-text-light transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}