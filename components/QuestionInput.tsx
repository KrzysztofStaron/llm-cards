"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Send } from "lucide-react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export default function QuestionInput({ onSubmit, isLoading }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="w-full">
      {/* Terminal input window */}
      <div className="bg-black/95 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/10 p-4">
        {/* Terminal header */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 pb-2 border-b border-green-500/20 overflow-hidden">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Terminal className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-400 font-mono text-xs md:text-sm tracking-wider truncate">
              NEURAL_QUERY_INTERFACE
            </span>
          </div>
          {isLoading && (
            <div className="ml-auto flex items-center gap-1 md:gap-2 flex-shrink-0">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-mono text-xs whitespace-nowrap">PROCESSING</span>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-green-500/80 font-mono text-sm">$</span>
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Enter neural query..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-green-300 placeholder-green-500/50 font-mono text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-transparent px-0"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!question.trim() || isLoading}
            size="sm"
            className="bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 hover:border-green-400/60 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs px-3"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-green-400 border-t-transparent" />
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                EXEC
              </>
            )}
          </Button>
        </form>

        {/* Status line */}
        <div className="mt-2 pt-2 border-t border-green-500/10">
          <div className="text-green-500/60 font-mono text-xs">
            {isLoading ? (
              <span className="animate-pulse">&gt; Connecting to neural networks...</span>
            ) : (
              <span>&gt; Ready for input</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
