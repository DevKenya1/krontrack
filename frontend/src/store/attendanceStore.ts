import { create } from 'zustand'
import type { ClockStatus } from '../types'
import { attendanceApi } from '../api/attendance'

interface AttendanceState {
  status: ClockStatus | null
  isLoading: boolean
  fetchStatus: () => Promise<void>
  clockIn: (payload?: object) => Promise<void>
  clockOut: (payload?: object) => Promise<void>
  startBreak: (type?: string) => Promise<void>
  endBreak: () => Promise<void>
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  status: null,
  isLoading: false,

  fetchStatus: async () => {
    set({ isLoading: true })
    try {
      const status = await attendanceApi.getStatus()
      set({ status, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  clockIn: async (payload = {}) => {
    await attendanceApi.clockIn(payload)
    await get().fetchStatus()
  },

  clockOut: async (payload = {}) => {
    await attendanceApi.clockOut(payload)
    await get().fetchStatus()
  },

  startBreak: async (type = 'rest') => {
    await attendanceApi.startBreak(type)
    await get().fetchStatus()
  },

  endBreak: async () => {
    await attendanceApi.endBreak()
    await get().fetchStatus()
  },
}))
