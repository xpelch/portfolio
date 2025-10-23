import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DynamicLang from "@/components/DynamicLang";
import HydrationBoundary from "@/components/ui/HydrationBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xavier Pelchat",
  description: "Professional portfolio showcasing my experience, education, and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
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
