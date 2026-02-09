import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HubSnap | The Operating System for Creators",
    template: "%s | HubSnap"
  },
  description: "HubSnap is the all-in-one platform for digital creators. Manage your content, analyze performance, and grow your audience with AI-powered tools.",
  keywords: ["creator tools", "content creation", "AI for creators", "YouTube analytics", "creator economy", "HubSnap", "Creator OS", "Digital Business Ideas", "YouTube Script Generator", "Viral Trend Detector"],
  authors: [{ name: "Prince Kumar", url: "https://hubsnap.com/founder/prince-kumar" }],
  creator: "Prince Kumar",
  publisher: "HubSnap",
  icons: {
    icon: "/hubsnap_logo.jpeg",
    shortcut: "/hubsnap_logo.jpeg",
    apple: "/hubsnap_logo.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hubsnap.com",
    title: "HubSnap | The Operating System for Creators",
    description: "HubSnap is the all-in-one platform for digital creators. Manage your content, analyze performance, and grow your audience with AI-powered tools.",
    siteName: "HubSnap",
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 600,
        alt: "HubSnap Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HubSnap | The Operating System for Creators",
    description: "HubSnap is the all-in-one platform for digital creators. Manage your content, analyze performance, and grow your audience with AI-powered tools.",
    images: ["/logo.jpeg"],
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

import { AuthProvider } from "@/context/AuthContext";
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
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
