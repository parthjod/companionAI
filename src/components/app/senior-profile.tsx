'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type Senior } from '@/store/app-store'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Heart,
  Music,
  Briefcase,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react'

interface ProfileData {
  formerCareer?: string
  hometown?: string
  familyMembers?: string
  favoriteMusicEra?: string
  hobbies?: string
  medicalNotes?: string
  topicsToAvoid?: string
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'America/Toronto', label: 'Eastern - Canada' },
  { value: 'America/Winnipeg', label: 'Central - Canada' },
  { value: 'America/Edmonton', label: 'Mountain - Canada' },
  { value: 'America/Vancouver', label: 'Pacific - Canada' },
  { value: 'America/Halifax', label: 'Atlantic (AT)' },
  { value: 'America/St_Johns', label: 'Newfoundland (NT)' },
]

const MUSIC_ERAS = [
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
]

function parseProfileData(jsonStr: string | undefined): ProfileData {
  if (!jsonStr) return {}
  try {
    return JSON.parse(jsonStr) as ProfileData
  } catch {
    return {}
  }
}

function serializeProfileData(data: ProfileData): string {
  return JSON.stringify(data)
}

export function SeniorProfile() {
  const { currentSenior, createSenior, updateSenior, setCurrentView } =
    useAppStore()

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic info
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [city, setCity] = useState('')
  const [preferredCallTime, setPreferredCallTime] = useState('10:00')
  const [timezone, setTimezone] = useState('America/New_York')
  const [aiName, setAiName] = useState('Clara')

  // Life history
  const [formerCareer, setFormerCareer] = useState('')
  const [hometown, setHometown] = useState('')
  const [familyMembers, setFamilyMembers] = useState('')
  const [favoriteMusicEra, setFavoriteMusicEra] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [topicsToAvoid, setTopicsToAvoid] = useState('')

  // Pre-populate form when currentSenior changes
  useEffect(() => {
    if (currentSenior) {
      setName(currentSenior.name)
      setDateOfBirth(currentSenior.dateOfBirth || '')
      setCity(currentSenior.city || '')
      setPreferredCallTime(currentSenior.preferredCallTime || '10:00')
      setTimezone(currentSenior.timezone || 'America/New_York')
      setAiName(currentSenior.aiName || 'Clara')

      const profile = parseProfileData(currentSenior.profileData)
      setFormerCareer(profile.formerCareer || '')
      setHometown(profile.hometown || '')
      setFamilyMembers(profile.familyMembers || '')
      setFavoriteMusicEra(profile.favoriteMusicEra || '')
      setHobbies(profile.hobbies || '')
      setMedicalNotes(profile.medicalNotes || '')
      setTopicsToAvoid(profile.topicsToAvoid || '')
    }
  }, [currentSenior])

  const isEditing = !!currentSenior

  async function handleSave() {
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsSaving(true)

    try {
      const profileData = serializeProfileData({
        formerCareer: formerCareer || undefined,
        hometown: hometown || undefined,
        familyMembers: familyMembers || undefined,
        favoriteMusicEra: favoriteMusicEra || undefined,
        hobbies: hobbies || undefined,
        medicalNotes: medicalNotes || undefined,
        topicsToAvoid: topicsToAvoid || undefined,
      })

      const seniorData: Partial<Senior> & { name: string } = {
        name: name.trim(),
        dateOfBirth: dateOfBirth || undefined,
        city: city.trim() || undefined,
        preferredCallTime,
        timezone,
        aiName: aiName.trim() || 'Clara',
        profileData,
      }

      if (isEditing && currentSenior) {
        const result = await updateSenior(currentSenior.id, seniorData)
        if (result) {
          setCurrentView('dashboard')
        } else {
          setError('Failed to update profile. Please try again.')
        }
      } else {
        const result = await createSenior(seniorData)
        if (result) {
          setCurrentView('dashboard')
        } else {
          setError('Failed to create profile. Please try again.')
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-amber-700 md:text-3xl">
          {isEditing ? 'Edit Profile' : 'Create Senior Profile'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isEditing
            ? `Update ${currentSenior?.name}'s information and preferences`
            : 'Set up a profile to personalize the AI companion experience'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Info Card */}
        <Card className="border-amber-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <User className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-amber-800">
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Personal details and preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-base font-medium text-amber-900"
              >
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Margaret Johnson"
                className="h-12 border-amber-200 text-base focus-visible:ring-amber-500"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label
                htmlFor="dob"
                className="text-base font-medium text-amber-900"
              >
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-12 border-amber-200 text-base focus-visible:ring-amber-500"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-base font-medium text-amber-900"
              >
                City of Residence
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Portland, Oregon"
                className="h-12 border-amber-200 text-base focus-visible:ring-amber-500"
              />
            </div>

            {/* Preferred Call Time */}
            <div className="space-y-2">
              <Label
                htmlFor="callTime"
                className="text-base font-medium text-amber-900"
              >
                Preferred Call Time
              </Label>
              <Input
                id="callTime"
                type="time"
                value={preferredCallTime}
                onChange={(e) => setPreferredCallTime(e.target.value)}
                className="h-12 border-amber-200 text-base focus-visible:ring-amber-500"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-amber-900">
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-12 w-full border-amber-200 text-base focus:ring-amber-500">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Companion Name */}
            <div className="space-y-2">
              <Label
                htmlFor="aiName"
                className="text-base font-medium text-amber-900"
              >
                AI Companion Name
              </Label>
              <Input
                id="aiName"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                placeholder="Clara"
                className="h-12 border-amber-200 text-base focus-visible:ring-amber-500"
              />
              <p className="text-xs text-muted-foreground">
                The name your AI companion will use when talking with you
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Life History Card */}
        <Card className="border-orange-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Heart className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-orange-800">
                  Life History &amp; Interests
                </CardTitle>
                <CardDescription>
                  Help the AI companion know you better
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Former Career */}
            <div className="space-y-2">
              <Label
                htmlFor="career"
                className="flex items-center gap-2 text-base font-medium text-orange-900"
              >
                <Briefcase className="h-4 w-4 text-orange-500" />
                Former Career
              </Label>
              <Input
                id="career"
                value={formerCareer}
                onChange={(e) => setFormerCareer(e.target.value)}
                placeholder="e.g., School teacher for 30 years"
                className="h-12 border-orange-200 text-base focus-visible:ring-orange-500"
              />
            </div>

            {/* Hometown */}
            <div className="space-y-2">
              <Label
                htmlFor="hometown"
                className="text-base font-medium text-orange-900"
              >
                Hometown
              </Label>
              <Input
                id="hometown"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="e.g., Grew up in small town in Vermont"
                className="h-12 border-orange-200 text-base focus-visible:ring-orange-500"
              />
            </div>

            {/* Family Members */}
            <div className="space-y-2">
              <Label
                htmlFor="family"
                className="flex items-center gap-2 text-base font-medium text-orange-900"
              >
                <Heart className="h-4 w-4 text-orange-500" />
                Family Members
              </Label>
              <Textarea
                id="family"
                value={familyMembers}
                onChange={(e) => setFamilyMembers(e.target.value)}
                placeholder="e.g., Daughter Sarah, Son Michael, 3 grandchildren"
                className="min-h-[80px] border-orange-200 text-base focus-visible:ring-orange-500"
              />
            </div>

            {/* Favorite Music Era */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-medium text-orange-900">
                <Music className="h-4 w-4 text-orange-500" />
                Favorite Music Era
              </Label>
              <Select
                value={favoriteMusicEra}
                onValueChange={setFavoriteMusicEra}
              >
                <SelectTrigger className="h-12 w-full border-orange-200 text-base focus:ring-orange-500">
                  <SelectValue placeholder="Select an era" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_ERAS.map((era) => (
                    <SelectItem key={era} value={era}>
                      {era}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hobbies & Interests */}
            <div className="space-y-2">
              <Label
                htmlFor="hobbies"
                className="text-base font-medium text-orange-900"
              >
                Hobbies &amp; Interests
              </Label>
              <Textarea
                id="hobbies"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="e.g., Gardening, crossword puzzles, bird watching"
                className="min-h-[80px] border-orange-200 text-base focus-visible:ring-orange-500"
              />
            </div>

            <Separator className="bg-orange-100" />

            {/* Medical Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="medical"
                className="flex items-center gap-2 text-base font-medium text-orange-900"
              >
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Medical Notes
              </Label>
              <Textarea
                id="medical"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="For reminders only — e.g., Take medication at 8am daily"
                className="min-h-[80px] border-orange-200 text-base focus-visible:ring-orange-500"
              />
              <p className="text-xs text-muted-foreground">
                This information is used only for setting up reminders
              </p>
            </div>

            {/* Topics to Avoid */}
            <div className="space-y-2">
              <Label
                htmlFor="avoid"
                className="text-base font-medium text-orange-900"
              >
                Topics to Avoid
              </Label>
              <Textarea
                id="avoid"
                value={topicsToAvoid}
                onChange={(e) => setTopicsToAvoid(e.target.value)}
                placeholder="e.g., Politics, recent loss of spouse"
                className="min-h-[80px] border-orange-200 text-base focus-visible:ring-orange-500"
              />
              <p className="text-xs text-muted-foreground">
                The AI companion will avoid bringing up these topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex flex-col items-center gap-3 pb-8 sm:flex-row sm:justify-center">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="h-12 w-full max-w-xs bg-amber-600 text-base font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {isEditing ? 'Update Profile' : 'Create Profile'}
            </>
          )}
        </Button>

        {isEditing && (
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            className="h-12 w-full max-w-xs border-amber-200 text-base text-amber-700 hover:bg-amber-50"
            size="lg"
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
