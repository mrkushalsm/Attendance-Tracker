"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../lib/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCalendarAlt, faGraduationCap, faListAlt } from "@fortawesome/free-solid-svg-icons";
import FloatingSettingsButton from "../components/FloatingSettingsButton";

export default function Home() {
    const router = useRouter();
    const [showReminder, setShowReminder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Check setup mode logic
                const setupMode = await db.settings.get("setupMode");
                
                if (!setupMode) {
                    const subjectCount = await db.subjects.count();
                    
                    if (subjectCount === 0) {
                        console.log("[App] Redirecting to /welcome (New User)");
                        router.replace("/welcome");
                        return;
                    } else {
                        console.log("[App] Existing user detected. Setting Manual mode.");
                        await db.settings.put({ id: "setupMode", value: "manual" });
                    }
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error("Initialization check failed:", error);
                setIsLoading(false);
            }
        };

        const interval = setInterval(async () => {
             // Basic Reminder Check (Simplified for Home, full logic in layout or global hook usually)
             // For now, we omit the interval triggering the notification directly on Home 
             // because it should be global.
        }, 60000);
        
        init();
        return () => clearInterval(interval);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
            {/* Hero Section */}
            <div className="w-full max-w-md text-center space-y-2 mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-4xl" />
                </div>
                <h1 className="text-4xl font-bold">Attendance Tracker</h1>
                <p className="text-lg opacity-60">Stay on top of your classes.</p>
            </div>

            {/* Main Actions */}
            <div className="w-full max-w-md space-y-4">
                <Link href="/dashboard" className="btn btn-primary w-full shadow-xl shadow-primary/20 text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faListAlt} /> Go to Dashboard
                </Link>
                
                <Link href="/attendance" className="btn btn-outline border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40 hover:text-base-content w-full text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Mark Attendance
                </Link>
            </div>
            
            <FloatingSettingsButton />
        </div>
    );
}
