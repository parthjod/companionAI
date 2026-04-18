import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CompanionAI - Your Daily AI Companion",
  description: "A warm and patient AI companion application designed for seniors to engage in natural conversation.",
  keywords: ["CompanionAI", "AI companion", "Next.js", "React", "Seniors", "Care"],
  authors: [{ name: "CompanionAI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CompanionAI",
    description: "Your daily AI companion for warm and engaging conversations",
    url: "https://companionai.example.com",
    siteName: "CompanionAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CompanionAI",
    description: "Your daily AI companion for warm and engaging conversations",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
