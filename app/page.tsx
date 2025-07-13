"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Terminal,
  Zap,
  Brain,
  Layers,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Play,
  Github,
  Code,
  ShuffleIcon as Swipe,
  RefreshCw,
  Target,
  Clock,
  Infinity,
} from "lucide-react";

const swipeExamples = [
  {
    question: "Explain quantum computing",
    fastResponse:
      "Quick overview: Quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously...",
    detailedResponse:
      "Comprehensive analysis: Quantum computing represents a fundamental paradigm shift in computational theory...",
    badges: ["QUANTUM PHYSICS", "ALGORITHMS", "FUTURE TECH"],
  },
  {
    question: "Best practices for React",
    fastResponse: "Key points: Use hooks, avoid prop drilling, implement proper state management...",
    detailedResponse:
      "In-depth guide: React development excellence requires understanding component lifecycle, optimization patterns...",
    badges: ["COMPONENTS", "PERFORMANCE", "ARCHITECTURE"],
  },
];

export default function LLMCardsLanding() {
  const [currentExample, setCurrentExample] = useState(0);
  const [showResponse, setShowResponse] = useState<"none" | "fast" | "detailed">("none");
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const handleLaunchApp = () => {
    router.push("/app");
  };

  const simulateSwipe = (direction: "left" | "right") => {
    setIsTyping(true);
    setShowResponse("none");

    setTimeout(() => {
      setShowResponse(direction === "left" ? "fast" : "detailed");
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % swipeExamples.length);
      setShowResponse("none");
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Terminal Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(34,197,94,0.03) 2px,
            rgba(34,197,94,0.03) 4px
          )`,
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-green-800/30 bg-black/90 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 border border-green-500 rounded-lg flex items-center justify-center relative">
                <Terminal className="w-5 h-5 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-400">LLM_CARDS</span>
                <div className="text-xs text-green-600 -mt-1">v2.0.1-beta</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                <Github className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">source</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                <span className="text-lg font-bold mr-2">𝕏</span>
                <span className="hidden sm:inline">@PanzerBread</span>
              </Button>
              <Button
                size="sm"
                className="bg-green-500 text-black hover:bg-green-400 hidden sm:flex font-bold"
                onClick={handleLaunchApp}
              >
                <Play className="w-4 h-4 mr-2" />
                launch_app
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 relative">
        <div className="max-w-6xl mx-auto">
          {/* Terminal Header */}
          <div className="mb-8">
            <div className="text-green-600 text-sm mb-2">{">"} ./initialize_revolution.sh</div>
            <div className="text-green-500 text-xs mb-6">[NEURAL_NETWORK_INTERFACE_ACTIVE]</div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300">PARADIGM_SHIFT_DETECTED</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                <span className="text-white">SWIPE TO</span>
                <br />
                <span className="text-green-400">EXPLORE AI</span>
                <br />
                <span className="text-green-600">INFINITELY</span>
              </h1>

              <div className="space-y-4 mb-8 text-green-300">
                <p className="text-lg leading-relaxed">{">"} Revolutionary interface that replaces broken chatbot UX</p>
                <p className="text-lg leading-relaxed">
                  {">"} <span className="text-green-400 font-bold">Swipe left</span> → Fast insights (ministral-3b)
                </p>
                <p className="text-lg leading-relaxed">
                  {">"} <span className="text-green-400 font-bold">Swipe right</span> → Deep analysis (Grok-4)
                </p>
                <p className="text-lg leading-relaxed">
                  {">"} <span className="text-green-400 font-bold">Tap badges</span> → Explore related topics
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-green-500 text-black hover:bg-green-400 px-8 py-4 text-lg font-bold"
                  onClick={handleLaunchApp}
                >
                  <Terminal className="w-5 h-5 mr-2" />
                  ./launch_app
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="text-green-600 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Code className="w-4 h-4" />
                  <span>Open source • Terminal aesthetic • Zero friction</span>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Demo */}
            <div className="relative">
              <Card className="bg-black border border-green-500/30 shadow-2xl shadow-green-500/20">
                <CardContent className="p-0">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-2 p-4 border-b border-green-500/30 bg-green-500/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-400 text-sm ml-2">NEURAL_QUERY_INTERFACE</span>
                    {showResponse !== "none" && (
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs">READY</span>
                      </div>
                    )}
                  </div>

                  {/* Query Input */}
                  <div className="p-6 border-b border-green-500/20">
                    <div className="text-green-600 text-sm mb-2">$ Enter neural query...</div>
                    <div className="text-green-300 text-lg">{swipeExamples[currentExample].question}</div>
                    <div className="text-green-600 text-sm mt-2">{">"} Ready for input</div>
                  </div>

                  {/* Response Area */}
                  <div className="p-6 min-h-[200px]">
                    {isTyping ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing neural pathways...</span>
                      </div>
                    ) : showResponse !== "none" ? (
                      <div className="space-y-4">
                        <div className="text-green-300 text-sm leading-relaxed">
                          {showResponse === "fast"
                            ? swipeExamples[currentExample].fastResponse
                            : swipeExamples[currentExample].detailedResponse}
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                          <span className="text-green-600 text-xs mb-1">{">"} ALTERNATIVE_CONTEXTS:</span>
                          <div className="flex gap-2 w-min">
                            {swipeExamples[currentExample].badges.map((badge, i) => (
                              <button
                                key={i}
                                className=" px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs hover:bg-green-500/30 transition-colors text-left"
                              >
                                {badge}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-green-600 text-sm">Swipe to explore different perspectives</div>
                        <div className="flex justify-center gap-8">
                          <button
                            onClick={() => simulateSwipe("left")}
                            className="flex flex-col items-center gap-2 p-4 border border-green-500/30 rounded hover:bg-green-500/10 transition-colors group"
                          >
                            <ArrowLeft className="w-6 h-6 text-green-400 group-hover:text-green-300" />
                            <span className="text-green-400 text-xs">FAST</span>
                            <span className="text-green-600 text-xs">ministral-3b</span>
                          </button>
                          <button
                            onClick={() => simulateSwipe("right")}
                            className="flex flex-col items-center gap-2 p-4 border border-green-500/30 rounded hover:bg-green-500/10 transition-colors group"
                          >
                            <ArrowRight className="w-6 h-6 text-green-400 group-hover:text-green-300" />
                            <span className="text-green-400 text-xs">DETAILED</span>
                            <span className="text-green-600 text-xs">Grok-4</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="border-t border-green-800/30 bg-green-500/5 py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="text-green-600 text-sm mb-4">{">"} ./analyze_problem.sh</div>
            <h2 className="text-4xl font-bold mb-6 text-white">CHATBOTS ARE BROKEN</h2>
            <p className="text-xl text-green-300">
              Traditional AI interfaces force linear thinking and limit exploration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problems */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-red-400 mb-6">// CURRENT PROBLEMS</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <MessageSquare className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-red-300 font-medium">Linear conversations</div>
                    <div className="text-red-400/80 text-sm">You have to think of follow-up questions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <Layers className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-red-300 font-medium">Messy threads</div>
                    <div className="text-red-400/80 text-sm">Conversations become unmanageable</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <Target className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-red-300 font-medium">Single perspective</div>
                    <div className="text-red-400/80 text-sm">Limited to one response per query</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-green-400 mb-6">// LLM_CARDS SOLUTION</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <Swipe className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-green-300 font-medium">Effortless exploration</div>
                    <div className="text-green-400/80 text-sm">No need to craft perfect prompts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <Brain className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-green-300 font-medium">Multiple perspectives</div>
                    <div className="text-green-400/80 text-sm">Different angles instantly</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <Infinity className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-green-300 font-medium">Infinite discovery</div>
                    <div className="text-green-400/80 text-sm">AI suggests directions for you</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="text-green-600 text-sm mb-4">{">"} ./list_features.sh</div>
            <h2 className="text-4xl font-bold mb-6 text-white">TECHNICAL INNOVATION</h2>
            <p className="text-xl text-green-300">Built for the future of AI interaction</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Smart Caching</h3>
                <p className="text-green-300 leading-relaxed">
                  Detailed responses pre-generated in background. Fast access to deep analysis when you swipe right.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Layers className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Multi-Model Orchestra</h3>
                <p className="text-green-300 leading-relaxed">
                  Different models for different needs. Fast insights vs deep analysis, orchestrated seamlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">AI Navigation</h3>
                <p className="text-green-300 leading-relaxed">
                  Dynamic badges generated based on your specific response. Discover connections you never considered.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Terminal className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Terminal Aesthetic</h3>
                <p className="text-green-300 leading-relaxed">
                  Clean, focused interface that feels like a developer's terminal. No distractions, pure exploration.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Progressive Disclosure</h3>
                <p className="text-green-300 leading-relaxed">
                  Start simple, go deep only when needed. Cognitive offloading at its finest.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group border-green-500/30 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                  <Infinity className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Infinite Exploration</h3>
                <p className="text-green-300 leading-relaxed">
                  Ask once, explore infinitely. The system suggests directions, you don't have to think of them.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-green-500/10 to-black border border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Terminal className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-green-600 text-sm mb-4">{">"} ./start_revolution.sh</div>
              <h2 className="text-4xl font-bold mb-6 text-white">READY TO BREAK FREE FROM CHATBOTS?</h2>
              <p className="text-xl text-green-300 mb-12 max-w-2xl mx-auto">
                Experience the future of AI interaction. Swipe to explore, tap to discover, think differently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-green-500 text-black hover:bg-green-400 px-10 py-4 text-lg font-bold"
                  onClick={handleLaunchApp}
                >
                  <Terminal className="w-5 h-5 mr-2" />
                  ./launch_app
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-green-500/30 hover:bg-green-500/10 text-green-400 bg-transparent"
                >
                  <Github className="w-5 h-5 mr-2" />
                  view_source
                </Button>
              </div>
              <div className="mt-8 text-sm text-green-600">
                ✓ Open source • ✓ Terminal aesthetic • ✓ Zero friction • ✓ Infinite exploration
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-800/30 bg-black py-12 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-green-500/20 border border-green-500 rounded-lg flex items-center justify-center relative">
                <Terminal className="w-5 h-5 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <span className="text-xl font-bold text-green-400">LLM_CARDS</span>
                <div className="text-xs text-green-600 -mt-1">v2.0.1-beta</div>
              </div>
            </div>
            <div className="text-sm text-green-600">© 2024 LLM Cards. Open source revolution. Built for explorers.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
