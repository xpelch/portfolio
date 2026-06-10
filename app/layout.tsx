import type { Metadata } from "next";
import { Azeret_Mono, Libre_Baskerville, Work_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DynamicLang from "@/components/DynamicLang";
import HydrationBoundary from "@/components/ui/HydrationBoundary";

const bodyFont = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const title = "Xavier Pelchat - Full-Stack Developer & AI Workflows";
const description = "Full-stack engineer in Quebec building production-ready .NET, React, and practical AI workflow systems.";

export const metadata: Metadata = {
  metadataBase: new URL("https://xpelch.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/images/developer-workspace.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/developer-workspace.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`} suppressHydrationWarning={true}>
        <HydrationBoundary>
          <LanguageProvider>
            <DynamicLang />
            {children}
            <LanguageSwitcher />
          </LanguageProvider>
        </HydrationBoundary>
      </body>
    </html>
  );
}
