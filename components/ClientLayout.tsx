"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FloatingSettingsButton from "./FloatingSettingsButton";

// FontAwesome Config
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initialize Theme
        const storedTheme = localStorage.getItem("theme") || "emerald";
        document.documentElement.setAttribute("data-theme", storedTheme);
        setMounted(true);

        // Register Service Worker
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("Service Worker registered: ", registration);
                })
                .catch((error) => {
                    console.error("Service Worker registration failed: ", error);
                });
        }
    }, []);

    // Prevent hydration mismatch for theme-dependent UI if necessary,
    // but for the FAB and body content, pure rendering is fine.
    
    const showFab = pathname !== "/welcome" && pathname !== "/";

    return (
        <>
            {children}
            {mounted && showFab && <FloatingSettingsButton />}
        </>
    );
}
