import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/AuthDialog'
import { useAuthStore } from '@/store/auth-store'
import { Sparkles, MessageSquare, Image, Code, BarChart3, Mail, Upload, Globe, Zap, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/chat')
    } else {
      setShowAuth(true)
    }
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Multi-model AI conversations with streaming responses',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Image,
      title: 'Image Generation',
      description: 'Create stunning images with Google Gemini 2.5 Flash',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code,
      title: 'Code Assistant',
      description: 'Advanced code generation and debugging with AI',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'Analyze documents and data with AI insights',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: Globe,
      title: 'Web Search',
      description: 'Real-time web search with source citations',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Mail,
      title: 'Email Integration',
      description: 'Send professional emails with attachments',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Upload,
      title: 'File Upload',
      description: 'Upload and analyze any file type',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Multiple Models',
      description: 'Access GPT-4o, Claude, Kimi K2, and more',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">Sree AI</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate('/chat')} className="gradient-primary">
                  Open App
                </Button>
              ) : (
                <Button onClick={() => setShowAuth(true)} variant="outline">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Advanced AI Assistant Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient-primary">Sree AI</span>
              <br />
              <span className="text-foreground/90">Your Complete AI Suite</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the power of multiple AI models, image generation, web search, 
              code assistance, and more—all in one beautiful interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                onClick={handleGetStarted} 
                size="lg"
                className="gradient-primary text-lg px-8 py-6 h-auto glow-primary"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Features
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Real-time responses</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Multiple AI models</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for AI-powered productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl gradient-primary p-12 text-center">
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold text-white">
                Ready to Experience Sree AI?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of users leveraging AI for productivity and creativity
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-white/90"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Using Sree AI
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2025 Sree AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  )
}
