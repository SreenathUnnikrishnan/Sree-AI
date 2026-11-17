import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  ExternalLink, 
  Upload, 
  X, 
  Paperclip, 
  Sparkles,
  Camera,
  Paintbrush,
  Wand2,
  Layers
} from 'lucide-react'
import { useChatStore, type UploadedFile } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'
import { LazyImage } from './LazyImage'

interface ImageGeneratorProps {
  conversationId: string
}

export function ImageGenerator({ conversationId }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState('text-to-image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    generateImage, 
    generateImageWithFile, 
    isGeneratingImage,
    uploadFiles,
    isUploading,
    uploadProgress
  } = useChatStore()
  const { toast } = useToast()
  
  // Check authentication status
  const isAuthenticated = localStorage.getItem('DEVV_CODE_SID')

  // Enhanced prompt suggestions
  const promptSuggestions = {
    'text-to-image': [
      "A futuristic cityscape at sunset with flying cars",
      "A magical forest with glowing mushrooms and fairy lights",
      "A professional headshot in corporate style",
      "A minimalist logo design for a tech company",
      "An abstract art piece with vibrant colors and geometric shapes"
    ],
    'image-to-image': [
      "Transform this into a watercolor painting style",
      "Add a dramatic sunset lighting to this scene",
      "Convert this to a minimalist black and white illustration",
      "Apply a cyberpunk aesthetic with neon lights",
      "Transform this into a vintage oil painting style"
    ]
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGeneratingImage) return

    if (activeTab === 'text-to-image') {
      await generateImage(conversationId, prompt.trim())
    } else if (activeTab === 'image-to-image' && uploadedImages.length > 0) {
      await generateImageWithFile(conversationId, prompt.trim(), uploadedImages)
    }
    
    setPrompt('')
  }

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
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Filter for images only
    const imageFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image. Please upload JPG, PNG, or WebP files.`,
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

    if (imageFiles.length === 0) return

    try {
      const uploadedFiles = await uploadFiles(conversationId, imageFiles)
      
      if (uploadedFiles.length > 0) {
        setUploadedImages(prev => [...prev, ...uploadedFiles])
        setActiveTab('image-to-image') // Switch to image-to-image tab
        toast({
          title: 'Images uploaded successfully',
          description: `${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} uploaded and ready for transformation.`
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading images.',
        variant: 'destructive'
      })
    }
  }, [conversationId, uploadFiles, toast])

  const removeUploadedImage = (index: number) => {
    setUploadedImages(images => images.filter((_, i) => i !== index))
  }

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Image Generation</h3>
            <p className="text-sm text-muted-foreground">Create and transform images with Google Gemini 2.5 Flash</p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-500 text-sm">🔐</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Authentication Required
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  Please sign in to generate images. Click the "Sign In" button at the top right to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 premium-glass">
            <TabsTrigger value="text-to-image" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Text to Image</span>
              <span className="sm:hidden">T2I</span>
            </TabsTrigger>
            <TabsTrigger value="image-to-image" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Image to Image</span>
              <span className="sm:hidden">I2I</span>
              {uploadedImages.length > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {uploadedImages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text-to-image" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Create from Description</span>
              </div>
              
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate in detail..."
                className="min-h-[80px] bg-background/50 border-primary/30 focus:border-primary/50 resize-none"
                disabled={isGeneratingImage}
              />
              
              <p className="text-xs text-muted-foreground">
                💡 Tip: Be specific about style, colors, composition, and mood for better results
              </p>
              
              {/* Quick suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions['text-to-image'].slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptSuggestion(suggestion)}
                      className="text-xs h-7 bg-background/50 hover:bg-primary/10"
                      disabled={isGeneratingImage}
                    >
                      {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image-to-image" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Paintbrush className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Transform Existing Images</span>
              </div>
              
              {/* Image Upload Area */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200
                  ${dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                  }
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support: JPG, PNG, WebP (Max 10MB each)
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading images...</span>
                    <span className="text-primary font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Uploaded Images ({uploadedImages.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border bg-card">
                        <LazyImage
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeUploadedImage(index)
                            }}
                            className="h-6 w-6 p-0 bg-white/90 text-black hover:bg-white"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                          <p className="text-xs text-white truncate">{image.filename}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to transform the uploaded images..."
                className="min-h-[80px] bg-background/50 border-primary/30 focus:border-primary/50 resize-none"
                disabled={isGeneratingImage || uploadedImages.length === 0}
              />
              
              <p className="text-xs text-muted-foreground">
                ✨ Transform uploaded images with styles, effects, or modifications
              </p>
              
              {/* Transform suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Transform Ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions['image-to-image'].slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptSuggestion(suggestion)}
                      className="text-xs h-7 bg-background/50 hover:bg-primary/10"
                      disabled={isGeneratingImage || uploadedImages.length === 0}
                    >
                      {suggestion.length > 25 ? suggestion.substring(0, 25) + '...' : suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generation Controls */}
        <div className="space-y-4 mt-6">
          <Button 
            onClick={handleGenerate}
            disabled={
              !prompt.trim() || 
              isGeneratingImage || 
              (activeTab === 'image-to-image' && uploadedImages.length === 0)
            }
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 h-11"
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {activeTab === 'text-to-image' ? 'Generate Image' : 'Transform Images'}
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Powered by Google Gemini 2.5 Flash • High-quality image generation and transformation
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GeneratedImageProps {
  images: string[]
  prompt: string
}

export function GeneratedImage({ images, prompt }: GeneratedImageProps) {
  const handleDownload = (imageUrl: string, index: number) => {
    // Open in new window since direct download may not work
    window.open(imageUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Generated {images.length} image{images.length > 1 ? 's' : ''}</p>
        <Badge variant="secondary" className="text-xs">"{prompt}"</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((imageUrl, index) => (
          <Card key={index} className="overflow-hidden border-primary/20 group">
            <CardContent className="p-0">
              <div className="relative">
                <LazyImage
                  src={imageUrl}
                  alt={`Generated image ${index + 1}: ${prompt}`}
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(imageUrl, index)}
                    className="bg-white/90 text-black hover:bg-white shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}