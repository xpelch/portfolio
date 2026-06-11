import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DynamicLang from "@/components/DynamicLang";
import HydrationBoundary from "@/components/ui/HydrationBoundary";

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
      <body suppressHydrationWarning={true}>
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
