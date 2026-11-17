import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Shield } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const { sendOTP, verifyOTP, isLoading } = useAuthStore()
  const { toast } = useToast()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      await sendOTP(email)
      setStep('otp')
      toast({
        title: "Verification code sent",
        description: `Please check your email at ${email}`,
      })
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: "Please try again or check your email address.",
        variant: "destructive",
      })
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return

    try {
      await verifyOTP(email, otp)
      onOpenChange(false)
      setStep('email')
      setEmail('')
      setOtp('')
      toast({
        title: "Welcome to Sree AI!",
        description: "You're now logged in and ready to chat.",
      })
    } catch (error) {
      toast({
        title: "Invalid verification code",
        description: "Please check your code and try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setOtp('')
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'email' ? (
              <>
                <Mail className="w-5 h-5 text-primary" />
                Sign in to Sree AI
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-primary" />
                Enter verification code
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'email' ? (
            <div key="email">
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full ai-gradient" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send verification code'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div key="otp">
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Code sent to {email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full ai-gradient" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                  >
                    Back to email
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}