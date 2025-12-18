import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSun, faMoon, faClock, faFileImport, faFileExport, faCamera, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { db } from "../database/db";
import { parseTimetable } from "../utils/ocrParser";

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "emerald");
    const [endTime, setEndTime] = useState("");
    const [attendanceGoal, setAttendanceGoal] = useState(75);
    const [setupMode, setSetupMode] = useState("auto"); // Default to auto/visible if undefined
    
    // UI States
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [importData, setImportData] = useState(null); // { subjects: [] }
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const timeSetting = await db.settings.get("collegeEndTime");
                if (timeSetting) setEndTime(timeSetting.value);

                const goalSetting = await db.settings.get("attendanceGoal");
                if (goalSetting) setAttendanceGoal(goalSetting.value);

                // Check Setup Mode (Manual vs Auto)
                const modeSetting = await db.settings.get("setupMode");
                if (modeSetting) setSetupMode(modeSetting.value);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const saveEndTime = async () => {
        try {
            await db.settings.put({ id: "collegeEndTime", value: endTime });
            alert("✅ College end time saved!");
        } catch (error) {
            console.error("Error saving college end time:", error);
            alert("❌ Failed to save college end time.");
        }
    };

    const saveAttendanceGoal = async () => {
        try {
            await db.settings.put({ id: "attendanceGoal", value: attendanceGoal });
            alert("✅ Attendance goal saved!");
        } catch (error) {
            console.error("Error saving attendance goal:", error);
            alert("❌ Failed to save attendance goal.");
        }
    };

    // 📤 Export JSON Data
    const exportData = async () => {
        try {
            const subjects = await db.subjects.toArray();
            const settings = await db.settings.toArray();
            const exportJson = JSON.stringify({ subjects, settings }, null, 2);
            const blob = new Blob([exportJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "attendance_backup.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert("✅ Data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            alert("❌ Failed to export data.");
        }
    };

    // 📥 Import JSON Data
    const handleImportFile = async (event) => {
        if (!event.target.files.length) return;
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const parsedData = JSON.parse(e.target.result);
                if (!parsedData.subjects) throw new Error("Invalid format");

                setImportData(parsedData);
                setIsPreviewOpen(false);
                setTimeout(() => setIsPreviewOpen(true), 100);
            } catch (error) {
                alert("❌ Invalid file format! Please upload a valid JSON.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    // 📷 Handle Timetable Image Upload (OCR)
    const handleTimetableUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanProgress(0);

        try {
            const extractedSubjects = await parseTimetable(file, (progress) => {
                setScanProgress(progress);
            });

            if (extractedSubjects.length === 0) {
                alert("Could not find any subjects. Please try a clearer image.");
                setIsScanning(false);
                return;
            }

            // Format for compatibility with existing import modal
            // In V2, we might want to capture the schedule too, but for now we focus on Names
            setImportData({
                subjects: extractedSubjects.map(sub => ({
                    ...sub,
                    attendanceRecords: [],
                    totalStrictClasses: 0,
                    totalRelaxedClasses: 0
                }))
            });
            
            setIsPreviewOpen(true);
        } catch (error) {
            console.error(error);
            alert("Failed to scan timetable. Please try again.");
        } finally {
            setIsScanning(false);
            event.target.value = ""; // Reset input
        }
    };

    // ✏️ Handle Editing in the Import Preview Table
    const handleEditChange = (index, field, value) => {
        setImportData((prevData) => {
            const updatedSubjects = [...prevData.subjects];
            updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
            return { ...prevData, subjects: updatedSubjects };
        });
    };

    // ✅ Confirm Import
    const confirmImport = async (mode) => {
        try {
            if (!importData) return;
            if (mode === "overwrite") {
                await db.subjects.clear();
                // Don't clear settings if it's just a timetable import!
                // We'll only clear settings if importData HAS settings (which comes from JSON backup, not OCR)
                if (importData.settings) await db.settings.clear();
            }

            if (importData.subjects) {
                // Remove ID so Dexie auto-increments for new entries (unless restoring backup with IDs)
                // For OCR, IDs are undefined anyway.
                const cleanSubjects = importData.subjects.map(({ id, ...rest }) => rest);
                await db.subjects.bulkPut(cleanSubjects);
            }
            if (importData.settings) {
                await db.settings.bulkPut(importData.settings);
            }

            alert("✅ Import successful!");
            setIsPreviewOpen(false);
            
            // If setupMode was 'auto', we can now consider them onboarding complete?
            // Optional: navigate('/dashboard');
        } catch (error) {
            alert("❌ Import failed!");
            console.error("Import Error:", error);
        }
    };

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    ⚙️ Settings
                </h1>
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                </button>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Column 1: Appearance & Preferences */}
                <div className="space-y-6">
                    {/* Theme Card */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-3 px-1">Appearance</h2>
                        <button onClick={() => setTheme(theme === "emerald" ? "business" : "emerald")} 
                                className="btn btn-primary w-full h-14 text-lg rounded-xl shadow-md">
                            <FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} className="mr-2" />
                            {theme === "emerald" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        </button>
                    </div>

                    {/* Attendance Goal Card */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h2 className="text-lg font-semibold">Attendance Goal</h2>
                            <span className="badge badge-primary font-bold text-lg p-3">{attendanceGoal}%</span>
                        </div>
                        <p className="text-sm opacity-60 mb-4 px-1">Minimum required attendance percentage.</p>
                        
                        <div className="flex gap-4 items-center">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={attendanceGoal} 
                                onChange={(e) => setAttendanceGoal(Number(e.target.value))}
                                className="range range-primary range-sm" 
                            />
                        </div>
                        <div className="flex justify-between text-xs px-1 mt-1 opacity-50 font-mono">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                        <button onClick={saveAttendanceGoal} className="btn btn-neutral w-full mt-4 rounded-xl">
                            Save Goal
                        </button>
                    </div>

                    {/* College End Time Card */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-3 px-1">Preferences</h2>
                        <label className="block font-medium mb-2 opacity-80 px-1">
                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                            College End Time
                        </label>
                        <div className="flex gap-2">
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} 
                                   className="input input-bordered h-12 w-full text-lg rounded-xl" />
                            <button onClick={saveEndTime} className="btn btn-neutral h-12 px-6 rounded-xl">Save</button>
                        </div>
                    </div>
                </div>

                {/* Column 2: Import/Export + Timetable */}
                <div className="space-y-6">
                    {/* Setup Mode: Auto - Timetable Import (LOCKED for Manual Users) */}
                    {setupMode !== 'manual' && (
                        <div className="bg-base-200 p-6 rounded-2xl shadow-sm border-2 border-primary/20">
                            <h2 className="text-lg font-bold mb-3 px-1 flex justify-between items-center">
                                <span>Smart Import</span>
                                {isScanning && <span className="loading loading-spinner loading-sm text-primary"></span>}
                            </h2>
                            <p className="text-sm opacity-60 mb-4 px-1">
                                {isScanning ? `Scanning... ${scanProgress}%` : "Upload your timetable image to auto-detect subjects."}
                            </p>
                            
                            <label className={`btn btn-primary w-full h-16 rounded-xl shadow-lg flex items-center gap-3 ${isScanning ? 'btn-disabled opacity-50' : ''}`}>
                                {isScanning ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                                        <span>Analyzing Image...</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCamera} className="text-2xl" />
                                        <span className="text-lg">Upload Timetable Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleTimetableUpload} disabled={isScanning} />
                                    </>
                                )}
                            </label>
                        </div>
                    )}

            {/* Backup & Restore */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold mb-3 px-1">Backup & Restore</h2>
                        <p className="text-sm opacity-60 mb-4 px-1">Safeguard your data or move it to another device.</p>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <label className="btn btn-outline h-20 flex flex-row items-center gap-4 rounded-xl border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40 cursor-pointer px-6">
                                <FontAwesomeIcon icon={faFileImport} className="text-2xl text-primary" />
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold">Import Backup</span>
                                    <span className="text-xs opacity-50 font-normal">.JSON file</span>
                                </div>
                                <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
                            </label>

                            <button onClick={exportData} 
                                    className="btn btn-outline h-20 flex flex-row items-center gap-4 rounded-xl border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40 px-6">
                                <FontAwesomeIcon icon={faFileExport} className="text-2xl text-secondary" />
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold">Export Data</span>
                                    <span className="text-xs opacity-50 font-normal">Download JSON</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ⚠️ Danger Zone */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-sm border border-error/20">
                        <h2 className="text-lg font-bold mb-3 px-1 text-error">Danger Zone</h2>
                        <p className="text-sm opacity-60 mb-4 px-1">
                            Clear all data and reset the application to its original state.
                        </p>
                        <button 
                            onClick={async () => {
                                if (window.confirm("⚠️ Are you sure? This will DELETE ALL subjects and attendance records permanently. This cannot be undone.")) {
                                    try {
                                        console.log("Attempting Dexie delete...");
                                        await db.delete().catch(err => console.error("Dexie delete failed:", err));
                                        
                                        console.log("Attempting native IndexedDB delete...");
                                        const req = window.indexedDB.deleteDatabase("AttendanceDB");
                                        req.onerror = (e) => console.error("Native delete failed", e);
                                        req.onsuccess = () => console.log("Native delete success");
                                        
                                        // Wait a moment for native delete to trigger
                                        await new Promise(r => setTimeout(r, 100));
                                    } catch (e) {
                                        console.error("Reset encountered errors (ignoring):", e);
                                    } finally {
                                        console.log("Clearing localStorage and Service Workers...");
                                        localStorage.clear();
                                        
                                        if ('serviceWorker' in navigator) {
                                            const registrations = await navigator.serviceWorker.getRegistrations();
                                            for (const registration of registrations) {
                                                await registration.unregister();
                                            }
                                        }
                                        
                                        alert("Application reset. Reloading (Hard Reload might be needed if errors persist).");
                                        window.location.reload();
                                    }
                                }
                            }}
                            className="btn btn-error btn-outline w-full h-14 rounded-xl">
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Reset Application
                        </button>
                    </div>
                </div>
            </div>

            {/* 📋 Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-base-200 p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {importData?.settings ? "📋 Restore Backup" : "✨ Review Scanned Subjects"}
                            </h2>
                            <button onClick={() => setIsPreviewOpen(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
                        </div>
                        
                        {!importData?.settings && (
                            <div className="alert alert-info shadow-sm mb-4 text-xs sm:text-sm py-2">
                                <span>Please rename any subjects that were scanned incorrectly before saving.</span>
                            </div>
                        )}

                        {/* Table with Editable Inputs */}
                        <div className="overflow-auto flex-1 border rounded bg-base-100 p-2">
                            <table className="table table-compact w-full">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Subject Name</th>
                                    {/* Only show stats columns if it's a backup restore, otherwise irrelevant for new import */}
                                    {importData?.settings && (
                                        <>
                                            <th>Present</th>
                                            <th>Total</th>
                                        </>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {importData?.subjects?.map((subject, index) => {
                                    // For backup restore, show stats. For OCR, simplistic view.
                                    const attendanceRecords = subject.attendanceRecords || [];
                                    const present = attendanceRecords.filter((record) => record.status === "Present").length;
                                    
                                    return (
                                        <tr key={index}>
                                            <td className="w-10 text-center opacity-50">{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={subject.name}
                                                    onChange={(e) => handleEditChange(index, "name", e.target.value)}
                                                    className="input input-sm input-bordered w-full font-bold"
                                                    placeholder="Subject Name"
                                                />
                                            </td>
                                            {importData?.settings && (
                                                <>
                                                    <td>{present}</td>
                                                    <td>{subject.totalStrictClasses}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* ✅ Buttons */}
                        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-2 border-t border-base-content/10">
                            <button onClick={() => {
                                setIsPreviewOpen(false);
                                setImportData(null);
                            }} className="btn btn-sm btn-ghost">
                                Cancel
                            </button>
                            
                            {/* If it's a fresh scan, usually we append or overwrite? Default to Append for safety, or Overwrite if new user? 
                                Let's offer both but make "Save" the primary action which appends/overwrites logic.
                            */}
                            <button onClick={() => confirmImport("overwrite")} className="btn btn-sm btn-warning">
                                {importData?.settings ? "Overwrite All Data" : "Replace Existing Subjects"}
                            </button>
                            <button onClick={() => confirmImport("append")} className="btn btn-sm btn-success">
                                {importData?.settings ? "Merge / Append" : "Add to List"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
