import apiClient from './client'
import type { Employee, PaginatedResponse } from '../types'

export const employeesApi = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResponse<Employee>> => {
    const { data } = await apiClient.get('/employees/', { params })
    return data
  },
  getMe: async (): Promise<Employee> => {
    const { data } = await apiClient.get('/employees/me/')
    return data
  },
  getMyTeam: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get('/employees/my-team/')
    return data
  },
  getOne: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.get(`/employees/${id}/`)
    return data
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/employees/', payload)
    return data
  },
  update: async (id: string, payload: Partial<Employee>) => {
    const { data } = await apiClient.patch(`/employees/${id}/`, payload)
    return data
  },
  updateAvatar: async (id: string, formData: FormData) => {
    const { data } = await apiClient.patch(`/employees/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
