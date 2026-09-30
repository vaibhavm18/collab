import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { ThemeScript } from "@/components/theme-script";
import { Instrument_Serif, DM_Sans, Geist_Mono } from "next/font/google";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "A collaborative workspace for teams to shape ideas and move forward together.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CollabBoard",
    template: "%s | CollabBoard",
  },
  description,
  openGraph: {
    title: "CollabBoard",
    description,
    url: siteUrl,
    siteName: "CollabBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollabBoard",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        serif.variable,
        sans.variable, 
        mono.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeScript />
        <SmoothScrollProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
