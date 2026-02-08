import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Creator OS",
    description: "The flagship operating system for creators. AI-powered channel growth, idea generation, and content optimization.",
    alternates: {
        canonical: "https://hubsnap.com/products/creator-os",
    },
};

export default function CreatorOSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
