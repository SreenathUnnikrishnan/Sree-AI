import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useChatStore } from "@/store/chat-store"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/hooks/use-toast"

interface ShareConversationProps {
  conversationId: string
  isOpen: boolean
  onClose: () => void
}

export function ShareConversation({ conversationId, isOpen, onClose }: ShareConversationProps) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [isShared, setIsShared] = useState(false)
  
  const { shareConversationViaEmail, isSharingEmail, getCurrentConversation } = useChatStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  
  const conversation = getCurrentConversation()
  
  const handleShare = async () => {
    if (!recipientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address.",
        variant: "destructive"
      })
      return
    }
    
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to share conversations.",
        variant: "destructive"
      })
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      })
      return
    }
    
    try {
      await shareConversationViaEmail(
        conversationId,
        recipientEmail,
        user.email,
        personalMessage.trim() || undefined
      )
      
      setIsShared(true)
      toast({
        title: "Conversation Shared!",
        description: `Successfully sent to ${recipientEmail}`,
      })
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setRecipientEmail('')
        setPersonalMessage('')
        setIsShared(false)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: "Share Failed",
        description: "Failed to share conversation. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const handleClose = () => {
    if (!isSharingEmail) {
      setRecipientEmail('')
      setPersonalMessage('')
      setIsShared(false)
      onClose()
    }
  }
  
  if (!conversation) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Share Conversation
          </DialogTitle>
          <DialogDescription>
            Share "{conversation.title}" via email with beautifully formatted content.
          </DialogDescription>
        </DialogHeader>
        
        {isShared ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">Successfully Shared!</h3>
            <p className="text-gray-600 text-center">
              The conversation has been sent to {recipientEmail}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email *</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="colleague@company.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={isSharingEmail}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal note to include with the conversation..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                disabled={isSharingEmail}
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">What gets shared:</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Complete conversation with all messages</li>
                    <li>• Generated images and search results</li>
                    <li>• File attachments with download links</li>
                    <li>• Beautifully formatted HTML email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isShared && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSharingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharingEmail || !recipientEmail.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSharingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Share via Email
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}