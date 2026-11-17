import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Code, 
  BarChart3, 
  Image as ImageIcon, 
  Mail,
  Globe,
  Sparkles,
  Wand2,
  Search,
  FileText,
  Zap,
  Lightbulb,
  Terminal,
  Bug,
  Cpu,
  TrendingUp,
  FileSearch,
  BookOpen,
  Send,
  Loader2
} from 'lucide-react'
import { AdvancedFileUpload } from './AdvancedFileUpload'
import { useChatStore, type UploadedFile } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'

type FeatureMode = 'chat' | 'code' | 'analysis' | 'image' | 'email' | 'web-search'

interface Feature {
  id: FeatureMode
  name: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  description: string
  placeholder: string
  supportsFiles: boolean
  supportsWebSearch: boolean
}

const features: Feature[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    icon: MessageSquare,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    description: 'General conversation with AI assistant',
    placeholder: 'Ask me anything...',
    supportsFiles: true,
    supportsWebSearch: true
  },
  {
    id: 'code',
    name: 'Code Generation',
    icon: Code,
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-700',
    description: 'Generate, review, and debug code',
    placeholder: 'Describe the code you want to generate or paste code for review...',
    supportsFiles: true,
    supportsWebSearch: true
  },
  {
    id: 'analysis',
    name: 'Data Analysis',
    icon: BarChart3,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-700',
    description: 'Analyze data, documents, and research',
    placeholder: 'Upload data files or describe what you want to analyze...',
    supportsFiles: true,
    supportsWebSearch: true
  },
  {
    id: 'image',
    name: 'Image Generation',
    icon: ImageIcon,
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-pink-700',
    description: 'Generate and transform images with AI',
    placeholder: 'Describe the image you want to generate...',
    supportsFiles: true,
    supportsWebSearch: false
  },
  {
    id: 'email',
    name: 'Email Assistant',
    icon: Mail,
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-700',
    description: 'Draft and send professional emails',
    placeholder: 'Describe the email you want to draft...',
    supportsFiles: true,
    supportsWebSearch: false
  },
  {
    id: 'web-search',
    name: 'Web Search',
    icon: Globe,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-700',
    description: 'Search the web for latest information',
    placeholder: 'What would you like to search for?',
    supportsFiles: false,
    supportsWebSearch: true
  }
]

interface UnifiedFeaturePanelProps {
  conversationId: string
  onFeatureSubmit: (mode: FeatureMode, content: string, files?: UploadedFile[]) => void
}

export function UnifiedFeaturePanel({ conversationId, onFeatureSubmit }: UnifiedFeaturePanelProps) {
  const [selectedMode, setSelectedMode] = useState<FeatureMode>('chat')
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  
  const { 
    isStreaming, 
    isGeneratingImage, 
    isSearching,
    webSearchEnabled,
    setWebSearchEnabled 
  } = useChatStore()
  const { toast } = useToast()

  const currentFeature = features.find(f => f.id === selectedMode)!
  const isProcessing = isStreaming || isGeneratingImage || isSearching

  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setShowFileUpload(false)
    toast({
      title: 'Files uploaded',
      description: `${files.length} file${files.length > 1 ? 's' : ''} ready for processing`
    })
  }, [toast])

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isProcessing) return
    
    onFeatureSubmit(selectedMode, input.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined)
    setInput('')
    setUploadedFiles([])
  }, [input, selectedMode, uploadedFiles, isProcessing, onFeatureSubmit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit, isProcessing])

  // Quick action buttons for each mode
  const getQuickActions = () => {
    switch (selectedMode) {
      case 'code':
        return [
          { label: 'JavaScript', action: () => setInput('Generate a JavaScript function that ') },
          { label: 'Python', action: () => setInput('Generate a Python script that ') },
          { label: 'React', action: () => setInput('Create a React component that ') },
          { label: 'Debug', action: () => setInput('Debug this code:\n\n```\n// Paste your code here\n```') },
          { label: 'Optimize', action: () => setInput('Optimize this code for better performance:\n\n```\n// Paste your code here\n```') },
          { label: 'Explain', action: () => setInput('Explain this code in detail:\n\n```\n// Paste your code here\n```') }
        ]
      case 'analysis':
        return [
          { label: 'Analyze Data', action: () => setInput('Analyze this data and provide insights, trends, and recommendations') },
          { label: 'Research', action: () => { setInput('Research this topic in depth'); setWebSearchEnabled(true) } },
          { label: 'Summarize', action: () => setInput('Summarize the key points from the uploaded documents') },
          { label: 'Compare', action: () => setInput('Compare and contrast the uploaded files') },
          { label: 'Extract Info', action: () => setInput('Extract key information and statistics from the data') },
          { label: 'Visualize', action: () => setInput('Suggest data visualizations for this dataset') }
        ]
      case 'image':
        return [
          { label: 'Realistic Photo', action: () => setInput('Create a photorealistic image of ') },
          { label: 'Digital Art', action: () => setInput('Create digital artwork of ') },
          { label: 'Illustration', action: () => setInput('Create an illustration of ') },
          { label: 'Transform', action: () => setInput('Transform the uploaded images to ') },
          { label: '3D Render', action: () => setInput('Create a 3D rendered image of ') },
          { label: 'Logo Design', action: () => setInput('Design a professional logo for ') }
        ]
      case 'email':
        return [
          { label: 'Professional', action: () => setInput('Draft a professional email about ') },
          { label: 'Follow-up', action: () => setInput('Write a follow-up email regarding ') },
          { label: 'Thank You', action: () => setInput('Write a thank you email for ') },
          { label: 'Meeting', action: () => setInput('Draft a meeting invitation email for ') },
          { label: 'Proposal', action: () => setInput('Write a business proposal email about ') },
          { label: 'Newsletter', action: () => setInput('Create a newsletter about ') }
        ]
      case 'web-search':
        return [
          { label: 'Latest News', action: () => { setInput('What are the latest news about '); setWebSearchEnabled(true) } },
          { label: 'How-to Guide', action: () => { setInput('How to '); setWebSearchEnabled(true) } },
          { label: 'Comparison', action: () => { setInput('Compare '); setWebSearchEnabled(true) } },
          { label: 'Best Practices', action: () => { setInput('What are the best practices for '); setWebSearchEnabled(true) } },
          { label: 'Trends', action: () => { setInput('Current trends in '); setWebSearchEnabled(true) } },
          { label: 'Reviews', action: () => { setInput('Reviews and ratings for '); setWebSearchEnabled(true) } }
        ]
      default:
        return [
          { label: 'Brainstorm', action: () => setInput('Help me brainstorm ideas for ') },
          { label: 'Explain', action: () => setInput('Explain in simple terms: ') },
          { label: 'Pros & Cons', action: () => setInput('What are the pros and cons of ') },
          { label: 'Step-by-Step', action: () => setInput('Provide step-by-step instructions for ') },
          { label: 'Create Plan', action: () => setInput('Create a detailed plan for ') },
          { label: 'Problem Solve', action: () => setInput('Help me solve this problem: ') }
        ]
    }
  }

  return (
    <div className="space-y-4">
      {/* Feature Mode Selector - Icon Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon
          const isSelected = selectedMode === feature.id
          
          return (
            <button
              key={feature.id}
              onClick={() => {
                setSelectedMode(feature.id)
                if (feature.supportsWebSearch) {
                  setWebSearchEnabled(feature.id === 'web-search')
                }
              }}
              className={`
                group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300
                ${isSelected 
                  ? `border-${feature.color.split('-')[1]}-500 bg-gradient-to-br ${feature.gradient} shadow-lg scale-105` 
                  : 'border-border hover:border-primary/50 hover:scale-102 bg-card'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2 text-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all
                  ${isSelected 
                    ? 'bg-white/20 text-white' 
                    : `${feature.color} bg-muted group-hover:bg-muted/80`
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`
                  text-xs font-medium transition-colors
                  ${isSelected ? 'text-white' : 'text-foreground group-hover:text-primary'}
                `}>
                  {feature.name.split(' ')[0]}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {/* Feature Description */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              bg-gradient-to-br ${currentFeature.gradient}
            `}>
              <currentFeature.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">{currentFeature.name}</h3>
              <p className="text-xs text-muted-foreground">{currentFeature.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {getQuickActions().map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="text-xs h-7"
            disabled={isProcessing}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* File Upload Section */}
      {currentFeature.supportsFiles && (
        <div>
          {!showFileUpload ? (
            <Button
              variant="outline"
              onClick={() => setShowFileUpload(true)}
              className="w-full"
              disabled={isProcessing}
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload Files or URLs
            </Button>
          ) : (
            <AdvancedFileUpload
              conversationId={conversationId}
              onFilesUploaded={handleFilesUploaded}
              disabled={isProcessing}
              mode={selectedMode as any}
            />
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} attached
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground truncate">
                    📄 {file.filename}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Web Search Toggle */}
      {currentFeature.supportsWebSearch && selectedMode !== 'web-search' && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Enable Web Search</span>
          </div>
          <Button
            variant={webSearchEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            disabled={isProcessing}
          >
            {webSearchEnabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentFeature.placeholder}
          className="min-h-[100px] resize-none"
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {webSearchEnabled && <Badge variant="secondary" className="mr-2">🌐 Web Search Active</Badge>}
            {uploadedFiles.length > 0 && <Badge variant="secondary">📎 {uploadedFiles.length} files</Badge>}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className="min-w-[100px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {selectedMode === 'image' ? 'Generate' : 'Send'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
