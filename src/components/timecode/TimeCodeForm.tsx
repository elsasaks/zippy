import { useState, useEffect } from 'react'
import type { TimeCode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateTimeCode } from '@/lib/validation'

interface TimeCodeFormProps {
  initialCode?: TimeCode
  onSubmit: (code: Omit<TimeCode, 'favorite'>) => void
  onCancel: () => void
}

export function TimeCodeForm({ initialCode, onSubmit, onCancel }: TimeCodeFormProps) {
  const [formData, setFormData] = useState({
    code: initialCode?.code || '',
    description: initialCode?.description || '',
    activityCode: initialCode?.activityCode || '500 - Development',
    functionCode: initialCode?.functionCode || 'A500 - Default',
    startDate: initialCode?.startDate || '',
    endDate: initialCode?.endDate || '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialCode) {
      setFormData({
        code: initialCode.code,
        description: initialCode.description,
        activityCode: initialCode.activityCode,
        functionCode: initialCode.functionCode,
        startDate: initialCode.startDate,
        endDate: initialCode.endDate,
      })
    }
  }, [initialCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateTimeCode(formData)
    if (!validation.valid) {
      setError(validation.error || 'Invalid data')
      return
    }

    onSubmit(formData)
    setError(null)
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="code">Time Code</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="e.g., IA1397"
          disabled={!!initialCode}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="e.g., Project development work"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="activityCode">Activity Code</Label>
        <Input
          id="activityCode"
          value={formData.activityCode}
          onChange={(e) => handleChange('activityCode', e.target.value)}
          placeholder="e.g., 500 - Development"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="functionCode">Function Code</Label>
        <Input
          id="functionCode"
          value={formData.functionCode}
          onChange={(e) => handleChange('functionCode', e.target.value)}
          placeholder="e.g., A500 - Default"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialCode ? 'Save Changes' : 'Add Code'}</Button>
      </div>
    </form>
  )
}
