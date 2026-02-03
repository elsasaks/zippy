import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toMinutes, fromMinutes } from '@/lib/calculations'

interface MinutesInputProps {
  value: number
  onChange: (minutes: number) => void
  label?: string
  max?: number
  disabled?: boolean
}

export function MinutesInput({
  value,
  onChange,
  label,
  max,
  disabled,
}: MinutesInputProps) {
  const { hours, minutes } = fromMinutes(value)
  const [hoursInput, setHoursInput] = useState(hours.toString())
  const [minutesInput, setMinutesInput] = useState(minutes.toString())

  useEffect(() => {
    const { hours, minutes } = fromMinutes(value)
    setHoursInput(hours.toString())
    setMinutesInput(minutes.toString())
  }, [value])

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHoursInput(val)
    const h = parseInt(val) || 0
    const m = parseInt(minutesInput) || 0
    const total = toMinutes(h, m)
    if (!max || total <= max) {
      onChange(total)
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMinutesInput(val)
    const h = parseInt(hoursInput) || 0
    const m = parseInt(val) || 0
    const total = toMinutes(h, m)
    if (!max || total <= max) {
      onChange(total)
    }
  }

  const handleHoursBlur = () => {
    const h = parseInt(hoursInput) || 0
    setHoursInput(h.toString())
  }

  const handleMinutesBlur = () => {
    let m = parseInt(minutesInput) || 0
    if (m >= 60) {
      const extraHours = Math.floor(m / 60)
      m = m % 60
      const h = (parseInt(hoursInput) || 0) + extraHours
      setHoursInput(h.toString())
      onChange(toMinutes(h, m))
    }
    setMinutesInput(m.toString())
  }

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0"
            max="24"
            value={hoursInput}
            onChange={handleHoursChange}
            onBlur={handleHoursBlur}
            className="w-16 text-center"
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">h</span>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0"
            max="59"
            value={minutesInput}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
            className="w-16 text-center"
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
      </div>
    </div>
  )
}
