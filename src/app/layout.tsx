import type { Metadata } from "next";
import "./globals.css";
import { websiteConfigService } from "@/lib/website-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await websiteConfigService.getConfig();
  const title = config.seo.title || "HubSnap | The Operating System for Creators";
  const description = config.seo.description || "HubSnap is the all-in-one platform for digital creators. Manage your content, analyze performance, and grow your audience with AI-powered tools.";
  const ogImage = config.seo.ogImage || config.hero.imageUrl || "/logo.jpeg";

  return {
    title: {
      default: title,
      template: `%s | ${config.seo.title || "HubSnap"}`
    },
    description: description,
    keywords: ["creator tools", "content creation", "AI for creators", "YouTube analytics", "creator economy", "HubSnap", "Creator OS", "Digital Business Ideas", "YouTube Script Generator", "Viral Trend Detector"],
    authors: [{ name: "Prince Kumar", url: "https://hubsnap.com/founder/prince-kumar" }],
    creator: "Prince Kumar",
    publisher: "HubSnap",
    icons: {
      icon: config.branding.faviconUrl || "/hubsnap_logo.jpeg",
      shortcut: config.branding.faviconUrl || "/hubsnap_logo.jpeg",
      apple: config.branding.faviconUrl || "/hubsnap_logo.jpeg",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://hub-snap.web.app",
      title: title,
      description: description,
      siteName: "HubSnap",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "HubSnap",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImage],
      creator: "@hubsnap_os",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

import { AuthProvider } from "@/context/AuthContext";
import { HeaderTitleProvider } from "@/context/HeaderTitleContext";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <HeaderTitleProvider>
            {children}
            <Toaster position="top-center" />
          </HeaderTitleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
