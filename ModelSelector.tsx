import React from 'react'
import { Check, Crown, Sparkles, Code, BarChart3, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useChatStore, AIModel } from '@/store/chat-store'

const categoryIcons = {
  general: Brain,
  creative: Sparkles,
  analytical: BarChart3,
  coding: Code,
  premium: Crown,
}

const categoryColors = {
  general: 'bg-blue-500/10 text-blue-700 border-blue-200',
  creative: 'bg-purple-500/10 text-purple-700 border-purple-200',
  analytical: 'bg-green-500/10 text-green-700 border-green-200',
  coding: 'bg-orange-500/10 text-orange-700 border-orange-200',
  premium: 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-700 border-yellow-200',
}

interface ModelSelectorProps {
  onClose?: () => void
}

export default function ModelSelector({ onClose }: ModelSelectorProps) {
  const { selectedModel, availableModels, setModel } = useChatStore()
  
  const currentModel = availableModels.find(m => m.id === selectedModel)
  const CategoryIcon = currentModel ? categoryIcons[currentModel.category] : Brain

  const groupedModels = availableModels.reduce((groups, model) => {
    const category = model.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(model)
    return groups
  }, {} as Record<string, AIModel[]>)

  const handleModelSelect = (modelId: string) => {
    setModel(modelId)
    onClose?.()
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedModels).map(([category, models]) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons]
        
        return (
          <div key={category}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Icon className="w-4 h-4" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
            
            <div className="space-y-2">
              {models.map((model) => {
                const ModelIcon = categoryIcons[model.category]
                const isSelected = model.id === selectedModel
                
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected 
                        ? 'border-accent bg-accent/10' 
                        : 'border-border hover:border-accent/50 hover:bg-accent/5'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ModelIcon className="w-4 h-4" />
                          <span className="font-medium">{model.name}</span>
                          {model.premium && <Crown className="w-3 h-3 text-accent" />}
                          {isSelected && <Check className="w-4 h-4 text-accent ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {model.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}