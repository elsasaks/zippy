import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { User, TimeCode, TimeEntry, Split, AppState, ExportData } from '@/types'
import { DEFAULT_TIME_CODES, createDefaultUser } from '@/lib/seed-data'
import { exportData, importData, validateImportData } from '@/lib/storage'

interface AppActions {
  // User actions
  addUser: (name: string) => User
  setCurrentUser: (userId: string) => void
  updateUser: (userId: string, name: string) => void
  deleteUser: (userId: string) => void

  // Time Code actions
  addTimeCode: (code: Omit<TimeCode, 'favorite'> & { favorite?: boolean }) => void
  updateTimeCode: (code: string, updates: Partial<TimeCode>) => void
  deleteTimeCode: (code: string) => void
  toggleFavorite: (code: string) => void

  // Time Entry actions
  addTimeEntry: (date: string, totalMinutes: number) => TimeEntry
  updateTimeEntry: (entryId: string, updates: Partial<Pick<TimeEntry, 'date' | 'totalMinutes'>>) => void
  deleteTimeEntry: (entryId: string) => void

  // Split actions
  addSplit: (entryId: string, timeCode: string, minutes: number, description?: string) => void
  updateSplit: (entryId: string, splitId: string, updates: Partial<Split>) => void
  deleteSplit: (entryId: string, splitId: string) => void

  // Export/Import
  exportAllData: () => ExportData
  importAllData: (data: unknown, mode: 'merge' | 'replace') => { success: boolean; message: string }

  // Utilities
  getEntriesForUser: (userId: string) => TimeEntry[]
  getEntriesInRange: (startDate: string, endDate: string) => TimeEntry[]
}

type Store = AppState & AppActions

const createInitialState = (): AppState => {
  const defaultUser = createDefaultUser()
  return {
    users: [defaultUser],
    currentUserId: defaultUser.id,
    timeCodes: DEFAULT_TIME_CODES,
    timeEntries: [],
  }
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      // User actions
      addUser: (name: string) => {
        const user: User = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.id,
        }))
        return user
      },

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId })
      },

      updateUser: (userId: string, name: string) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, name } : u
          ),
        }))
      },

      deleteUser: (userId: string) => {
        const state = get()
        if (state.users.length <= 1) return

        set((state) => {
          const newUsers = state.users.filter((u) => u.id !== userId)
          const newEntries = state.timeEntries.filter((e) => e.userId !== userId)
          return {
            users: newUsers,
            timeEntries: newEntries,
            currentUserId:
              state.currentUserId === userId
                ? newUsers[0]?.id || null
                : state.currentUserId,
          }
        })
      },

      // Time Code actions
      addTimeCode: (code) => {
        set((state) => ({
          timeCodes: [
            ...state.timeCodes,
            { ...code, favorite: code.favorite ?? false },
          ],
        }))
      },

      updateTimeCode: (code: string, updates: Partial<TimeCode>) => {
        set((state) => ({
          timeCodes: state.timeCodes.map((c) =>
            c.code === code ? { ...c, ...updates } : c
          ),
        }))
      },

      deleteTimeCode: (code: string) => {
        set((state) => ({
          timeCodes: state.timeCodes.filter((c) => c.code !== code),
        }))
      },

      toggleFavorite: (code: string) => {
        set((state) => ({
          timeCodes: state.timeCodes.map((c) =>
            c.code === code ? { ...c, favorite: !c.favorite } : c
          ),
        }))
      },

      // Time Entry actions
      addTimeEntry: (date: string, totalMinutes: number) => {
        const state = get()
        const entry: TimeEntry = {
          id: uuidv4(),
          userId: state.currentUserId!,
          date,
          totalMinutes,
          splits: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          timeEntries: [...state.timeEntries, entry],
        }))
        return entry
      },

      updateTimeEntry: (entryId: string, updates) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === entryId
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          ),
        }))
      },

      deleteTimeEntry: (entryId: string) => {
        set((state) => ({
          timeEntries: state.timeEntries.filter((e) => e.id !== entryId),
        }))
      },

      // Split actions
      addSplit: (entryId: string, timeCode: string, minutes: number, description?: string) => {
        const split: Split = {
          id: uuidv4(),
          timeCode,
          minutes,
          description,
        }
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  splits: [...e.splits, split],
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }))
      },

      updateSplit: (entryId: string, splitId: string, updates: Partial<Split>) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  splits: e.splits.map((s) =>
                    s.id === splitId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }))
      },

      deleteSplit: (entryId: string, splitId: string) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  splits: e.splits.filter((s) => s.id !== splitId),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }))
      },

      // Export/Import
      exportAllData: () => {
        const state = get()
        return exportData(
          {
            users: state.users,
            currentUserId: state.currentUserId,
            timeCodes: state.timeCodes,
            timeEntries: state.timeEntries,
          },
          state.currentUserId || ''
        )
      },

      importAllData: (data: unknown, mode: 'merge' | 'replace') => {
        if (!validateImportData(data)) {
          return { success: false, message: 'Invalid import file format' }
        }

        const state = get()
        const { state: newState, summary } = importData(
          {
            users: state.users,
            currentUserId: state.currentUserId,
            timeCodes: state.timeCodes,
            timeEntries: state.timeEntries,
          },
          data,
          mode
        )

        set(newState)
        return { success: true, message: summary }
      },

      // Utilities
      getEntriesForUser: (userId: string) => {
        return get()
          .timeEntries.filter((e) => e.userId === userId)
          .sort((a, b) => b.date.localeCompare(a.date))
      },

      getEntriesInRange: (startDate: string, endDate: string) => {
        const state = get()
        return state.timeEntries
          .filter(
            (e) =>
              e.userId === state.currentUserId &&
              e.date >= startDate &&
              e.date <= endDate
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      },
    }),
    {
      name: 'zippy-time-splitter',
    }
  )
)
