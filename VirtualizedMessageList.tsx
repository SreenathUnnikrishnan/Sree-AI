import React, { memo, useMemo, useCallback } from 'react'
import { VariableSizeList as List } from 'react-window'
import { Message } from '@/store/chat-store'
import EnhancedMessageBubble from './EnhancedMessageBubble'

interface VirtualizedMessageListProps {
  messages: Message[]
  height: number
  conversationId: string
}

const MemoizedMessageBubble = memo(EnhancedMessageBubble)

const MessageItem = memo(({ index, style, data }: { 
  index: number
  style: React.CSSProperties
  data: { messages: Message[], conversationId: string }
}) => {
  const { messages, conversationId } = data
  const message = messages[index]

  return (
    <div style={style}>
      <div className="px-4 py-2">
        <MemoizedMessageBubble
          message={message}
          conversationId={conversationId}
        />
      </div>
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export const VirtualizedMessageList = memo(({ 
  messages, 
  height, 
  conversationId 
}: VirtualizedMessageListProps) => {
  const itemData = useMemo(() => ({
    messages,
    conversationId
  }), [messages, conversationId])

  const getItemSize = useCallback((index: number) => {
    const message = messages[index]
    // Estimate height based on message content
    const baseHeight = 80
    const contentHeight = Math.max(40, Math.ceil(message.content.length / 80) * 20)
    const imageHeight = message.images?.length ? message.images.length * 200 : 0
    const fileHeight = message.files?.length ? message.files.length * 40 : 0
    const searchHeight = message.searchResults?.length ? 150 : 0
    
    return baseHeight + contentHeight + imageHeight + fileHeight + searchHeight
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages yet. Start a conversation!</p>
      </div>
    )
  }

  return (
    <List
      height={height}
      width="100%"
      itemCount={messages.length}
      itemSize={getItemSize}
      itemData={itemData}
      overscanCount={3}
      className="scrollbar-thin scrollbar-thumb-border/20"
    >
      {MessageItem}
    </List>
  )
})

VirtualizedMessageList.displayName = 'VirtualizedMessageList'