import { create } from 'zustand'
import type { Notification } from '../types'
import { notificationsApi } from '../api/notifications'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const data = await notificationsApi.getAll()
      set({ notifications: data.results })
    } catch {}
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationsApi.getUnreadCount()
      set({ unreadCount: data.unread_count })
    } catch {}
  },

  markRead: async (id) => {
    await notificationsApi.markRead(id)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead()
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },
}))
