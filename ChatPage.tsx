import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/Sidebar'
import { EnhancedChatInterface } from '@/components/EnhancedChatInterface'
import { useChatStore } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Menu, X, Home } from 'lucide-react'

export default function ChatPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { createConversation, currentConversationId } = useChatStore()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const handleNewChat = () => {
    createConversation()
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Desktop or Mobile Overlay */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-50' : 'relative'}
        ${sidebarOpen ? 'block' : 'hidden'}
        ${isMobile && sidebarOpen ? 'bg-background/80 backdrop-blur-sm' : ''}
      `}>
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className={`
          ${isMobile ? 'absolute left-0 top-0 bottom-0 w-80' : 'w-80'}
          bg-background border-r border-border
          ${isMobile ? 'shadow-2xl' : ''}
        `}>
          <Sidebar onNewChat={handleNewChat} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="font-semibold text-gradient-primary">Sree AI</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToHome}
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          {currentConversationId && (
            <EnhancedChatInterface 
              conversationId={currentConversationId} 
              onBackToHome={handleBackToHome} 
            />
          )}
        </div>
      </div>
    </div>
  )
}
