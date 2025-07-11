"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, RotateCcw } from "lucide-react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  onClearHistory?: () => void;
  isLoading: boolean;
  hasHistory?: boolean;
}

export default function QuestionInput({ onSubmit, onClearHistory, isLoading, hasHistory = false }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  const handleClearHistory = () => {
    if (onClearHistory && !isLoading) {
      onClearHistory();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask any question..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {hasHistory && (
        <div className="flex justify-center">
          <Button
            onClick={handleClearHistory}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}
