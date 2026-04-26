import { CommonService } from "@/service/commonservice.page";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth";

type BrandingSettings = {
    platformName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    darkMode?: string;
    customCss?: string;
    supportEmail?: string;
    supportUrl?: string;
    termsUrl?: string;
    privacyUrl?: string;
    loginMessage?: string;
    footerText?: string;
};

type BrandingContextType = {
    settings: BrandingSettings | null;
    isLoading: boolean;
};

const BrandingContext = createContext<BrandingContextType>({
    settings: null,
    isLoading: true,
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [settings, setSettings] = useState<BrandingSettings | null>(() => {
        try {
            const cached = localStorage.getItem("cached_branding");
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {}
        return {
            platformName: "Billing POS",
            footerText: "© 2026 Billing POS"
        };
    });
    const [isLoading, setIsLoading] = useState(!settings);

    useEffect(() => {
        // Whitelabel API call removed as requested
        setIsLoading(false);
    }, [user]);

    return (
        <BrandingContext.Provider value={{ settings, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
}

// Convert HEX to HSL so it integrates seamlessly with Tailwind CSS variables in index.css
function hexToHSL(hex: string): string {
    let r = 0, g = 0, b = 0;
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return hex; // fallback
    }

    r /= 255; g /= 255; b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `hsl(${h} ${s}% ${l}%)`;
}

function applyBranding(settings: BrandingSettings) {
    if (!settings) return;
    const root = document.documentElement;

    if (settings.primaryColor) {
        if (settings.primaryColor.startsWith("#")) {
            root.style.setProperty("--color-primary", hexToHSL(settings.primaryColor));
        } else {
            root.style.setProperty("--color-primary", settings.primaryColor);
        }
    }

    if (settings.accentColor) {
        if (settings.accentColor.startsWith("#")) {
            root.style.setProperty("--color-accent", hexToHSL(settings.accentColor));
        } else {
            root.style.setProperty("--color-accent", settings.accentColor);
        }
    }

    if (settings.customCss) {
        let styleEl = document.getElementById("whitelabel-css");
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "whitelabel-css";
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = settings.customCss;
    }

    if (settings.platformName) {
        document.title = settings.platformName;
    }

    if (settings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = settings.faviconUrl;
    }
}
