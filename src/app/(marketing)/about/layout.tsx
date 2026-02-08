import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about HubSnap's mission to empower creators. Meet our founder, Prince Kumar, and discover why we're building the operating system for the creator economy.",
    alternates: {
        canonical: "https://hubsnap.com/about",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
