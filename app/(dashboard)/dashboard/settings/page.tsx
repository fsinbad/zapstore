'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Store, Mail, Save, ShieldCheck, Copy, Share2, Upload, ExternalLink, LogOut, Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { useUpdateProfile, useCurrentUser } from '@/lib/api/users'
import { useUploadImage } from '@/lib/api/products'
import { useWallet } from '@/hooks/useWallet'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { wallet, logout } = useWallet()
  const updateProfile = useUpdateProfile()
  const uploadImage = useUploadImage()
  const { data: userData } = useCurrentUser()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Populate fields when user data loads
  useEffect(() => {
    if (!userData?.user) return
    const u = userData.user
    setDisplayName(u.displayName ?? '')
    setUsername(u.username ?? '')
    setBio(u.bio ?? '')
    setEmail(u.email ?? '')
    setAvatarUrl(u.avatarUrl ?? null)
  }, [userData?.user])

  const walletAddress = wallet?.address ?? ''
  const storeUrl = `https://zapstore-one.vercel.app${ROUTES.STORE(username)}`

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

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        displayName,
        username,
        bio,
        email,
        avatarUrl: avatarUrl ?? undefined,
      })
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 lg:pb-0">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground pt-1">Configure your digital storefront and creator profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Store Profile */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="text-primary" size={20} />
                Store Profile
              </CardTitle>
              <CardDescription>How your store appears on the marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png" onChange={handleAvatarUpload} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    {uploadImage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPEG or PNG, max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Store URL Slug</Label>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="h-12 px-3 rounded-xl border-border/50 bg-muted/50 text-muted-foreground font-mono">/store/</Badge>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all flex-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[120px] rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">Max 500 characters</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Notification Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">We&apos;ll send sale notifications to this address</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="rounded-xl font-bold py-6 px-8 gap-2 shadow-lg shadow-primary/20"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" size={20} />
                  Wallet
                </CardTitle>
                <CardDescription>Your Privy-managed Starknet wallet.</CardDescription>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-lg">{walletAddress ? 'Connected' : 'Not Connected'}</Badge>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-3">
                <p className="text-sm font-bold">Starknet Wallet Address</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 rounded-xl bg-background border border-border/50 text-sm font-mono truncate">{walletAddress || 'Loading...'}</code>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/50 bg-card shrink-0" onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Address copied') }}>
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Managed by Privy. Revenue from sales is received directly at this address.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Store Link */}
          <Card className="border-border/50 bg-card overflow-hidden text-center">
            <div className="bg-primary/5 p-8 border-b border-border/50 flex flex-col items-center">
              <Avatar className="h-20 w-20 mb-4">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold font-heading">Your Store</h3>
              <p className="text-xs text-muted-foreground pt-1">Share your store link with buyers</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Public Link</p>
                <p className="text-sm font-bold text-primary truncate">{storeUrl}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl font-bold gap-2" onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success('Link copied') }}>
                  <Copy size={16} /> Copy
                </Button>
                <Button
                  className="flex-1 rounded-xl font-bold gap-2"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: 'My ZapStore', url: storeUrl })
                        toast.success('Store link shared!')
                      } catch (err) {
                        // AbortError = user cancelled the share sheet — fall back to clipboard
                        await navigator.clipboard.writeText(storeUrl)
                        toast.success('Link copied to clipboard')
                      }
                    } else {
                      await navigator.clipboard.writeText(storeUrl)
                      toast.success('Link copied to clipboard')
                    }
                  }}
                >
                  <Share2 size={16} /> Share
                </Button>
              </div>
              <Button variant="ghost" className="w-full gap-2 text-muted-foreground" asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} /> Open Store
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Logout (mobile) */}
          <Card className="border-destructive/20 bg-destructive/5 lg:hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold">Sign Out</h3>
                  <p className="text-xs text-muted-foreground">Log out of your ZapStore account.</p>
                </div>
                <Button variant="destructive" className="w-full rounded-xl font-bold gap-2" onClick={handleLogout}>
                  <LogOut size={16} /> Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
