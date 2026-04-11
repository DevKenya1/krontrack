import apiClient from './client'
import type { PTORequest, PTOAccrual, PaginatedResponse } from '../types'

export const leaveApi = {
  getRequests: async (params?: Record<string, string>): Promise<PaginatedResponse<PTORequest>> => {
    const { data } = await apiClient.get('/pto-requests/', { params })
    return data
  },
  createRequest: async (payload: Partial<PTORequest>) => {
    const { data } = await apiClient.post('/pto-requests/', payload)
    return data
  },
  reviewRequest: async (id: string, action: 'approve' | 'reject', review_notes = '') => {
    const { data } = await apiClient.post(`/pto-requests/${id}/review/`, { action, review_notes })
    return data
  },
  cancelRequest: async (id: string) => {
    const { data } = await apiClient.post(`/pto-requests/${id}/cancel/`)
    return data
  },
  getMyBalances: async (): Promise<PTOAccrual[]> => {
    const { data } = await apiClient.get('/pto-accruals/my-balances/')
    return data
  },
}
