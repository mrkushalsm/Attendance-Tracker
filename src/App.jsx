import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { checkReminder } from "./utils/reminder"; // Import reminder function
import Home from "./pages/Home";
import Dashboard from "./pages/DashboardPage";
import Attendance from "./pages/AttendancePage";
import Settings from "./pages/SettingsPage";
import SubjectHistoryPage from "./pages/SubjectHistoryPage";
import FloatingSettingsButton from "./components/FloatingSettingsButton.jsx";

const App = () => {

    useEffect(() => {
        const interval = setInterval(async () => {
            console.log("⏳ Checking reminder...");
            const shouldNotify = await checkReminder();

            if (shouldNotify) {
                console.log("✅ Reminder triggered!");
                // Notification logic here if needed
            } else {
                 // console.log("🚫 No reminder needed.");
            }
        }, 10000); // Check every minute

        return () => {
            console.log("🛑 Clearing interval...");
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") {
                    console.warn("❌ Notifications denied by the user.");
                }
            });
        }

        // Run reminder check every minute globally
        const interval = setInterval(async () => {
            await checkReminder();
        }, 60000); 

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/history/:id" element={<SubjectHistoryPage />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
            <FloatingSettingsButton />
        </Router>
    );
};

export default App;
