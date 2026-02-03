import { useState } from 'react'
import { UserSwitcher } from '@/components/user/UserSwitcher'
import { POLCodeManager } from '@/components/polcode/POLCodeManager'
import { TimeEntryForm } from '@/components/entry/TimeEntryForm'
import { TimeEntryList } from '@/components/entry/TimeEntryList'
import { WeeklyReport } from '@/components/reports/WeeklyReport'
import { MonthlyReport } from '@/components/reports/MonthlyReport'
import { DataManager } from '@/components/common/DataManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Settings, Zap } from 'lucide-react'

function App() {
  const [codesDialogOpen, setCodesDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="h-5 w-5 text-primary" />
            <span>zippy</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <DataManager />
            <Dialog open={codesDialogOpen} onOpenChange={setCodesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Codes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage POL Codes</DialogTitle>
                </DialogHeader>
                <POLCodeManager />
              </DialogContent>
            </Dialog>
            <UserSwitcher />
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <TimeEntryForm />

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimeEntryList />
            </div>
            <div className="space-y-6">
              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                  <WeeklyReport />
                </TabsContent>
                <TabsContent value="monthly">
                  <MonthlyReport />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 mt-8">
        <div className="container px-4 max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            zippy - POL Time Splitter for Estonian bank developers
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
