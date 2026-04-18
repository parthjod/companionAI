'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  Shield,
  AlertTriangle,
  Trash2,
  User,
  LogOut,
  Save,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

// ---------- main component ----------

export function Settings() {
  const {
    currentSenior,
    accountEmail,
    accountName,
    logout,
    updateSenior,
  } = useAppStore()

  // Alert config state
  const [alertMethod, setAlertMethod] = useState<'push' | 'sms' | 'both'>('push')
  const [smsPhone, setSmsPhone] = useState('')
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  // Senior config state
  const [aiName, setAiName] = useState(currentSenior?.aiName || 'Clara')
  const [preferredCallTime, setPreferredCallTime] = useState(
    currentSenior?.preferredCallTime || '09:00'
  )
  const [timezone, setTimezone] = useState(
    currentSenior?.timezone || 'America/New_York'
  )
  const [isSavingSenior, setIsSavingSenior] = useState(false)

  // Danger zone dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // Sync senior data into local state
  useEffect(() => {
    if (currentSenior) {
      setAiName(currentSenior.aiName || 'Clara')
      setPreferredCallTime(currentSenior.preferredCallTime || '09:00')
      setTimezone(currentSenior.timezone || 'America/New_York')
    }
  }, [currentSenior])

  // ---------- handlers ----------

  const handleSaveAlerts = () => {
    // MVP: just show a toast
    toast.success('Alert settings saved!', {
      description: `Missed check-in alerts will be sent via ${alertMethod === 'push' ? 'push notification' : alertMethod === 'sms' ? 'SMS' : 'push & SMS'}.`,
    })
  }

  const handleSaveSenior = async () => {
    if (!currentSenior) return
    setIsSavingSenior(true)
    try {
      await updateSenior(currentSenior.id, {
        aiName,
        preferredCallTime,
        timezone,
      })
      toast.success('Settings updated!', {
        description: `${aiName}'s configuration has been saved.`,
      })
    } catch {
      toast.error('Failed to update settings. Please try again.')
    } finally {
      setIsSavingSenior(false)
    }
  }

  const handleDeleteAllData = () => {
    // MVP: just show a toast
    toast.success('All data has been deleted.', {
      description: 'This is a demo — no data was actually deleted.',
    })
    setShowDeleteDialog(false)
  }

  const handleResetAiMemory = () => {
    // MVP: just show a toast
    toast.success('AI memory has been reset.', {
      description: 'This is a demo — no memory was actually reset.',
    })
    setShowResetDialog(false)
  }

  const seniorName = currentSenior?.name || 'Your loved one'

  return (
    <div className="space-y-6">
      {/* ====== Alert Configuration ====== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-amber-600" />
            <CardTitle className="text-lg">Missed Check-In Alerts</CardTitle>
          </div>
          <CardDescription>
            Alerts are sent when {seniorName} doesn&apos;t answer their scheduled
            check-in call.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Enable / disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="alerts-toggle" className="text-sm">
              Enable missed check-in alerts
            </Label>
            <Switch
              id="alerts-toggle"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>

          <Separator />

          {/* Alert method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Alert method</Label>
            <RadioGroup
              value={alertMethod}
              onValueChange={(v) => setAlertMethod(v as 'push' | 'sms' | 'both')}
              disabled={!alertsEnabled}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="push" id="push" />
                <Label htmlFor="push" className="text-sm font-normal cursor-pointer">
                  Push Notification
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="text-sm font-normal cursor-pointer">
                  SMS
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="text-sm font-normal cursor-pointer">
                  Both (Push &amp; SMS)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* SMS phone number */}
          {(alertMethod === 'sms' || alertMethod === 'both') && alertsEnabled && (
            <div className="space-y-2">
              <Label htmlFor="sms-phone" className="text-sm font-medium">
                Phone number for SMS alerts
              </Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Standard messaging rates may apply.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSaveAlerts}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Save className="size-4" />
            Save Alert Settings
          </Button>
        </CardFooter>
      </Card>

      {/* ====== Account ====== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-5 text-amber-600" />
            <CardTitle className="text-lg">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <p className="text-sm font-medium">{accountEmail || 'Not signed in'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Account name</span>
            <p className="text-sm font-medium">{accountName || '—'}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      {/* ====== Senior Configuration ====== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-amber-600" />
            <CardTitle className="text-lg">Senior Configuration</CardTitle>
          </div>
          <CardDescription>
            Manage {seniorName}&apos;s AI companion and call preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* AI Name */}
          <div className="space-y-2">
            <Label htmlFor="ai-name" className="text-sm font-medium">
              AI Companion Name
            </Label>
            <Input
              id="ai-name"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="e.g. Clara"
            />
            <p className="text-xs text-muted-foreground">
              This is the name the AI uses to introduce itself during calls.
            </p>
          </div>

          {/* Preferred call time */}
          <div className="space-y-2">
            <Label htmlFor="call-time" className="text-sm font-medium">
              Preferred Call Time
            </Label>
            <Input
              id="call-time"
              type="time"
              value={preferredCallTime}
              onChange={(e) => setPreferredCallTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The daily time for the scheduled check-in call.
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. America/New_York"
            />
            <p className="text-xs text-muted-foreground">
              IANA timezone identifier (e.g. America/Los_Angeles, Europe/London).
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSaveSenior}
            disabled={isSavingSenior}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSavingSenior ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSavingSenior ? 'Saving...' : 'Update Settings'}
          </Button>
        </CardFooter>
      </Card>

      {/* ====== Danger Zone ====== */}
      <Card className="border-red-300 bg-red-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-600" />
            <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-600/70">
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-md border border-red-200 bg-white/60">
            <div>
              <p className="text-sm font-medium text-red-800">Delete All Data</p>
              <p className="text-xs text-red-600/70">
                Permanently remove all call logs, reminders, and conversation data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="shrink-0"
            >
              <Trash2 className="size-3.5" />
              Delete All Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-md border border-orange-200 bg-white/60">
            <div>
              <p className="text-sm font-medium text-orange-800">Reset AI Memory</p>
              <p className="text-xs text-orange-600/70">
                Clear all learned facts and conversation history the AI remembers.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              onClick={() => setShowResetDialog(true)}
            >
              <RefreshCw className="size-3.5" />
              Reset AI Memory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====== Confirmation Dialogs ====== */}

      {/* Delete All Data Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all call logs, reminders, and conversation
              data for {seniorName}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllData}>
              <Trash2 className="size-4" />
              Yes, Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset AI Memory Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-orange-700">Reset AI Memory?</DialogTitle>
            <DialogDescription>
              This will clear all the facts and preferences {aiName} has learned about{' '}
              {seniorName} over time. The AI will start fresh as if meeting for the
              first time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleResetAiMemory}
            >
              <RefreshCw className="size-4" />
              Yes, Reset Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
