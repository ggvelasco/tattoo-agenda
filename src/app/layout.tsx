import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

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
  title: " Tattooagenda — Gerencie seu estúdio de tatuagem com facilidade",
  description:
    "Gerencie seu estúdio de tatuagem com facilidade usando nosso painel de controle intuitivo e eficiente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <TooltipProvider>
          <ThemeProvider>
            {children}
            <Analytics />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
