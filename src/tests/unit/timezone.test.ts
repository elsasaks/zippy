import { describe, test, expect } from 'vitest'
import {
  getCurrentDateET,
  formatDateET,
  getWeekStartET,
  getWeekEndET,
  getWeekNumberET,
  getYearET,
  getMonthNameET,
  isDateInRange,
  formatWeekRange,
  getWeekRangeDates,
  getMonthRangeDates,
  navigateWeek,
  navigateMonth,
  parseInputDate,
  formatISODate,
} from '@/lib/timezone'
import { format } from 'date-fns'

describe('Estonian timezone handling', () => {
  describe('getCurrentDateET', () => {
    test('returns date in YYYY-MM-DD format', () => {
      const date = getCurrentDateET()
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('formatDateET', () => {
    test('formats date in Estonian format (dd.MM.yyyy)', () => {
      expect(formatDateET('2026-02-03')).toBe('03.02.2026')
    })

    test('formats date with leading zeros', () => {
      expect(formatDateET('2026-01-05')).toBe('05.01.2026')
    })
  })

  describe('getWeekStartET', () => {
    test('returns Monday as week start', () => {
      // 2026-02-05 is Thursday
      const weekStart = getWeekStartET('2026-02-05')
      expect(format(weekStart, 'EEEE')).toBe('Monday')
    })

    test('handles date already on Monday', () => {
      // 2026-02-02 is Monday
      const weekStart = getWeekStartET('2026-02-02')
      expect(format(weekStart, 'yyyy-MM-dd')).toBe('2026-02-02')
    })
  })

  describe('getWeekEndET', () => {
    test('returns Sunday as week end', () => {
      const weekEnd = getWeekEndET('2026-02-05')
      expect(format(weekEnd, 'EEEE')).toBe('Sunday')
    })
  })

  describe('getWeekNumberET', () => {
    test('returns correct week number', () => {
      // Week 6 of 2026 starts Feb 2
      expect(getWeekNumberET('2026-02-03')).toBe(6)
    })
  })

  describe('getYearET', () => {
    test('returns correct year', () => {
      expect(getYearET('2026-02-03')).toBe(2026)
    })
  })

  describe('getMonthNameET', () => {
    test('returns month name with year', () => {
      const monthName = getMonthNameET('2026-02-03')
      expect(monthName).toContain('2026')
    })
  })

  describe('isDateInRange', () => {
    test('returns true for date within range', () => {
      expect(isDateInRange('2026-06-15', '2026-01-01', '2026-12-31')).toBe(true)
    })

    test('returns true for date on start boundary', () => {
      expect(isDateInRange('2026-01-01', '2026-01-01', '2026-12-31')).toBe(true)
    })

    test('returns true for date on end boundary', () => {
      expect(isDateInRange('2026-12-31', '2026-01-01', '2026-12-31')).toBe(true)
    })

    test('returns false for date before range', () => {
      expect(isDateInRange('2025-12-31', '2026-01-01', '2026-12-31')).toBe(false)
    })

    test('returns false for date after range', () => {
      expect(isDateInRange('2027-01-01', '2026-01-01', '2026-12-31')).toBe(false)
    })
  })

  describe('formatWeekRange', () => {
    test('formats week range correctly', () => {
      const range = formatWeekRange('2026-02-03')
      expect(range).toMatch(/\d{2}\.\d{2}\.\d{4} - \d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('getWeekRangeDates', () => {
    test('returns start and end dates for week', () => {
      const { start, end } = getWeekRangeDates('2026-02-05')
      expect(start).toBe('2026-02-02') // Monday
      expect(end).toBe('2026-02-08') // Sunday
    })
  })

  describe('getMonthRangeDates', () => {
    test('returns start and end dates for month', () => {
      const { start, end } = getMonthRangeDates('2026-02-15')
      expect(start).toBe('2026-02-01')
      expect(end).toBe('2026-02-28')
    })
  })

  describe('navigateWeek', () => {
    test('navigates to next week', () => {
      const nextWeek = navigateWeek('2026-02-03', 'next')
      expect(nextWeek).toBe('2026-02-10')
    })

    test('navigates to previous week', () => {
      const prevWeek = navigateWeek('2026-02-03', 'prev')
      expect(prevWeek).toBe('2026-01-27')
    })
  })

  describe('navigateMonth', () => {
    test('navigates to next month', () => {
      const nextMonth = navigateMonth('2026-02-03', 'next')
      expect(nextMonth).toBe('2026-03-03')
    })

    test('navigates to previous month', () => {
      const prevMonth = navigateMonth('2026-02-03', 'prev')
      expect(prevMonth).toBe('2026-01-03')
    })
  })

  describe('parseInputDate', () => {
    test('parses dd.MM.yyyy format', () => {
      expect(parseInputDate('03.02.2026')).toBe('2026-02-03')
    })

    test('parses yyyy-MM-dd format', () => {
      expect(parseInputDate('2026-02-03')).toBe('2026-02-03')
    })

    test('returns null for invalid format', () => {
      expect(parseInputDate('invalid')).toBe(null)
    })

    test('handles single-digit day and month', () => {
      expect(parseInputDate('3.2.2026')).toBe('2026-02-03')
    })
  })

  describe('formatISODate', () => {
    test('formats date to ISO format', () => {
      const date = new Date(2026, 1, 3)
      expect(formatISODate(date)).toBe('2026-02-03')
    })
  })
})
