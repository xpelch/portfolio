import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DynamicLang from "@/components/DynamicLang";
import HydrationBoundary from "@/components/ui/HydrationBoundary";

const inter = Inter({ subsets: ["latin"] });

const title = "Xavier Pelchat – Full-Stack Developer (.NET / React)";
const description = "Full-stack engineer building production-ready web apps.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/window.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/window.svg"],
  },
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
