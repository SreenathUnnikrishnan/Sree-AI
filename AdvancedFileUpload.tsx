import React, { useCallback, useState, useRef } from 'react'
import { 
  Upload, 
  File, 
  X, 
  Paperclip, 
  Link,
  Image as ImageIcon,
  FileText,
  Code,
  Archive,
  Music,
  Video,
  FileSpreadsheet,
  FilePlus,
  Globe,
  Download,
  Eye,
  Edit,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore, type UploadedFile } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'
import { LazyImage } from './LazyImage'

interface AdvancedFileUploadProps {
  conversationId: string
  onFilesUploaded: (files: UploadedFile[]) => void
  disabled?: boolean
  mode?: 'chat' | 'analysis' | 'code'
}

export const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
  conversationId,
  onFilesUploaded,
  disabled = false,
  mode = 'chat'
}) => {
  const { toast } = useToast()
  const { uploadFiles, uploadFileFromUrl, isUploading, uploadProgress } = useChatStore()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)
  const [activeTab, setActiveTab] = useState('files')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Enhanced supported file types
  const supportedTypes = {
    // Documents
    'application/pdf': { icon: FileText, color: 'text-red-600', category: 'Document' },
    'application/msword': { icon: FileText, color: 'text-blue-600', category: 'Document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-600', category: 'Document' },
    'application/vnd.ms-powerpoint': { icon: FileText, color: 'text-orange-600', category: 'Presentation' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, color: 'text-orange-600', category: 'Presentation' },
    
    // Spreadsheets
    'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-600', category: 'Spreadsheet' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-600', category: 'Spreadsheet' },
    
    // Text Files
    'text/plain': { icon: FileText, color: 'text-gray-600', category: 'Text' },
    'text/markdown': { icon: FileText, color: 'text-purple-600', category: 'Text' },
    'text/csv': { icon: FileSpreadsheet, color: 'text-green-600', category: 'Data' },
    'application/json': { icon: Code, color: 'text-yellow-600', category: 'Data' },
    'application/xml': { icon: Code, color: 'text-red-600', category: 'Code' },
    'text/xml': { icon: Code, color: 'text-red-600', category: 'Code' },
    
    // Code Files
    'text/javascript': { icon: Code, color: 'text-yellow-500', category: 'Code' },
    'text/typescript': { icon: Code, color: 'text-blue-500', category: 'Code' },
    'text/html': { icon: Code, color: 'text-orange-500', category: 'Code' },
    'text/css': { icon: Code, color: 'text-blue-500', category: 'Code' },
    'application/x-python': { icon: Code, color: 'text-green-500', category: 'Code' },
    'text/x-python': { icon: Code, color: 'text-green-500', category: 'Code' },
    
    // Images
    'image/jpeg': { icon: ImageIcon, color: 'text-pink-600', category: 'Image' },
    'image/jpg': { icon: ImageIcon, color: 'text-pink-600', category: 'Image' },
    'image/png': { icon: ImageIcon, color: 'text-pink-600', category: 'Image' },
    'image/gif': { icon: ImageIcon, color: 'text-pink-600', category: 'Image' },
    'image/webp': { icon: ImageIcon, color: 'text-pink-600', category: 'Image' },
    'image/svg+xml': { icon: ImageIcon, color: 'text-purple-600', category: 'Image' },
    
    // Archives
    'application/zip': { icon: Archive, color: 'text-gray-600', category: 'Archive' },
    'application/x-rar-compressed': { icon: Archive, color: 'text-gray-600', category: 'Archive' },
    'application/x-7z-compressed': { icon: Archive, color: 'text-gray-600', category: 'Archive' },
    
    // Audio
    'audio/mpeg': { icon: Music, color: 'text-purple-600', category: 'Audio' },
    'audio/wav': { icon: Music, color: 'text-purple-600', category: 'Audio' },
    'audio/mp3': { icon: Music, color: 'text-purple-600', category: 'Audio' },
    
    // Video
    'video/mp4': { icon: Video, color: 'text-red-600', category: 'Video' },
    'video/webm': { icon: Video, color: 'text-red-600', category: 'Video' },
    'video/avi': { icon: Video, color: 'text-red-600', category: 'Video' }
  }

  const getFileIcon = (type: string, name: string) => {
    // Check by extension if MIME type is not recognized
    const ext = name.toLowerCase().split('.').pop()
    const extMap: Record<string, keyof typeof supportedTypes> = {
      'py': 'text/x-python',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'jsx': 'text/javascript',
      'tsx': 'text/typescript',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/avi'
    }
    
    const mappedType = ext && extMap[ext] ? extMap[ext] : type
    const fileInfo = supportedTypes[mappedType as keyof typeof supportedTypes]
    
    return fileInfo || { icon: File, color: 'text-gray-500', category: 'Unknown' }
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Enhanced file validation
    const validFiles = fileArray.filter(file => {
      // Size check - 50MB limit for most files, 100MB for archives
      const isArchive = file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')
      const sizeLimit = isArchive ? 100 * 1024 * 1024 : 50 * 1024 * 1024
      
      if (file.size > sizeLimit) {
        toast({
          title: 'File too large',
          description: `${file.name} is too large. Maximum file size is ${isArchive ? '100MB' : '50MB'}.`,
          variant: 'destructive'
        })
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    setSelectedFiles(validFiles)
    
    try {
      const uploadedFiles = await uploadFiles(conversationId, validFiles)
      
      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles)
        setSelectedFiles([])
        toast({
          title: 'Files uploaded successfully',
          description: `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded and ready for analysis.`
        })
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload files. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading files.'
      
      // Check if it's an authentication error
      const isAuthError = errorMessage.includes('session') || 
                          errorMessage.includes('sign in') || 
                          errorMessage.includes('authentication')
      
      toast({
        title: isAuthError ? 'Authentication Required' : 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [conversationId, uploadFiles, onFilesUploaded, toast])

  const handleUrlUpload = useCallback(async () => {
    if (!urlInput.trim()) return

    const url = urlInput.trim()
    
    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL.',
        variant: 'destructive'
      })
      return
    }

    setIsProcessingUrl(true)
    
    try {
      // Use web reader to extract content
      const webReaderModule = await import('@devvai/devv-code-backend')
      const webReader = webReaderModule.webReader
      
      const result = await webReader.read({ url })
      
      if (result.code === 200 && result.status === 20000) {
        // Create a file object from extracted content
        const content = `Title: ${result.data.title}\n\nDescription: ${result.data.description}\n\nURL: ${result.data.url}\n\n${result.data.content}`
        const blob = new Blob([content], { type: 'text/plain' })
        const fileName = (result.data.title || 'webpage').replace(/[^a-z0-9]/gi, '_').substring(0, 50) + '.txt'
        // Create File using DOM API
        const webFile: File = Object.assign(blob, {
          name: fileName,
          lastModified: Date.now()
        }) as File
        
        // Upload the extracted content
        const uploadedFiles = await uploadFiles(conversationId, [webFile])
        
        if (uploadedFiles.length > 0) {
          onFilesUploaded(uploadedFiles)
          setUrlInput('')
          toast({
            title: 'URL content extracted',
            description: `Successfully extracted content from ${result.data.title}`
          })
        }
      } else {
        // Fallback to direct URL upload
        const uploadedFile = await uploadFileFromUrl(conversationId, url)
        
        if (uploadedFile) {
          onFilesUploaded([uploadedFile])
          setUrlInput('')
          toast({
            title: 'URL content fetched',
            description: 'Content from URL has been processed and is ready for analysis.'
          })
        } else {
          throw new Error('Failed to fetch URL content')
        }
      }
    } catch (error) {
      console.error('URL upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the URL.'
      
      // Check if it's an authentication error
      const isAuthError = errorMessage.includes('session') || 
                          errorMessage.includes('sign in') || 
                          errorMessage.includes('authentication')
      
      toast({
        title: isAuthError ? 'Authentication Required' : 'URL processing failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsProcessingUrl(false)
    }
  }, [urlInput, conversationId, uploadFiles, uploadFileFromUrl, onFilesUploaded, toast])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getModeDescription = () => {
    switch (mode) {
      case 'analysis':
        return 'Upload data files, documents, or spreadsheets for comprehensive AI analysis and insights'
      case 'code':
        return 'Upload code files, projects, or repositories for AI-powered code review and analysis'
      default:
        return 'Upload any file type for AI analysis, or provide URLs for web content processing'
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FilePlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Advanced File Upload</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {getModeDescription()}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 premium-glass">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            URL Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
              ${dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/20'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              disabled={disabled}
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Drop files here or click to browse
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Supports documents, images, code, data files, archives, and more
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Badge variant="secondary" className="text-xs">Word</Badge>
                <Badge variant="secondary" className="text-xs">Excel</Badge>
                <Badge variant="secondary" className="text-xs">Images</Badge>
                <Badge variant="secondary" className="text-xs">Code</Badge>
                <Badge variant="secondary" className="text-xs">+More</Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Link className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Import from URL</h4>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste URL here (web pages, documents, images, etc.)&#10;Example: https://example.com/document.pdf"
                  className="min-h-[80px] resize-none"
                  disabled={disabled || isProcessingUrl}
                />
                
                <Button
                  onClick={handleUrlUpload}
                  disabled={!urlInput.trim() || disabled || isProcessingUrl}
                  className="w-full"
                >
                  {isProcessingUrl ? (
                    <>
                      <Download className="w-4 h-4 mr-2 animate-pulse" />
                      Processing URL...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Fetch Content from URL
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  💡 Supports web pages, direct file links, GitHub repos, and more
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Progress */}
      {(isUploading || isProcessingUrl) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isUploading ? 'Uploading files...' : 'Processing URL...'}
                </span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Selected Files ({selectedFiles.length})
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {selectedFiles.map((file, index) => {
                  const fileInfo = getFileIcon(file.type, file.name)
                  const IconComponent = fileInfo.icon
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <IconComponent className={`h-5 w-5 ${fileInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {fileInfo.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                        disabled={disabled}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}