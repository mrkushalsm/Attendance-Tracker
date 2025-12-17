import { Link } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCalendarAlt, faGraduationCap, faListAlt } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
    const [showReminder, setShowReminder] = useState(false);

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
                <Link to="/dashboard" className="btn btn-primary w-full shadow-xl shadow-primary/20 text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faListAlt} /> Go to Dashboard
                </Link>
                
                <Link to="/attendance" className="btn btn-outline border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40 hover:text-base-content w-full text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Mark Attendance
                </Link>
            </div>

            {/* Reminder Notification */}
            {showReminder && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-warning text-warning-content p-4 rounded-2xl shadow-lg flex items-center justify-between z-50 animate-bounce">
                    <span className="font-bold flex items-center gap-2">
                        ⏳ Reminder: Fill your attendance!
                    </span>
                    <button onClick={() => setShowReminder(false)} className="btn btn-sm btn-circle btn-ghost">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
