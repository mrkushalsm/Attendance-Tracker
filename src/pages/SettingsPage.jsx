import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSun, faMoon, faClock, faFileImport, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { db } from "../database/db";

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "emerald");
    const [endTime, setEndTime] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [importData, setImportData] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

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

    const saveEndTime = async () => {
        try {
            await db.settings.put({ id: "collegeEndTime", value: endTime });
            alert("✅ College end time saved!");
        } catch (error) {
            console.error("Error saving college end time:", error);
            alert("❌ Failed to save college end time.");
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
                await db.settings.clear();
            }

            if (importData.subjects) {
                await db.subjects.bulkPut(importData.subjects);
            }
            if (importData.settings) {
                await db.settings.bulkPut(importData.settings);
            }

            alert("✅ Import successful!");
            setIsPreviewOpen(false);
        } catch (error) {
            alert("❌ Import failed!");
            console.error("Import Error:", error);
        }
    };



    return (
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    ⚙️ Settings
                </h1>
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
            </div>

            <div className="w-full max-w-md space-y-4">
                {/* Theme Card */}
                <div className="bg-base-200 p-4 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-3 px-1">Appearance</h2>
                    <button onClick={() => setTheme(theme === "emerald" ? "business" : "emerald")} 
                            className="btn btn-primary w-full h-14 text-lg rounded-xl shadow-md">
                        <FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} className="mr-2" />
                        {theme === "emerald" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    </button>
                </div>

                {/* College End Time Card */}
                <div className="bg-base-200 p-4 rounded-2xl shadow-sm">
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

                {/* Backup & Restore Card */}
                <div className="bg-base-200 p-4 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold mb-3 px-1">Backup & Restore</h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <label className="btn btn-outline h-24 flex flex-col gap-2 rounded-xl border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40 cursor-pointer">
                            <FontAwesomeIcon icon={faFileImport} className="text-3xl mb-1 text-primary" />
                            <span className="text-sm font-normal">Import Data</span>
                            <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
                        </label>

                        <button onClick={exportData} 
                                className="btn btn-outline h-24 flex flex-col gap-2 rounded-xl border-base-content/20 bg-base-100 hover:bg-base-200 hover:border-base-content/40">
                            <FontAwesomeIcon icon={faFileExport} className="text-3xl mb-1 text-secondary" />
                            <span className="text-sm font-normal">Export Data</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 📋 Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-base-200 p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <h2 className="text-xl font-bold mb-4">📋 Edit Import Data</h2>

                        {/* Table with Editable Inputs */}
                        <div className="overflow-auto flex-1 border rounded bg-base-100 p-2">
                            <table className="table table-compact w-full">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Subject</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Sick</th>
                                    <th>Excused</th>
                                </tr>
                                </thead>
                                <tbody>
                                {importData?.subjects?.map((subject, index) => {
                                    const attendanceRecords = subject.attendanceRecords || [];
                                    const present = attendanceRecords.filter((record) => record.status === "Present").length;
                                    const absent = attendanceRecords.filter((record) => record.status === "Absent").length;
                                    const sick = attendanceRecords.filter((record) => record.status === "Sick Leave").length;
                                    const excused = attendanceRecords.filter((record) => record.status === "Excused").length;

                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={subject.name}
                                                    onChange={(e) => handleEditChange(index, "name", e.target.value)}
                                                    className="input input-xs input-bordered w-full"
                                                />
                                            </td>
                                            <td>{present}</td>
                                            <td>{absent}</td>
                                            <td>{sick}</td>
                                            <td>{excused}</td>
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
                            <button onClick={() => confirmImport("overwrite")} className="btn btn-sm btn-warning">Overwrite</button>
                            <button onClick={() => confirmImport("append")} className="btn btn-sm btn-success">Append</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
