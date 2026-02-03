import type { AppState, ExportData } from '@/types'

const STORAGE_KEY = 'zippy-time-splitter'
const VERSION = '1.0.0'

export function loadFromStorage(): AppState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const parsed = JSON.parse(data)
    return parsed as AppState
  } catch (error) {
    console.error('Failed to load from storage:', error)
    return null
  }
}

export function saveToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

export function exportData(state: AppState, userId: string): ExportData {
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: userId,
    version: VERSION,
    data: {
      users: state.users,
      timeCodes: state.timeCodes,
      timeEntries: state.timeEntries,
    },
  }
}

export function importData(
  currentState: AppState,
  importedData: ExportData,
  mode: 'merge' | 'replace'
): { state: AppState; summary: string } {
  if (mode === 'replace') {
    return {
      state: {
        ...currentState,
        users: importedData.data.users,
        timeCodes: importedData.data.timeCodes,
        timeEntries: importedData.data.timeEntries,
        currentUserId: importedData.data.users[0]?.id || null,
      },
      summary: `Replaced all data: ${importedData.data.users.length} users, ${importedData.data.timeCodes.length} codes, ${importedData.data.timeEntries.length} entries`,
    }
  }

  // Merge mode
  const existingUserIds = new Set(currentState.users.map((u) => u.id))
  const existingCodeIds = new Set(currentState.timeCodes.map((c) => c.code))
  const existingEntryIds = new Set(currentState.timeEntries.map((e) => e.id))

  const newUsers = importedData.data.users.filter((u) => !existingUserIds.has(u.id))
  const newCodes = importedData.data.timeCodes.filter((c) => !existingCodeIds.has(c.code))
  const newEntries = importedData.data.timeEntries.filter((e) => !existingEntryIds.has(e.id))

  return {
    state: {
      ...currentState,
      users: [...currentState.users, ...newUsers],
      timeCodes: [...currentState.timeCodes, ...newCodes],
      timeEntries: [...currentState.timeEntries, ...newEntries],
    },
    summary: `Imported ${newUsers.length} users, ${newCodes.length} codes, ${newEntries.length} entries`,
  }
}

export function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.version !== 'string') return false
  if (!d.data || typeof d.data !== 'object') return false

  const dataObj = d.data as Record<string, unknown>
  if (!Array.isArray(dataObj.users)) return false
  if (!Array.isArray(dataObj.timeCodes)) return false
  if (!Array.isArray(dataObj.timeEntries)) return false

  return true
}
