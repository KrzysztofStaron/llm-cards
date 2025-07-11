"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CardData {
  id: string;
  question: string;
  response: string;
  model: string;
  timestamp: Date;
  isStreaming?: boolean;
  state: "fast_responding" | "fast_complete" | "detailed_responding" | "detailed_complete";
  reasoningBadges?: string[];
  detailedSections?: { title: string; content: string }[];
  sectionTitle?: string;
}

interface CardSwipeableProps {
  card: CardData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onBadgeClick: (badge: string) => void;
  isLoading: boolean;
  isDetailedSection?: boolean;
}

export default function CardSwipeable({
  card,
  onSwipeLeft,
  onSwipeRight,
  onBadgeClick,
  isLoading,
  isDetailedSection = false,
}: CardSwipeableProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number) => {
    if (isLoading || card.isStreaming || card.detailedSections || isDetailedSection) return;
    setIsDragging(true);
    startPos.current = { x: clientX - position.x, y: 0 };
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isLoading || card.isStreaming || card.detailedSections || isDetailedSection) return;
    const newX = clientX - startPos.current.x;
    setPosition({ x: newX, y: 0 });
    setRotation(newX * 0.1);
  };

  const handleEnd = () => {
    if (!isDragging || isLoading || card.isStreaming || card.detailedSections || isDetailedSection) return;
    setIsDragging(false);

    const threshold = 100;
    if (position.x > threshold && card.state === "fast_complete") {
      setPosition({ x: window.innerWidth, y: 0 });
      setRotation(30);
      setTimeout(() => {
        onSwipeRight();
        resetPosition();
      }, 300);
    } else if (position.x < -threshold) {
      setPosition({ x: -window.innerWidth, y: 0 });
      setRotation(-30);
      setTimeout(() => {
        onSwipeLeft();
        resetPosition();
      }, 300);
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const getModelBadgeColor = () => {
    switch (card.model) {
      case "mistralai/ministral-3b":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "google/gemini-2.5-pro":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    }
  };

  const getStateIndicator = () => {
    switch (card.state) {
      case "fast_responding":
        return { text: "Fast Response", icon: "⚡" };
      case "fast_complete":
        return { text: "Fast Response Complete", icon: "✓" };
      case "detailed_responding":
        return { text: "Detailed Response", icon: "🧠" };
      case "detailed_complete":
        return { text: "Detailed Response Complete", icon: "✅" };
    }
  };

  const stateInfo = getStateIndicator();
  const hasDetailedSections = card.detailedSections && card.detailedSections.length > 0;

  // Simplified section card for detailed sections
  if (isDetailedSection) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <Card className="relative w-full max-w-3xl h-[380px] flex flex-col transition-transform border-border/50 bg-card shadow-lg">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <h3 className="text-lg font-semibold text-foreground">{card.sectionTitle}</h3>
              <div className="h-px bg-border flex-1" />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col pb-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              <div className="text-foreground/90 leading-7 whitespace-pre-wrap">
                {card.response.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular card for non-detailed sections
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      {/* Swipe hints - only show for non-detailed section cards */}
      {!hasDetailedSections && !isDetailedSection && (
        <>
          <div
            className={`absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 pointer-events-none ${
              position.x < -50 ? "opacity-100 scale-110" : "opacity-40"
            }`}
          >
            <div className="flex items-center gap-3 text-red-500/80">
              <div className="flex flex-col items-center bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-500/20">
                <ChevronLeft className="w-6 h-6 mb-1" />
                <span className="font-medium text-xs text-center leading-tight">
                  New
                  <br />
                  Approach
                </span>
              </div>
            </div>
          </div>
          <div
            className={`absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 pointer-events-none ${
              position.x > 50 && card.state === "fast_complete"
                ? "opacity-100 scale-110"
                : card.state === "fast_complete"
                ? "opacity-40"
                : "opacity-20"
            }`}
          >
            <div className="flex items-center gap-3 text-green-500/80">
              <div className="flex flex-col items-center bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/20">
                <ChevronRight className="w-6 h-6 mb-1" />
                <span className="font-medium text-xs text-center leading-tight">Expand</span>
              </div>
            </div>
          </div>
        </>
      )}

      <Card
        className={`relative w-full max-w-3xl h-[550px] flex flex-col transition-transform border-border/50 bg-card shadow-2xl ${
          !isDragging ? "duration-300" : ""
        } ${hasDetailedSections || isDetailedSection ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
        style={{
          transform: `translateX(${position.x}px) rotate(${rotation}deg)`,
          opacity: 1 - Math.abs(position.x) / 500,
        }}
        onMouseDown={e => handleStart(e.clientX)}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={e => handleStart(e.touches[0].clientX)}
        onTouchMove={e => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {stateInfo.icon} {stateInfo.text}
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getModelBadgeColor()}`}>
                {card.model.split("/")[1] || card.model}
              </div>
            </div>
          </div>
          <p className="text-base font-medium leading-tight">{card.question}</p>
          {isDetailedSection && card.sectionTitle && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-sm text-muted-foreground font-medium px-2">{card.sectionTitle}</span>
              <div className="h-px bg-border flex-1" />
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col pb-4">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {hasDetailedSections ? (
              // Display detailed sections in column format
              <div className="space-y-6">
                {card.detailedSections!.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/10">
                    <h3 className="text-lg font-semibold mb-3 text-foreground border-b border-border pb-2">
                      {section.title}
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold mt-3 mb-2 text-foreground">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">{children}</h3>
                          ),
                          p: ({ children }) => <p className="mb-2 text-foreground/90 leading-6">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                          code: ({ className, children }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-muted/50 p-2 rounded overflow-x-auto font-mono text-sm my-2 text-foreground">
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => <div className="my-2">{children}</div>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500/30 pl-3 my-2 italic text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Display regular response
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Customize markdown rendering
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-3 text-foreground">{children}</h1>,
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h3>
                    ),
                    p: ({ children }) => <p className="mb-3 text-foreground/90 leading-7">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                    code: ({ className, children }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-muted/50 p-3 rounded-md overflow-x-auto font-mono text-sm my-2 text-foreground">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <div className="my-3">{children}</div>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-500/30 pl-4 my-3 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border px-3 py-2 text-left font-semibold bg-muted/30">{children}</th>
                    ),
                    td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
                    hr: () => <hr className="my-4 border-border" />,
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-purple-500 hover:text-purple-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {card.response}
                </ReactMarkdown>
                {card.isStreaming && <span className="inline-block w-0.5 h-5 bg-purple-500 streaming-cursor -mb-1" />}
              </div>
            )}
          </div>

          {/* Reasoning Badges - only show for fast_complete state and non-detailed sections */}
          {card.state === "fast_complete" &&
            !hasDetailedSections &&
            !isDetailedSection &&
            card.reasoningBadges &&
            card.reasoningBadges.length > 0 && (
              <div className="px-2 py-3 border-t border-b bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Explore different angles:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.reasoningBadges.map((badge, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onBadgeClick(badge);
                      }}
                      className="h-7 px-3 text-xs bg-background hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:border-purple-400 dark:hover:border-purple-500"
                    >
                      {badge}
                    </Button>
                  ))}
                </div>
              </div>
            )}
        </CardContent>

        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          </div>
        )}
      </Card>
    </div>
  );
}
