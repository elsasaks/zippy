import { useState } from 'react'
import { useStore } from '@/store/useStore'
import type { TimeCode } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimeCodeForm } from './TimeCodeForm'
import { formatDateET } from '@/lib/timezone'
import { Plus, Star, StarOff, Pencil, Trash2 } from 'lucide-react'

export function TimeCodeManager() {
  const { timeCodes, addTimeCode, updateTimeCode, deleteTimeCode, toggleFavorite } =
    useStore()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<TimeCode | null>(null)

  const handleAddCode = (code: Omit<TimeCode, 'favorite'>) => {
    addTimeCode(code)
    setAddDialogOpen(false)
  }

  const handleEditCode = (code: Omit<TimeCode, 'favorite'>) => {
    if (editingCode) {
      updateTimeCode(editingCode.code, code)
      setEditDialogOpen(false)
      setEditingCode(null)
    }
  }

  const handleOpenEdit = (code: TimeCode) => {
    setEditingCode(code)
    setEditDialogOpen(true)
  }

  const sortedCodes = [...timeCodes].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return a.code.localeCompare(b.code)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">Time Codes</CardTitle>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Time Code</DialogTitle>
            </DialogHeader>
            <TimeCodeForm
              onSubmit={handleAddCode}
              onCancel={() => setAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedCodes.map((code) => (
            <div
              key={code.code}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{code.code}</span>
                  {code.favorite && (
                    <Badge variant="secondary" className="text-xs">
                      Favorite
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {code.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateET(code.startDate)} - {formatDateET(code.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(code.code)}
                  title={code.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {code.favorite ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(code)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Time Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{code.code}"? This will not
                        affect existing time entries using this code.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTimeCode(code.code)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {timeCodes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No time codes configured. Add one to get started.
            </p>
          )}
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Time Code</DialogTitle>
            </DialogHeader>
            {editingCode && (
              <TimeCodeForm
                initialCode={editingCode}
                onSubmit={handleEditCode}
                onCancel={() => {
                  setEditDialogOpen(false)
                  setEditingCode(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
