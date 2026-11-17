import React, { useCallback, useState } from 'react'
import { Upload, File, X, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useChatStore, type UploadedFile } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'

interface FileUploadProps {
  conversationId: string
  onFilesUploaded: (files: UploadedFile[]) => void
  disabled?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  conversationId,
  onFilesUploaded,
  disabled = false
}) => {
  const { toast } = useToast()
  const { uploadFiles, isUploading, uploadProgress } = useChatStore()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Filter supported file types
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    
    const validFiles = fileArray.filter(file => {
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: 'Unsupported file type',
          description: `${file.name} is not supported. Please upload text, PDF, Word, or image files.`,
          variant: 'destructive'
        })
        return false
      }
      
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is too large. Maximum file size is 10MB.`,
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
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading files.',
        variant: 'destructive'
      })
    }
  }, [conversationId, uploadFiles, onFilesUploaded, toast])

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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
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

  return (
    <div className="space-y-3">
      {/* File Input Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".txt,.md,.csv,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Support: Text, PDF, Word documents, Images (Max 10MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading files...</span>
            <span className="text-primary font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Selected Files:</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
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
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                  disabled={disabled}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById('file-input')?.click()}
        disabled={disabled || isUploading}
        className="w-full"
      >
        <Paperclip className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Attach Files'}
      </Button>
    </div>
  )
}