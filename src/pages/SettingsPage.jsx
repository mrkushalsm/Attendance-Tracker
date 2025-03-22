import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";


const SettingsPage = () => {
    const navigate = useNavigate();

    // Check local storage for theme or default to 'light'
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "emerald");

    useEffect(() => {
        // Apply theme to the document
        document.documentElement.setAttribute("data-theme", theme);
        // Save theme to local storage
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Toggle theme function
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "emerald" ? "business" : "emerald"));
    };

    return (
        <div className="p-6 max-w-md mx-auto text-center">
            {/* Back Button (Icon Only) */}
            <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-circle absolute left-4 top-4"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>

            <h1 className="text-2xl font-bold">⚙️ Settings</h1>
            <button onClick={toggleTheme} className="btn btn-primary mt-4">
                <div className="mt-0.5"><FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} /> </div>
                Display mode: {theme === "emerald" ? "Light" : "Dark"}
            </button>
        </div>
    );
};

export default SettingsPage;
