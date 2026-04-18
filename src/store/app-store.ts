import { create } from 'zustand'

export type ViewType = 'dashboard' | 'senior-profile' | 'reminders' | 'chat' | 'call-history' | 'settings'

export interface Senior {
  id: string
  name: string
  dateOfBirth?: string
  city?: string
  preferredCallTime: string
  timezone: string
  profileData?: string
  aiName: string
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  seniorId: string
  type: string
  description: string
  frequency: string
  nextDue?: string
  active: boolean
  createdAt: string
}

export interface CallLog {
  id: string
  seniorId: string
  scheduledAt: string
  answeredAt?: string
  endedAt?: string
  durationSeconds?: number
  status: string
  createdAt: string
  conversationSummary?: {
    id: string
    summary: string
    createdAt: string
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isPlaying?: boolean
}

interface AppState {
  // Navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  // Auth
  isLoggedIn: boolean
  accountId: string | null
  accountEmail: string | null
  accountName: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phoneNumber?: string) => Promise<boolean>
  logout: () => void

  // Senior
  currentSenior: Senior | null
  seniors: Senior[]
  fetchSeniors: () => Promise<void>
  selectSenior: (id: string) => Promise<void>
  createSenior: (data: Partial<Senior> & { name: string }) => Promise<Senior | null>
  updateSenior: (id: string, data: Partial<Senior>) => Promise<Senior | null>

  // Reminders
  reminders: Reminder[]
  fetchReminders: (seniorId: string) => Promise<void>
  addReminder: (seniorId: string, data: { type: string; description: string; frequency?: string; nextDue?: string }) => Promise<Reminder | null>
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<boolean>
  deleteReminder: (id: string) => Promise<boolean>

  // Call Logs
  callLogs: CallLog[]
  fetchCallLogs: (seniorId: string) => Promise<void>

  // Chat
  chatMessages: ChatMessage[]
  currentCallLogId: string | null
  isChatLoading: boolean
  sendMessage: (seniorId: string, message: string) => Promise<void>
  startChat: (seniorId: string) => Promise<void>
  endChat: (seniorId: string) => Promise<void>
  clearChat: () => void

  // TTS/ASR
  isSpeaking: boolean
  isRecording: boolean
  speakText: (text: string) => Promise<void>
  stopSpeaking: () => void
  startRecording: () => Promise<string | null>

  // Data loading
  isLoading: boolean
  seedData: () => Promise<void>
}

// Audio tracking
let currentAudio: HTMLAudioElement | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // Auth
  isLoggedIn: false,
  accountId: null,
  accountEmail: null,
  accountName: null,
  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        set({
          isLoggedIn: true,
          accountId: data.account.id,
          accountEmail: data.account.email,
          accountName: data.account.name,
        })
        // Load senior if linked
        if (data.account.seniorId) {
          await get().selectSenior(data.account.seniorId)
        }
        return true
      }
      return false
    } catch {
      return false
    }
  },
  register: async (email, password, name, phoneNumber) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phoneNumber }),
      })
      const data = await res.json()
      if (data.success) {
        set({
          isLoggedIn: true,
          accountId: data.accountId,
          accountEmail: email,
          accountName: name,
        })
        return true
      }
      return false
    } catch {
      return false
    }
  },
  logout: () => {
    set({
      isLoggedIn: false,
      accountId: null,
      accountEmail: null,
      accountName: null,
      currentSenior: null,
      seniors: [],
      reminders: [],
      callLogs: [],
      chatMessages: [],
      currentCallLogId: null,
    })
  },

  // Senior
  currentSenior: null,
  seniors: [],
  fetchSeniors: async () => {
    try {
      set({ isLoading: true })
      const { accountId } = get()
      const url = accountId ? `/api/seniors?accountId=${accountId}` : '/api/seniors'
      const res = await fetch(url)
      const data = await res.json()
      set({ seniors: data.seniors || data || [], isLoading: false })
      // Auto-select first senior if none selected
      const state = get()
      if (!state.currentSenior && state.seniors.length > 0) {
        await get().selectSenior(state.seniors[0].id)
      }
    } catch {
      set({ isLoading: false })
    }
  },
  selectSenior: async (id) => {
    try {
      const res = await fetch(`/api/seniors/${id}`)
      const data = await res.json()
      set({ currentSenior: data.senior || data })
      // Also load related data
      await get().fetchReminders(id)
      await get().fetchCallLogs(id)
    } catch {
      // ignore
    }
  },
  createSenior: async (data) => {
    try {
      const { accountId } = get()
      const res = await fetch('/api/seniors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountId }),
      })
      const result = await res.json()
      const senior = result.senior || result
      await get().fetchSeniors()
      set({ currentSenior: senior })
      return senior
    } catch {
      return null
    }
  },
  updateSenior: async (id, data) => {
    try {
      const res = await fetch(`/api/seniors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      const senior = result.senior || result
      set({ currentSenior: senior })
      await get().fetchSeniors()
      return senior
    } catch {
      return null
    }
  },

  // Reminders
  reminders: [],
  fetchReminders: async (seniorId) => {
    try {
      const res = await fetch(`/api/seniors/${seniorId}/reminders`)
      const data = await res.json()
      set({ reminders: data.reminders || data || [] })
    } catch {
      // ignore
    }
  },
  addReminder: async (seniorId, data) => {
    try {
      const res = await fetch(`/api/seniors/${seniorId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      await get().fetchReminders(seniorId)
      return result.reminder || result
    } catch {
      return null
    }
  },
  updateReminder: async (id, data) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (get().currentSenior) {
        await get().fetchReminders(get().currentSenior!.id)
      }
      return result.success !== false
    } catch {
      return false
    }
  },
  deleteReminder: async (id) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
      if (get().currentSenior) {
        await get().fetchReminders(get().currentSenior!.id)
      }
      return true
    } catch {
      return false
    }
  },

  // Call Logs
  callLogs: [],
  fetchCallLogs: async (seniorId) => {
    try {
      const res = await fetch(`/api/seniors/${seniorId}/calls`)
      const data = await res.json()
      set({ callLogs: data.callLogs || data || [] })
    } catch {
      // ignore
    }
  },

  // Chat
  chatMessages: [],
  currentCallLogId: null,
  isChatLoading: false,
  sendMessage: async (seniorId, message) => {
    const state = get()
    set({ isChatLoading: true })

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date() }
    set({ chatMessages: [...state.chatMessages, userMsg] })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seniorId,
          message,
          callLogId: state.currentCallLogId,
        }),
      })
      const data = await res.json()
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      }
      set((s) => ({
        chatMessages: [...s.chatMessages, aiMsg],
        isChatLoading: false,
      }))
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, there was an error connecting. Please try again.",
        timestamp: new Date(),
      }
      set((s) => ({
        chatMessages: [...s.chatMessages, errorMsg],
        isChatLoading: false,
      }))
    }
  },
  startChat: async (seniorId) => {
    try {
      // Create a call log
      const res = await fetch(`/api/seniors/${seniorId}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      const data = await res.json()
      const callLog = data.callLog || data

      // Initial greeting
      const greetingMsg: ChatMessage = {
        role: 'assistant',
        content: `Hello! This is ${get().currentSenior?.aiName || 'Clara'}. I'm so happy to talk with you today! How are you doing?`,
        timestamp: new Date(),
      }

      set({
        chatMessages: [greetingMsg],
        currentCallLogId: callLog.id,
      })
    } catch {
      set({
        chatMessages: [{
          role: 'assistant' as const,
          content: `Hello! This is ${get().currentSenior?.aiName || 'Clara'}. How are you today?`,
          timestamp: new Date(),
        }],
        currentCallLogId: null,
      })
    }
  },
  endChat: async (seniorId) => {
    const state = get()
    if (!state.currentCallLogId) return

    try {
      // Prepare messages for summary
      const messages = state.chatMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))

      await fetch('/api/chat/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seniorId,
          callLogId: state.currentCallLogId,
          messages,
        }),
      })

      // Update the call log status
      await fetch(`/api/calls/${state.currentCallLogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endedAt: new Date().toISOString(),
          durationSeconds: Math.floor(
            (Date.now() - new Date(state.chatMessages[0]?.timestamp || Date.now()).getTime()) / 1000
          ),
        }),
      })

      // Refresh call logs
      await get().fetchCallLogs(seniorId)
    } catch {
      // ignore
    }

    set({ currentCallLogId: null })
  },
  clearChat: () => set({ chatMessages: [], currentCallLogId: null }),

  // TTS/ASR
  isSpeaking: false,
  isRecording: false,
  speakText: async (text) => {
    try {
      // Stop any current audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
        set({ isSpeaking: false })
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }

      set({ isSpeaking: true })
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.substring(0, 1024) }),
        })

        if (!res.ok) {
          throw new Error('TTS API failed')
        }

        const audioBlob = await res.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        currentAudio = audio

        audio.onended = () => {
          set({ isSpeaking: false })
          currentAudio = null
          URL.revokeObjectURL(audioUrl)
        }

        audio.onerror = () => {
          set({ isSpeaking: false })
          currentAudio = null
        }

        await audio.play()
      } catch (err) {
        // Fallback to browser TTS
        console.warn('Backend TTS failed, using browser Native TTS fallback')
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.onend = () => set({ isSpeaking: false })
          utterance.onerror = () => set({ isSpeaking: false })
          window.speechSynthesis.speak(utterance)
        } else {
          set({ isSpeaking: false })
        }
      }
    } catch {
      set({ isSpeaking: false })
    }
  },
  stopSpeaking: () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    set({ isSpeaking: false })
  },
  startRecording: async () => {
    try {
      set({ isRecording: true })
      audioChunks = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      return new Promise<string | null>((resolve) => {
        if (!mediaRecorder) {
          set({ isRecording: false })
          resolve(null)
          return
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop())
          set({ isRecording: false })

          if (audioChunks.length === 0) {
            resolve(null)
            return
          }

          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            const reader = new FileReader()
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1]
              if (!base64Audio) {
                resolve(null)
                return
              }

              const asrRes = await fetch('/api/asr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Audio }),
              })
              const asrData = await asrRes.json()
              resolve(asrData.text || null)
            }
            reader.readAsDataURL(audioBlob)
          } catch {
            resolve(null)
          }
        }

        mediaRecorder.start()

        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
        }, 30000)
      })
    } catch {
      set({ isRecording: false })
      return null
    }
  },

  // Data loading
  isLoading: false,
  seedData: async () => {
    try {
      await fetch('/api/seed', { method: 'POST' })
    } catch {
      // ignore
    }
  },
}))
