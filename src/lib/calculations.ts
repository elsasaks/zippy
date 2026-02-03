import type { Split, TimeEntry } from '@/types'

export function toMinutes(hours: number, minutes: number = 0): number {
  return hours * 60 + minutes
}

export function fromMinutes(totalMinutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return { hours, minutes }
}

export function formatMinutes(totalMinutes: number): string {
  const { hours, minutes } = fromMinutes(totalMinutes)
  if (hours === 0) {
    return `${minutes}min`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}min`
}

export function formatMinutesLong(totalMinutes: number): string {
  const { hours, minutes } = fromMinutes(totalMinutes)
  return `${hours}h ${minutes}min`
}

export function calculateAllocatedMinutes(splits: Split[]): number {
  return splits.reduce((sum, split) => sum + split.minutes, 0)
}

export function calculateRemainingMinutes(totalMinutes: number, splits: Split[]): number {
  const allocated = calculateAllocatedMinutes(splits)
  return Math.max(0, totalMinutes - allocated)
}

export function canAddSplit(totalMinutes: number, currentAllocated: number, newSplitMinutes: number): boolean {
  return currentAllocated + newSplitMinutes <= totalMinutes
}

export function isFullyAllocated(totalMinutes: number, splits: Split[]): boolean {
  return calculateAllocatedMinutes(splits) >= totalMinutes
}

export function getAllocationPercentage(totalMinutes: number, splits: Split[]): number {
  if (totalMinutes === 0) return 0
  const allocated = calculateAllocatedMinutes(splits)
  return Math.min(100, (allocated / totalMinutes) * 100)
}

export interface CodeSummary {
  timeCode: string
  totalMinutes: number
}

export function summarizeByCode(entries: TimeEntry[]): CodeSummary[] {
  const summaryMap = new Map<string, number>()

  for (const entry of entries) {
    for (const split of entry.splits) {
      const current = summaryMap.get(split.timeCode) || 0
      summaryMap.set(split.timeCode, current + split.minutes)
    }
  }

  return Array.from(summaryMap.entries())
    .map(([timeCode, totalMinutes]) => ({ timeCode, totalMinutes }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
}

export function calculateTotalMinutes(entries: TimeEntry[]): number {
  return entries.reduce((sum, entry) => {
    return sum + calculateAllocatedMinutes(entry.splits)
  }, 0)
}

export function formatReportText(summaries: CodeSummary[], title: string): string {
  const lines: string[] = []
  lines.push(title)
  lines.push('─'.repeat(32))

  for (const summary of summaries) {
    lines.push(`${summary.timeCode}: ${formatMinutesLong(summary.totalMinutes)}`)
  }

  lines.push('─'.repeat(32))
  const total = summaries.reduce((sum, s) => sum + s.totalMinutes, 0)
  lines.push(`Total: ${formatMinutesLong(total)}`)

  return lines.join('\n')
}
