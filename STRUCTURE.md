# This file is only for editing file nodes, do not break the structure
## Project Description
Sree AI - A fully functional advanced AI assistant platform with comprehensive features including multi-model AI chat, image generation & transformation, multi-language code generation & debugging, advanced data analysis, web search integration, email assistance, and universal file upload support (all formats + URL/link upload). Features icon-based mode selection, streaming responses, conversation management, and a sophisticated interface optimized for mobile and desktop.

## Key Features
- ✅ **Unified Feature Panel**: Icon-based selection for 6 AI modes (Chat, Code, Analysis, Image, Email, Web Search)
- ✅ **Universal File Upload**: Supports all file formats with drag-and-drop, file browser, and URL/link import
- ✅ **Web Reader Integration**: Automatic content extraction from URLs using Jina Reader API
- ✅ **Multi-Model AI Chat**: DevvAI Default, Kimi K2, GPT-4o, Claude 3.5, Llama 3.1 with streaming responses
- ✅ **AI Image Generation**: Text-to-image and image-to-image transformation with Google Gemini 2.5 Flash
- ✅ **Code Generation & Debugging**: Multi-language support (JavaScript, Python, React, TypeScript, Java, C++, Go, Rust)
- ✅ **Advanced Data Analysis**: Document analysis, data insights, research with web search integration
- ✅ **Web Search Integration**: Real-time web search with source citations using Jina SERP API
- ✅ **Email Assistant**: Professional email drafting with AI assistance
- ✅ **Quick Actions**: Mode-specific quick action buttons for common tasks
- ✅ **Conversation Management**: Export (TXT, JSON), sharing via email, sidebar navigation
- ✅ **Mobile-Responsive**: Optimized layouts for mobile, tablet, and desktop with adaptive UI
- ✅ **Authentication System**: Email OTP with session management
- ✅ **Premium Animations**: 3D transforms, glass morphism, holographic text effects

## Data Storage
Tables: conversations (ez8b2iogpgjk) - stores user conversations with messages and metadata
Local: Zustand persist for auth state and chat conversations with cross-session persistence

## Devv SDK Integration
Built-in: Authentication (email OTP), Database (conversations table), DevvAI (multi-model chat), Image Generation (Google Gemini 2.5 Flash), Web Search (Jina SERP API), Web Reader (Jina content extraction), File Upload (all formats support)
External: Resend (email sharing), OpenRouter (GPT-4o, Claude 3.5, Llama 3.1)

## Special Requirements
✅ ALL FEATURES FULLY FUNCTIONAL: Complete AI assistant platform with 6 feature modes accessible via icon selection. Each mode supports comprehensive file upload (all formats), URL/link import with automatic content extraction, and web search integration. The unified feature panel provides quick action buttons for common tasks in each mode. Mobile-responsive design with adaptive layouts and sheet-based input panels for small screens. All features tested and working including text generation, code generation/debugging, data analysis, image generation/transformation, email assistance, and web search with real-time results.

/src
├── components/
│   ├── ui/             # Pre-installed shadcn/ui components with premium styling
│   ├── AuthDialog.tsx  # Email OTP authentication with session management
│   ├── ProtectedRoute.tsx # Route protection wrapper component
│   ├── UnifiedFeaturePanel.tsx # NEW: Icon-based feature selector with quick actions, file upload, and input
│   ├── EnhancedChatInterface.tsx # Streamlined chat interface using unified feature panel
│   ├── EnhancedMessageBubble.tsx # Premium message display with reactions and syntax highlighting
│   ├── ModelSelector.tsx # AI model selection dialog with categories
│   ├── ConversationTemplates.tsx # Conversation starter templates
│   ├── AdvancedFileUpload.tsx # Enhanced file upload with URL import and web reader integration
│   ├── EmailSender.tsx # Professional email sending with templates
│   ├── LazyImage.tsx # Performance-optimized image loading
│   ├── ShareConversation.tsx # Conversation sharing via email
│   ├── Sidebar.tsx # Conversation management sidebar
│   └── VirtualizedMessageList.tsx # Performance-optimized message list
│
├── pages/
│   ├── HomePage.tsx    # Sophisticated landing page with gradient hero
│   ├── ChatPage.tsx    # Main chat application with unified feature panel
│   └── NotFoundPage.tsx # 404 error page 
│
├── store/
│   ├── auth-store.ts   # Zustand auth state with OTP flow and session management
│   └── chat-store.ts   # Comprehensive chat state with handleFeatureSubmit, fetchUrlContent, and all AI features
│
├── hooks/              # Custom Hooks
│   ├── use-mobile.ts   # Mobile detection Hook
│   ├── use-toast.ts    # Toast notification system Hook
│   ├── useDebounce.ts  # Debouncing hook for performance
│   └── useThrottle.ts  # Throttling hook for scroll optimization
│
├── lib/                # Utility library
│   └── utils.ts        # Helper functions including cn
│
├── App.tsx             # Root component with React Router
├── main.tsx            # Entry file
└── index.css           # Sophisticated design system with purple-gold theme and 3D effects