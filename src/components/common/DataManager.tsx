import { useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog'
import { Download, Upload } from 'lucide-react'

export function DataManager() {
  const { exportAllData, importAllData } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zippy-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setImportDialogOpen(true)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = async (mode: 'merge' | 'replace') => {
    if (!pendingFile) return

    try {
      const text = await pendingFile.text()
      const data = JSON.parse(text)
      const result = importAllData(data, mode)
      setResult(result)
      setImportDialogOpen(false)
      setPendingFile(null)
    } catch {
      setResult({ success: false, message: 'Failed to parse import file' })
    }
  }

  const handleMergeClick = () => {
    handleImport('merge')
  }

  const handleReplaceClick = () => {
    setConfirmDialogOpen(true)
  }

  const handleConfirmReplace = () => {
    handleImport('replace')
    setConfirmDialogOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-1" />
        Import
      </Button>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Choose how to import the data from "{pendingFile?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Merge</h4>
              <p className="text-sm text-muted-foreground">
                Add new entries, users, and codes. Existing items will not be modified.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Replace</h4>
              <p className="text-sm text-muted-foreground">
                Replace all existing data with the imported data. This cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleMergeClick}>
              Merge
            </Button>
            <Button variant="destructive" onClick={handleReplaceClick}>
              Replace All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all existing users, POL codes, and time entries and
              replace them with the imported data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Replace All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!result} onOpenChange={() => setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {result?.success ? 'Import Successful' : 'Import Failed'}
            </DialogTitle>
          </DialogHeader>
          <p className={result?.success ? 'text-muted-foreground' : 'text-destructive'}>
            {result?.message}
          </p>
          <DialogFooter>
            <Button onClick={() => setResult(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
