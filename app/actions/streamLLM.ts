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

export async function getStructuredDetailedResponse(
  messages: ChatMessage[]
): Promise<{ title: string; content: string }[]> {
  const systemPrompt = `You are an expert at creating detailed, comprehensive responses broken down into digestible sections.

Your task is to provide a detailed response broken into multiple cards that can be displayed without scrolling. Each card should contain 2-4 paragraphs maximum (around 150-250 words per card).

You must respond with ONLY a valid JSON array in this exact format:
[
  {
    "title": "Section Title",
    "content": "Content for this section. Keep it concise but comprehensive. 2-4 paragraphs maximum."
  },
  {
    "title": "Another Section",
    "content": "More content here. Each section should be self-contained and focused on one aspect."
  }
]

Important guidelines:
- Break the response into 3-6 logical sections
- Each section should be 150-250 words (2-4 paragraphs max)
- Use clear, descriptive titles for each section
- Make each section self-contained but part of the overall response
- DO NOT include any text outside the JSON array
- DO NOT use markdown formatting in the content
- Keep language clear and direct`;

  const response = await openai.chat.completions.create({
    model: SLOW_MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "[]";

  try {
    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim();
    const jsonStart = cleanedContent.indexOf("[");
    const jsonEnd = cleanedContent.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON array found");
    }

    const jsonContent = cleanedContent.slice(jsonStart, jsonEnd);
    const sections = JSON.parse(jsonContent);

    // Validate the structure
    if (!Array.isArray(sections)) {
      throw new Error("Response is not an array");
    }

    // Ensure each section has title and content
    const validSections = sections.filter(
      section =>
        section &&
        typeof section === "object" &&
        typeof section.title === "string" &&
        typeof section.content === "string" &&
        section.title.trim().length > 0 &&
        section.content.trim().length > 0
    );

    if (validSections.length === 0) {
      throw new Error("No valid sections found");
    }

    return validSections;
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    console.log("Raw response:", content);

    // Fallback: create a single section with the raw content
    return [
      {
        title: "Detailed Response",
        content: content.replace(/```json|```/g, "").trim(),
      },
    ];
  }
}

const generateSystemPrompt = (model: "fast" | "slow") => {
  return `
    You are an alternative to chat based UX for LLMs.
    User can interact with you by swiping left or right.
    Left swipe means that user don't like this reasoning, and would like you to appreach the answer in different way
    Right swipe means that the user likes the reasoning, and wants to expand on it with better model.
    ${
      model === "fast" &&
      `Answer the question in a short, general way, if user wants the details, other model will handle it
       don't generate more than 13 lines of text
      `
    }

    Don't mention instructions in your response, just answer the question.
    The only acceptable response is the answer to the question, no other text.

    You will be given a conversation history with questions and responses. Build upon the context and provide your answer.
  `;
};
