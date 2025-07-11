"use client";

import { useState, useRef } from "react";
import QuestionInput from "./QuestionInput";
import CardSwipeable from "./CardSwipeable";
import { streamLLM, getStructuredDetailedResponse } from "@/app/actions/streamLLM";

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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DetailedLoadingCard = () => (
  <div className="relative h-[400px]">
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="relative w-full max-w-3xl h-[380px] flex flex-col transition-transform border-border/50 bg-card shadow-lg rounded-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">🧠 Analyzing & Structuring</p>
              <p className="text-sm text-muted-foreground">Breaking down the response into digestible sections...</p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CardInterface() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDetailed, setIsGeneratingDetailed] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build conversation history from existing cards
  const buildConversationHistory = (includeCurrentIndex: number = -1): ChatMessage[] => {
    const messages: ChatMessage[] = [];

    // Get all cards except the current one being generated (reverse order for chronological)
    const relevantCards = cards
      .slice()
      .reverse()
      .filter((_, index) => {
        const reversedIndex = cards.length - 1 - index;
        return includeCurrentIndex === -1 || reversedIndex !== includeCurrentIndex;
      });

    // Add conversation pairs
    relevantCards.forEach(card => {
      if (card.response.trim()) {
        messages.push({ role: "user", content: card.question });
        messages.push({ role: "assistant", content: card.response });
      }
    });

    return messages;
  };

  const generateReasoningBadges = (question: string, response: string): string[] => {
    // Simple heuristic to generate alternative reasoning directions
    // In a real app, this could be AI-generated or more sophisticated
    const badges: string[] = [];

    if (question.toLowerCase().includes("virus")) {
      if (response.toLowerCase().includes("biological") || response.toLowerCase().includes("disease")) {
        badges.push("computer viruses", "antivirus software");
      } else if (response.toLowerCase().includes("computer") || response.toLowerCase().includes("software")) {
        badges.push("biological viruses", "immune system");
      }
    }

    if (question.toLowerCase().includes("memory")) {
      if (response.toLowerCase().includes("computer") || response.toLowerCase().includes("ram")) {
        badges.push("human memory", "psychology");
      } else if (response.toLowerCase().includes("brain") || response.toLowerCase().includes("remember")) {
        badges.push("computer memory", "storage");
      }
    }

    if (question.toLowerCase().includes("network")) {
      if (response.toLowerCase().includes("computer") || response.toLowerCase().includes("internet")) {
        badges.push("social networks", "professional networking");
      } else if (response.toLowerCase().includes("social") || response.toLowerCase().includes("people")) {
        badges.push("computer networks", "technical networking");
      }
    }

    if (question.toLowerCase().includes("security")) {
      badges.push("cyber security", "physical security", "financial security");
    }

    if (question.toLowerCase().includes("cloud")) {
      if (response.toLowerCase().includes("computing") || response.toLowerCase().includes("server")) {
        badges.push("weather clouds", "meteorology");
      } else {
        badges.push("cloud computing", "technology");
      }
    }

    // Generic alternatives
    if (badges.length === 0) {
      badges.push("technical approach", "practical approach", "theoretical approach");
    }

    return badges.slice(0, 3); // Limit to 3 badges
  };

  const streamResponse = async (
    messages: ChatMessage[],
    modelType: "fast" | "slow",
    modelName: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<() => void> => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const abortFunction = () => {
      abortController.abort();
      abortControllerRef.current = null;
    };

    try {
      // Get the readable stream from streamLLM
      const stream = await streamLLM(messages, modelType);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              onComplete();
              break;
            }

            // Check if aborted
            if (abortController.signal.aborted) {
              reader.cancel();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          onError(error as Error);
        }
      };

      readStream();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return abortFunction;
      }
      onError(error as Error);
    }

    return abortFunction;
  };

  const handleQuestionSubmit = async (question: string) => {
    setIsLoading(true);

    // Create a new card with empty response
    const newCard: CardData = {
      id: Date.now().toString(),
      question,
      response: "",
      model: "mistralai/ministral-3b",
      timestamp: new Date(),
      isStreaming: true,
      state: "fast_responding",
    };

    setCards([newCard, ...cards]);
    setCurrentCardIndex(0);

    // Build conversation history and add current question
    const conversationHistory = buildConversationHistory();
    const messages: ChatMessage[] = [...conversationHistory, { role: "user", content: question }];

    // Start streaming with fast model
    let isFirstChunk = true;
    const abort = await streamResponse(
      messages,
      "fast",
      "mistralai/ministral-3b",
      chunk => {
        // Stop loading state on first chunk
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }

        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              response: updatedCards[0].response + chunk,
            };
          }
          return updatedCards;
        });
      },
      () => {
        // Mark fast response as complete and generate badges
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            const finalResponse = updatedCards[0].response;
            const badges = generateReasoningBadges(question, finalResponse);
            updatedCards[0] = {
              ...updatedCards[0],
              isStreaming: false,
              state: "fast_complete",
              reasoningBadges: badges,
            };
          }
          return updatedCards;
        });
        abortControllerRef.current = null;
      },
      error => {
        console.error("Error streaming response:", error);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    );
  };

  const handleBadgeClick = async (badge: string) => {
    if (cards.length === 0) return;

    const currentCard = cards[currentCardIndex];
    if (currentCard.state !== "fast_complete") return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(true);

    // Update current card to regenerating state
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      if (updatedCards[currentCardIndex]) {
        updatedCards[currentCardIndex] = {
          ...updatedCards[currentCardIndex],
          response: "",
          isStreaming: true,
          state: "fast_responding",
          reasoningBadges: undefined,
          detailedSections: undefined,
        };
      }
      return updatedCards;
    });

    // Build conversation history and add steering instruction
    const conversationHistory = buildConversationHistory(currentCardIndex);
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: `${currentCard.question}\n\nPlease focus specifically on: ${badge}` },
    ];

    // Start streaming with fast model for steered response
    let isFirstChunk = true;
    const abort = await streamResponse(
      messages,
      "fast",
      "mistralai/ministral-3b",
      chunk => {
        // Stop loading state on first chunk
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }

        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              response: updatedCards[currentCardIndex].response + chunk,
            };
          }
          return updatedCards;
        });
      },
      () => {
        // Mark fast response as complete and generate new badges
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            const finalResponse = updatedCards[currentCardIndex].response;
            const badges = generateReasoningBadges(currentCard.question, finalResponse);
            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              isStreaming: false,
              state: "fast_complete",
              reasoningBadges: badges,
            };
          }
          return updatedCards;
        });
        abortControllerRef.current = null;
      },
      error => {
        console.error("Error streaming response:", error);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    );
  };

  const handleSwipeLeft = async () => {
    if (cards.length === 0) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const currentCard = cards[currentCardIndex];
    setIsLoading(true);

    // Create a new card with empty response
    const newCard: CardData = {
      id: Date.now().toString(),
      question: currentCard.question,
      response: "",
      model: "mistralai/ministral-3b",
      timestamp: new Date(),
      isStreaming: true,
      state: "fast_responding",
    };

    setCards([newCard, ...cards]);
    setCurrentCardIndex(0);

    // Build conversation history excluding current card and add rejection feedback
    const conversationHistory = buildConversationHistory(currentCardIndex);
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: currentCard.question },
      { role: "assistant", content: currentCard.response },
      { role: "user", content: "I don't like this reasoning, approach the problem in another way" },
    ];

    // Start streaming with fast model for new approach
    let isFirstChunk = true;
    const abort = await streamResponse(
      messages,
      "fast",
      "mistralai/ministral-3b",
      chunk => {
        // Stop loading state on first chunk
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }

        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              response: updatedCards[0].response + chunk,
            };
          }
          return updatedCards;
        });
      },
      () => {
        // Mark fast response as complete and generate badges
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            const finalResponse = updatedCards[0].response;
            const badges = generateReasoningBadges(currentCard.question, finalResponse);
            updatedCards[0] = {
              ...updatedCards[0],
              isStreaming: false,
              state: "fast_complete",
              reasoningBadges: badges,
            };
          }
          return updatedCards;
        });
        abortControllerRef.current = null;
      },
      error => {
        console.error("Error streaming response:", error);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    );
  };

  const handleSwipeRight = async () => {
    if (cards.length === 0) return;

    const currentCard = cards[currentCardIndex];

    // Only allow expansion from fast_complete state
    if (currentCard.state !== "fast_complete") return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsGeneratingDetailed(true);

    // Update current card to detailed responding state
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      if (updatedCards[currentCardIndex]) {
        updatedCards[currentCardIndex] = {
          ...updatedCards[currentCardIndex],
          model: "google/gemini-2.5-pro",
          isStreaming: false,
          state: "detailed_responding",
          reasoningBadges: undefined,
        };
      }
      return updatedCards;
    });

    try {
      // Build conversation history excluding current card and add expansion request
      const conversationHistory = buildConversationHistory(currentCardIndex);
      const messages: ChatMessage[] = [
        ...conversationHistory,
        { role: "user", content: currentCard.question },
        { role: "assistant", content: currentCard.response },
        {
          role: "user",
          content:
            "I like this approach. Please provide a more comprehensive, detailed, and improved answer. Build upon the good points, correct any limitations, add more depth and nuance, and provide additional insights or examples.",
        },
      ];

      // Get structured detailed response from LLM
      const sections = await getStructuredDetailedResponse(messages);

      setCards(prevCards => {
        const updatedCards = [...prevCards];
        if (updatedCards[currentCardIndex]) {
          updatedCards[currentCardIndex] = {
            ...updatedCards[currentCardIndex],
            isStreaming: false,
            state: "detailed_complete",
            detailedSections: sections,
            response: "", // Clear the temporary message
          };
        }
        return updatedCards;
      });
    } catch (error) {
      console.error("Error getting structured response:", error);
      setCards(prevCards => {
        const updatedCards = [...prevCards];
        if (updatedCards[currentCardIndex]) {
          updatedCards[currentCardIndex] = {
            ...updatedCards[currentCardIndex],
            isStreaming: false,
            state: "fast_complete", // Revert to previous state
            response: currentCard.response, // Restore original response
            reasoningBadges: generateReasoningBadges(currentCard.question, currentCard.response),
          };
        }
        return updatedCards;
      });
    } finally {
      setIsGeneratingDetailed(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setCards([]);
    setCurrentCardIndex(0);
    setIsLoading(false);
    setIsGeneratingDetailed(false);
  };

  const currentCard = cards[currentCardIndex];
  const hasDetailedSections = currentCard?.detailedSections && currentCard.detailedSections.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <QuestionInput
        onSubmit={handleQuestionSubmit}
        onClearHistory={handleClearHistory}
        isLoading={isLoading || isGeneratingDetailed}
        hasHistory={cards.length > 0}
      />

      {currentCard && (
        <div className={hasDetailedSections || isGeneratingDetailed ? "space-y-6" : "relative h-[600px]"}>
          {isGeneratingDetailed ? (
            // Show detailed loading state
            <DetailedLoadingCard />
          ) : hasDetailedSections ? (
            // Display detailed sections as separate card containers
            <>
              {currentCard.detailedSections!.map((section, index) => (
                <div key={index} className="relative h-[400px]">
                  <CardSwipeable
                    card={{
                      ...currentCard,
                      response: section.content,
                      detailedSections: undefined,
                      reasoningBadges: undefined,
                      sectionTitle: section.title,
                    }}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                    onBadgeClick={() => {}}
                    isLoading={false}
                    isDetailedSection={true}
                  />
                </div>
              ))}
            </>
          ) : (
            // Display single card
            <CardSwipeable
              card={currentCard}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onBadgeClick={handleBadgeClick}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {cards.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentCardIndex ? "bg-purple-500 w-8" : "bg-muted hover:bg-muted-foreground/30 w-2"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}

      {!currentCard && !isLoading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Ask a question to get started</p>
        </div>
      )}
    </div>
  );
}
