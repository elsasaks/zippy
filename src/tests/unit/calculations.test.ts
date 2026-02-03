import { describe, test, expect } from 'vitest'
import {
  toMinutes,
  fromMinutes,
  formatMinutes,
  formatMinutesLong,
  calculateAllocatedMinutes,
  calculateRemainingMinutes,
  canAddSplit,
  isFullyAllocated,
  getAllocationPercentage,
  summarizeByCode,
  calculateTotalMinutes,
} from '@/lib/calculations'
import type { Split, TimeEntry } from '@/types'

describe('Time calculations', () => {
  describe('toMinutes', () => {
    test('converts hours to minutes', () => {
      expect(toMinutes(8)).toBe(480)
    })

    test('converts hours and minutes to total minutes', () => {
      expect(toMinutes(8, 30)).toBe(510)
    })

    test('handles zero values', () => {
      expect(toMinutes(0, 0)).toBe(0)
    })
  })

  describe('fromMinutes', () => {
    test('converts minutes to hours and minutes', () => {
      expect(fromMinutes(510)).toEqual({ hours: 8, minutes: 30 })
    })

    test('handles exact hours', () => {
      expect(fromMinutes(480)).toEqual({ hours: 8, minutes: 0 })
    })

    test('handles only minutes', () => {
      expect(fromMinutes(45)).toEqual({ hours: 0, minutes: 45 })
    })
  })

  describe('formatMinutes', () => {
    test('formats hours only', () => {
      expect(formatMinutes(480)).toBe('8h')
    })

    test('formats minutes only', () => {
      expect(formatMinutes(30)).toBe('30min')
    })

    test('formats hours and minutes', () => {
      expect(formatMinutes(510)).toBe('8h 30min')
    })
  })

  describe('formatMinutesLong', () => {
    test('always shows both hours and minutes', () => {
      expect(formatMinutesLong(480)).toBe('8h 0min')
      expect(formatMinutesLong(30)).toBe('0h 30min')
      expect(formatMinutesLong(510)).toBe('8h 30min')
    })
  })

  describe('calculateAllocatedMinutes', () => {
    test('sums all split minutes', () => {
      const splits: Split[] = [
        { id: '1', timeCode: 'A', minutes: 180 },
        { id: '2', timeCode: 'B', minutes: 120 },
        { id: '3', timeCode: 'C', minutes: 60 },
      ]
      expect(calculateAllocatedMinutes(splits)).toBe(360)
    })

    test('returns 0 for empty splits', () => {
      expect(calculateAllocatedMinutes([])).toBe(0)
    })
  })

  describe('calculateRemainingMinutes', () => {
    test('calculates remaining time correctly', () => {
      const splits: Split[] = [
        { id: '1', timeCode: 'A', minutes: 180 },
        { id: '2', timeCode: 'B', minutes: 120 },
      ]
      expect(calculateRemainingMinutes(480, splits)).toBe(180)
    })

    test('returns 0 when fully allocated', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 480 }]
      expect(calculateRemainingMinutes(480, splits)).toBe(0)
    })

    test('returns 0 when over-allocated', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 500 }]
      expect(calculateRemainingMinutes(480, splits)).toBe(0)
    })
  })

  describe('canAddSplit', () => {
    test('allows split within remaining time', () => {
      expect(canAddSplit(480, 300, 180)).toBe(true)
    })

    test('allows split exactly filling remaining time', () => {
      expect(canAddSplit(480, 300, 180)).toBe(true)
    })

    test('rejects split exceeding remaining time', () => {
      expect(canAddSplit(480, 300, 200)).toBe(false)
    })
  })

  describe('isFullyAllocated', () => {
    test('returns true when fully allocated', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 480 }]
      expect(isFullyAllocated(480, splits)).toBe(true)
    })

    test('returns false when not fully allocated', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 300 }]
      expect(isFullyAllocated(480, splits)).toBe(false)
    })
  })

  describe('getAllocationPercentage', () => {
    test('calculates percentage correctly', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 240 }]
      expect(getAllocationPercentage(480, splits)).toBe(50)
    })

    test('caps at 100%', () => {
      const splits: Split[] = [{ id: '1', timeCode: 'A', minutes: 600 }]
      expect(getAllocationPercentage(480, splits)).toBe(100)
    })

    test('returns 0 for empty total', () => {
      expect(getAllocationPercentage(0, [])).toBe(0)
    })
  })

  describe('summarizeByCode', () => {
    test('groups and sums by time code', () => {
      const entries: TimeEntry[] = [
        {
          id: '1',
          userId: 'u1',
          date: '2026-02-01',
          totalMinutes: 480,
          splits: [
            { id: 's1', timeCode: 'IA1397', minutes: 180 },
            { id: 's2', timeCode: 'IA1468', minutes: 120 },
          ],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'u1',
          date: '2026-02-02',
          totalMinutes: 480,
          splits: [
            { id: 's3', timeCode: 'IA1397', minutes: 240 },
            { id: 's4', timeCode: 'IA1416', minutes: 60 },
          ],
          createdAt: '',
          updatedAt: '',
        },
      ]

      const summary = summarizeByCode(entries)
      expect(summary).toHaveLength(3)
      expect(summary.find((s) => s.timeCode === 'IA1397')?.totalMinutes).toBe(420)
      expect(summary.find((s) => s.timeCode === 'IA1468')?.totalMinutes).toBe(120)
      expect(summary.find((s) => s.timeCode === 'IA1416')?.totalMinutes).toBe(60)
    })

    test('sorts by total minutes descending', () => {
      const entries: TimeEntry[] = [
        {
          id: '1',
          userId: 'u1',
          date: '2026-02-01',
          totalMinutes: 480,
          splits: [
            { id: 's1', timeCode: 'A', minutes: 100 },
            { id: 's2', timeCode: 'B', minutes: 200 },
            { id: 's3', timeCode: 'C', minutes: 150 },
          ],
          createdAt: '',
          updatedAt: '',
        },
      ]

      const summary = summarizeByCode(entries)
      expect(summary[0].timeCode).toBe('B')
      expect(summary[1].timeCode).toBe('C')
      expect(summary[2].timeCode).toBe('A')
    })
  })

  describe('calculateTotalMinutes', () => {
    test('sums all allocated minutes from entries', () => {
      const entries: TimeEntry[] = [
        {
          id: '1',
          userId: 'u1',
          date: '2026-02-01',
          totalMinutes: 480,
          splits: [
            { id: 's1', timeCode: 'A', minutes: 180 },
            { id: 's2', timeCode: 'B', minutes: 120 },
          ],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'u1',
          date: '2026-02-02',
          totalMinutes: 480,
          splits: [{ id: 's3', timeCode: 'A', minutes: 240 }],
          createdAt: '',
          updatedAt: '',
        },
      ]

      expect(calculateTotalMinutes(entries)).toBe(540)
    })
  })
})
