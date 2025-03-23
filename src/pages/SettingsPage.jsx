import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSun, faMoon, faClock } from "@fortawesome/free-solid-svg-icons";
import { db } from "../database/db"; // ✅ Import database

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "emerald");
    const [endTime, setEndTime] = useState(""); // Store college end time

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Fetch stored college end time from IndexedDB
    useEffect(() => {
        const fetchEndTime = async () => {
            try {
                const setting = await db.settings.get("collegeEndTime");
                if (setting) {
                    setEndTime(setting.value);
                }
            } catch (error) {
                console.error("Error fetching college end time:", error);
            }
        };
        fetchEndTime();
    }, []);

    // Request Notification Permission when the component mounts
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") {
                    console.warn("❌ Notifications are blocked by the user.");
                }
            });
        }
    }, []);

    // Save end time to IndexedDB & Schedule Notification
    const saveEndTime = async () => {
        try {
            await db.settings.put({ id: "collegeEndTime", value: endTime });
            alert("✅ College end time saved!");

            // Convert time to Date object
            const [hours, minutes] = endTime.split(":").map(Number);
            const collegeEndDate = new Date();
            collegeEndDate.setHours(hours, minutes, 0, 0);

            // Set reminder time (2 hours later)
            const reminderTime = new Date(collegeEndDate.getTime() + 2 * 60 * 60 * 1000);
            const delay = reminderTime.getTime() - Date.now();

            if (delay > 0) {
                setTimeout(() => {
                    if (Notification.permission === "granted") {
                        new Notification("📌 Attendance Reminder", {
                            body: "Don't forget to mark your attendance!",
                            icon: "/icon.png", // Optional icon
                        });
                    }
                }, delay);
            }
        } catch (error) {
            console.error("Error saving college end time:", error);
            alert("❌ Failed to save college end time.");
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto text-center">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle absolute left-4 top-4">
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>

            <h1 className="text-2xl font-bold">⚙️ Settings</h1>

            {/* Theme Toggle */}
            <button onClick={() => setTheme(theme === "emerald" ? "business" : "emerald")} className="btn btn-primary mt-10">
                <FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} />
                Display mode: {theme === "emerald" ? "Light" : "Dark"}
            </button>

            {/* College End Time Input */}
            <div className="mt-10 m-5">
                <label className="block font-semibold">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    College End Time
                </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input input-bordered w-full max-w-xs mt-2"
                />
                <button onClick={saveEndTime} className="btn btn-success mt-2">
                    Save
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
