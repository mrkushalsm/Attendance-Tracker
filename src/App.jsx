import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { db } from "./database/db";
import { checkReminder } from "./utils/reminder";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import SettingsPage from "./pages/SettingsPage";
import SubjectHistoryPage from "./pages/SubjectHistoryPage";
import WelcomePage from "./pages/WelcomePage";
import FloatingSettingsButton from "./components/FloatingSettingsButton";

const AppContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [hasFatalError, setHasFatalError] = useState(false);

    // Initial Onboarding Check
    useEffect(() => {
        const init = async () => {
            try {
                // If already on welcome, stop checking
                if (location.pathname === '/welcome') {
                    setIsChecking(false);
                    return;
                }

                const setupMode = await db.settings.get("setupMode");
                console.log("[App] Setup Mode:", setupMode);
                
                if (!setupMode) {
                    const subjectCount = await db.subjects.count();
                    console.log("[App] Subject Count:", subjectCount);
                    
                    if (subjectCount === 0) {
                        console.log("[App] Redirecting to /welcome (New User)");
                        // Truly new user -> Force Welcome
                        // Using replace: true to prevent back-button loop
                        navigate("/welcome", { replace: true });
                    } else {
                        console.log("[App] Existing user detected. Setting Manual mode.");
                        // Existing user (migrating) -> Set Manual mode silently
                        await db.settings.put({ id: "setupMode", value: "manual" });
                    }
                } else {
                    console.log("[App] Setup mode already set:", setupMode.value);
                }
            } catch (error) {
                console.error("Onboarding check failed:", error);
                // If it's a structural/DB error, trigger Safe Mode
                if (error.name === 'DexieError' || error.name === 'DatabaseClosedError' || error.message.includes('open')) {
                    setHasFatalError(true);
                }
            } finally {
                setIsChecking(false);
            }
        };

        // Delay slightly to ensure DB is ready, though usually unnecessary
        init();
    }, [navigate, location.pathname]);

    // Reminders
    useEffect(() => {
        if (hasFatalError) return; // Don't run side effects in Safe Mode

        // Request permissions
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        // Periodic check
        const interval = setInterval(async () => {
             // Safe check
            try {
                 const shouldNotify = await checkReminder();
                 if (shouldNotify) console.log("✅ Reminder triggered!");
            } catch (e) {
                console.error("Reminder check failed:", e);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [hasFatalError]);

    // Safe Mode UI
    if (hasFatalError) {
        return (
            <div className="min-h-screen bg-error/10 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-base-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-error">
                    <h1 className="text-3xl font-bold text-error mb-4">⚠️ Database Error</h1>
                    <p className="text-base-content/70 mb-6">
                        The application database seems to be corrupted or locked by the browser. 
                        This often happens in Chrome if the app was closed unexpectedly.
                    </p>
                    
                    <button 
                        onClick={async () => {
                            if (window.confirm("Perform Emergency Reset? This will wipe all app data.")) {
                                try {
                                    console.log("Attempting Dexie delete...");
                                    await db.delete().catch(e => console.error(e));
                                    
                                    console.log("Attempting native delete...");
                                    const req = window.indexedDB.deleteDatabase("AttendanceDB");
                                    req.onsuccess = () => console.log("Native delete success");
                                    req.onerror = () => console.log("Native delete fail");
                                } catch (e) {
                                    console.error("Delete failed", e);
                                } finally {
                                    localStorage.clear();
                                    if ('serviceWorker' in navigator) {
                                        const registrations = await navigator.serviceWorker.getRegistrations();
                                        for (const registration of registrations) await registration.unregister();
                                    }
                                    alert("System Reset. Reloading...");
                                    window.location.reload();
                                }
                            }
                        }}
                        className="btn btn-error w-full btn-lg rounded-xl shadow-lg animate-pulse"
                    >
                        🚨 EMERGENCY RESET
                    </button>
                    <div className="mt-4 text-xs opacity-50">
                        Code: CRITICAL_DB_FAILURE
                    </div>
                </div>
            </div>
        );
    }

    // Show blank screen while routing check determines destiny
    if (isChecking) {
        return <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>;
    }

    return (
        <>
            <Toaster position="top-center" />
            
            {/* Show Floating Button on all pages EXCEPT Welcome and Home */}
            {location.pathname !== "/welcome" && location.pathname !== "/" && <FloatingSettingsButton />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/history/:subjectId" element={<SubjectHistoryPage />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
