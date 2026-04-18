'use client'

import { useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  MessageCircle,
  Bell,
  Clock,
  Heart,
  Calendar,
  Plus,
  ChevronRight,
  Sparkles,
  UserPlus,
} from 'lucide-react'

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0m'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Never'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'Unknown'
  }
}

function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function Dashboard() {
  const {
    currentSenior,
    seniors,
    reminders,
    callLogs,
    setCurrentView,
    fetchSeniors,
    seedData,
    isLoading,
  } = useAppStore()

  // Calculate stats
  const completedCalls = callLogs.filter((c) => c.status === 'completed')
  const totalConversations = completedCalls.length
  const averageDuration =
    completedCalls.length > 0
      ? Math.round(
          completedCalls.reduce(
            (sum, c) => sum + (c.durationSeconds || 0),
            0
          ) / completedCalls.length
        )
      : 0
  const activeReminders = reminders.filter((r) => r.active).length
  const lastCheckIn =
    callLogs.length > 0
      ? callLogs.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]?.createdAt
      : undefined

  const recentCalls = callLogs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  // No senior setup - show get started
  if (!currentSenior) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-700 md:text-3xl">
            Welcome to Companion
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your AI companion for staying connected and cared for
          </p>
        </div>

        <Card className="mx-auto max-w-lg border-amber-200 bg-amber-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <UserPlus className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-amber-800">
              Get Started
            </CardTitle>
            <CardDescription className="text-amber-700/70">
              Set up a senior profile to begin. You&apos;ll be able to customize
              their AI companion and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => setCurrentView('senior-profile')}
              className="bg-amber-600 text-white hover:bg-amber-700"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Senior Profile
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              variant="ghost"
              onClick={seedData}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Load Demo Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700 md:text-3xl">
            Good to see you, {currentSenior.name}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your companion{' '}
            <span className="font-medium text-amber-600">
              {currentSenior.aiName}
            </span>{' '}
            is here for you
          </p>
        </div>
        {callLogs.length === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={seedData}
            className="text-amber-600 hover:bg-amber-100 hover:text-amber-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Load Demo Data
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Conversations */}
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-amber-700/70">
                Conversations
              </CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <MessageCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-800">
              {totalConversations}
            </p>
            <p className="mt-1 text-xs text-amber-600/70">
              {totalConversations === 0
                ? 'Start your first chat!'
                : `${totalConversations} completed`}
            </p>
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-orange-700/70">
                Avg. Duration
              </CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-800">
              {formatDuration(averageDuration)}
            </p>
            <p className="mt-1 text-xs text-orange-600/70">
              {averageDuration === 0
                ? 'No calls yet'
                : 'Per conversation'}
            </p>
          </CardContent>
        </Card>

        {/* Active Reminders */}
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-amber-700/70">
                Active Reminders
              </CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-800">
              {activeReminders}
            </p>
            <p className="mt-1 text-xs text-amber-600/70">
              {activeReminders === 0
                ? 'No reminders set'
                : `${activeReminders} active`}
            </p>
          </CardContent>
        </Card>

        {/* Last Check-in */}
        <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-orange-700/70">
                Last Check-in
              </CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-800">
              {formatDate(lastCheckIn)}
            </p>
            <p className="mt-1 text-xs text-orange-600/70">
              {!lastCheckIn ? 'No check-ins yet' : 'Most recent call'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-amber-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button
            onClick={() => setCurrentView('chat')}
            className="h-auto justify-start gap-3 bg-amber-600 py-4 text-white hover:bg-amber-700"
            size="lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Start a Chat</p>
              <p className="text-xs text-amber-100">Talk with{' '}
                {currentSenior.aiName}
              </p>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView('reminders')}
            className="h-auto justify-start gap-3 bg-orange-600 py-4 text-white hover:bg-orange-700"
            size="lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Add Reminder</p>
              <p className="text-xs text-orange-100">Set a new reminder</p>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView('call-history')}
            className="h-auto justify-start gap-3 bg-amber-700 py-4 text-white hover:bg-amber-800"
            size="lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">View History</p>
              <p className="text-xs text-amber-100">Past conversations</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-amber-800">
          Recent Conversations
        </h2>
        {recentCalls.length === 0 ? (
          <Card className="border-dashed border-amber-200 bg-amber-50/30">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Heart className="mb-3 h-10 w-10 text-amber-300" />
              <p className="text-lg font-medium text-amber-700">
                No conversations yet
              </p>
              <p className="mt-1 text-sm text-amber-600/70">
                Start a chat with {currentSenior.aiName} to see your
                conversation history here
              </p>
              <Button
                onClick={() => setCurrentView('chat')}
                className="mt-4 bg-amber-600 text-white hover:bg-amber-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <Card
                key={call.id}
                className="transition-colors hover:border-amber-200 hover:bg-amber-50/30"
              >
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-amber-900">
                        Conversation with {currentSenior.aiName}
                      </p>
                      <Badge
                        variant={
                          call.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          call.status === 'completed'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }
                      >
                        {call.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatFullDate(call.createdAt)}
                      </span>
                      {call.durationSeconds !== undefined &&
                        call.durationSeconds > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(call.durationSeconds)}
                          </span>
                        )}
                      {call.conversationSummary?.summary && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Heart className="h-3.5 w-3.5" />
                          Mood detected
                        </span>
                      )}
                    </div>
                    {call.conversationSummary?.summary && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {call.conversationSummary.summary}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-amber-300" />
                </CardContent>
              </Card>
            ))}

            {callLogs.length > 5 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView('call-history')}
                  className="text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                >
                  View All Conversations
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
            <p className="text-sm text-amber-700">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
