'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore, type CallLog } from '@/store/app-store'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Phone,
  PhoneOff,
  Clock,
  ChevronDown,
  ChevronUp,
  Volume2,
  Calendar,
  MessageCircle,
} from 'lucide-react'

// ---------- helpers ----------

function formatDuration(totalSeconds?: number | null): string {
  if (!totalSeconds && totalSeconds !== 0) return 'N/A'
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins} min ${secs} sec`
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

interface ParsedSummary {
  mood?: string
  moodEmoji?: string
  topicsDiscussed?: string[]
  newFactsLearned?: string[]
  remindersConfirmed?: string[]
  followUpPrompts?: string[]
  rawText?: string
}

function parseSummary(summaryStr?: string | null): ParsedSummary {
  if (!summaryStr) return {}
  try {
    const parsed = JSON.parse(summaryStr)
    return {
      mood: parsed.mood ?? parsed.mood_text ?? undefined,
      moodEmoji: parsed.mood_emoji ?? parsed.emoji ?? undefined,
      topicsDiscussed: Array.isArray(parsed.topics_discussed ?? parsed.topics)
        ? (parsed.topics_discussed ?? parsed.topics)
        : undefined,
      newFactsLearned: Array.isArray(parsed.new_facts_learned ?? parsed.new_facts ?? parsed.facts)
        ? (parsed.new_facts_learned ?? parsed.new_facts ?? parsed.facts)
        : undefined,
      remindersConfirmed: Array.isArray(parsed.reminders_confirmed ?? parsed.reminders)
        ? (parsed.reminders_confirmed ?? parsed.reminders)
        : undefined,
      followUpPrompts: Array.isArray(parsed.follow_up_prompts ?? parsed.follow_ups ?? parsed.followUps)
        ? (parsed.follow_up_prompts ?? parsed.follow_ups ?? parsed.followUps)
        : undefined,
    }
  } catch {
    return { rawText: summaryStr }
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          <Phone className="size-3" />
          Completed
        </Badge>
      )
    case 'missed':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          <PhoneOff className="size-3" />
          Missed
        </Badge>
      )
    case 'active':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          <Phone className="size-3" />
          Active
        </Badge>
      )
    case 'late_answered':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          <Phone className="size-3" />
          Late Answered
        </Badge>
      )
    case 'scheduled':
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
          <Clock className="size-3" />
          Scheduled
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ---------- sub-components ----------

function SummarySection({ summary }: { summary: string }) {
  const parsed = useMemo(() => parseSummary(summary), [summary])

  if (parsed.rawText) {
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
        {parsed.rawText}
      </p>
    )
  }

  const hasContent =
    parsed.mood ||
    parsed.topicsDiscussed?.length ||
    parsed.newFactsLearned?.length ||
    parsed.remindersConfirmed?.length ||
    parsed.followUpPrompts?.length

  if (!hasContent) {
    return (
      <p className="text-sm text-muted-foreground italic mt-2">
        No detailed summary available.
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Mood */}
      {parsed.mood && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-700">Mood:</span>
          <span className="text-sm">
            {parsed.moodEmoji && <span className="mr-1">{parsed.moodEmoji}</span>}
            {parsed.mood}
          </span>
        </div>
      )}

      {/* Topics */}
      {parsed.topicsDiscussed && parsed.topicsDiscussed.length > 0 && (
        <div>
          <span className="text-sm font-medium text-amber-700">Topics discussed:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {parsed.topicsDiscussed.map((t, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-amber-50 text-amber-800 border-amber-200 text-xs"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* New facts */}
      {parsed.newFactsLearned && parsed.newFactsLearned.length > 0 && (
        <div>
          <span className="text-sm font-medium text-amber-700">New facts learned:</span>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            {parsed.newFactsLearned.map((f, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reminders confirmed */}
      {parsed.remindersConfirmed && parsed.remindersConfirmed.length > 0 && (
        <div>
          <span className="text-sm font-medium text-amber-700">Reminders confirmed:</span>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            {parsed.remindersConfirmed.map((r, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up prompts */}
      {parsed.followUpPrompts && parsed.followUpPrompts.length > 0 && (
        <div>
          <span className="text-sm font-medium text-amber-700">Follow-up prompts:</span>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            {parsed.followUpPrompts.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CallLogCard({ log, aiName }: { log: CallLog; aiName: string }) {
  const { speakText, isSpeaking } = useAppStore()
  const [open, setOpen] = useState(false)

  const hasSummary = !!log.conversationSummary?.summary

  const buildReadAloudText = (): string => {
    if (!log.conversationSummary?.summary) return ''
    const parsed = parseSummary(log.conversationSummary.summary)
    if (parsed.rawText) return parsed.rawText

    const parts: string[] = []
    if (parsed.mood) parts.push(`Mood: ${parsed.moodEmoji ? parsed.moodEmoji + ' ' : ''}${parsed.mood}`)
    if (parsed.topicsDiscussed?.length)
      parts.push(`Topics discussed: ${parsed.topicsDiscussed.join(', ')}`)
    if (parsed.newFactsLearned?.length)
      parts.push(`New facts: ${parsed.newFactsLearned.join(', ')}`)
    if (parsed.remindersConfirmed?.length)
      parts.push(`Reminders confirmed: ${parsed.remindersConfirmed.join(', ')}`)
    if (parsed.followUpPrompts?.length)
      parts.push(`Follow-ups: ${parsed.followUpPrompts.join(', ')}`)
    return parts.join('. ')
  }

  const dateStr = log.scheduledAt || log.createdAt

  return (
    <Card className="border-l-4 border-l-amber-400">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="size-4 text-amber-600 shrink-0" />
            <CardTitle className="text-base truncate">
              {formatDate(dateStr)}
              {formatTime(dateStr) && (
                <span className="text-muted-foreground font-normal ml-2">
                  {formatTime(dateStr)}
                </span>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {statusBadge(log.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {/* Duration row */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          <span>Duration: {formatDuration(log.durationSeconds)}</span>
        </div>

        {/* Expandable summary */}
        {hasSummary && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              >
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="size-3.5" />
                  Conversation Summary
                </span>
                {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-1">
              <SummarySection summary={log.conversationSummary!.summary} />

              {/* Read Aloud button */}
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => {
                  const text = buildReadAloudText()
                  if (text) speakText(text)
                }}
                disabled={isSpeaking}
              >
                <Volume2 className="size-3.5" />
                {isSpeaking ? 'Speaking...' : 'Read Summary Aloud'}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        {!hasSummary && (
          <p className="text-xs text-muted-foreground italic">No conversation summary available.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- main component ----------

export function CallHistory() {
  const { currentSenior, callLogs, fetchCallLogs } = useAppStore()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (currentSenior?.id) {
      fetchCallLogs(currentSenior.id)
    }
  }, [currentSenior?.id, fetchCallLogs])

  const sortedLogs = useMemo(() => {
    return [...callLogs].sort((a, b) => {
      const dateA = new Date(a.scheduledAt || a.createdAt).getTime()
      const dateB = new Date(b.scheduledAt || b.createdAt).getTime()
      return dateB - dateA
    })
  }, [callLogs])

  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return sortedLogs
    if (activeTab === 'completed') return sortedLogs.filter((l) => l.status === 'completed')
    if (activeTab === 'missed') return sortedLogs.filter((l) => l.status === 'missed')
    return sortedLogs
  }, [sortedLogs, activeTab])

  const aiName = currentSenior?.aiName || 'Clara'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="size-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Call History</h2>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            {callLogs.length} {callLogs.length === 1 ? 'call' : 'calls'}
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      {callLogs.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-amber-50">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-200">
              All
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-amber-200">
              Completed
            </TabsTrigger>
            <TabsTrigger value="missed" className="data-[state=active]:bg-amber-200">
              Missed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CallLogList logs={filteredLogs} aiName={aiName} />
          </TabsContent>
          <TabsContent value="completed">
            <CallLogList logs={filteredLogs} aiName={aiName} />
          </TabsContent>
          <TabsContent value="missed">
            <CallLogList logs={filteredLogs} aiName={aiName} />
          </TabsContent>
        </Tabs>
      )}

      {/* No tabs when empty */}
      {callLogs.length === 0 && (
        <CallLogList logs={[]} aiName={aiName} />
      )}
    </div>
  )
}

function CallLogList({ logs, aiName }: { logs: CallLog[]; aiName: string }) {
  if (logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <PhoneOff className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            No calls yet. Start your first conversation with{' '}
            <span className="font-semibold text-amber-700">{aiName}</span>!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollArea className="max-h-[calc(100vh-280px)]">
      <div className="space-y-3 pr-1">
        {logs.map((log) => (
          <CallLogCard key={log.id} log={log} aiName={aiName} />
        ))}
      </div>
    </ScrollArea>
  )
}
