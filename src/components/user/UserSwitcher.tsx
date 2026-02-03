import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { validateUserName } from '@/lib/validation'
import { UserPlus, Trash2, Pencil } from 'lucide-react'

export function UserSwitcher() {
  const { users, currentUserId, setCurrentUser, addUser, updateUser, deleteUser } =
    useStore()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [editUserName, setEditUserName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentUser = users.find((u) => u.id === currentUserId)

  const handleAddUser = () => {
    const validation = validateUserName(newUserName)
    if (!validation.valid) {
      setError(validation.error || 'Invalid name')
      return
    }

    addUser(newUserName.trim())
    setNewUserName('')
    setError(null)
    setAddDialogOpen(false)
  }

  const handleEditUser = () => {
    if (!currentUserId) return

    const validation = validateUserName(editUserName)
    if (!validation.valid) {
      setError(validation.error || 'Invalid name')
      return
    }

    updateUser(currentUserId, editUserName.trim())
    setEditUserName('')
    setError(null)
    setEditDialogOpen(false)
  }

  const handleDeleteUser = () => {
    if (!currentUserId) return
    deleteUser(currentUserId)
  }

  const handleOpenEditDialog = () => {
    if (currentUser) {
      setEditUserName(currentUser.name)
      setError(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentUserId || ''} onValueChange={setCurrentUser}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Add user">
            <UserPlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user to track their time entries separately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => {
                  setNewUserName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter user name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="Edit user"
            onClick={handleOpenEditDialog}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editUserName}
                onChange={(e) => {
                  setEditUserName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter user name"
                onKeyDown={(e) => e.key === 'Enter' && handleEditUser()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="Delete user"
            disabled={users.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentUser?.name}"? This will
              also delete all their time entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
