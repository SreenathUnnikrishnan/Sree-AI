import { useState, useMemo, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useChatStore, useFilteredConversations } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreHorizontal, 
  Sparkles,
  User,
  LogOut,
  Settings,
  Zap,
  Image as ImageIcon,
  Search,
  FileText,
  Share2,
  X,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShareConversation } from './ShareConversation'

interface SidebarProps {
  onNewChat: () => void
}

export const Sidebar = memo(({ onNewChat }: SidebarProps) => {
  const { 
    currentConversationId, 
    setCurrentConversation, 
    deleteConversation,
    selectedModel,
    setModel,
    searchTerm,
    searchConversations
  } = useChatStore()
  
  const { user, logout } = useAuthStore()
  
  // Use debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const filteredConversations = useFilteredConversations(debouncedSearchTerm)
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareConversationId, setShareConversationId] = useState<string | null>(null)

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(conversationId)
  }

  const handleShareConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShareConversationId(conversationId)
    setShowShareDialog(true)
  }

  const models = [
    { id: 'default', name: 'DevvAI Default', icon: Sparkles },
    { id: 'kimi-k2-0711-preview', name: 'Kimi K2 Preview', icon: Zap }
  ]

  return (
    <div className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-sidebar-foreground">Sree AI</h1>
        </div>
        
        <Button onClick={onNewChat} className="w-full justify-start ai-gradient">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Model Selection */}
      <div className="p-4 border-b border-sidebar-border">
        <DropdownMenu open={isModelMenuOpen} onOpenChange={setIsModelMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const currentModel = models.find(m => m.id === selectedModel)
                  const Icon = currentModel?.icon || Sparkles
                  return (
                    <>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{currentModel?.name}</span>
                    </>
                  )
                })()}
              </div>
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {models.map((model) => {
              const Icon = model.icon
              return (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setModel(model.id)}
                  className={cn(
                    "flex items-center gap-2",
                    selectedModel === model.id && "bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-sidebar-foreground/60">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{searchTerm ? 'No matching conversations' : 'No conversations yet'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const hasImages = conversation.messages.some(m => m.images && m.images.length > 0)
                const hasSearchResults = conversation.messages.some(m => m.searchResults && m.searchResults.length > 0)
                const hasFiles = conversation.messages.some(m => m.files && m.files.length > 0)
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                      currentConversationId === conversation.id && "bg-sidebar-accent"
                    )}
                    onClick={() => setCurrentConversation(conversation.id)}
                  >
                    {hasFiles ? (
                      <FileText className="w-4 h-4 text-green-500/80 flex-shrink-0" />
                    ) : hasImages ? (
                      <ImageIcon className="w-4 h-4 text-primary/80 flex-shrink-0" />
                    ) : hasSearchResults ? (
                      <Search className="w-4 h-4 text-blue-500/80 flex-shrink-0" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-sidebar-foreground truncate flex-1">
                          {conversation.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {hasFiles && (
                            <FileText className="w-3 h-3 text-green-500 opacity-60" />
                          )}
                          {hasSearchResults && (
                            <Search className="w-3 h-3 text-blue-500 opacity-60" />
                          )}
                          {hasImages && (
                            <ImageIcon className="w-3 h-3 text-primary opacity-60" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-sidebar-foreground/60">
                        {conversation.messages.length} messages
                        {hasFiles && ' • Files'}
                        {hasSearchResults && ' • Web Search'}
                        {hasImages && ' • Images'}
                      </p>
                    </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleShareConversation(conversation.id, e)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Menu */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <div className="w-6 h-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center mr-2">
                <User className="w-3 h-3" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      <ShareConversation
        conversationId={shareConversationId || ''}
        isOpen={showShareDialog && !!shareConversationId}
        onClose={() => {
          setShowShareDialog(false)
          setShareConversationId(null)
        }}
      />
    </div>
  )
})