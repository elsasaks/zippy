import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MinutesInput } from '@/components/common/MinutesInput'
import { getCurrentDateET, formatDateET } from '@/lib/timezone'
import { validateTimeEntry } from '@/lib/validation'
import { toMinutes } from '@/lib/calculations'
import { Plus } from 'lucide-react'

export function TimeEntryForm() {
  const { addTimeEntry, currentUserId, timeEntries } = useStore()

  const [date, setDate] = useState(getCurrentDateET())
  const [totalMinutes, setTotalMinutes] = useState(toMinutes(8, 0))
  const [error, setError] = useState<string | null>(null)

  const existingEntry = timeEntries.find(
    (e) => e.userId === currentUserId && e.date === date
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (existingEntry) {
      setError('An entry already exists for this date. Edit the existing entry instead.')
      return
    }

    const validation = validateTimeEntry({ date, totalMinutes })
    if (!validation.valid) {
      setError(validation.error || 'Invalid entry')
      return
    }

    addTimeEntry(date, totalMinutes)
    setDate(getCurrentDateET())
    setTotalMinutes(toMinutes(8, 0))
    setError(null)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate)
    setError(null)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Add Time Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={handleDateChange}
              />
              <p className="text-xs text-muted-foreground">
                {formatDateET(date)}
              </p>
            </div>
            <MinutesInput
              label="Total Time"
              value={totalMinutes}
              onChange={setTotalMinutes}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {existingEntry && (
            <p className="text-sm text-muted-foreground">
              Entry already exists for {formatDateET(date)}
            </p>
          )}

          <Button type="submit" disabled={!!existingEntry} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
