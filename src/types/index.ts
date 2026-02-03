export interface User {
  id: string
  name: string
  createdAt: string
}

export interface POLCode {
  code: string
  description: string
  activityCode: string
  functionCode: string
  startDate: string // ISO date YYYY-MM-DD
  endDate: string // ISO date YYYY-MM-DD
  favorite: boolean
}

export interface Split {
  id: string
  polCode: string
  minutes: number
  description?: string
}

export interface TimeEntry {
  id: string
  userId: string
  date: string // ISO date YYYY-MM-DD
  totalMinutes: number
  splits: Split[]
  createdAt: string
  updatedAt: string
}

export interface AppState {
  users: User[]
  currentUserId: string | null
  polCodes: POLCode[]
  timeEntries: TimeEntry[]
}

export interface ExportData {
  exportedAt: string
  exportedBy: string
  version: string
  data: {
    users: User[]
    polCodes: POLCode[]
    timeEntries: TimeEntry[]
  }
}
