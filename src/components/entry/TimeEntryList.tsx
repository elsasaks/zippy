import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SplitAllocator } from './SplitAllocator'
import { MinutesInput } from '@/components/common/MinutesInput'
import { formatDateET } from '@/lib/timezone'
import { formatMinutes, calculateAllocatedMinutes } from '@/lib/calculations'
import { Pencil, Trash2, Calendar, Clock } from 'lucide-react'
import type { TimeEntry } from '@/types'

export function TimeEntryList() {
  const { timeEntries, currentUserId, updateTimeEntry, deleteTimeEntry } = useStore()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editMinutes, setEditMinutes] = useState(0)

  const userEntries = timeEntries
    .filter((e) => e.userId === currentUserId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const handleOpenEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setEditDate(entry.date)
    setEditMinutes(entry.totalMinutes)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingEntry) return

    const allocated = calculateAllocatedMinutes(editingEntry.splits)
    if (editMinutes < allocated) {
      return
    }

    updateTimeEntry(editingEntry.id, {
      date: editDate,
      totalMinutes: editMinutes,
    })
    setEditDialogOpen(false)
    setEditingEntry(null)
  }

  if (userEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No time entries yet. Add your first entry above.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Time Entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userEntries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDateET(entry.date)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatMinutes(entry.totalMinutes)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(entry)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the entry for{' '}
                        {formatDateET(entry.date)}? This will remove all splits
                        associated with this entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTimeEntry(entry.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <SplitAllocator entry={entry} />
          </div>
        ))}

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editDate">Date</Label>
                  <Input
                    id="editDate"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>

                <MinutesInput
                  label="Total Time"
                  value={editMinutes}
                  onChange={setEditMinutes}
                />

                {editMinutes < calculateAllocatedMinutes(editingEntry.splits) && (
                  <p className="text-sm text-destructive">
                    Total time cannot be less than allocated time (
                    {formatMinutes(calculateAllocatedMinutes(editingEntry.splits))})
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={
                  editingEntry
                    ? editMinutes < calculateAllocatedMinutes(editingEntry.splits)
                    : false
                }
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
