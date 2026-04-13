'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowRight, ArrowLeft, Check, Store, Upload, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { useUpdateProfile } from '@/lib/api/users'
import { useUploadImage } from '@/lib/api/products'
import { toast } from 'sonner'

const steps = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Store' },
  { id: 3, label: 'First Product' },
  { id: 4, label: 'Done' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const updateProfile = useUpdateProfile()
  const uploadImage = useUploadImage()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadImage.mutateAsync(file)
      setAvatarUrl(result.url)
      toast.success('Avatar uploaded')
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  const handleNext = async () => {
    if (currentStep === 3) {
      // Save profile on finish
      try {
        await updateProfile.mutateAsync({
          displayName,
          username,
          bio,
          avatarUrl: avatarUrl ?? undefined,
        })
        toast.success('Profile saved!')
        setCurrentStep(4)
      } catch {
        toast.error('Failed to save profile')
      }
      return
    }
    setCurrentStep(Math.min(4, currentStep + 1))
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl tracking-tight mb-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-primary">Zap</span>
            <span className="text-foreground">Store</span>
          </div>
          <p className="text-muted-foreground">Set up your creator store</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                currentStep > step.id ? "bg-primary text-primary-foreground" :
                currentStep === step.id ? "bg-primary/20 text-primary border-2 border-primary" :
                "bg-muted text-muted-foreground"
              )}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {step.id < steps.length && (
                <div className={cn("w-8 h-0.5", currentStep > step.id ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-heading font-bold">Your Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">How buyers will see you</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input placeholder="e.g. DevPro Studio" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="h-12 px-3 rounded-xl font-mono">zapstore.xyz/store/</Badge>
                    <Input placeholder="devpro" value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-heading font-bold">Store Setup</h2>
                  <p className="text-sm text-muted-foreground mt-1">Tell buyers about your store</p>
                </div>
                <div className="flex justify-center">
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} />
                  <div
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {uploadImage.isPending ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">{avatarUrl ? 'Click to change avatar' : 'Upload a store avatar (optional)'}</p>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio</Label>
                  <Textarea placeholder="Describe what you create..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] rounded-xl resize-none" maxLength={500} />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-heading font-bold">Your First Product</h2>
                  <p className="text-sm text-muted-foreground mt-1">You can add more later from your dashboard</p>
                </div>
                <div className="p-8 rounded-2xl border-2 border-dashed border-border/50 text-center space-y-4">
                  <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Ready to list your first product?</p>
                  <Link href={ROUTES.DASHBOARD_PRODUCTS_NEW}>
                    <Button className="gap-2 rounded-xl">
                      <Store className="w-4 h-4" /> Create Product Listing
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">Or skip for now and add products later</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-heading font-bold">You&apos;re all set!</h2>
                <p className="text-sm text-muted-foreground">Your ZapStore creator account is ready. Start listing products and earning USDC.</p>
                <Link href={ROUTES.DASHBOARD}>
                  <Button size="lg" className="gap-2 rounded-xl mt-4">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {currentStep === 3 ? 'Finish' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
