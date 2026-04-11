import { useEffect, useRef, useCallback } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attempts = useRef(0)
  const { isAuthenticated } = useAuthStore()
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore()

  const connect = useCallback(() => {
    if (!isAuthenticated) return
    if (attempts.current >= 3) {
      // After 3 failed attempts, fall back to polling only — no more WS spam
      console.info('WebSocket unavailable, using polling fallback')
      return
    }

    try {
      ws.current = new WebSocket('ws://127.0.0.1:8000/ws/notifications/')

      ws.current.onopen = () => {
        console.info('WebSocket connected')
        attempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'notification') {
            fetchNotifications()
            fetchUnreadCount()
          }
        } catch {}
      }

      ws.current.onclose = () => {
        attempts.current += 1
        if (attempts.current < 3) {
          reconnectTimer.current = setTimeout(connect, 5000)
        }
      }

      ws.current.onerror = () => {
        ws.current?.close()
      }
    } catch {}
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])
}
