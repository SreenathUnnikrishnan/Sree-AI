import React from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/store/chat-store'
import { useNavigate } from 'react-router-dom'

const categoryColors = {
  productivity: 'bg-blue-500/10 text-blue-700 border-blue-200',
  creative: 'bg-purple-500/10 text-purple-700 border-purple-200',
  analysis: 'bg-green-500/10 text-green-700 border-green-200',
  coding: 'bg-orange-500/10 text-orange-700 border-orange-200',
  business: 'bg-red-500/10 text-red-700 border-red-200',
}

interface ConversationTemplatesProps {
  trigger?: React.ReactNode
}

export default function ConversationTemplates({ trigger }: ConversationTemplatesProps) {
  const { conversationTemplates, createFromTemplate, setCurrentConversation } = useChatStore()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  const handleTemplateSelect = (templateId: string) => {
    const newConversationId = createFromTemplate(templateId)
    setCurrentConversation(newConversationId)
    setOpen(false)
    navigate('/chat')
  }

  const groupedTemplates = conversationTemplates.reduce((groups, template) => {
    const category = template.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(template)
    return groups
  }, {} as Record<string, typeof conversationTemplates>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="premium-button">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto premium-glass">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Choose Your AI Assistant
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a specialized template to get started with the perfect AI assistant for your task.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold capitalize">
                  {category}
                </h3>
                <Badge 
                  variant="outline"
                  className={categoryColors[category as keyof typeof categoryColors]}
                >
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="feature-card cursor-pointer group p-6 hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {template.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors duration-300">
                          {template.name}
                        </h4>
                        
                        <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline"
                            className={`text-xs ${categoryColors[template.category as keyof typeof categoryColors]}`}
                          >
                            {template.category}
                          </Badge>
                          
                          <div className="text-xs text-muted-foreground">
                            {template.suggestedModel === 'devv-default' ? 'Built-in' : 'Premium'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted/20 rounded-lg border border-border/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Pro Tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Each template comes with a specialized AI model and initial prompt optimized for specific tasks. 
            You can always change the model later in your conversation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}