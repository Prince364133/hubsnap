import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore Tools",
    description: "Discover our curated directory of 650+ AI tools for creators. Filter by category, price, and use case to find the perfect tool for your workflow.",
    alternates: {
        canonical: "https://hubsnap.com/explore",
    },
};

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
