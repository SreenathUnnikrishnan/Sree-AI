import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useChatStore, type Message } from '@/store/chat-store'
import { 
  Send, 
  Sparkles, 
  Bot, 
  MessageSquare, 
  Globe, 
  Share2, 
  Download, 
  Home,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useThrottle } from '@/hooks/useThrottle'
import { default as EnhancedMessageBubble } from './EnhancedMessageBubble'
import { UnifiedFeaturePanel } from './UnifiedFeaturePanel'
import { ShareConversation } from './ShareConversation'
import { default as ModelSelector } from './ModelSelector'

interface ChatInterfaceProps {
  conversationId: string
  onBackToHome?: () => void
  onLogout?: () => void
}

// Optimized message selector
const useMessages = () => useChatStore(state => {
  const conversation = state.conversations.find(c => c.id === state.currentConversationId)
  return conversation?.messages || []
})

const useIsStreaming = () => useChatStore(state => state.isStreaming)
const useStreamingMessage = () => useChatStore(state => state.streamingMessage)
const useCurrentConversation = () => useChatStore(state => {
  return state.conversations.find(c => c.id === state.currentConversationId) || null
})

export const EnhancedChatInterface = memo(({ conversationId, onBackToHome, onLogout }: ChatInterfaceProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showFeaturePanel, setShowFeaturePanel] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  // Use optimized selectors
  const conversation = useCurrentConversation()
  const messages = useMessages()
  const isStreaming = useIsStreaming()
  const streamingMessage = useStreamingMessage()
  
  const { 
    handleFeatureSubmit,
    selectedModel,
    isGeneratingImage,
    isSearching,
    webSearchEnabled,
    showTypingIndicator,
    availableModels
  } = useChatStore()

  // Throttled auto-scroll
  const throttledScrollToBottom = useThrottle(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, 100)

  // Auto-scroll on new messages
  useEffect(() => {
    throttledScrollToBottom()
  }, [messages.length, streamingMessage, throttledScrollToBottom])

  // Feature submission handler
  const onFeatureSubmit = useCallback((mode: string, content: string, files?: any[]) => {
    handleFeatureSubmit(conversationId, mode, content, files)
    if (isMobile) {
      setShowFeaturePanel(false)
    }
  }, [conversationId, handleFeatureSubmit, isMobile])

  const selectedModelInfo = availableModels.find(m => m.id === selectedModel)
  const isProcessing = isStreaming || isGeneratingImage || isSearching

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Desktop Header */}
      {conversation && !isMobile && (
        <div className="glass-3d border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {onBackToHome && (
                <Button variant="ghost" size="sm" onClick={onBackToHome} className="hover-lift-3d flex-shrink-0">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse-3d">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-lg truncate holographic">{conversation.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages • {selectedModelInfo?.name || 'AI Assistant'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowModelSelector(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {selectedModelInfo?.name || 'Model'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
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

              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {conversation && isMobile && (
        <div className="glass-3d border-b border-border/30 p-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {onBackToHome && (
                <Button variant="ghost" size="sm" onClick={onBackToHome} className="h-8 w-8 p-0">
                  <Home className="w-4 h-4" />
                </Button>
              )}
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-sm truncate">{conversation.title}</h1>
                <p className="text-xs text-muted-foreground truncate">{messages.length} messages</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowModelSelector(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Change Model
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => useChatStore.getState().exportConversation(conversationId, 'txt')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="px-4 md:px-6 lg:px-8 max-w-5xl mx-auto py-6">
          {messages.length === 0 && !isStreaming && !isGeneratingImage ? (
            <div className="flex items-center justify-center min-h-[400px] p-4">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full ai-gradient flex items-center justify-center animate-pulse-3d">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 holographic">Welcome to Sree AI</h3>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  Choose a feature below to get started with AI-powered assistance
                </p>
                {webSearchEnabled && (
                  <Badge className="mb-4">
                    <Globe className="w-3 h-3 mr-1" />
                    Web Search Enabled
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <EnhancedMessageBubble
                  key={message.id}
                  message={message}
                  conversationId={conversationId}
                />
              ))}
            </div>
          )}
          
          {/* Loading States */}
          {isSearching && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm">Searching the web for latest information...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isStreaming && streamingMessage && !isSearching && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="bg-muted rounded-2xl p-4">
                  <div className="whitespace-pre-wrap">{streamingMessage}<span className="animate-pulse">▊</span></div>
                </div>
              </div>
            </div>
          )}
          
          {isGeneratingImage && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm">Generating your image...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showTypingIndicator && !isStreaming && !isGeneratingImage && !isSearching && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 px-4 py-3 bg-muted rounded-2xl">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Feature Input Panel - Desktop */}
      {!isMobile && (
        <div className="border-t border-border/30 p-4 glass-3d">
          <div className="max-w-5xl mx-auto">
            <UnifiedFeaturePanel
              conversationId={conversationId}
              onFeatureSubmit={onFeatureSubmit}
            />
          </div>
        </div>
      )}

      {/* Feature Input Panel - Mobile (Sheet) */}
      {isMobile && (
        <div className="border-t border-border/30 p-3 glass-3d">
          <Button
            onClick={() => setShowFeaturePanel(true)}
            className="w-full"
            disabled={isProcessing}
          >
            <Send className="w-4 h-4 mr-2" />
            Choose Feature & Send Message
          </Button>

          <Sheet open={showFeaturePanel} onOpenChange={setShowFeaturePanel}>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>AI Features</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <UnifiedFeaturePanel
                  conversationId={conversationId}
                  onFeatureSubmit={onFeatureSubmit}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Conversation</DialogTitle>
          </DialogHeader>
          <ShareConversation
            conversationId={conversationId}
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select AI Model</DialogTitle>
          </DialogHeader>
          <ModelSelector onClose={() => setShowModelSelector(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
})

EnhancedChatInterface.displayName = 'EnhancedChatInterface'
