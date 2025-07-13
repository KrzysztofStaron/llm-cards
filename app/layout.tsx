import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LLM Cards - AI-Powered Study Flashcards",
    template: "%s | LLM Cards",
  },
  description:
    "Create and study with AI-generated flashcards. Generate personalized study cards instantly using advanced language models for efficient learning.",
  keywords: [
    "flashcards",
    "AI study cards",
    "LLM flashcards",
    "study app",
    "AI learning",
    "personalized learning",
    "study tools",
    "education technology",
    "AI-powered learning",
  ],
  authors: [{ name: "LLM Cards Team" }],
  creator: "LLM Cards",
  publisher: "LLM Cards",
  metadataBase: new URL("https://llm-cards.vercel.app"), // Update with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://llm-cards.vercel.app", // Update with your actual domain
    title: "LLM Cards - AI-Powered Study Flashcards",
    description:
      "Create and study with AI-generated flashcards. Generate personalized study cards instantly using advanced language models for efficient learning.",
    siteName: "LLM Cards",
    images: [
      {
        url: "/og-image.jpg", // You'll need to create this image
        width: 1200,
        height: 630,
        alt: "LLM Cards - AI-Powered Study Flashcards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM Cards - AI-Powered Study Flashcards",
    description:
      "Create and study with AI-generated flashcards. Generate personalized study cards instantly using advanced language models.",
    images: ["/og-image.jpg"], // You'll need to create this image
    creator: "@llmcards", // Update with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
