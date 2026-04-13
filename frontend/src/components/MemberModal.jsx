import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Search, UserPlus } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export default function MemberModal({ isOpen, onClose, projectId }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [isLoading, setIsLoading] = useState(false)
  const { addMember } = useProjectStore()

  // Searches for user by email and adds them to the project with selected role
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const searchRes = await api.get(`/auth/users/search/?search=${email}`)
      const users = searchRes.data.results || []
      
      if (users.length === 0) {
        toast.error('User not found')
        return
      }
      
      // DRF backend expects user_id and role for member creation
      const userId = users[0].id
      await addMember(projectId, { user_id: userId, role })
      
      setEmail('')
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop styled with high transparency for glassmorphism effect */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-surface border border-border rounded-xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-text-light">Invite Member</Dialog.Title>
            <button onClick={onClose} className="text-text-muted hover:text-text-light transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">
                User Email
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border text-text-light rounded-md pl-10 pr-4 py-2 focus:ring-1 focus:ring-primary-green outline-none"
                  placeholder="dev@gotasks.io"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-2">
                Project Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-background border border-border text-text-light rounded-md px-4 py-2 focus:ring-1 focus:ring-primary-green outline-none cursor-pointer"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
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
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Processing...' : 'Add Member'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}