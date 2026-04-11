import apiClient from './client'
import type { ClockStatus, TimeEntry, PaginatedResponse } from '../types'

export const attendanceApi = {
  getStatus: async (): Promise<ClockStatus> => {
    const { data } = await apiClient.get('/time-entries/current-status/')
    return data
  },
  clockIn: async (payload: { method?: string; latitude?: number; longitude?: number; notes?: string }) => {
    const { data } = await apiClient.post('/time-entries/clock-in/', payload)
    return data
  },
  clockOut: async (payload: { method?: string; latitude?: number; longitude?: number }) => {
    const { data } = await apiClient.post('/time-entries/clock-out/', payload)
    return data
  },
  startBreak: async (break_type = 'rest') => {
    const { data } = await apiClient.post('/breaks/start/', { break_type })
    return data
  },
  endBreak: async () => {
    const { data } = await apiClient.post('/breaks/end/', {})
    return data
  },
  getTodaySummary: async () => {
    const { data } = await apiClient.get('/time-entries/today-summary/')
    return data
  },
  getEntries: async (params?: Record<string, string>): Promise<PaginatedResponse<TimeEntry>> => {
    const { data } = await apiClient.get('/time-entries/', { params })
    return data
  },
}
