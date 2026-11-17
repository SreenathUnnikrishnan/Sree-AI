import React from 'react'
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  BookmarkCheck,
  Copy,
  Crown,
  Sparkles,
  Code,
  BarChart3,
  Brain,
  Download,
  ExternalLink,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChatStore, Message, WebSearchResult, UploadedFile } from '@/store/chat-store'

interface EnhancedMessageBubbleProps {
  message: Message
  conversationId: string
}

const modelIcons = {
  'devv-default': Brain,
  'kimi-k2-0711-preview': Crown,
  'gpt-4o': Crown,
  'claude-3-5-sonnet': Sparkles,
  'llama-3.1-405b': Code,
}

const typeIcons = {
  text: null,
  code: Code,
  analysis: BarChart3,
  image: Sparkles,
  file: FileText,
}

export default function EnhancedMessageBubble({ message, conversationId }: EnhancedMessageBubbleProps) {
  const { reactToMessage, toggleBookmark } = useChatStore()
  const isUser = message.role === 'user'
  const ModelIcon = message.model ? modelIcons[message.model as keyof typeof modelIcons] : null
  const TypeIcon = message.type ? typeIcons[message.type as keyof typeof typeIcons] : null

  const handleReaction = (reaction: 'like' | 'dislike' | null) => {
    reactToMessage(conversationId, message.id, reaction)
  }

  const handleBookmark = () => {
    toggleBookmark(conversationId, message.id)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  const formatContent = (content: string) => {
    // Enhanced code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g
    const inlineCodeRegex = /`([^`]+)`/g
    
    return content
      .split(codeBlockRegex)
      .map((part, index) => {
        if (index % 3 === 1) {
          // Language identifier
          return null
        } else if (index % 3 === 2) {
          // Code content
          const language = content.split(codeBlockRegex)[index - 1] || 'text'
          return (
            <div key={index} className="my-4">
              <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-t-lg border-b">
                <Badge variant="outline" className="text-xs">
                  {language}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(part)}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <pre className="bg-muted/20 p-4 rounded-b-lg overflow-x-auto">
                <code className={`language-${language} text-sm`}>{part}</code>
              </pre>
            </div>
          )
        } else {
          // Regular text with inline code
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part.split(inlineCodeRegex).map((textPart, textIndex) => {
                if (textIndex % 2 === 1) {
                  return (
                    <code key={textIndex} className="bg-muted/30 px-1 py-0.5 rounded text-sm font-mono">
                      {textPart}
                    </code>
                  )
                }
                return textPart
              })}
            </div>
          )
        }
      })
      .filter(Boolean)
  }

  return (
    <div className={`flex gap-4 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center flex-shrink-0">
          {ModelIcon ? (
            <ModelIcon className="w-4 h-4 text-white" />
          ) : (
            <Brain className="w-4 h-4 text-white" />
          )}
        </div>
      )}
      
      <div className={`
        max-w-[85%] relative
        ${isUser ? 'user-message' : 'ai-message'}
      `}>
        {/* Model and Type Information */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1">
              {ModelIcon && <ModelIcon className="w-3 h-3" />}
              <span className="font-medium text-muted-foreground">
                {message.model?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'AI'}
              </span>
            </div>
            
            {message.type && message.type !== 'text' && TypeIcon && (
              <div className="flex items-center gap-1">
                <TypeIcon className="w-3 h-3" />
                <span className="text-muted-foreground capitalize">{message.type}</span>
              </div>
            )}
            
            {message.codeLanguage && (
              <Badge variant="outline" className="text-xs">
                {message.codeLanguage}
              </Badge>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {formatContent(message.content)}
        </div>

        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {message.images.map((image, index) => (
              <div key={index} className="relative group/image">
                <img 
                  src={image.url} 
                  alt={`Generated image ${index + 1}`}
                  className="rounded-lg w-full h-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = image.url
                      a.download = `generated-image-${index + 1}.png`
                      a.click()
                    }}
                    className="backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Files */}
        {message.files && message.files.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.files.map((file: UploadedFile, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.type} • {(file.size / 1024).toFixed(1)}KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {message.searchResults && message.searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Search Results for "{message.searchQuery}"
            </div>
            <div className="space-y-2">
              {message.searchResults.slice(0, 3).map((result: WebSearchResult, index) => (
                <div key={index} className="p-3 bg-muted/20 rounded-lg border border-border/30 hover:border-accent/30 transition-colors">
                  <h4 className="font-medium text-sm mb-1">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                    >
                      {result.title}
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{new URL(result.url).hostname}</span>
                    {result.date && <span>• {result.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Actions */}
        <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(message.reaction === 'like' ? null : 'like')}
                className={`h-8 px-2 ${message.reaction === 'like' ? 'text-green-600 bg-green-50' : ''}`}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(message.reaction === 'dislike' ? null : 'dislike')}
                className={`h-8 px-2 ${message.reaction === 'dislike' ? 'text-red-600 bg-red-50' : ''}`}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`h-8 px-2 ${message.bookmarked ? 'text-yellow-600 bg-yellow-50' : ''}`}
          >
            {message.bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 px-2"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-3">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold text-sm">
          U
        </div>
      )}
    </div>
  )
}