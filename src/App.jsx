import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Dashboard from "./pages/DashboardPage.jsx";
import AttendancePage from "./pages/AttendancePage";
import SettingsPage from "./pages/SettingsPage";
import FloatingSettingsButton from "./components/FloatingSettingsButton";

const App = () => {
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
                <FloatingSettingsButton />
            </Router>
        </>
    );
};

export default App;
