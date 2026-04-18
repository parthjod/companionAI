'use client'

import { useState } from 'react'
import { useAppStore, type ViewType } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Heart,
  LayoutDashboard,
  User,
  Bell,
  MessageCircle,
  Phone,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Users,
} from 'lucide-react'

interface NavItem {
  view: ViewType
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { view: 'senior-profile', label: 'Senior Profile', icon: <User className="w-5 h-5" /> },
  { view: 'reminders', label: 'Reminders', icon: <Bell className="w-5 h-5" /> },
  { view: 'chat', label: 'AI Chat', icon: <MessageCircle className="w-5 h-5" /> },
  { view: 'call-history', label: 'Call History', icon: <Phone className="w-5 h-5" /> },
  { view: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentSenior = useAppStore((s) => s.currentSenior)
  const seniors = useAppStore((s) => s.seniors)
  const selectSenior = useAppStore((s) => s.selectSenior)
  const logout = useAppStore((s) => s.logout)
  const accountName = useAppStore((s) => s.accountName)

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view)
    onNavClick?.()
  }

  const handleSwitchSenior = async (seniorId: string) => {
    await selectSenior(seniorId)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-white">
      {/* Logo / App Name */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 shadow-sm">
            <Heart className="w-5 h-5 text-amber-600 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900 tracking-tight">CompanionAI</h2>
            <p className="text-xs text-amber-600">Caring for your loved ones</p>
          </div>
        </div>
      </div>

      <Separator className="bg-amber-200/60" />

      {/* Current Senior Info */}
      {currentSenior && (
        <div className="px-4 py-4">
          <div className="rounded-xl bg-amber-100/60 border border-amber-200/80 p-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">
                {currentSenior.name}
              </span>
            </div>
            {currentSenior.aiName && (
              <div className="flex items-center gap-1.5 mt-1">
                <Heart className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span className="text-xs text-amber-700">
                  AI Companion: <span className="font-medium">{currentSenior.aiName}</span>
                </span>
              </div>
            )}
          </div>

          {/* Switch Senior Dropdown */}
          {seniors.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full mt-2 justify-between text-amber-700 hover:bg-amber-100/60 hover:text-amber-900 text-sm h-9"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Switch Senior
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-amber-800">Select Senior</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {seniors.map((senior) => (
                  <DropdownMenuItem
                    key={senior.id}
                    onClick={() => handleSwitchSenior(senior.id)}
                    className={
                      senior.id === currentSenior.id
                        ? 'bg-amber-100 text-amber-900 font-medium'
                        : 'text-amber-700'
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    {senior.name}
                    {senior.id === currentSenior.id && (
                      <Badge className="ml-auto bg-amber-500 text-white text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <Separator className="bg-amber-200/60" />

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = currentView === item.view
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-base font-medium
                transition-all duration-150 ease-in-out
                ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-amber-800 hover:bg-amber-100/80 hover:text-amber-900'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={isActive ? 'text-white' : 'text-amber-600'}>{item.icon}</span>
              <span>{item.label}</span>
              {item.view === 'chat' && (
                <MessageCircle className="w-3 h-3 ml-auto opacity-50" />
              )}
            </button>
          )
        })}
      </nav>

      <Separator className="bg-amber-200/60" />

      {/* User Info + Logout */}
      <div className="px-4 py-4">
        {accountName && (
          <p className="text-xs text-amber-600 mb-2 truncate">
            Signed in as <span className="font-semibold text-amber-800">{accountName}</span>
          </p>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 text-base h-11"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentSenior = useAppStore((s) => s.currentSenior)
  const currentView = useAppStore((s) => s.currentView)

  // Find the current nav label for the mobile top bar
  const currentNavLabel = navItems.find((n) => n.view === currentView)?.label ?? 'Dashboard'

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-amber-200/60 shadow-sm">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-amber-800 hover:bg-amber-100 h-10 w-10">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-amber-200">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="font-bold text-amber-900 text-lg">CompanionAI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentSenior && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-medium">
              {currentSenior.name}
            </Badge>
          )}
          <span className="text-sm text-amber-700 font-medium">{currentNavLabel}</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r border-amber-200/60">
        <SidebarContent />
      </aside>
    </>
  )
}
