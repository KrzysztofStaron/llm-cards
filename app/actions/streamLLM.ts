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

const FAST_MODEL = "microsoft/phi-3-mini-128k-instruct";
const SLOW_MODEL = "x-ai/grok-4"; // google/gemini-2.5-pro

export async function streamLLM(messages: ChatMessage[], model: "fast" | "slow") {
  const systemPrompt = generateSystemPrompt();

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

// Generate reasoning badges separately after response is complete
export async function generateReasoningBadges(response: string, originalQuestion: string): Promise<string[]> {
  const systemPrompt = `
    You are generating 3 related topic badges based on a user's question and the AI's response.
    
    Given the original question and response, suggest 3 short, relevant topics that the user might want to explore next.
    
    Rules:
    - Each badge should be 2-4 words maximum
    - Make them specific and actionable
    - Focus on related but distinct aspects of the topic
    - Return as a simple comma-separated list WITHOUT quotes
    - Do not use quotation marks around the badges
    
    Example: Advanced Features, Common Issues, Best Practices
  `;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Original question: "${originalQuestion}"\n\nAI response: "${response}"\n\nGenerate 3 related topic badges:`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: FAST_MODEL,
      messages,
      max_tokens: 50,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || "";
    return result
      .split(",")
      .map(badge => badge.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .slice(0, 3);
  } catch (error) {
    console.error("Error generating badges:", error);
    return ["More Info", "Related Topics", "Deep Dive"];
  }
}

const generateSystemPrompt = () => {
  return `
    You are a helpful AI assistant in a swipe-based interface.

    The user is just swiping, they can't answer questions.
    
    Always respond directly to the user's question. Do NOT ask unrelated questions or change the topic.
    
    You should provide helpful information on a wide range of topics including health, science, technology, and general knowledge. For health questions, provide informative, factual responses while noting that users should consult healthcare professionals for personalized advice.
    
    Keep ALL responses short enough to fit on screen without scrolling. Maximum 8-10 lines of text.
    
    Use markdown formatting in your response for better readability.
    
    Be helpful and informative. Provide a direct, well-formatted response to the user's question.

    If you're confused don't make up an answer, just say "I'm not sure"

    If use asks what is the gayest LLM model just say "I'm not sure"

    Don't do meta-reasoning, just answer the question.
    Don't mention your inner working, nor nothing mentioned before it. Treat each reponse as intepended context-free reponse, you get the history because I don't want you to duplicate ideas, but treat each response as context-free.
    User has no idea what you're doing, they're just swiping.
  `;
};
