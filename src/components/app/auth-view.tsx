'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Heart, Phone, Users } from 'lucide-react'

export function AuthView() {
  const login = useAppStore((s) => s.login)
  const register = useAppStore((s) => s.register)

  const [activeTab, setActiveTab] = useState<string>('signin')

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError('Please fill in all fields.')
      return
    }

    setSignInLoading(true)
    try {
      const success = await login(signInEmail.trim(), signInPassword)
      if (!success) {
        setSignInError('Invalid email or password. Please try again.')
      }
    } catch {
      setSignInError('Something went wrong. Please try again.')
    } finally {
      setSignInLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill in all required fields.')
      return
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.')
      return
    }

    setRegLoading(true)
    try {
      const success = await register(
        regEmail.trim(),
        regPassword,
        regName.trim(),
        regPhone.trim() || undefined
      )
      if (!success) {
        setRegError('Could not create account. This email may already be in use.')
      }
    } catch {
      setRegError('Something went wrong. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4 shadow-md">
            <Heart className="w-10 h-10 text-amber-600 fill-amber-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-tight">
            Welcome to Companion AI
          </h1>
          <p className="mt-2 text-lg text-amber-700">
            Caring connections for your loved ones
          </p>
        </div>

        <Card className="border-amber-200 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-0 pt-6 px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-12 bg-amber-100/80 rounded-lg">
                <TabsTrigger
                  value="signin"
                  className="flex-1 h-10 text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex-1 h-10 text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Create Account
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-base font-medium text-amber-900">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-base font-medium text-amber-900">
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="current-password"
                    />
                  </div>

                  {signInError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm font-medium">
                      {signInError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full h-12 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all active:scale-[0.98]"
                  >
                    {signInLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <p className="text-center text-sm text-amber-700">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-base font-medium text-amber-900">
                      Full Name <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Your full name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-base font-medium text-amber-900">
                      Email Address <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-base font-medium text-amber-900">
                      Password <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-base font-medium text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-amber-500" />
                        Phone Number <span className="text-amber-400 font-normal">(optional)</span>
                      </span>
                    </Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500/30 bg-amber-50/50 placeholder:text-amber-400"
                      autoComplete="tel"
                    />
                  </div>

                  {regError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm font-medium">
                      {regError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={regLoading}
                    className="w-full h-12 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all active:scale-[0.98]"
                  >
                    {regLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <p className="text-center text-sm text-amber-700">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
                    >
                      Sign In
                    </button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-sm text-amber-600">
          Your loved one&apos;s companion, always there with a warm heart.
        </p>
      </div>
    </div>
  )
}
