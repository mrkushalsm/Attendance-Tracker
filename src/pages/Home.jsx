import { Link } from "react-router-dom";
import { useState } from "react";

const Home = () => {
    const [showReminder, setShowReminder] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 relative">
            <div className="p-8 shadow-xl bg-base-100 rounded-lg text-center space-y-4">
                <h1 className="text-4xl font-bold">📌 Attendance Tracker</h1>
                <p className="text-lg">Track your attendance effortlessly.</p>

                <div className="flex gap-4 justify-center">
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    <Link to="/attendance" className="btn btn-secondary">Mark Attendance</Link>
                </div>
            </div>

            {/* Reminder Notification */}
            {showReminder && (
                <div className="fixed bottom-5 right-5 bg-warning p-4 rounded-lg shadow-lg">
                    <p>⏳ Reminder: Fill your attendance!</p>
                    <button onClick={() => setShowReminder(false)} className="btn btn-sm btn-primary mt-2">
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
