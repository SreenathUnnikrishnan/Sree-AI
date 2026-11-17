import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Send, 
  Paperclip, 
  X, 
  Plus, 
  User, 
  Users, 
  FileText,
  Image as ImageIcon,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  Code
} from 'lucide-react'
import { useChatStore, type UploadedFile } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'

interface EmailSenderProps {
  conversationId?: string
  defaultSubject?: string
  defaultContent?: string
  defaultAttachments?: UploadedFile[]
}

interface EmailRecipient {
  email: string
  type: 'to' | 'cc' | 'bcc'
}

export function EmailSender({ 
  conversationId, 
  defaultSubject = '', 
  defaultContent = '',
  defaultAttachments = []
}: EmailSenderProps) {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([{ email: '', type: 'to' }])
  const [senderEmail, setSenderEmail] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [content, setContent] = useState(defaultContent)
  const [htmlContent, setHtmlContent] = useState('')
  const [useHtml, setUseHtml] = useState(false)
  const [attachments, setAttachments] = useState<UploadedFile[]>(defaultAttachments)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [useScheduling, setUseScheduling] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('compose')
  
  const { sendEmail, uploadFiles } = useChatStore()
  const { toast } = useToast()

  // Email templates
  const templates = {
    business: {
      subject: 'Business Communication',
      content: `Dear [Recipient Name],

I hope this email finds you well.

[Your message content here]

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Title]
[Company Name]`
    },
    casual: {
      subject: 'Quick Update',
      content: `Hi [Name],

Hope you're doing well! 

[Your message here]

Talk soon,
[Your Name]`
    },
    meeting: {
      subject: 'Meeting Invitation - [Topic]',
      content: `Hello [Name],

I would like to schedule a meeting to discuss [topic].

Proposed Time: [Date and Time]
Duration: [Duration]
Location/Link: [Location or meeting link]

Please let me know if this time works for you.

Best regards,
[Your Name]`
    },
    report: {
      subject: 'Report - [Report Name]',
      content: `Dear Team,

Please find attached the [report name] for your review.

Key highlights:
• [Point 1]
• [Point 2] 
• [Point 3]

Please don't hesitate to reach out if you have any questions.

Best regards,
[Your Name]`
    }
  }

  const addRecipient = (type: 'to' | 'cc' | 'bcc' = 'to') => {
    setRecipients([...recipients, { email: '', type }])
  }

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index))
    }
  }

  const updateRecipient = (index: number, field: 'email' | 'type', value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!conversationId) {
      toast({
        title: 'Upload not available',
        description: 'File uploads are only available within conversations.',
        variant: 'destructive'
      })
      return
    }

    try {
      const uploadedFiles = await uploadFiles(conversationId, Array.from(files))
      setAttachments(prev => [...prev, ...uploadedFiles])
      toast({
        title: 'Files attached',
        description: `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} attached to email.`
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload attachments.',
        variant: 'destructive'
      })
    }
  }, [conversationId, uploadFiles, toast])

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const applyTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey]
    setSubject(template.subject)
    setContent(template.content)
    setActiveTab('compose')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSend = async () => {
    // Validation
    if (!senderEmail || !validateEmail(senderEmail)) {
      toast({
        title: 'Invalid sender email',
        description: 'Please enter a valid sender email address.',
        variant: 'destructive'
      })
      return
    }

    const validRecipients = recipients.filter(r => r.email && validateEmail(r.email))
    if (validRecipients.length === 0) {
      toast({
        title: 'Invalid recipients',
        description: 'Please enter at least one valid recipient email address.',
        variant: 'destructive'
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: 'Missing subject',
        description: 'Please enter an email subject.',
        variant: 'destructive'
      })
      return
    }

    if (!content.trim() && !htmlContent.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please enter email content.',
        variant: 'destructive'
      })
      return
    }

    setIsSending(true)
    setSendProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSendProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Prepare recipients
      const toRecipients = validRecipients.filter(r => r.type === 'to').map(r => r.email)
      const ccRecipients = validRecipients.filter(r => r.type === 'cc').map(r => r.email)
      const bccRecipients = validRecipients.filter(r => r.type === 'bcc').map(r => r.email)

      // Prepare email data
      const emailData: any = {
        from: senderEmail,
        to: toRecipients,
        subject: subject.trim(),
        [useHtml ? 'html' : 'text']: useHtml ? htmlContent.trim() : content.trim()
      }

      if (ccRecipients.length > 0) emailData.cc = ccRecipients
      if (bccRecipients.length > 0) emailData.bcc = bccRecipients

      // Add attachments
      if (attachments.length > 0) {
        emailData.attachments = attachments.map(file => ({
          filename: file.filename,
          path: file.url,
          content_type: file.type
        }))
      }

      // Add scheduling
      if (useScheduling && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        emailData.scheduled_at = scheduledDateTime
      }

      clearInterval(progressInterval)
      setSendProgress(95)

      // Send email
      const result = await sendEmail(emailData)
      
      setSendProgress(100)
      
      toast({
        title: 'Email sent successfully!',
        description: useScheduling 
          ? 'Your email has been scheduled and will be sent at the specified time.'
          : `Email sent to ${toRecipients.length} recipient${toRecipients.length > 1 ? 's' : ''}.`
      })

      // Reset form
      setRecipients([{ email: '', type: 'to' }])
      setSubject('')
      setContent('')
      setHtmlContent('')
      setAttachments([])
      setScheduledDate('')
      setScheduledTime('')
      setUseScheduling(false)
      setUseHtml(false)

    } catch (error) {
      console.error('Email send error:', error)
      toast({
        title: 'Failed to send email',
        description: 'An error occurred while sending the email. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSending(false)
      setSendProgress(0)
    }
  }

  const generatePreview = () => {
    const toEmails = recipients.filter(r => r.type === 'to' && r.email).map(r => r.email)
    const ccEmails = recipients.filter(r => r.type === 'cc' && r.email).map(r => r.email)
    const bccEmails = recipients.filter(r => r.type === 'bcc' && r.email).map(r => r.email)
    
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #f9fafb; padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="margin-bottom: 8px;"><strong>From:</strong> ${senderEmail}</div>
          <div style="margin-bottom: 8px;"><strong>To:</strong> ${toEmails.join(', ')}</div>
          ${ccEmails.length > 0 ? `<div style="margin-bottom: 8px;"><strong>CC:</strong> ${ccEmails.join(', ')}</div>` : ''}
          ${bccEmails.length > 0 ? `<div style="margin-bottom: 8px;"><strong>BCC:</strong> ${bccEmails.join(', ')}</div>` : ''}
          <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${subject}</div>
          ${attachments.length > 0 ? `<div><strong>Attachments:</strong> ${attachments.map(a => a.filename).join(', ')}</div>` : ''}
        </div>
        <div style="padding: 16px;">
          ${useHtml ? htmlContent : content.replace(/\n/g, '<br>')}
        </div>
      </div>
    `
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Email Sender</CardTitle>
            <p className="text-sm text-muted-foreground">Send professional emails with attachments and scheduling</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 premium-glass">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6 mt-6">
            {/* Sender Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                From (Sender Email)
              </label>
              <Input
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="your-email@domain.com"
                type="email"
                className="bg-background/50"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recipients
                </label>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => addRecipient('to')}>
                    <Plus className="w-3 h-3 mr-1" />
                    To
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addRecipient('cc')}>
                    <Plus className="w-3 h-3 mr-1" />
                    CC
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addRecipient('bcc')}>
                    <Plus className="w-3 h-3 mr-1" />
                    BCC
                  </Button>
                </div>
              </div>
              
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={recipient.type}
                    onChange={(e) => updateRecipient(index, 'type', e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background text-sm min-w-[70px]"
                  >
                    <option value="to">To</option>
                    <option value="cc">CC</option>
                    <option value="bcc">BCC</option>
                  </select>
                  <Input
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    placeholder="recipient@example.com"
                    type="email"
                    className="flex-1 bg-background/50"
                  />
                  {recipients.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRecipient(index)}
                      className="px-2 hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="bg-background/50"
              />
            </div>

            {/* Content Type Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">HTML Content</span>
              </div>
              <Switch
                checked={useHtml}
                onCheckedChange={setUseHtml}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {useHtml ? 'HTML Content' : 'Message Content'}
              </label>
              <Textarea
                value={useHtml ? htmlContent : content}
                onChange={(e) => useHtml ? setHtmlContent(e.target.value) : setContent(e.target.value)}
                placeholder={useHtml 
                  ? "Enter HTML content...\n<h1>Hello</h1>\n<p>Your message here</p>" 
                  : "Type your message here..."
                }
                className="min-h-[120px] bg-background/50 resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({attachments.length})
                </label>
                {conversationId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('email-file-input')?.click()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Files
                  </Button>
                )}
              </div>
              
              <input
                id="email-file-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm">{file.filename}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024).toFixed(1)}KB
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduling */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Schedule Email</span>
                </div>
                <Switch
                  checked={useScheduling}
                  onCheckedChange={setUseScheduling}
                />
              </div>
              
              {useScheduling && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div>
                    <label className="text-xs text-muted-foreground">Date</label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="bg-background/50"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Time</label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send Progress */}
            {isSending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sending email...</span>
                  <span className="text-primary font-medium">{sendProgress}%</span>
                </div>
                <Progress value={sendProgress} className="h-2" />
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 h-11"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : useScheduling ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Email
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(templates).map(([key, template]) => (
                <Card key={key} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold capitalize">{key} Email</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content.substring(0, 100)}...
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyTemplate(key as keyof typeof templates)}
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                Email Preview
              </div>
              <div
                className="border rounded-lg p-1 bg-background"
                dangerouslySetInnerHTML={{ __html: generatePreview() }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}