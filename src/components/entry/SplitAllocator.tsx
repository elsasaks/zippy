import { useState } from 'react'
import type { TimeEntry } from '@/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { TimeCodePicker } from '@/components/timecode/TimeCodePicker'
import { MinutesInput } from '@/components/common/MinutesInput'
import { RemainingTime } from './RemainingTime'
import { validateSplit } from '@/lib/validation'
import { calculateRemainingMinutes, formatMinutes } from '@/lib/calculations'
import { Plus, X } from 'lucide-react'

interface SplitAllocatorProps {
  entry: TimeEntry
}

export function SplitAllocator({ entry }: SplitAllocatorProps) {
  const { timeCodes, addSplit, deleteSplit } = useStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [minutes, setMinutes] = useState(60)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const remaining = calculateRemainingMinutes(entry.totalMinutes, entry.splits)

  const handleOpenDialog = () => {
    setSelectedCode('')
    setMinutes(Math.min(60, remaining))
    setDescription('')
    setError(null)
  }

  const handleAddSplit = () => {
    const validation = validateSplit(
      { timeCode: selectedCode, minutes },
      entry,
      timeCodes
    )

    if (!validation.valid) {
      setError(validation.error || 'Invalid split')
      return
    }

    addSplit(entry.id, selectedCode, minutes, description || undefined)
    setDialogOpen(false)
  }

  const handleDeleteSplit = (splitId: string) => {
    deleteSplit(entry.id, splitId)
  }

  const getCodeDescription = (code: string) => {
    return timeCodes.find((c) => c.code === code)?.description || ''
  }

  return (
    <div className="space-y-3">
      {entry.splits.length > 0 && (
        <div className="space-y-2">
          {entry.splits.map((split) => (
            <div
              key={split.id}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{split.timeCode}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatMinutes(split.minutes)})
                  </span>
                </div>
                {split.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {split.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {getCodeDescription(split.timeCode)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDeleteSplit(split.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <RemainingTime totalMinutes={entry.totalMinutes} splits={entry.splits} />

      {remaining > 0 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleOpenDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Split
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Split</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Time Code</Label>
                <TimeCodePicker
                  value={selectedCode}
                  onChange={setSelectedCode}
                  entryDate={entry.date}
                />
              </div>

              <MinutesInput
                label="Time"
                value={minutes}
                onChange={setMinutes}
                max={remaining}
              />

              <div className="grid gap-2">
                <Label htmlFor="splitDescription">Description (optional)</Label>
                <Input
                  id="splitDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                />
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Remaining after this split:{' '}
                  <span className="font-medium">
                    {formatMinutes(Math.max(0, remaining - minutes))}
                  </span>
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSplit} disabled={!selectedCode}>
                Add Split
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
