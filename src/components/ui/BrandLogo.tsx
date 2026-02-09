import Image from "next/image";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
    const sizes = {
        sm: { width: 60, height: 18 },
        md: { width: 80, height: 24 },
        lg: { width: 120, height: 36 },
        xl: { width: 160, height: 48 }
    };

    const dimensions = sizes[size];

    return (
        <Image
            src="/logo.gif"
            alt="HubSnap"
            width={dimensions.width}
            height={dimensions.height}
            className={className}
            priority
        />
    );
}
