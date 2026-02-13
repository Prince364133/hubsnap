import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Digital Business Ideas & Resources",
    description: "Explore curated digital business ideas, freelancing kits, blueprints, and templates. Start your journey with AI-powered resources.",
    keywords: ["digital business ideas", "online business", "freelancing kits", "business blueprints", "AI business tools", "side hustle ideas"],
    openGraph: {
        title: "Digital Business Ideas & Resources | HubSnap",
        description: "Explore curated digital business ideas, freelancing kits, blueprints, and templates.",
        type: "website",
        url: "https://hubsnap.com/digital-business-ideas",
        images: [{ url: "/logo.jpeg", width: 800, height: 600, alt: "HubSnap Digital Business Ideas" }],
        siteName: "HubSnap",
    },
    alternates: {
        canonical: "https://hubsnap.com/digital-business-ideas",
    },
};

export default function GuidesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
