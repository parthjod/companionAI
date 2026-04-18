'use client'

import { useState } from 'react'
import { useAppStore, type Reminder } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pill, Calendar, Bell, Trash2, AlertCircle } from 'lucide-react'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  medication: <Pill className="size-4" />,
  appointment: <Calendar className="size-4" />,
  other: <Bell className="size-4" />,
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  medication: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  appointment: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  other: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700',
}

const TYPE_LABELS: Record<string, string> = {
  medication: 'Medication',
  appointment: 'Appointment',
  other: 'Other',
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  once: 'Once',
}

export function Reminders() {
  const { currentSenior, reminders, addReminder, updateReminder, deleteReminder } = useAppStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formType, setFormType] = useState<string>('medication')
  const [formDescription, setFormDescription] = useState('')
  const [formFrequency, setFormFrequency] = useState<string>('daily')
  const [formNextDue, setFormNextDue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormType('medication')
    setFormDescription('')
    setFormFrequency('daily')
    setFormNextDue('')
  }

  const handleAddReminder = async () => {
    if (!currentSenior || !formDescription.trim()) return

    setIsSubmitting(true)
    try {
      await addReminder(currentSenior.id, {
        type: formType,
        description: formDescription.trim(),
        frequency: formFrequency,
        nextDue: formNextDue || undefined,
      })
      resetForm()
      setIsAddDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (reminder: Reminder) => {
    await updateReminder(reminder.id, { active: !reminder.active })
  }

  const handleDelete = async (id: string) => {
    await deleteReminder(id)
  }

  const formatNextDue = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (!currentSenior) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">
            Select a senior profile to manage their reminders.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reminders</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Medication and appointment reminders for {currentSenior.name}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Reminder</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="reminder-type">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger id="reminder-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">
                      <span className="flex items-center gap-2">
                        <Pill className="size-3.5" /> Medication
                      </span>
                    </SelectItem>
                    <SelectItem value="appointment">
                      <span className="flex items-center gap-2">
                        <Calendar className="size-3.5" /> Appointment
                      </span>
                    </SelectItem>
                    <SelectItem value="other">
                      <span className="flex items-center gap-2">
                        <Bell className="size-3.5" /> Other
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="reminder-desc">Description</Label>
                <Textarea
                  id="reminder-desc"
                  placeholder="e.g., Take blood pressure medication with breakfast"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="reminder-freq">Frequency</Label>
                <Select value={formFrequency} onValueChange={setFormFrequency}>
                  <SelectTrigger id="reminder-freq" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="once">Once</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Next Due Date */}
              <div className="space-y-2">
                <Label htmlFor="reminder-due">Next Due Date (optional)</Label>
                <Input
                  id="reminder-due"
                  type="date"
                  value={formNextDue}
                  onChange={(e) => setFormNextDue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleAddReminder}
                disabled={!formDescription.trim() || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Reminder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminder List */}
      {reminders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="size-12 text-amber-300 mb-4" />
            <p className="text-muted-foreground text-base">
              No reminders yet. Add one to help keep track of medications and appointments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={`transition-opacity ${
                !reminder.active ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-9 items-center justify-center rounded-full shrink-0 ${
                        reminder.type === 'medication'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : reminder.type === 'appointment'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
                      }`}
                    >
                      {TYPE_ICONS[reminder.type] || TYPE_ICONS.other}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug truncate">
                        {reminder.description}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className={TYPE_BADGE_COLORS[reminder.type] || TYPE_BADGE_COLORS.other}
                        >
                          {TYPE_LABELS[reminder.type] || 'Other'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {FREQUENCY_LABELS[reminder.frequency] || reminder.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {reminder.nextDue && (
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Due: {formatNextDue(reminder.nextDue)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.active}
                      onCheckedChange={() => handleToggleActive(reminder)}
                      aria-label={`${reminder.active ? 'Deactivate' : 'Activate'} reminder`}
                      className="data-[state=checked]:bg-amber-600"
                    />
                    <span className="text-sm text-muted-foreground">
                      {reminder.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this reminder? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(reminder.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
