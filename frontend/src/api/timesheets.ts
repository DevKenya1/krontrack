import apiClient from './client'
import type { Timesheet, PaginatedResponse } from '../types'

export const timesheetsApi = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResponse<Timesheet>> => {
    const { data } = await apiClient.get('/timesheets/', { params })
    return data
  },
  getOne: async (id: string): Promise<Timesheet> => {
    const { data } = await apiClient.get(`/timesheets/${id}/`)
    return data
  },
  submit: async (id: string) => {
    const { data } = await apiClient.post(`/timesheets/${id}/submit/`)
    return data
  },
  approve: async (id: string, notes = '') => {
    const { data } = await apiClient.post(`/timesheets/${id}/approve/`, { notes })
    return data
  },
  reject: async (id: string, notes = '') => {
    const { data } = await apiClient.post(`/timesheets/${id}/reject/`, { notes })
    return data
  },
  getPendingApprovals: async (): Promise<Timesheet[]> => {
    const { data } = await apiClient.get('/timesheets/pending-approvals/')
    return data
  },
}
