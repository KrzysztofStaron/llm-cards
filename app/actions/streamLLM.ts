"use server";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Persona Chat App",
  },
});

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

const FAST_MODEL = "mistralai/ministral-3b";
const SLOW_MODEL = "google/gemini-2.5-pro";

export async function streamLLM(messages: ChatMessage[], model: "fast" | "slow") {
  const systemPrompt = generateSystemPrompt(model);

  const stream = await openai.chat.completions.create({
    model: model === "fast" ? FAST_MODEL : SLOW_MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
  });

  // Convert OpenAI stream to a standard ReadableStream
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return readableStream;
}

// Removed getStructuredDetailedResponse - no longer using multiple cards

const generateSystemPrompt = (model: "fast" | "slow") => {
  return `
    You are a helpful AI assistant in a swipe-based interface.
    
    CRITICAL: Always respond directly to the user's question. Do NOT ask unrelated questions like "What's the capital of France?" or change the topic.
    
    IMPORTANT: Keep ALL responses short enough to fit on screen without scrolling. Maximum 8-10 lines of text.
    
    ${model === "fast" && `Provide a concise, focused answer in 3-5 sentences maximum. Stay directly on topic.`}
    ${
      model === "slow" &&
      `Provide a more detailed response but still keep it under 8-10 lines total. Be comprehensive but concise.`
    }
    
    Rules:
    - Answer the user's actual question
    - Keep responses SHORT and screen-friendly
    - Do not ask irrelevant questions 
    - Do not change the subject
    - Be helpful and informative
    - Use the conversation history for context but stay focused on the current question
    
    Interaction context: Left swipe = try different approach, Right swipe = expand with more detail (but still keep it short).
  `;
};
