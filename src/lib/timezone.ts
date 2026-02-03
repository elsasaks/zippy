import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getWeek,
  getYear,
  isWithinInterval,
  addWeeks,
  addMonths,
  format,
} from 'date-fns'
import { et } from 'date-fns/locale'

export const TIMEZONE = 'Europe/Tallinn'

export function getCurrentDateET(): string {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd')
}

export function formatDateET(date: string): string {
  return formatInTimeZone(parseISO(date), TIMEZONE, 'dd.MM.yyyy', { locale: et })
}

export function formatDateLongET(date: string): string {
  return formatInTimeZone(parseISO(date), TIMEZONE, 'd. MMMM yyyy', { locale: et })
}

export function getWeekStartET(date: string): Date {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return startOfWeek(zonedDate, { weekStartsOn: 1 })
}

export function getWeekEndET(date: string): Date {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return endOfWeek(zonedDate, { weekStartsOn: 1 })
}

export function getMonthStartET(date: string): Date {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return startOfMonth(zonedDate)
}

export function getMonthEndET(date: string): Date {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return endOfMonth(zonedDate)
}

export function getWeekNumberET(date: string): number {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return getWeek(zonedDate, { weekStartsOn: 1, firstWeekContainsDate: 4 })
}

export function getYearET(date: string): number {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  return getYear(zonedDate)
}

export function getMonthNameET(date: string): string {
  return formatInTimeZone(parseISO(date), TIMEZONE, 'LLLL yyyy', { locale: et })
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const targetDate = toZonedTime(parseISO(date), TIMEZONE)
  const start = toZonedTime(parseISO(startDate), TIMEZONE)
  const end = toZonedTime(parseISO(endDate), TIMEZONE)
  return isWithinInterval(targetDate, { start, end })
}

export function formatWeekRange(date: string): string {
  const weekStart = getWeekStartET(date)
  const weekEnd = getWeekEndET(date)
  const startStr = format(weekStart, 'dd.MM.yyyy', { locale: et })
  const endStr = format(weekEnd, 'dd.MM.yyyy', { locale: et })
  return `${startStr} - ${endStr}`
}

export function getWeekRangeDates(date: string): { start: string; end: string } {
  const weekStart = getWeekStartET(date)
  const weekEnd = getWeekEndET(date)
  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  }
}

export function getMonthRangeDates(date: string): { start: string; end: string } {
  const monthStart = getMonthStartET(date)
  const monthEnd = getMonthEndET(date)
  return {
    start: format(monthStart, 'yyyy-MM-dd'),
    end: format(monthEnd, 'yyyy-MM-dd'),
  }
}

export function navigateWeek(date: string, direction: 'prev' | 'next'): string {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  const newDate = addWeeks(zonedDate, direction === 'next' ? 1 : -1)
  return format(newDate, 'yyyy-MM-dd')
}

export function navigateMonth(date: string, direction: 'prev' | 'next'): string {
  const zonedDate = toZonedTime(parseISO(date), TIMEZONE)
  const newDate = addMonths(zonedDate, direction === 'next' ? 1 : -1)
  return format(newDate, 'yyyy-MM-dd')
}

export function parseInputDate(input: string): string | null {
  // Try parsing dd.MM.yyyy format
  const ddmmyyyy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  const match = input.match(ddmmyyyy)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Try parsing yyyy-MM-dd format
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/
  if (yyyymmdd.test(input)) {
    return input
  }

  return null
}

export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
