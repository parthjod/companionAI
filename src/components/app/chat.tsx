'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore, type ChatMessage } from '@/store/app-store'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Phone,
  PhoneOff,
  MessageCircle,
  Clock,
  StopCircle,
} from 'lucide-react'

const TOPIC_SUGGESTIONS = [
  "How are you feeling today?",
  "Tell me about your family",
  "What's your favorite memory?",
  "Let's talk about the weather",
  "Tell me a story",
  "What did you do today?",
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatMessageTime(date: Date): string {
  try {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

export function Chat() {
  const {
    currentSenior,
    chatMessages,
    isChatLoading,
    sendMessage,
    startChat,
    endChat,
    isSpeaking,
    isRecording,
    speakText,
    stopSpeaking,
    startRecording,
    currentCallLogId,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const aiName = currentSenior?.aiName || 'Clara'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [chatMessages, isChatLoading])

  // Elapsed time counter
  useEffect(() => {
    if (currentCallLogId) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentCallLogId])

  // Focus input when chat starts
  useEffect(() => {
    if (currentCallLogId && !isChatLoading) {
      inputRef.current?.focus()
    }
  }, [currentCallLogId, isChatLoading])

  const handleStartChat = useCallback(async () => {
    if (!currentSenior) return
    setSessionEnded(false)
    setElapsedSeconds(0)
    setInputValue('')
    await startChat(currentSenior.id)
  }, [currentSenior, startChat])

  const handleEndChat = useCallback(async () => {
    if (!currentSenior) return
    await endChat(currentSenior.id)
    setIsEndDialogOpen(false)
    setSessionEnded(true)
    setElapsedSeconds(0)
  }, [currentSenior, endChat])

  const handleSendMessage = useCallback(async () => {
    if (!currentSenior || !inputValue.trim() || isChatLoading) return
    const msg = inputValue.trim()
    setInputValue('')
    await sendMessage(currentSenior.id, msg)
    inputRef.current?.focus()
  }, [currentSenior, inputValue, isChatLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Recording auto-stops; the store handles it
      return
    }
    const transcript = await startRecording()
    if (transcript && currentSenior && currentCallLogId) {
      setInputValue(transcript)
    }
  }

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speakText(text)
    }
  }

  const handleQuickTopic = (topic: string) => {
    setInputValue(topic)
    inputRef.current?.focus()
  }

  // No senior selected
  if (!currentSenior) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle className="size-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            Select a senior profile to start a conversation.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Empty state - no active session and no messages
  if (!currentCallLogId && chatMessages.length === 0 && !sessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
          <MessageCircle className="size-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Ready to start your daily chat with {aiName}?
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          {aiName} is your AI companion, here to chat, share stories, and keep you company.
        </p>
        <Button
          onClick={handleStartChat}
          size="lg"
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-lg px-8 py-6 h-auto"
        >
          <Phone className="size-5" />
          Start Conversation
        </Button>

        {/* Quick topic suggestions */}
        <div className="mt-8 w-full max-w-lg">
          <p className="text-sm text-muted-foreground text-center mb-3">
            Or pick a topic to get started:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TOPIC_SUGGESTIONS.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                className="text-sm border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
                onClick={() => handleStartChat().then(() => {
                  setTimeout(() => {
                    if (currentSenior) sendMessage(currentSenior.id, topic)
                  }, 500)
                })}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Session ended state
  if (sessionEnded && !currentCallLogId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <PhoneOff className="size-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Conversation Ended</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Your chat with {aiName} has ended. A summary has been saved to your call history.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setSessionEnded(false)
              handleStartChat()
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            <Phone className="size-4" />
            Start New Conversation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col overflow-hidden border-0 shadow-none sm:border sm:shadow-sm h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)]">
      {/* Top Bar - Session Controls */}
      <CardHeader className="border-b p-3 sm:p-4 space-y-0 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border-2 border-amber-300">
              <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-sm font-semibold">
                {aiName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm leading-tight">
                Chatting with {aiName}
              </p>
              {currentCallLogId && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />
                  <Clock className="size-3" />
                  {formatTime(elapsedSeconds)}
                </div>
              )}
            </div>
          </div>
          {currentCallLogId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEndDialogOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/30 dark:text-red-400 gap-1.5"
            >
              <PhoneOff className="size-3.5" />
              <span className="hidden sm:inline">End</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Message Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="p-4 space-y-4">
            {chatMessages.map((msg: ChatMessage, idx: number) => {
              const isUser = msg.role === 'user'
              const isSystem = msg.role === 'system'
              if (isSystem) return null

              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isUser && (
                      <Avatar className="size-8 shrink-0 mt-1 border border-amber-200 dark:border-amber-800">
                        <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold">
                          {aiName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Bubble */}
                    <div className="space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-3 text-base leading-relaxed ${
                          isUser
                            ? 'bg-amber-500 text-white rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[11px] text-muted-foreground">
                          {formatMessageTime(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp))}
                        </span>
                        {!isUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0 text-muted-foreground hover:text-amber-600"
                            onClick={() => handleSpeakMessage(msg.content)}
                            aria-label="Play message audio"
                          >
                            {isSpeaking ? (
                              <StopCircle className="size-3.5" />
                            ) : (
                              <Volume2 className="size-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Loading indicator */}
            {isChatLoading && (
              <div className="flex justify-start animate-in fade-in-0 duration-200">
                <div className="flex gap-2 max-w-[75%]">
                  <Avatar className="size-8 shrink-0 mt-1 border border-amber-200 dark:border-amber-800">
                    <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold">
                      {aiName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      {currentCallLogId && (
        <div className="border-t p-3 sm:p-4 shrink-0 bg-background">
          <div className="flex items-center gap-2">
            {/* Microphone button */}
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              className={`shrink-0 gap-1.5 ${!isRecording ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30' : ''}`}
              onClick={handleToggleRecording}
              disabled={isChatLoading}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <>
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <MicOff className="size-4" />
                </>
              ) : (
                <Mic className="size-4" />
              )}
            </Button>

            {/* Text input */}
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isChatLoading || isRecording}
                className="pr-12 text-base h-11"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white size-8 p-0"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isChatLoading}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
              <span className="flex size-2.5 rounded-full bg-red-500 animate-pulse" />
              Recording... Tap the mic button to stop.
            </div>
          )}
        </div>
      )}

      {/* End Session Confirmation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>End Conversation?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to end your chat with {aiName}? A summary of your conversation will be saved.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Continue Chatting</Button>
            </DialogClose>
            <Button
              onClick={handleEndChat}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              <PhoneOff className="size-4" />
              End Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
