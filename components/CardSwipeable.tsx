"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Terminal, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    if (isLoading || card.isStreaming || isDetailedSection) return;
    setIsDragging(true);
    startPos.current = { x: clientX - position.x, y: 0 };
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isLoading || card.isStreaming || isDetailedSection) return;
    const newX = clientX - startPos.current.x;
    setPosition({ x: newX, y: 0 });
    setRotation(newX * 0.05);
  };

  const handleEnd = () => {
    if (!isDragging || isLoading || card.isStreaming || isDetailedSection) return;
    setIsDragging(false);

    const threshold = 80;
    if (position.x > threshold && card.state === "fast_complete") {
      setPosition({ x: window.innerWidth, y: 0 });
      setRotation(15);
      setTimeout(() => {
        onSwipeRight();
        resetPosition();
      }, 200);
    } else if (position.x < -threshold) {
      setPosition({ x: -window.innerWidth, y: 0 });
      setRotation(-15);
      setTimeout(() => {
        onSwipeLeft();
        resetPosition();
      }, 200);
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const getStatusColor = () => {
    switch (card.state) {
      case "fast_responding":
        return "text-yellow-400 border-yellow-400/30";
      case "fast_complete":
        return "text-green-400 border-green-400/30";
      case "detailed_responding":
        return "text-cyan-400 border-cyan-400/30";
      case "detailed_complete":
        return "text-blue-400 border-blue-400/30";
    }
  };

  const getStatusText = () => {
    switch (card.state) {
      case "fast_responding":
        return "PROCESSING";
      case "fast_complete":
        return "READY";
      case "detailed_responding":
        return "ENHANCING";
      case "detailed_complete":
        return "COMPLETE";
    }
  };

  const getModelIcon = () => {
    return card.model.includes("mistral") ? <Cpu className="w-3 h-3" /> : <Terminal className="w-3 h-3" />;
  };

  // Removed detailed sections logic - keeping single responses only

  // Simplified section card for detailed sections
  if (isDetailedSection) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="relative w-full h-full flex flex-col bg-black/95 border-green-500/30 shadow-2xl shadow-green-500/10">
          <CardHeader className="pb-2 shrink-0 border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-mono text-sm tracking-wider">
                {card.sectionTitle?.toUpperCase() || "NEURAL_SEGMENT"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="flex-1 overflow-y-auto terminal-scrollbar">
              <div className="text-green-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {card.response.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-3 last:mb-0">
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

  // Regular terminal window for main cards
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Card
        className={`relative w-full h-full flex flex-col bg-black/95 border-green-500/30 shadow-2xl shadow-green-500/10 transition-transform ${
          !isDragging ? "duration-200" : ""
        } ${isDetailedSection ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
        style={{
          transform: `translateX(${position.x}px) rotate(${rotation}deg)`,
          opacity: 1 - Math.abs(position.x) / 800,
        }}
        onMouseDown={e => handleStart(e.clientX)}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={e => handleStart(e.touches[0].clientX)}
        onTouchMove={e => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Terminal header */}
        <CardHeader className="pb-2 shrink-0 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <span className="text-green-400 font-mono text-xs tracking-wider">
                TERMINAL_SESSION_{card.id.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-mono ${getStatusColor()}`}>
                {getModelIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>
          </div>

          {/* Query line */}
          <div className="mt-2">
            <div className="text-green-400 font-mono text-sm">
              <span className="text-green-500/80">$ </span>
              <span className="text-green-300">{card.question}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex-1 overflow-y-auto terminal-scrollbar">
            <div className="text-green-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {card.response.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph.trim()}
                </p>
              ))}
              {card.isStreaming && <span className="inline-block w-2 h-4 bg-green-400 streaming-cursor ml-1" />}
            </div>
          </div>

          {/* Reasoning badges */}
          {card.state === "fast_complete" &&
            !isDetailedSection &&
            card.reasoningBadges &&
            card.reasoningBadges.length > 0 && (
              <div className="mt-4 pt-3 border-t border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3 h-3 text-green-400" />
                  <span className="text-green-400/80 font-mono text-xs tracking-wide">ALTERNATIVE_CONTEXTS:</span>
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
                      className="h-7 px-3 text-xs font-mono bg-black border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 transition-all duration-200"
                    >
                      {badge.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            )}
        </CardContent>

        {isLoading && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mb-2 mx-auto" />
              <div className="text-green-400 font-mono text-sm">&gt; PROCESSING...</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
