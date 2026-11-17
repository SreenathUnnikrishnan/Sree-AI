import { memo, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MessageSquare, Trash2, MoreHorizontal, ImageIcon, Search, FileText, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Conversation } from '@/store/chat-store'
import { useState } from 'react'
import { ShareConversation } from './ShareConversation'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export const ConversationItem = memo(({ 
  conversation, 
  isActive, 
  onSelect, 
  onDelete 
}: ConversationItemProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false)

  // Memoize expensive computations
  const iconInfo = useMemo(() => {
    const hasFiles = conversation.messages.some(m => m.files && m.files.length > 0)
    const hasImages = conversation.messages.some(m => m.images && m.images.length > 0)
    const hasSearchResults = conversation.messages.some(m => m.searchResults && m.searchResults.length > 0)
    
    if (hasFiles) {
      return { icon: FileText, color: 'text-green-500/80' }
    } else if (hasImages) {
      return { icon: ImageIcon, color: 'text-primary/80' }
    } else if (hasSearchResults) {
      return { icon: Search, color: 'text-blue-500/80' }
    } else {
      return { icon: MessageSquare, color: 'text-sidebar-foreground/60' }
    }
  }, [conversation.messages])

  const lastMessageTime = useMemo(() => {
    if (conversation.messages.length === 0) return ''
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    const date = new Date(lastMessage.timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }, [conversation.messages])

  const handleSelect = useCallback(() => {
    onSelect(conversation.id)
  }, [conversation.id, onSelect])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(conversation.id)
  }, [conversation.id, onDelete])

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareDialog(true)
  }, [])

  const IconComponent = iconInfo.icon

  return (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-all duration-200",
        isActive && "bg-sidebar-accent shadow-sm"
      )}
      onClick={handleSelect}
    >
      <IconComponent className={cn("w-4 h-4 flex-shrink-0", iconInfo.color)} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <h4 className="text-sm font-medium truncate flex-1">
            {conversation.title}
          </h4>
          <span className="text-xs text-sidebar-foreground/40 flex-shrink-0">
            {lastMessageTime}
          </span>
        </div>
        <p className="text-xs text-sidebar-foreground/60 truncate">
          {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''} • {conversation.model}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Conversation
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showShareDialog && (
        <ShareConversation
          conversationId={conversation.id}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem'