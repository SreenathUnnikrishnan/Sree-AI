import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { DevvAI, OpenRouterAI, imageGen, webSearch, upload, email } from '@devvai/devv-code-backend'
import { useAuthStore } from './auth-store'

export interface WebSearchResult {
  title: string
  url: string
  description: string
  content: string
  date?: string
}

export interface UploadedFile {
  filename: string
  url: string
  size: number
  type: string
  uploadedAt: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  type?: 'text' | 'image' | 'file' | 'code' | 'analysis'
  images?: Array<{ url: string; prompt: string }>
  files?: UploadedFile[]
  searchResults?: WebSearchResult[]
  searchQuery?: string
  model?: string
  reaction?: 'like' | 'dislike' | null
  bookmarked?: boolean
  codeLanguage?: string
  analysisType?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model: string
  hasImages?: boolean
  hasFiles?: boolean
  hasSearch?: boolean
}



export interface AIModel {
  id: string
  name: string
  provider: 'devv' | 'openrouter'
  category: 'general' | 'creative' | 'analytical' | 'coding' | 'premium'
  description: string
  features: string[]
  maxTokens: number
  premium?: boolean
}

export interface ConversationTemplate {
  id: string
  name: string
  description: string
  icon: string
  initialPrompt: string
  suggestedModel: string
  category: 'productivity' | 'creative' | 'analysis' | 'coding' | 'business'
}

// Default AI Models
const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'devv-default',
    name: 'Sree AI Default',
    provider: 'devv',
    category: 'general',
    description: 'Fast and efficient general-purpose AI assistant',
    features: ['General chat', 'Quick responses', 'Multi-language'],
    maxTokens: 4000,
  },
  {
    id: 'kimi-k2-0711-preview',
    name: 'Kimi K2 Advanced',
    provider: 'devv',
    category: 'premium',
    description: 'Advanced reasoning and long-context understanding',
    features: ['Long context', 'Advanced reasoning', 'Document analysis'],
    maxTokens: 8000,
    premium: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    category: 'premium',
    description: 'OpenAI\'s most capable model for complex tasks',
    features: ['Advanced reasoning', 'Code generation', 'Creative writing'],
    maxTokens: 8000,
    premium: true,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    category: 'analytical',
    description: 'Anthropic\'s model excellent for analysis and coding',
    features: ['Code analysis', 'Document reasoning', 'Safety-focused'],
    maxTokens: 8000,
    premium: true,
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'openrouter',
    category: 'coding',
    description: 'Meta\'s powerful open-source model for coding',
    features: ['Code generation', 'Math reasoning', 'Open source'],
    maxTokens: 4000,
    premium: true,
  }
]

// Conversation Templates
const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  {
    id: 'general-chat',
    name: 'General Chat',
    description: 'Start a casual conversation',
    icon: '💬',
    initialPrompt: 'Hello! I\'m here to help you with any questions or tasks you have.',
    suggestedModel: 'devv-default',
    category: 'productivity'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Get your code reviewed and improved',
    icon: '🔍',
    initialPrompt: 'I\'ll help you review your code for best practices, bugs, and improvements. Please share your code.',
    suggestedModel: 'claude-3-5-sonnet',
    category: 'coding'
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    description: 'Write stories, poems, and creative content',
    icon: '✍️',
    initialPrompt: 'Let\'s create something amazing together! What kind of creative writing would you like to work on?',
    suggestedModel: 'gpt-4o',
    category: 'creative'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze and interpret your data',
    icon: '📊',
    initialPrompt: 'I\'ll help you analyze your data and extract meaningful insights. Please upload your data files or describe your dataset.',
    suggestedModel: 'claude-3-5-sonnet',
    category: 'analysis'
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Strategic planning and business advice',
    icon: '💼',
    initialPrompt: 'Let\'s work on your business strategy. I can help with planning, market analysis, and strategic decisions.',
    suggestedModel: 'gpt-4o',
    category: 'business'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Deep research with web search integration',
    icon: '🔬',
    initialPrompt: 'I\'ll help you research any topic thoroughly using web search and analysis. What would you like to research?',
    suggestedModel: 'kimi-k2-0711-preview',
    category: 'analysis'
  }
]



export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model: string
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isStreaming: boolean
  streamingMessage: string
  selectedModel: string
  availableModels: AIModel[]
  isGeneratingImage: boolean
  isSearching: boolean
  webSearchEnabled: boolean
  isUploading: boolean
  uploadProgress: number
  isSharingEmail: boolean
  searchTerm: string
  showTypingIndicator: boolean
  conversationTemplates: ConversationTemplate[]
  
  // Actions
  createConversation: (title?: string, template?: string) => string
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateStreamingMessage: (content: string) => void
  setStreaming: (streaming: boolean) => void
  sendMessage: (conversationId: string, content: string, files?: UploadedFile[]) => Promise<void>
  sendMessageWithSearch: (conversationId: string, content: string) => Promise<void>
  sendAdvancedMessage: (conversationId: string, content: string, type: Message['type'], options?: any) => Promise<void>
  generateImage: (conversationId: string, prompt: string) => Promise<void>
  generateImageWithFile: (conversationId: string, prompt: string, files: UploadedFile[]) => Promise<void>
  analyzeCode: (conversationId: string, code: string, language: string) => Promise<void>
  analyzeData: (conversationId: string, data: string) => Promise<void>
  creativeWriting: (conversationId: string, prompt: string, style: string) => Promise<void>
  uploadFiles: (conversationId: string, files: File[]) => Promise<UploadedFile[]>
  uploadFileFromUrl: (conversationId: string, url: string) => Promise<UploadedFile | null>
  sendEmail: (emailData: any) => Promise<any>
  deleteConversation: (conversationId: string) => void
  setCurrentConversation: (conversationId: string | null) => void
  setModel: (model: string) => void
  setWebSearchEnabled: (enabled: boolean) => void
  shareConversationViaEmail: (conversationId: string, recipientEmail: string, senderEmail: string, message?: string) => Promise<void>
  getCurrentConversation: () => Conversation | null
  reactToMessage: (conversationId: string, messageId: string, reaction: 'like' | 'dislike' | null) => void
  toggleBookmark: (conversationId: string, messageId: string) => void
  searchConversations: (term: string) => void
  exportConversation: (conversationId: string, format: 'pdf' | 'txt' | 'json') => Promise<void>
  setTypingIndicator: (show: boolean) => void
  getAvailableModels: () => AIModel[]
  createFromTemplate: (templateId: string) => string
  handleFeatureSubmit: (conversationId: string, mode: string, content: string, files?: UploadedFile[]) => Promise<void>
  fetchUrlContent: (url: string) => Promise<string>
}

const devvAI = new DevvAI()
const openRouterAI = new OpenRouterAI()

export const useChatStore = create<ChatState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isStreaming: false,
      streamingMessage: '',
      selectedModel: 'devv-default',
      availableModels: DEFAULT_MODELS,
      isGeneratingImage: false,
      isSearching: false,
      webSearchEnabled: false,
      isUploading: false,
      uploadProgress: 0,
      isSharingEmail: false,
      searchTerm: '',
      showTypingIndicator: false,
      conversationTemplates: CONVERSATION_TEMPLATES,

      createConversation: (title?: string, template?: string) => {
        const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const selectedTemplate = template ? CONVERSATION_TEMPLATES.find(t => t.id === template) : null
        
        const conversation: Conversation = {
          id,
          title: title || selectedTemplate?.name || 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: selectedTemplate?.suggestedModel || get().selectedModel
        }
        
        // Add initial message if using a template
        if (selectedTemplate) {
          const initialMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: selectedTemplate.initialPrompt,
            timestamp: Date.now(),
            model: selectedTemplate.suggestedModel,
            type: 'text'
          }
          conversation.messages.push(initialMessage)
        }
        
        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id
        }))
        
        return id
      },

      addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const fullMessage: Message = {
          ...message,
          id,
          timestamp: Date.now()
        }

        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  messages: [...conv.messages, fullMessage],
                  updatedAt: Date.now(),
                  // Auto-generate title from first user message
                  title: conv.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title
                }
              : conv
          )
        }))
      },

      updateStreamingMessage: (content: string) => {
        set({ streamingMessage: content })
      },

      setStreaming: (streaming: boolean) => {
        set({ 
          isStreaming: streaming,
          streamingMessage: streaming ? '' : get().streamingMessage
        })
      },

      sendMessage: async (conversationId: string, content: string, files?: UploadedFile[]) => {
        const state = get()
        if (state.webSearchEnabled) {
          return state.sendMessageWithSearch(conversationId, content)
        }

        const conversation = state.conversations.find(c => c.id === conversationId)
        if (!conversation) return

        // Add user message
        state.addMessage(conversationId, {
          role: 'user',
          content,
          model: state.selectedModel,
          files: files,
          type: files && files.length > 0 ? 'file' : 'text'
        })

        // Start streaming
        set({ isStreaming: true, streamingMessage: '' })

        try {
          // Create enhanced context with file information if files are present
          let enhancedContent = content
          if (files && files.length > 0) {
            const fileInfo = files.map(file => 
              `File: ${file.filename} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
            ).join('\n')
            enhancedContent = `${content}\n\nAttached files:\n${fileInfo}\n\nPlease analyze the content and context of these files in your response.`
          }

          const messages = [
            ...conversation.messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: enhancedContent }
          ]

          // Select the appropriate AI instance based on model
          const selectedModelInfo = state.availableModels.find(m => m.id === state.selectedModel)
          const aiInstance = selectedModelInfo?.provider === 'openrouter' ? openRouterAI : devvAI
          
          // Determine the correct model name for the API call
          let apiModelName = state.selectedModel
          if (selectedModelInfo?.provider === 'devv') {
            apiModelName = state.selectedModel === 'kimi-k2-0711-preview' ? 'kimi-k2-0711-preview' : 'default'
          }

          const stream = await aiInstance.chat.completions.create({
            model: apiModelName,
            messages,
            stream: true,
            max_tokens: selectedModelInfo?.maxTokens || 2000,
            temperature: 0.7
          })

          let fullResponse = ''
          for await (const chunk of stream) {
            const deltaContent = chunk.choices[0]?.delta?.content || ''
            if (deltaContent) {
              fullResponse += deltaContent
              state.updateStreamingMessage(fullResponse)
            }
          }

          // Add AI response
          state.addMessage(conversationId, {
            role: 'assistant',
            content: fullResponse,
            model: state.selectedModel
          })

        } catch (error) {
          console.error('AI response error:', error)
          state.addMessage(conversationId, {
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your request. Please try again.',
            model: state.selectedModel
          })
        } finally {
          set({ isStreaming: false, streamingMessage: '' })
        }
      },

      sendMessageWithSearch: async (conversationId: string, content: string) => {
        const state = get()
        const conversation = state.conversations.find(c => c.id === conversationId)
        if (!conversation) return

        // Add user message
        state.addMessage(conversationId, {
          role: 'user',
          content,
          model: state.selectedModel
        })

        // Start searching and streaming
        set({ isStreaming: true, isSearching: true, streamingMessage: '' })

        try {
          // Perform web search
          const searchResult = await webSearch.search({
            query: content
          })

          let searchResults: WebSearchResult[] = []
          if (searchResult.code === 200 && searchResult.status === 20000) {
            searchResults = searchResult.data.map(item => ({
              title: item.title,
              url: item.url,
              description: item.description,
              content: item.content,
              date: item.date
            }))
          }

          set({ isSearching: false })

          // Create enhanced context with search results
          const searchContext = searchResults.length > 0 
            ? `Here are some recent web search results for "${content}":\n\n${
                searchResults.slice(0, 5).map((result, index) => 
                  `${index + 1}. **${result.title}**\n   ${result.description}\n   Source: ${result.url}\n`
                ).join('\n')
              }\n\nBased on this information and your knowledge, please provide a comprehensive response:`
            : `I couldn't find recent web search results for "${content}". I'll provide a response based on my knowledge:`

          const messages = [
            ...conversation.messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: searchContext + '\n\n' + content }
          ]

          // Select AI based on model
          const aiInstance = state.selectedModel.startsWith('gpt-') || 
                           state.selectedModel.startsWith('claude-') || 
                           state.selectedModel.startsWith('llama-') 
                           ? openRouterAI : devvAI

          const stream = await aiInstance.chat.completions.create({
            model: state.selectedModel,
            messages,
            stream: true,
            max_tokens: 2000,
            temperature: 0.7
          })

          let fullResponse = ''
          for await (const chunk of stream) {
            const deltaContent = chunk.choices[0]?.delta?.content || ''
            if (deltaContent) {
              fullResponse += deltaContent
              state.updateStreamingMessage(fullResponse)
            }
          }

          // Add AI response with search results
          state.addMessage(conversationId, {
            role: 'assistant',
            content: fullResponse,
            model: state.selectedModel,
            searchResults: searchResults.length > 0 ? searchResults.slice(0, 5) : undefined,
            searchQuery: searchResults.length > 0 ? content : undefined
          })

        } catch (error) {
          console.error('Search or AI response error:', error)
          state.addMessage(conversationId, {
            role: 'assistant',
            content: 'Sorry, I encountered an error while searching for information and processing your request. Please try again.',
            model: state.selectedModel
          })
        } finally {
          set({ isStreaming: false, isSearching: false, streamingMessage: '' })
        }
      },

      uploadFiles: async (conversationId: string, files: File[]): Promise<UploadedFile[]> => {
        const state = get()
        
        // Check authentication first
        const { isAuthenticated, user, logout } = useAuthStore.getState()
        const sid = localStorage.getItem('DEVV_CODE_SID')
        
        if (!sid || !isAuthenticated || !user) {
          console.error('File upload error: User not authenticated')
          throw new Error('Please sign in to upload files. Authentication is required for file uploads.')
        }
        
        set({ isUploading: true, uploadProgress: 0 })
        
        const uploadedFiles: UploadedFile[] = []
        
        try {
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            set({ uploadProgress: Math.round(((i + 0.5) / files.length) * 100) })
            
            const result = await upload.uploadFile(file)
            
            if (upload.isErrorResponse(result)) {
              // Check if it's an authentication error
              if (result.errMsg && result.errMsg.includes('session has expired')) {
                console.error('Session expired during file upload')
                // Clear expired session
                logout()
                throw new Error('Your session has expired. Please sign in again to continue uploading files.')
              }
              
              console.error(`Upload error for ${file.name}:`, result.errMsg)
              continue
            }
            
            if (result.link && result.filename) {
              uploadedFiles.push({
                filename: result.filename,
                url: result.link,
                size: file.size,
                type: file.type,
                uploadedAt: Date.now()
              })
            }
            
            set({ uploadProgress: Math.round(((i + 1) / files.length) * 100) })
          }
          
          return uploadedFiles
        } catch (error) {
          console.error('File upload error:', error)
          // Check if it's an auth-related error
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('session') || errorMessage.includes('401') || errorMessage.includes('authentication')) {
            logout()
            throw new Error('Your session has expired. Please sign in again to upload files.')
          }
          throw error
        } finally {
          set({ isUploading: false, uploadProgress: 0 })
        }
      },

      generateImage: async (conversationId: string, prompt: string) => {
        const state = get()
        
        // Check authentication first
        const { isAuthenticated, user } = useAuthStore.getState()
        const sid = localStorage.getItem('DEVV_CODE_SID')
        
        if (!sid || !isAuthenticated || !user) {
          state.addMessage(conversationId, {
            role: 'assistant',
            content: '🔐 **Authentication Required**\n\nPlease sign in to generate images. Click the "Sign In" button at the top right to continue.',
            type: 'text'
          })
          return
        }
        
        // Add user prompt message
        state.addMessage(conversationId, {
          role: 'user',
          content: prompt,
          type: 'image'
        })

        // Start image generation
        set({ isGeneratingImage: true })

        try {
          const result = await imageGen.textToImage({
            prompt,
            model: 'google/gemini-2.5-flash-image',
            output_format: 'png',
            num_outputs: 1
          })

          // Check if result has images
          if (!result || !result.images || result.images.length === 0) {
            throw new Error('No images returned from generation')
          }

          // Add AI response with images
          state.addMessage(conversationId, {
            role: 'assistant',
            content: `Generated image for: "${prompt}"`,
            type: 'image',
            images: result.images.map(url => ({ url, prompt }))
          })

        } catch (error) {
          console.error('Image generation error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          
          // Check if it's an authentication error (401)
          if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
            // Clear invalid session
            localStorage.removeItem('DEVV_CODE_SID')
            useAuthStore.setState({ isAuthenticated: false, user: null })
            
            state.addMessage(conversationId, {
              role: 'assistant',
              content: '🔐 **Session Expired**\n\nYour session has expired. Please sign in again to continue generating images.\n\nClick the "Sign In" button at the top right.',
              type: 'text'
            })
          } else {
            state.addMessage(conversationId, {
              role: 'assistant',
              content: `❌ **Image Generation Failed**\n\n${errorMessage}\n\nPlease try again. If the problem persists, try signing out and back in.`,
              type: 'text'
            })
          }
        } finally {
          set({ isGeneratingImage: false })
        }
      },

      generateImageWithFile: async (conversationId: string, prompt: string, files: UploadedFile[]) => {
        const state = get()
        
        // Check authentication first
        const { isAuthenticated, user } = useAuthStore.getState()
        const sid = localStorage.getItem('DEVV_CODE_SID')
        
        if (!sid || !isAuthenticated || !user) {
          state.addMessage(conversationId, {
            role: 'assistant',
            content: '🔐 **Authentication Required**\n\nPlease sign in to use image transformation features. Click the "Sign In" button at the top right to continue.',
            type: 'text'
          })
          return
        }
        
        // Add user prompt message with files
        state.addMessage(conversationId, {
          role: 'user',
          content: `Transform images: ${prompt}`,
          type: 'image',
          files
        })

        // Start image generation
        set({ isGeneratingImage: true })

        try {
          const result = await imageGen.textToImage({
            prompt,
            model: 'google/gemini-2.5-flash-image',
            image_urls: files.map(f => f.url),
            output_format: 'png'
          })

          // Check if result has images
          if (!result || !result.images || result.images.length === 0) {
            throw new Error('No images returned from transformation')
          }

          // Add AI response with transformed images
          state.addMessage(conversationId, {
            role: 'assistant',
            content: `Transformed ${files.length} image${files.length > 1 ? 's' : ''} using: "${prompt}"`,
            type: 'image',
            images: result.images.map(url => ({ url, prompt: `Transformed: ${prompt}` }))
          })

        } catch (error) {
          console.error('Image transformation error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          
          // Check if it's an authentication error (401)
          if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
            // Clear invalid session
            localStorage.removeItem('DEVV_CODE_SID')
            useAuthStore.setState({ isAuthenticated: false, user: null })
            
            state.addMessage(conversationId, {
              role: 'assistant',
              content: '🔐 **Session Expired**\n\nYour session has expired. Please sign in again to continue transforming images.\n\nClick the "Sign In" button at the top right.',
              type: 'text'
            })
          } else {
            state.addMessage(conversationId, {
              role: 'assistant',
              content: `❌ **Image Transformation Failed**\n\n${errorMessage}\n\nPlease try again. If the problem persists, try signing out and back in.`,
              type: 'text'
            })
          }
        } finally {
          set({ isGeneratingImage: false })
        }
      },

      uploadFileFromUrl: async (conversationId: string, url: string): Promise<UploadedFile | null> => {
        // Check authentication first
        const { isAuthenticated, user, logout } = useAuthStore.getState()
        const sid = localStorage.getItem('DEVV_CODE_SID')
        
        if (!sid || !isAuthenticated || !user) {
          console.error('URL upload error: User not authenticated')
          throw new Error('Please sign in to upload files from URL. Authentication is required.')
        }
        
        set({ isUploading: true, uploadProgress: 0 })

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            set(state => ({ uploadProgress: Math.min(state.uploadProgress + 10, 90) }))
          }, 200)

          // Extract filename from URL
          const urlObj = new URL(url)
          const pathname = urlObj.pathname
          const filename = pathname.split('/').pop() || 'downloaded-file'
          
          // For demonstration - in real implementation, this would fetch and upload the URL content
          // Here we'll create a mock uploaded file
          const uploadedFile: UploadedFile = {
            filename: `url-${filename}`,
            url: url, // In real implementation, this would be the uploaded file URL
            size: 0, // Would be actual file size
            type: 'text/plain', // Would be detected from content
            uploadedAt: Date.now()
          }

          clearInterval(progressInterval)
          set({ uploadProgress: 100 })

          setTimeout(() => set({ uploadProgress: 0 }), 1000)

          return uploadedFile

        } catch (error) {
          console.error('URL upload error:', error)
          // Check if it's an auth-related error
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('session') || errorMessage.includes('401') || errorMessage.includes('authentication')) {
            logout()
            throw new Error('Your session has expired. Please sign in again to upload files.')
          }
          throw error
        } finally {
          set({ isUploading: false })
        }
      },

      sendEmail: async (emailData: any) => {
        try {
          const result = await email.sendEmail(emailData)
          return result
        } catch (error) {
          console.error('Email send error:', error)
          throw error
        }
      },

      deleteConversation: (conversationId: string) => {
        set(state => ({
          conversations: state.conversations.filter(c => c.id !== conversationId),
          currentConversationId: state.currentConversationId === conversationId 
            ? (state.conversations.length > 1 ? state.conversations.find(c => c.id !== conversationId)?.id || null : null)
            : state.currentConversationId
        }))
      },

      setCurrentConversation: (conversationId: string | null) => {
        set({ currentConversationId: conversationId })
      },

      setModel: (model: string) => {
        set({ selectedModel: model })
      },

      setWebSearchEnabled: (enabled: boolean) => {
        set({ webSearchEnabled: enabled })
      },

      shareConversationViaEmail: async (conversationId: string, recipientEmail: string, senderEmail: string, message?: string) => {
        const state = get()
        const conversation = state.conversations.find(c => c.id === conversationId)
        
        if (!conversation) {
          throw new Error('Conversation not found')
        }

        set({ isSharingEmail: true })

        try {
          // Generate conversation HTML
          let conversationHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Sree AI</h1>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">AI Conversation Shared</p>
              </div>
              
              ${message ? `
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #374151; font-style: italic;">"${message}"</p>
                </div>
              ` : ''}
              
              <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px;">
                  <h2 style="margin: 0; font-size: 18px;">${conversation.title}</h2>
                  <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
                    ${new Date(conversation.createdAt).toLocaleDateString()} • ${conversation.messages.length} messages
                  </p>
                </div>
                
                <div style="padding: 20px;">
          `

          // Add messages to HTML
          conversation.messages.forEach((msg, index) => {
            const isUser = msg.role === 'user'
            const bgColor = isUser ? '#f3f4f6' : '#faf5ff'
            const textColor = isUser ? '#374151' : '#581c87'
            
            conversationHtml += `
              <div style="margin-bottom: ${index === conversation.messages.length - 1 ? '0' : '20px'};">
                <div style="background: ${bgColor}; padding: 15px; border-radius: 8px; border-left: 4px solid ${isUser ? '#6b7280' : '#7c3aed'};">
                  <p style="margin: 0 0 5px 0; font-weight: 600; color: ${textColor}; font-size: 14px;">
                    ${isUser ? 'You' : (msg.model ? `AI (${msg.model})` : 'AI')}
                  </p>
                  <div style="color: #374151; line-height: 1.6;">
                    ${msg.content.replace(/\n/g, '<br>')}
                  </div>
                  
                  ${msg.images && msg.images.length > 0 ? `
                    <div style="margin-top: 10px;">
                      ${msg.images.map(img => `
                        <img src="${img}" alt="Generated image" style="max-width: 100%; height: auto; border-radius: 6px; margin: 5px 0;">
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  ${msg.searchResults && msg.searchResults.length > 0 ? `
                    <div style="margin-top: 10px;">
                      <p style="margin: 0 0 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">🔍 WEB SEARCH RESULTS:</p>
                      ${msg.searchResults.map(result => `
                        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 5px 0;">
                          <a href="${result.url}" style="color: #7c3aed; text-decoration: none; font-weight: 600; font-size: 14px;">
                            ${result.title}
                          </a>
                          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">${result.description}</p>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  ${msg.files && msg.files.length > 0 ? `
                    <div style="margin-top: 10px;">
                      <p style="margin: 0 0 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">📁 ATTACHED FILES:</p>
                      ${msg.files.map(file => `
                        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; margin: 5px 0; display: inline-block;">
                          <a href="${file.url}" style="color: #7c3aed; text-decoration: none; font-size: 12px;">
                            📄 ${file.filename} (${(file.size / 1024).toFixed(1)}KB)
                          </a>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                    ${new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            `
          })

          conversationHtml += `
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  Shared via <strong style="color: #7c3aed;">Sree AI</strong> - Advanced AI Assistant Platform
                </p>
                <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
                  Experience the future of AI conversations at sreeai.com
                </p>
              </div>
            </div>
          `

          // Send email
          await email.sendEmail({
            from: senderEmail,
            to: [recipientEmail],
            subject: `Shared AI Conversation: ${conversation.title}`,
            html: conversationHtml,
            tags: [
              { name: 'type', value: 'conversation_share' },
              { name: 'conversation_id', value: conversationId }
            ]
          })

        } catch (error) {
          console.error('Email sharing error:', error)
          throw error
        } finally {
          set({ isSharingEmail: false })
        }
      },



      reactToMessage: (conversationId: string, messageId: string, reaction: 'like' | 'dislike' | null) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId
                      ? { ...msg, reaction }
                      : msg
                  )
                }
              : conv
          )
        }))
      },

      toggleBookmark: (conversationId: string, messageId: string) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId
                      ? { ...msg, bookmarked: !msg.bookmarked }
                      : msg
                  )
                }
              : conv
          )
        }))
      },

      searchConversations: (term: string) => {
        set({ searchTerm: term })
      },

      exportConversation: async (conversationId: string, format: 'pdf' | 'txt' | 'json') => {
        const state = get()
        const conversation = state.conversations.find(c => c.id === conversationId)
        if (!conversation) return

        let content = ''
        let filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`

        if (format === 'json') {
          content = JSON.stringify(conversation, null, 2)
          filename += '.json'
        } else if (format === 'txt') {
          content = `${conversation.title}\n${'='.repeat(conversation.title.length)}\n\n`
          content += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`
          content += `Messages: ${conversation.messages.length}\n\n`
          
          conversation.messages.forEach((msg, index) => {
            content += `[${index + 1}] ${msg.role.toUpperCase()} (${new Date(msg.timestamp).toLocaleString()})\n`
            content += `${msg.content}\n`
            if (msg.images?.length) {
              content += `Images: ${msg.images.join(', ')}\n`
            }
            if (msg.files?.length) {
              content += `Files: ${msg.files.map(f => f.filename).join(', ')}\n`
            }
            content += '\n'
          })
          filename += '.txt'
        }

        // Create and download file
        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },

      setTypingIndicator: (show: boolean) => {
        set({ showTypingIndicator: show })
      },

      // Advanced AI Functions
      sendAdvancedMessage: async (conversationId: string, content: string, type: Message['type'], options?: any) => {
        const state = get()
        const conversation = state.conversations.find(c => c.id === conversationId)
        if (!conversation) return

        // Add user message
        state.addMessage(conversationId, {
          role: 'user',
          content,
          model: state.selectedModel,
          type: type || 'text'
        })

        set({ isStreaming: true, streamingMessage: '' })

        try {
          // Select the appropriate AI instance
          const selectedModelInfo = state.availableModels.find(m => m.id === state.selectedModel)
          const aiInstance = selectedModelInfo?.provider === 'openrouter' ? openRouterAI : devvAI
          
          let apiModelName = state.selectedModel
          if (selectedModelInfo?.provider === 'devv') {
            apiModelName = state.selectedModel === 'kimi-k2-0711-preview' ? 'kimi-k2-0711-preview' : 'default'
          }

          // Create context-aware prompt based on type
          let systemPrompt = ''
          switch (type) {
            case 'code':
              systemPrompt = 'You are an expert code reviewer and software engineer. Analyze code for best practices, bugs, performance issues, and provide detailed improvements.'
              break
            case 'analysis':
              systemPrompt = 'You are a data analyst and research expert. Provide thorough analysis, insights, and actionable recommendations.'
              break
            default:
              systemPrompt = 'You are a helpful AI assistant.'
          }

          const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...conversation.messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content }
          ]

          const stream = await aiInstance.chat.completions.create({
            model: apiModelName,
            messages,
            stream: true,
            max_tokens: selectedModelInfo?.maxTokens || 4000,
            temperature: type === 'code' ? 0.3 : 0.7
          })

          let fullResponse = ''
          for await (const chunk of stream) {
            const deltaContent = chunk.choices[0]?.delta?.content || ''
            if (deltaContent) {
              fullResponse += deltaContent
              set({ streamingMessage: fullResponse })
            }
          }

          // Add AI response
          state.addMessage(conversationId, {
            role: 'assistant',
            content: fullResponse,
            model: state.selectedModel,
            type,
            codeLanguage: options?.language,
            analysisType: options?.analysisType
          })

        } catch (error) {
          console.error('Advanced message error:', error)
          state.addMessage(conversationId, {
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            model: state.selectedModel
          })
        } finally {
          set({ isStreaming: false, streamingMessage: '' })
        }
      },

      analyzeCode: async (conversationId: string, code: string, language: string) => {
        const prompt = `Please analyze this ${language} code for:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security considerations\n5. Suggested improvements\n\n\`\`\`${language}\n${code}\n\`\`\``
        return get().sendAdvancedMessage(conversationId, prompt, 'code', { language })
      },

      analyzeData: async (conversationId: string, data: string) => {
        const prompt = `Please analyze this data and provide:\n1. Key insights and patterns\n2. Statistical summary\n3. Trends and anomalies\n4. Actionable recommendations\n5. Visualization suggestions\n\nData:\n${data}`
        return get().sendAdvancedMessage(conversationId, prompt, 'analysis', { analysisType: 'data' })
      },

      creativeWriting: async (conversationId: string, prompt: string, style: string) => {
        const enhancedPrompt = `Write in a ${style} style: ${prompt}\n\nPlease be creative, engaging, and maintain consistency with the requested style throughout.`
        return get().sendAdvancedMessage(conversationId, enhancedPrompt, 'text')
      },

      getAvailableModels: () => {
        return get().availableModels
      },

      createFromTemplate: (templateId: string) => {
        const template = CONVERSATION_TEMPLATES.find(t => t.id === templateId)
        if (!template) return ''
        
        // Set the suggested model
        set({ selectedModel: template.suggestedModel })
        
        // Create conversation with template
        return get().createConversation(template.name, templateId)
      },

      handleFeatureSubmit: async (conversationId: string, mode: string, content: string, files?: UploadedFile[]) => {
        const state = get()
        
        switch (mode) {
          case 'chat':
            await state.sendMessage(conversationId, content, files)
            break
            
          case 'code':
            let codePrompt = content
            if (files && files.length > 0) {
              codePrompt += '\n\nAttached code files for analysis. Please review for:\n- Code quality and best practices\n- Potential bugs and security issues\n- Performance optimizations\n- Documentation improvements'
            }
            await state.sendAdvancedMessage(conversationId, codePrompt, 'code', { language: 'auto' })
            break
            
          case 'analysis':
            let analysisPrompt = content
            if (files && files.length > 0) {
              analysisPrompt += '\n\nAnalyze the attached data/documents and provide:\n- Key insights and patterns\n- Statistical summaries\n- Trends and correlations\n- Actionable recommendations\n- Data visualizations suggestions'
            }
            if (state.webSearchEnabled) {
              await state.sendMessageWithSearch(conversationId, analysisPrompt)
            } else {
              await state.sendAdvancedMessage(conversationId, analysisPrompt, 'analysis', { analysisType: 'comprehensive' })
            }
            break
            
          case 'image':
            if (files && files.length > 0) {
              await state.generateImageWithFile(conversationId, content, files)
            } else {
              await state.generateImage(conversationId, content)
            }
            break
            
          case 'email':
            const emailPrompt = `Draft a professional email with the following requirements:\n\n${content}\n\nProvide:\n- Subject line\n- Email body with proper formatting\n- Professional tone\n- Call to action\n\nFormat the email ready to send.`
            await state.sendMessage(conversationId, emailPrompt, files)
            break
            
          case 'web-search':
            set({ webSearchEnabled: true })
            await state.sendMessageWithSearch(conversationId, content)
            break
            
          default:
            await state.sendMessage(conversationId, content, files)
        }
      },

      fetchUrlContent: async (url: string): Promise<string> => {
        try {
          const webReaderModule = await import('@devvai/devv-code-backend')
          const webReader = webReaderModule.webReader
          const result = await webReader.read({ url })
          
          if (result.code === 200 && result.status === 20000) {
            return `**${result.data.title}**\n\n${result.data.description}\n\n${result.data.content}`
          }
          
          throw new Error('Failed to fetch URL content')
        } catch (error) {
          console.error('URL fetch error:', error)
          throw error
        }
      },

      getCurrentConversation: () => {
        const state = get()
        return state.conversations.find(c => c.id === state.currentConversationId) || null
      }
    }),
    {
      name: 'devv-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        selectedModel: state.selectedModel,
        webSearchEnabled: state.webSearchEnabled
      }),
      // Performance optimization: debounce storage writes
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            return JSON.parse(str)
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          // Debounce storage writes to avoid excessive disk I/O
          const debounceKey = `debounce_${name}`
          if ((window as any)[debounceKey]) {
            clearTimeout((window as any)[debounceKey])
          }
          (window as any)[debounceKey] = setTimeout(() => {
            localStorage.setItem(name, JSON.stringify(value))
          }, 100)
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
  )
)

// Performance optimizations: Selectors for specific data
export const useCurrentConversation = () => 
  useChatStore(state => state.conversations.find(c => c.id === state.currentConversationId))

export const useMessages = () => 
  useChatStore(state => {
    const current = state.conversations.find(c => c.id === state.currentConversationId)
    return current?.messages || []
  })

export const useIsStreaming = () => 
  useChatStore(state => state.isStreaming)

export const useStreamingMessage = () => 
  useChatStore(state => state.streamingMessage)

// Memoized selectors for heavy computations
export const useFilteredConversations = (searchTerm?: string) =>
  useChatStore(state => {
    if (!searchTerm) return state.conversations
    const term = searchTerm.toLowerCase()
    return state.conversations.filter(conv => 
      conv.title.toLowerCase().includes(term) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(term))
    )
  })