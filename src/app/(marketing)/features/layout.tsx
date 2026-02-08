import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features",
    description: "Explore the powerful features of HubSnap. From AI content generation to advanced analytics, we have everything you need to grow.",
    alternates: {
        canonical: "https://hubsnap.com/features",
    },
};

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
