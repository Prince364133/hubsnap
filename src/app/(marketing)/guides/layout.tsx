import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Guides & Resources",
    description: "Comprehensive guides, blueprints, and templates for digital creators. Learn how to grow your audience and monetize your content.",
    alternates: {
        canonical: "https://hubsnap.com/guides",
    },
};

export default function GuidesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
