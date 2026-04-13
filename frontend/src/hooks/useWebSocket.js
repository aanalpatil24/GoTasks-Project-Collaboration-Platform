import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'

export const useWebSocket = (projectId) => {
  const ws = useRef(null)
  // Reactive state ensures UI components re-render when connection status changes
  const [isConnected, setIsConnected] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeout = useRef(null)
  
  const { accessToken } = useAuthStore()
  const { syncTaskFromWebSocket } = useTaskStore()

  const connect = useCallback(() => {
    if (!projectId || !accessToken) return

    // Dynamically builds the WS URL to route safely through the Nginx gateway
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws`
    const wsLink = `${wsUrl}/tasks/${projectId}/?token=${accessToken}`

    try {
      ws.current = new WebSocket(wsLink)

      ws.current.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        
        // Keeps the connection alive against Nginx's proxy timeouts
        ws.current.pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)
      }

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'task_update') {
          // Normalizes data payload before passing to the Zustand task store
          syncTaskFromWebSocket(data.event, data.task || { task_id: data.task_id, comment: data.comment, id: data.task_id })
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        if (ws.current?.pingInterval) clearInterval(ws.current.pingInterval)
        
        // Exponential backoff strategy for automatic reconnections
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * 2 ** reconnectAttempts.current, 30000)
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current += 1
            connect()
          }, timeout)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }, [projectId, accessToken, syncTaskFromWebSocket])

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    if (ws.current?.pingInterval) clearInterval(ws.current.pingInterval)
    if (ws.current) {
      ws.current.close()
      setIsConnected(false)
    }
  }, [])

  // Handles cleanup correctly when React Strict Mode double-invokes components
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { sendMessage, isConnected }
}