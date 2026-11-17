import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useChatStore, useCurrentConversation, useMessages, useIsStreaming, useStreamingMessage, type Message, type WebSearchResult, type UploadedFile } from '@/store/chat-store'
import { Send, Sparkles, User, Bot, MessageSquare, Image as ImageIcon, Search, ExternalLink, Globe, FileText, Paperclip, Share2, Heart, Bookmark, ThumbsUp, ThumbsDown, Download, MoreHorizontal, Code, BarChart3, Lightbulb, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { useThrottle } from '@/hooks/useThrottle'
import { VirtualizedMessageList } from './VirtualizedMessageList'
import { LazyImage } from './LazyImage'

// Direct imports for better performance
import { ImageGenerator } from './ImageGenerator'
import { AdvancedFileUpload } from './AdvancedFileUpload'
import { EmailSender } from './EmailSender'
import { ShareConversation } from './ShareConversation'
import { default as EnhancedMessageBubble } from './EnhancedMessageBubble'

interface ChatInterfaceProps {
  conversationId: string
}

export const ChatInterface = memo(({ conversationId }: ChatInterfaceProps) => {
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Use optimized selectors to prevent unnecessary re-renders
  const conversation = useCurrentConversation()
  const messages = useMessages()
  const isStreaming = useIsStreaming()
  const streamingMessage = useStreamingMessage()
  
  const { 
    sendMessage,
    selectedModel,
    isGeneratingImage,
    isSearching,
    webSearchEnabled,
    setWebSearchEnabled,
    showTypingIndicator,
    setTypingIndicator
  } = useChatStore()
  
  // Debounce input to reduce re-renders
  const debouncedInput = useDebounce(input, 100)

  // Throttled auto-scroll to improve performance
  const throttledScrollToBottom = useThrottle(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, 100)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    throttledScrollToBottom()
  }, [messages.length, streamingMessage, throttledScrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  // Memoized submit handler to prevent recreation on every render
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debouncedInput.trim() || isStreaming || isGeneratingImage) return

    const message = debouncedInput.trim()
    const files = uploadedFiles.length > 0 ? uploadedFiles : undefined
    
    setInput('')
    setUploadedFiles([])
    setShowFileUpload(false)
    
    try {
      // Show typing indicator for a brief moment before starting
      setTypingIndicator(true)
      await sendMessage(conversationId, message, files)
    } finally {
      setTimeout(() => setTypingIndicator(false), 1000)
    }
  }, [debouncedInput, isStreaming, isGeneratingImage, uploadedFiles, conversationId, sendMessage, setTypingIndicator])

  // Memoized message list height calculation
  const messageListHeight = useMemo(() => {
    // Calculate available height for message list
    const headerHeight = 64
    const tabsHeight = 48
    const inputAreaHeight = 120
    const viewportHeight = window.innerHeight
    return Math.max(300, viewportHeight - headerHeight - tabsHeight - inputAreaHeight)
  }, [])

  // Memoized event handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    if (!input.trim()) {
      setInput('Please analyze the uploaded files and provide insights.')
    }
  }, [input])

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index))
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      {conversation && (
        <div className="premium-glass border-b border-border/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{conversation.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {messages.length} message{messages.length !== 1 ? 's' : ''} • Advanced AI Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="premium-glass border-border/50 hover:border-accent/50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => useChatStore.getState().exportConversation(conversationId, 'txt')}>
                    Export as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => useChatStore.getState().exportConversation(conversationId, 'json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <ScrollArea className="flex-1 relative" ref={scrollAreaRef}>
        <div>
          {messages.length === 0 && !isStreaming && !isGeneratingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full ai-gradient flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Ask me anything or generate AI images - I'm here to help with all your creative needs.
                </p>
                <div className="inline-block">
                  <ImageGenerator conversationId={conversationId} />
                </div>
              </div>
            </div>
          ) : (
            <VirtualizedMessageList 
              messages={messages}
              height={messageListHeight}
              conversationId={conversationId}
            />
          )}
          
          {/* Searching indicator */}
          {isSearching && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="ai-message">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Searching the web for latest information...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming message */}
          {isStreaming && streamingMessage && !isSearching && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="ai-message">
                  <div className="streaming-text whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="typing-indicator" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Generating image indicator */}
          {isGeneratingImage && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="ai-message">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating your image...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Typing indicator */}
          {showTypingIndicator && !isStreaming && !isSearching && !isGeneratingImage && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="ai-message">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section with Tabs */}
      <div className="border-t bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4 premium-glass">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0">
              {/* Feature Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Web Search Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Web Search</span>
                    {webSearchEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        Real-time
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={webSearchEnabled}
                    onCheckedChange={setWebSearchEnabled}
                    disabled={isStreaming || isGeneratingImage || isSearching}
                  />
                </div>

                {/* File Upload Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">File Upload</span>
                    {uploadedFiles.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={showFileUpload}
                    onCheckedChange={setShowFileUpload}
                    disabled={isStreaming || isGeneratingImage}
                  />
                </div>
              </div>

              {/* File Upload Section */}
              {showFileUpload && (
                <div className="mb-4 p-4 rounded-lg border bg-card">
                  <AdvancedFileUpload
                    conversationId={conversationId}
                    onFilesUploaded={handleFilesUploaded}
                    disabled={isStreaming || isGeneratingImage}
                    mode="chat"
                  />
                </div>
              )}

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 p-3 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Ready to analyze ({uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{file.filename}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10"
                        >
                          <span className="text-destructive">×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    uploadedFiles.length > 0 
                      ? "Ask me to analyze your files or ask any related questions..."
                      : webSearchEnabled 
                        ? "Ask anything - I'll search the web for the latest information..."
                        : "Type your message..."
                  }
                  disabled={isStreaming || isGeneratingImage || isSearching}
                  className="min-h-[60px] max-h-[120px] resize-none pr-12 custom-scrollbar"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isStreaming || isGeneratingImage || isSearching}
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 ai-gradient"
                >
                  {webSearchEnabled && !isStreaming && !isSearching ? (
                    <Search className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Model: {selectedModel === 'kimi-k2-0711-preview' ? 'Kimi K2' : 'DevvAI Default'}</span>
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <div className="space-y-6">
                <div className="text-center py-6 premium-glass rounded-2xl border border-border/30">
                  <Code className="w-16 h-16 mx-auto mb-4 text-accent animate-gentle-glow" />
                  <h3 className="text-xl font-bold mb-3 gold-gradient bg-clip-text text-transparent">
                    Code Analysis & Review
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Upload code files or paste code snippets for expert AI analysis, bug detection, and optimization recommendations.
                  </p>
                </div>

                {/* Code File Upload */}
                <div className="p-4 rounded-lg border bg-card/50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Upload Code Files
                  </h4>
                  <AdvancedFileUpload
                    conversationId={conversationId}
                    onFilesUploaded={(files) => {
                      handleFilesUploaded(files)
                      setInput('Please analyze the uploaded code files and provide a comprehensive review including best practices, potential bugs, and optimization suggestions.')
                    }}
                    disabled={isStreaming || isGeneratingImage}
                    mode="code"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => {
                      setInput("Please review this code for best practices, potential bugs, and optimizations:\n\n```\n// Paste your code here\n```")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <Code className="w-8 h-8 mb-3 text-blue-600" />
                    <h4 className="font-semibold mb-2">Code Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive code analysis and improvement suggestions
                    </p>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setInput("Help me debug this code and find the issue:\n\n```\n// Paste your problematic code here\n```")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <Sparkles className="w-8 h-8 mb-3 text-purple-600" />
                    <h4 className="font-semibold mb-2">Bug Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Identify and fix bugs in your code
                    </p>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setInput("Analyze this code for performance issues and suggest optimizations:\n\n```\n// Paste your code here\n```")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <BarChart3 className="w-8 h-8 mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Performance Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimize code for better performance and efficiency
                    </p>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
              <div className="space-y-6">
                <div className="text-center py-6 premium-glass rounded-2xl border border-border/30">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-accent animate-gentle-glow" />
                  <h3 className="text-xl font-bold mb-3 gold-gradient bg-clip-text text-transparent">
                    Data Analysis & Research
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Upload data files, documents, or URLs for advanced AI analysis, trend identification, and comprehensive research insights.
                  </p>
                </div>

                {/* Data File Upload */}
                <div className="p-4 rounded-lg border bg-card/50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Upload Data & Documents
                  </h4>
                  <AdvancedFileUpload
                    conversationId={conversationId}
                    onFilesUploaded={(files) => {
                      handleFilesUploaded(files)
                      setInput('Please analyze the uploaded files and provide comprehensive insights, trends, patterns, and actionable recommendations.')
                    }}
                    disabled={isStreaming || isGeneratingImage}
                    mode="analysis"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      setInput("Analyze this data and provide insights, trends, and recommendations:\n\n[Paste your data here - CSV, JSON, or text format]")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <BarChart3 className="w-8 h-8 mb-3 text-blue-600" />
                    <h4 className="font-semibold mb-2">Data Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Statistical analysis and pattern recognition
                    </p>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setInput("Please conduct thorough research on this topic and provide detailed analysis with sources:\n\n[Your research topic here]")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <Search className="w-8 h-8 mb-3 text-purple-600" />
                    <h4 className="font-semibold mb-2">Research Assistant</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive research with web search integration
                    </p>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setInput("Write a creative story/article in [specify style: formal, creative, technical, etc.] about:\n\n[Your topic here]")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <Lightbulb className="w-8 h-8 mb-3 text-yellow-600" />
                    <h4 className="font-semibold mb-2">Creative Writing</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate creative content in various styles
                    </p>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setInput("Analyze this document/content for key insights and provide a detailed summary:\n\n[Paste your document content here]")
                      setActiveTab('chat')
                    }}
                    className="feature-card p-6 h-auto flex flex-col items-start text-left"
                    variant="outline"
                  >
                    <FileText className="w-8 h-8 mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Document Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Extract insights from documents and text
                    </p>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="mt-0">
              <ImageGenerator conversationId={conversationId} />
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <div className="space-y-4">
                <AdvancedFileUpload
                  conversationId={conversationId}
                  onFilesUploaded={handleFilesUploaded}
                  disabled={isStreaming || isGeneratingImage}
                  mode="analysis"
                />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)}KB • {file.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <span className="text-destructive">×</span>
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => {
                        setActiveTab('chat')
                        if (!input.trim()) {
                          setInput('Please analyze the uploaded files and provide detailed insights.')
                        }
                      }}
                      className="w-full ai-gradient"
                      disabled={isStreaming || isGeneratingImage}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Analyze Files with AI
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <EmailSender 
                conversationId={conversationId}
                defaultAttachments={uploadedFiles}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareConversation
        conversationId={conversationId}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </div>
  )
})

interface SearchResultCardProps {
  result: WebSearchResult
  index: number
}

function SearchResultCard({ result, index }: SearchResultCardProps) {
  const handleClick = () => {
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div 
      onClick={handleClick}
      className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary">#{index + 1}</span>
            <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {result.title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {result.description}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{result.url}</span>
            {result.date && (
              <>
                <span className="mx-1">•</span>
                <span>{result.date}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}