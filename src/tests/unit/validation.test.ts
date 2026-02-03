import { describe, test, expect } from 'vitest'
import {
  isCodeValidForDate,
  getValidCodesForDate,
  getFavoriteCodesForDate,
  validateTimeEntry,
  validateSplit,
  validatePOLCode,
  validateUserName,
} from '@/lib/validation'
import type { POLCode, TimeEntry } from '@/types'

describe('POL code date validation', () => {
  const testCode: POLCode = {
    code: 'IA1397',
    description: 'Test code',
    activityCode: '500',
    functionCode: 'A500',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    favorite: false,
  }

  describe('isCodeValidForDate', () => {
    test('allows entry within code date range', () => {
      expect(isCodeValidForDate(testCode, '2026-06-15')).toBe(true)
    })

    test('allows entry on start date', () => {
      expect(isCodeValidForDate(testCode, '2026-01-01')).toBe(true)
    })

    test('allows entry on end date', () => {
      expect(isCodeValidForDate(testCode, '2026-12-31')).toBe(true)
    })

    test('rejects entry before code start date', () => {
      expect(isCodeValidForDate(testCode, '2025-12-31')).toBe(false)
    })

    test('rejects entry after code end date', () => {
      expect(isCodeValidForDate(testCode, '2027-01-01')).toBe(false)
    })
  })

  describe('getValidCodesForDate', () => {
    const codes: POLCode[] = [
      { ...testCode, code: 'VALID', startDate: '2026-01-01', endDate: '2026-12-31' },
      { ...testCode, code: 'EXPIRED', startDate: '2025-01-01', endDate: '2025-12-31' },
      { ...testCode, code: 'FUTURE', startDate: '2027-01-01', endDate: '2027-12-31' },
    ]

    test('returns only valid codes for date', () => {
      const validCodes = getValidCodesForDate(codes, '2026-06-15')
      expect(validCodes).toHaveLength(1)
      expect(validCodes[0].code).toBe('VALID')
    })

    test('returns empty array when no valid codes', () => {
      const validCodes = getValidCodesForDate(codes, '2024-01-01')
      expect(validCodes).toHaveLength(0)
    })
  })

  describe('getFavoriteCodesForDate', () => {
    const codes: POLCode[] = [
      { ...testCode, code: 'FAV1', favorite: true },
      { ...testCode, code: 'FAV2', favorite: true },
      { ...testCode, code: 'OTHER', favorite: false },
    ]

    test('returns only favorite valid codes', () => {
      const favCodes = getFavoriteCodesForDate(codes, '2026-06-15')
      expect(favCodes).toHaveLength(2)
      expect(favCodes.every((c) => c.favorite)).toBe(true)
    })
  })
})

describe('Time entry validation', () => {
  describe('validateTimeEntry', () => {
    test('accepts valid entry', () => {
      const result = validateTimeEntry({
        date: '2026-02-03',
        totalMinutes: 480,
      })
      expect(result.valid).toBe(true)
    })

    test('rejects missing date', () => {
      const result = validateTimeEntry({ totalMinutes: 480 })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Date is required')
    })

    test('rejects zero total minutes', () => {
      const result = validateTimeEntry({ date: '2026-02-03', totalMinutes: 0 })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Total time must be greater than 0')
    })

    test('rejects negative total minutes', () => {
      const result = validateTimeEntry({ date: '2026-02-03', totalMinutes: -1 })
      expect(result.valid).toBe(false)
    })

    test('rejects invalid date format', () => {
      const result = validateTimeEntry({ date: '03-02-2026', totalMinutes: 480 })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid date format')
    })
  })
})

describe('Split validation', () => {
  const testEntry: TimeEntry = {
    id: '1',
    userId: 'u1',
    date: '2026-06-15',
    totalMinutes: 480,
    splits: [{ id: 's1', polCode: 'A', minutes: 180 }],
    createdAt: '',
    updatedAt: '',
  }

  const testCodes: POLCode[] = [
    {
      code: 'IA1397',
      description: 'Test',
      activityCode: '500',
      functionCode: 'A500',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      favorite: false,
    },
    {
      code: 'EXPIRED',
      description: 'Expired',
      activityCode: '500',
      functionCode: 'A500',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      favorite: false,
    },
  ]

  describe('validateSplit', () => {
    test('accepts valid split', () => {
      const result = validateSplit(
        { polCode: 'IA1397', minutes: 120 },
        testEntry,
        testCodes
      )
      expect(result.valid).toBe(true)
    })

    test('rejects missing POL code', () => {
      const result = validateSplit({ minutes: 120 }, testEntry, testCodes)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('POL code is required')
    })

    test('rejects zero minutes', () => {
      const result = validateSplit(
        { polCode: 'IA1397', minutes: 0 },
        testEntry,
        testCodes
      )
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Time must be greater than 0')
    })

    test('rejects unknown POL code', () => {
      const result = validateSplit(
        { polCode: 'UNKNOWN', minutes: 120 },
        testEntry,
        testCodes
      )
      expect(result.valid).toBe(false)
      expect(result.error).toBe('POL code not found')
    })

    test('rejects expired POL code', () => {
      const result = validateSplit(
        { polCode: 'EXPIRED', minutes: 120 },
        testEntry,
        testCodes
      )
      expect(result.valid).toBe(false)
      expect(result.error).toBe('POL code not valid for this date')
    })

    test('rejects split exceeding remaining time', () => {
      const result = validateSplit(
        { polCode: 'IA1397', minutes: 400 },
        testEntry,
        testCodes
      )
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Split exceeds remaining time')
    })
  })
})

describe('POL code validation', () => {
  describe('validatePOLCode', () => {
    test('accepts valid POL code', () => {
      const result = validatePOLCode({
        code: 'IA1397',
        description: 'Test description',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
      expect(result.valid).toBe(true)
    })

    test('rejects empty code', () => {
      const result = validatePOLCode({
        code: '',
        description: 'Test',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Code is required')
    })

    test('rejects empty description', () => {
      const result = validatePOLCode({
        code: 'IA1397',
        description: '',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Description is required')
    })

    test('rejects missing start date', () => {
      const result = validatePOLCode({
        code: 'IA1397',
        description: 'Test',
        endDate: '2026-12-31',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Start date is required')
    })

    test('rejects end date before start date', () => {
      const result = validatePOLCode({
        code: 'IA1397',
        description: 'Test',
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End date must be after start date')
    })
  })
})

describe('User validation', () => {
  describe('validateUserName', () => {
    test('accepts valid name', () => {
      const result = validateUserName('John Doe')
      expect(result.valid).toBe(true)
    })

    test('rejects empty name', () => {
      const result = validateUserName('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    test('rejects whitespace-only name', () => {
      const result = validateUserName('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    test('rejects name shorter than 2 characters', () => {
      const result = validateUserName('A')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Name must be at least 2 characters')
    })
  })
})
