import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { isAuthenticated, employee, loadProfile, isLoading } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !employee) {
      loadProfile()
    }
  }, [isAuthenticated, employee, loadProfile])

  return { isAuthenticated, employee, isLoading }
}
