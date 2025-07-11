"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 h-12 text-lg bg-background/50 backdrop-blur-sm border-purple-400/30 focus:border-purple-400"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!question.trim() || isLoading}
          className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
