import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore, useMessages, useIsStreaming, useStreamingMessage } from '@/store/chat-store'
import { 
  Send, 
  User, 
  Bot, 
  Paperclip, 
  Image as ImageIcon,
  Search,
  Code,
  BarChart3,
  Mail,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface MinimalChatInterfaceProps {
  conversationId: string
  onBackToHome?: () => void
  onLogout?: () => void
}

export function MinimalChatInterface({ conversationId }: MinimalChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [selectedMode, setSelectedMode] = useState<'chat' | 'code' | 'image' | 'analysis' | 'email'>('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  const messages = useMessages()
  const isStreaming = useIsStreaming()
  const streamingMessage = useStreamingMessage()
  
  const { sendMessage } = useChatStore()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages.length, streamingMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const message = input.trim()
    setInput('')
    
    try {
      await sendMessage(conversationId, message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [input, isStreaming, conversationId, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const modes = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'email', label: 'Email', icon: Mail },
  ] as const

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 px-4 custom-scrollbar"
      >
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-foreground flex items-center justify-center">
                <Bot className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Ask me anything or try one of the modes below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-slide-in",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-background" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-lg p-4 max-w-[85%]",
                    message.role === 'user'
                      ? "user-message ml-auto"
                      : "ai-message"
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Web Search Results */}
                  {message.searchResults && message.searchResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Search className="w-3 h-3" />
                        Sources:
                      </p>
                      {message.searchResults.slice(0, 3).map((result, idx) => (
                        <a
                          key={idx}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs hover:underline text-muted-foreground"
                        >
                          {result.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Streaming message */}
          {streamingMessage && (
            <div className="flex gap-3 animate-slide-in">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-background" />
              </div>
              <div className="ai-message rounded-lg p-4 max-w-[85%]">
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                  <span className="inline-block w-1 h-4 ml-1 bg-foreground animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  selectedMode === mode.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Sree AI"
                  className="min-h-[44px] max-h-[120px] resize-none pr-20 focus-minimal mobile-input"
                  disabled={isStreaming}
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Generate Image
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Search className="w-4 h-4 mr-2" />
                        Web Search
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="minimal-button h-[44px] w-[44px] p-0"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground mt-3">
            Sree AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
