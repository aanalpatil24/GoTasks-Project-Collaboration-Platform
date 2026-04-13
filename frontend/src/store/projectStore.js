import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Fetches list of projects, utilizing the || fallback for strict DRF pagination handling
  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/projects/')
      set({ projects: response.data.results || response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, isLoading: false })
    }
  },

  createProject: async (data) => {
    try {
      const response = await api.post('/projects/', data)
      set((state) => ({ projects: [response.data, ...state.projects] }))
      toast.success('Project initialized.')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initialize project')
      throw error
    }
  },

  // Hydrates the workspace with full project metadata, including roles and members
  fetchProjectDetail: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/projects/${projectId}//`)
      set({ currentProject: response.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, isLoading: false })
      throw error
    }
  },

  updateProject: async (projectId, data) => {
    try {
      const response = await api.patch(`/projects/${projectId}/`, data)
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? response.data : p),
        currentProject: state.currentProject?.id === projectId ? response.data : state.currentProject
      }))
      toast.success('Project parameters updated.')
    } catch (error) {
      toast.error('Failed to update project')
    }
  },

  // Removes project from global list and safely nullifies current view if active
  deleteProject: async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}/`)
      set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject
      }))
      toast.success('Project deleted.')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  },

  // Injects a new user object into the nested members array of the active project
  addMember: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/members/`, data)
      set((state) => {
        if (state.currentProject?.id === projectId) {
          return {
            currentProject: { ...state.currentProject, members: [...state.currentProject.members, response.data] }
          }
        }
        return state
      })
      toast.success('Member authorized.')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authorization failed')
    }
  },

  // Filters out the removed user from the deeply nested DRF relation schema
  removeMember: async (projectId, userId) => {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}/remove/`)
      set((state) => {
        if (state.currentProject?.id === projectId) {
          return {
            currentProject: { ...state.currentProject, members: state.currentProject.members.filter(m => m.user.id !== userId) }
          }
        }
        return state
      })
      toast.success('Member access revoked.')
    } catch (error) {
      toast.error('Failed to revoke access')
    }
  },

  updateMemberRole: async (projectId, userId, role) => {
    try {
      const response = await api.patch(`/projects/${projectId}/members/${userId}/`, { role })
      set((state) => {
        if (state.currentProject?.id === projectId) {
          return {
            currentProject: { ...state.currentProject, members: state.currentProject.members.map(m => m.user.id === userId ? response.data : m) }
          }
        }
        return state
      })
      toast.success('Role permissions updated.')
    } catch (error) {
      toast.error('Failed to update permissions')
    }
  },
}))