# LLM Cards

A modern, interactive chat interface that provides fast exploratory responses with intelligent follow-up options. Get quick insights from a fast model, then dive deeper with structured detailed responses.

## ✨ Features

- **Dual-Speed Processing**: Fast responses from `mistralai/ministral-3b` for quick exploration, detailed analysis from `google/gemini-2.5-pro`
- **Smart Badge System**: Context-aware reasoning badges that suggest alternative perspectives
- **Conversation Steering**: Click badges to regenerate responses with specific focus areas
- **Swipe Interactions**:
  - 👈 Swipe left to try a different approach
  - 👉 Swipe right to expand into detailed, structured sections
- **Section-Based Layout**: Detailed responses are intelligently broken into digestible card sections
- **Conversation History**: Full context preservation across all interactions
- **Mobile Responsive**: Optimized for both desktop and touch devices

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment example and add your API key:

```bash
cp env.example .env.local
```

Then edit `.env.local` and add your OpenRouter API key:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your API key from [OpenRouter](https://openrouter.ai/keys).

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start exploring!

## 🎯 How to Use

1. **Ask a Question**: Type any question in the input field
2. **Fast Response**: Get a quick response from the fast model with reasoning badges
3. **Explore Alternatives**: Click badges to regenerate with different focus areas
4. **Try Different Approaches**: Swipe left to get alternative reasoning
5. **Go Deeper**: Swipe right to get a comprehensive, structured breakdown

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **LLM Provider**: OpenRouter
- **Models**:
  - Fast: `mistralai/ministral-3b`
  - Detailed: `google/gemini-2.5-pro`

## 📱 Mobile Experience

The app is fully optimized for mobile devices with:

- Touch-friendly swipe gestures
- Responsive card layouts
- Optimized loading states
- Proper touch target sizes

## 🎨 Design Philosophy

- **Progressive Disclosure**: Start simple, allow deeper exploration
- **Context Preservation**: Every interaction builds on previous conversations
- **Intelligent Sectioning**: LLM automatically structures content for optimal readability
- **No Scrolling**: Each card is sized to fit content without scrolling needs

## 📖 Architecture

- `CardInterface.tsx`: Main state management and orchestration
- `CardSwipeable.tsx`: Swipe interactions and card rendering
- `QuestionInput.tsx`: Input handling and history management
- `streamLLM.ts`: Dual-mode LLM integration (streaming + structured)

## 🔧 Development

Built with modern React patterns:

- Server Actions for LLM integration
- Streaming responses with AbortController
- State machines for interaction flows
- Progressive enhancement for mobile

---

_Explore ideas at the speed of thought, then dive as deep as you want to go._
