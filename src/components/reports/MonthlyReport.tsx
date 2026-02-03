import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  getCurrentDateET,
  getMonthNameET,
  getMonthRangeDates,
  navigateMonth,
} from '@/lib/timezone'
import {
  summarizeByCode,
  formatMinutesLong,
  formatReportText,
  calculateTotalMinutes,
} from '@/lib/calculations'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'

export function MonthlyReport() {
  const { getEntriesInRange } = useStore()
  const [currentDate, setCurrentDate] = useState(getCurrentDateET())
  const [copied, setCopied] = useState(false)

  const monthName = getMonthNameET(currentDate)
  const { start, end } = getMonthRangeDates(currentDate)
  const entries = getEntriesInRange(start, end)
  const summary = summarizeByCode(entries)
  const totalMinutes = calculateTotalMinutes(entries)

  const handlePrevMonth = () => {
    setCurrentDate(navigateMonth(currentDate, 'prev'))
  }

  const handleNextMonth = () => {
    setCurrentDate(navigateMonth(currentDate, 'next'))
  }

  const handleCopy = async () => {
    const title = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const text = formatReportText(summary, title)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium capitalize">
            {monthName}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.length > 0 ? (
          <>
            <div className="space-y-2">
              {summary.map((item) => (
                <div
                  key={item.timeCode}
                  className="flex items-center justify-between py-1"
                >
                  <span className="font-medium">{item.timeCode}</span>
                  <span className="text-muted-foreground">
                    {formatMinutesLong(item.totalMinutes)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{formatMinutesLong(totalMinutes)}</span>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Report
                </>
              )}
            </Button>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No entries for this month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
