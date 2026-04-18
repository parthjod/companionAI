'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { AuthView } from '@/components/app/auth-view'
import { AppSidebar } from '@/components/app/app-sidebar'
import { Dashboard } from '@/components/app/dashboard'
import { SeniorProfile } from '@/components/app/senior-profile'
import { Reminders } from '@/components/app/reminders'
import { Chat } from '@/components/app/chat'
import { CallHistory } from '@/components/app/call-history'
import { Settings } from '@/components/app/settings'

export default function Home() {
  const {
    isLoggedIn,
    currentView,
    fetchSeniors,
    seedData,
    isLoading,
  } = useAppStore()

  useEffect(() => {
    if (isLoggedIn) {
      fetchSeniors()
      seedData()
    }
  }, [isLoggedIn, fetchSeniors, seedData])

  // Auth view
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <AuthView />
      </div>
    )
  }

  // Main app view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'senior-profile':
        return <SeniorProfile />
      case 'reminders':
        return <Reminders />
      case 'chat':
        return <Chat />
      case 'call-history':
        return <CallHistory />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[272px] min-h-screen">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                <p className="text-amber-700 font-medium">Loading...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  )
}
