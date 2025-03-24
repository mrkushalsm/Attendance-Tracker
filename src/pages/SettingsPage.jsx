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

    // Save end time to IndexedDB
    const saveEndTime = async () => {
        try {
            await db.settings.put({ id: "collegeEndTime", value: endTime });
            alert("✅ College end time saved!");
        } catch (error) {
            console.error("Error saving college end time:", error);
            alert("❌ Failed to save college end time.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-circle absolute left-4 top-4 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>

            <h1 className="text-3xl font-bold mb-8">⚙️ Settings</h1>

            {/* Settings Container */}
            <div className="w-full max-w-md p-6 bg-base-200 shadow-lg rounded-lg">
                {/* Theme Toggle */}
                <div className="mb-6 flex flex-col items-center">
                    <button
                        onClick={() => setTheme(theme === "emerald" ? "business" : "emerald")}
                        className="btn btn-primary w-full"
                    >
                        <FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} className="mr-2" />
                        {theme === "emerald" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    </button>
                </div>

                {/* College End Time Input */}
                <div className="mt-4">
                    <label className="block font-semibold mb-2">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        College End Time
                    </label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <button
                        onClick={saveEndTime}
                        className="btn btn-success w-full mt-3"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
