import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prince Kumar | Founder & CEO",
    description: "Meet Prince Kumar, Founder & CEO of HubSnap. A developer and entrepreneur passionate about democratization of AI tools for creators.",
    alternates: {
        canonical: "https://hubsnap.com/founder/prince-kumar",
    },
    openGraph: {
        title: "Prince Kumar | Founder & CEO of HubSnap",
        description: "Building the operating system for digital creators. Connect with Prince Kumar on LinkedIn and Instagram.",
        images: ["/logo.jpeg"], // Or specific founder image if available
    }
};

export default function FounderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
