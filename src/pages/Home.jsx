import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
            <div className="p-8 shadow-xl bg-base-100 rounded-lg text-center space-y-4">
                <h1 className="text-4xl font-bold">📌 Attendance Tracker</h1>
                <p className="text-lg">Track your attendance effortlessly.</p>

                <div className="flex gap-4">
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    <Link to="/attendance" className="btn btn-secondary">Mark Attendance</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
