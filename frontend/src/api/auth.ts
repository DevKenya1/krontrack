import apiClient from './client'

export interface AuthTokens {
  access: string
  refresh: string
}

export const authApi = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post('/auth/login/', { username, password })
    return data
  },
  refresh: async (refresh: string) => {
    const { data } = await apiClient.post('/auth/refresh/', { refresh })
    return data
  },
  verify: async (token: string) => {
    const { data } = await apiClient.post('/auth/verify/', { token })
    return data
  },
}
