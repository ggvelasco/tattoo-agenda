import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Unbounded, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
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
        className={`${unbounded.variable} ${inter.variable} antialiased font-sans`}
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
