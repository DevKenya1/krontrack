import apiClient from './client'
import type { Notification, PaginatedResponse } from '../types'

export const notificationsApi = {
  getAll: async (): Promise<PaginatedResponse<Notification>> => {
    const { data } = await apiClient.get('/notifications/')
    return data
  },
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const { data } = await apiClient.get('/notifications/unread-count/')
    return data
  },
  markRead: async (id: string) => {
    const { data } = await apiClient.post(`/notifications/${id}/mark-read/`)
    return data
  },
  markAllRead: async () => {
    const { data } = await apiClient.post('/notifications/mark-all-read/')
    return data
  },
}
