import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  myTasks: [],
  comments: {}, 
  currentTask: null,
  isLoading: false,
  error: null,

  // Uses query params to route DRF filtering for either global project views or personal dashboards
  fetchTasks: async (projectId = null, assignedTo = null) => {
    set({ isLoading: true, error: null })
    try {
      const params = {}
      if (projectId) params.project = projectId
      if (assignedTo) params.assigned_to = assignedTo
      
      const response = await api.get('/tasks/', { params })
      const data = response.data.results || response.data
      
      if (assignedTo) {
        set({ myTasks: data, isLoading: false })
      } else {
        set({ tasks: data, isLoading: false })
      }
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, isLoading: false })
    }
  },

  createTask: async (data) => {
    try {
      const response = await api.post('/tasks/', data)
      set((state) => ({ tasks: [response.data, ...state.tasks] }))
      toast.success('Task recorded.')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record task')
      throw error
    }
  },

  // Synchronizes task updates across both the global project array and user-specific array
  updateTask: async (taskId, data) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, data)
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? response.data : t),
        myTasks: state.myTasks.map(t => t.id === taskId ? response.data : t),
      }))
      return response.data
    } catch (error) {
      toast.error('Failed to patch task state')
      throw error
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}/`)
      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        myTasks: state.myTasks.filter(t => t.id !== taskId),
      }))
      toast.success('Task purged.')
    } catch (error) {
      toast.error('Failed to purge task')
    }
  },

  // Shortcut dispatcher specifically tailored for Kanban drag-and-drop actions
  updateTaskStatus: async (taskId, status) => {
    return get().updateTask(taskId, { status })
  },

  // Ensures immediate UI responsiveness on the Kanban board prior to DRF confirmation
  optimisticUpdate: (taskId, data) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...data } : t)
    }))
  },

  // Normalizes comment data into a dictionary structure keyed by task ID for quick lookup
  fetchComments: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/comments/`)
      set((state) => ({
        comments: { ...state.comments, [taskId]: response.data.results || response.data }
      }))
    } catch (error) {
      console.error('Failed to fetch comments', error)
    }
  },

  // Fires the POST request; the subsequent state update is caught by the WebSocket sync logic
  addComment: async (taskId, content) => {
    try {
      await api.post(`/tasks/${taskId}/comments/`, { content })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to transmit comment')
    }
  },

  // Main ingestion engine for incoming Django Channels WebSocket payloads
  syncTaskFromWebSocket: (event, payload) => {
    if (event === 'task_deleted') {
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== payload.task_id) }))
      return
    }

    if (event === 'comment_added') {
      const { task_id, comment } = payload
      set((state) => {
        const existingComments = state.comments[task_id] || []
        // Deduplicates incoming socket traffic against local state
        if (existingComments.find(c => c.id === comment.id)) return state
        return {
          comments: {
            ...state.comments,
            [task_id]: [...existingComments, comment]
          }
        }
      })
      return
    }

    // Upserts task data: updates existing entries or prepends entirely new ones
    set((state) => {
      const exists = state.tasks.find(t => t.id === payload.id)
      if (exists) {
        return { tasks: state.tasks.map(t => t.id === payload.id ? payload : t) }
      } else {
        return { tasks: [payload, ...state.tasks] }
      }
    })
  },
}))