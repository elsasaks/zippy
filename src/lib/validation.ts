import type { POLCode, Split, TimeEntry } from '@/types'
import { isDateInRange } from './timezone'
import { calculateAllocatedMinutes } from './calculations'

export function isCodeValidForDate(code: POLCode, entryDate: string): boolean {
  return isDateInRange(entryDate, code.startDate, code.endDate)
}

export function getValidCodesForDate(codes: POLCode[], entryDate: string): POLCode[] {
  return codes.filter((code) => isCodeValidForDate(code, entryDate))
}

export function getFavoriteCodesForDate(codes: POLCode[], entryDate: string): POLCode[] {
  return codes.filter((code) => code.favorite && isCodeValidForDate(code, entryDate))
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateTimeEntry(entry: Partial<TimeEntry>): ValidationResult {
  if (!entry.date) {
    return { valid: false, error: 'Date is required' }
  }

  if (!entry.totalMinutes || entry.totalMinutes <= 0) {
    return { valid: false, error: 'Total time must be greater than 0' }
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(entry.date)) {
    return { valid: false, error: 'Invalid date format' }
  }

  return { valid: true }
}

export function validateSplit(
  split: Partial<Split>,
  entry: TimeEntry,
  codes: POLCode[]
): ValidationResult {
  if (!split.polCode) {
    return { valid: false, error: 'POL code is required' }
  }

  if (!split.minutes || split.minutes <= 0) {
    return { valid: false, error: 'Time must be greater than 0' }
  }

  const code = codes.find((c) => c.code === split.polCode)
  if (!code) {
    return { valid: false, error: 'POL code not found' }
  }

  if (!isCodeValidForDate(code, entry.date)) {
    return { valid: false, error: 'POL code not valid for this date' }
  }

  const currentAllocated = calculateAllocatedMinutes(entry.splits)
  if (currentAllocated + split.minutes > entry.totalMinutes) {
    return { valid: false, error: 'Split exceeds remaining time' }
  }

  return { valid: true }
}

export function validatePOLCode(code: Partial<POLCode>): ValidationResult {
  if (!code.code || code.code.trim() === '') {
    return { valid: false, error: 'Code is required' }
  }

  if (!code.description || code.description.trim() === '') {
    return { valid: false, error: 'Description is required' }
  }

  if (!code.startDate) {
    return { valid: false, error: 'Start date is required' }
  }

  if (!code.endDate) {
    return { valid: false, error: 'End date is required' }
  }

  if (code.startDate > code.endDate) {
    return { valid: false, error: 'End date must be after start date' }
  }

  return { valid: true }
}

export function validateUserName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Name is required' }
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }

  return { valid: true }
}
