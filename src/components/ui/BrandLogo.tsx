import { useState, useEffect } from "react";
import { websiteConfigService, DEFAULT_WEBSITE_CONFIG } from "@/lib/website-config";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
    const [logoUrl, setLogoUrl] = useState(DEFAULT_WEBSITE_CONFIG.branding.headerLogoUrl);

    useEffect(() => {
        const loadConfig = async () => {
            const config = await websiteConfigService.getConfig();
            setLogoUrl(config.branding.headerLogoUrl);
        };
        loadConfig();
    }, []);

    const sizes = {
        sm: { width: 60, height: 18 },
        md: { width: 80, height: 24 },
        lg: { width: 120, height: 36 },
        xl: { width: 160, height: 48 }
    };

    const dimensions = sizes[size];

    return (
        <Image
            src={logoUrl || "/logo.gif"}
            alt="HubSnap"
            width={dimensions.width}
            height={dimensions.height}
            className={className}
            priority
            unoptimized
        />
    );
}
