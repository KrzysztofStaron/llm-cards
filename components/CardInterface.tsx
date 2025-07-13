"use client";

import { useState, useRef } from "react";
import QuestionInput from "./QuestionInput";
import CardSwipeable from "./CardSwipeable";
import { streamLLM, generateReasoningBadges } from "@/app/actions/streamLLM";

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
  cachedDetailedResponse?: string; // Cache for detailed response
  detailedResponses?: string[]; // Array of multiple detailed responses
  currentDetailedIndex?: number; // Current detailed response index
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface CardSwipeableProps {
  card: CardData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onBadgeClick: (badge: string) => void;
  onCycleDetailed: () => void;
  isLoading: boolean;
  isDetailedSection?: boolean;
}

export default function CardInterface() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  const cacheDetailedResponse = async (cardId: string, question: string, messages: ChatMessage[]) => {
    try {
      // Build messages for detailed response
      const detailedMessages: ChatMessage[] = [
        ...messages,
        {
          role: "user",
          content:
            "Please provide a more comprehensive, detailed, and improved answer. Keep it concise and screen-friendly (under 10 lines).",
        },
      ];

      let cachedResponse = "";

      // Stream the detailed response in background
      await streamResponse(
        detailedMessages,
        "slow",
        "google/gemini-2.5-pro",
        chunk => {
          cachedResponse += chunk;
        },
        () => {
          // Cache the completed response
          setCards(prevCards => {
            const updatedCards = [...prevCards];
            const cardIndex = updatedCards.findIndex(card => card.id === cardId);
            if (cardIndex >= 0) {
              updatedCards[cardIndex] = {
                ...updatedCards[cardIndex],
                cachedDetailedResponse: cachedResponse,
              };
            }
            return updatedCards;
          });
        },
        error => {
          console.error("Error caching detailed response:", error);
        }
      );
    } catch (error) {
      console.error("Error caching detailed response:", error);
    }
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
    let rawResponse = "";
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
        rawResponse += chunk;
        // Show partial response as plain text for streaming effect
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              response: rawResponse,
            };
          }
          return updatedCards;
        });
      },
      async () => {
        // Generate badges after response is complete
        const badges = await generateReasoningBadges(rawResponse, question);

        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              isStreaming: false,
              state: "fast_complete",
              response: rawResponse,
              reasoningBadges: badges.length ? badges : ["More Info", "Related Topics", "Deep Dive"],
            };
          }
          return updatedCards;
        });
        // Start caching detailed response in background
        cacheDetailedResponse(newCard.id, question, messages);
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
    let rawResponse = "";
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
        rawResponse += chunk;
        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              response: rawResponse,
            };
          }
          return updatedCards;
        });
      },
      async () => {
        // Generate badges after response is complete
        const badges = await generateReasoningBadges(
          rawResponse,
          `${currentCard.question}\n\nPlease focus specifically on: ${badge}`
        );

        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              isStreaming: false,
              state: "fast_complete",
              response: rawResponse,
              reasoningBadges: badges.length ? badges : ["More Info", "Related Topics", "Deep Dive"],
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
      { role: "user", content: "user doesn't like this approach, try something else." },
    ];

    // Start streaming with fast model for new approach
    let isFirstChunk = true;
    let rawResponse = "";
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
        rawResponse += chunk;
        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              response: rawResponse,
            };
          }
          return updatedCards;
        });
      },
      async () => {
        // Generate badges after response is complete
        const badges = await generateReasoningBadges(rawResponse, currentCard.question);

        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[0].id === newCard.id) {
            updatedCards[0] = {
              ...updatedCards[0],
              isStreaming: false,
              state: "fast_complete",
              response: rawResponse,
              reasoningBadges: badges.length ? badges : ["More Info", "Related Topics", "Deep Dive"],
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

    // Initialize detailed responses array if it doesn't exist
    if (!currentCard.detailedResponses) {
      setCards(prevCards => {
        const updatedCards = [...prevCards];
        if (updatedCards[currentCardIndex]) {
          updatedCards[currentCardIndex] = {
            ...updatedCards[currentCardIndex],
            detailedResponses: [],
            currentDetailedIndex: 0,
          };
        }
        return updatedCards;
      });
    }

    // Get current index and increment it
    const currentIndex = currentCard.currentDetailedIndex || 0;
    const detailedResponses = currentCard.detailedResponses || [];

    // Check if we have a cached detailed response for the current index
    if (detailedResponses[currentIndex]) {
      // Use cached response immediately
      setCards(prevCards => {
        const updatedCards = [...prevCards];
        if (updatedCards[currentCardIndex]) {
          updatedCards[currentCardIndex] = {
            ...updatedCards[currentCardIndex],
            model: "google/gemini-2.5-pro",
            response: detailedResponses[currentIndex],
            state: "detailed_complete",
            reasoningBadges: undefined,
            currentDetailedIndex: currentIndex,
          };
        }
        return updatedCards;
      });
      return;
    }

    setIsLoading(true);

    // Update current card to detailed responding state
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      if (updatedCards[currentCardIndex]) {
        updatedCards[currentCardIndex] = {
          ...updatedCards[currentCardIndex],
          model: "google/gemini-2.5-pro",
          isStreaming: true,
          state: "detailed_responding",
          reasoningBadges: undefined,
          response: "",
          currentDetailedIndex: currentIndex,
        };
      }
      return updatedCards;
    });

    // Build conversation history excluding current card and add expansion request
    const conversationHistory = buildConversationHistory(currentCardIndex);
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: currentCard.question },
      { role: "assistant", content: currentCard.response },
      {
        role: "user",
        content: `user likes this approach. Please provide a more comprehensive, detailed, and improved answer (variation ${
          currentIndex + 1
        }). Keep it concise and screen-friendly (under 10 lines).`,
      },
    ];

    // Start streaming with slow model for enhanced response
    let isFirstChunk = true;
    let rawDetailedResponse = "";

    const abort = await streamResponse(
      messages,
      "slow",
      "google/gemini-2.5-pro",
      chunk => {
        // Stop loading state on first chunk
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }

        rawDetailedResponse += chunk;

        // Update the card's response as chunks arrive
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              response: rawDetailedResponse,
            };
          }
          return updatedCards;
        });
      },
      () => {
        // Mark detailed response as complete and cache it
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          if (updatedCards[currentCardIndex]) {
            const currentDetailedResponses = updatedCards[currentCardIndex].detailedResponses || [];
            const newDetailedResponses = [...currentDetailedResponses];
            newDetailedResponses[currentIndex] = rawDetailedResponse;

            updatedCards[currentCardIndex] = {
              ...updatedCards[currentCardIndex],
              isStreaming: false,
              state: "detailed_complete",
              response: rawDetailedResponse,
              detailedResponses: newDetailedResponses,
            };
          }
          return updatedCards;
        });
        abortControllerRef.current = null;
      },
      error => {
        console.error("Error streaming detailed response:", error);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    );
  };

  const cycleDetailedResponse = () => {
    if (cards.length === 0) return;

    const currentCard = cards[currentCardIndex];
    if (currentCard.state !== "detailed_complete") return;

    const detailedResponses = currentCard.detailedResponses || [];
    const currentIndex = currentCard.currentDetailedIndex || 0;
    const nextIndex = (currentIndex + 1) % Math.max(detailedResponses.length, 1);

    setCards(prevCards => {
      const updatedCards = [...prevCards];
      if (updatedCards[currentCardIndex]) {
        updatedCards[currentCardIndex] = {
          ...updatedCards[currentCardIndex],
          currentDetailedIndex: nextIndex,
          response: detailedResponses[nextIndex] || updatedCards[currentCardIndex].response,
        };
      }
      return updatedCards;
    });
  };

  const currentCard = cards[currentCardIndex];
  const hasDetailedSections = currentCard?.detailedSections && currentCard.detailedSections.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <QuestionInput onSubmit={handleQuestionSubmit} isLoading={isLoading} />
      </div>

      {currentCard && (
        <div className="flex-1 min-h-0 relative">
          <CardSwipeable
            card={currentCard}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onBadgeClick={handleBadgeClick}
            onCycleDetailed={cycleDetailedResponse}
            isLoading={isLoading}
          />
        </div>
      )}

      {cards.length > 1 && (
        <div className="flex justify-center gap-2 py-2 flex-shrink-0">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentCardIndex ? "bg-green-400 w-6" : "bg-green-800 hover:bg-green-600 w-1"
              }`}
              aria-label={`Go to terminal ${index + 1}`}
            />
          ))}
        </div>
      )}

      {!currentCard && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-green-500/80 text-lg font-mono">&gt; READY_FOR_INPUT...</p>
            <p className="text-green-700/60 text-sm mt-2">[AWAITING_NEURAL_QUERY]</p>
          </div>
        </div>
      )}
    </div>
  );
}
