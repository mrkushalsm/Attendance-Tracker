import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSun, faMoon, faClock, faFileImport, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { db } from "../database/db";
import { extractTextFromImage } from "../api/geminiApi";
import TimetablePreview from "../components/TimetablePreview";

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "emerald");
    const [endTime, setEndTime] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [importData, setImportData] = useState(null);
    const [extractedTimetable, setExtractedTimetable] = useState(null);
    const [previewSubjects, setPreviewSubjects] = useState(null);

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

    const handleTimetableUpload = async (event) => {
        if (!event.target.files.length) return;
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result.split(",")[1];
            const extractedData = await extractTextFromImage(base64Image);

            if (!extractedData) {
                alert("❌ Failed to extract data.");
                return;
            }

            console.log("Extracted Timetable JSON:", extractedData);
            setExtractedTimetable(extractedData);
        };
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle absolute left-4 top-4">
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>

            <h1 className="text-3xl font-bold mb-8">⚙️ Settings</h1>

            <div className="w-full max-w-md p-6 bg-base-200 shadow-lg rounded-lg">
                {/* Theme Toggle */}
                <div className="mb-6 flex flex-col items-center">
                    <button onClick={() => setTheme(theme === "emerald" ? "business" : "emerald")} className="btn btn-primary w-full">
                        <FontAwesomeIcon icon={theme === "emerald" ? faSun : faMoon} className="mr-2" />
                        {theme === "emerald" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    </button>
                </div>

                {previewSubjects && (
                    <TimetablePreview extractedTimetable={extractedTimetable} />
                )}

                {/* 📤 Upload Timetable */}
                <label className="btn btn-outline w-full mt-2 cursor-pointer">
                    📄 Upload Timetable
                    <input type="file" accept="image/*" className="hidden" onChange={handleTimetableUpload} />
                </label>

                {/* College End Time Input */}
                <div className="mt-4">
                    <label className="block font-semibold mb-2">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        College End Time
                    </label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input input-bordered w-full" />
                    <button onClick={saveEndTime} className="btn btn-success w-full mt-3">Save</button>
                </div>

                {/* Import & Export Section */}
                <div className="mt-6">
                    <h2 className="text-lg font-bold">📂 Backup & Restore</h2>

                    {/* Import */}
                    <label className="btn btn-outline w-full mt-2 cursor-pointer">
                        <FontAwesomeIcon icon={faFileImport} className="mr-2" />
                        Import Data
                        <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
                    </label>

                    {/* Export */}
                    <button onClick={exportData} className="btn btn-outline w-full mt-2">
                        <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* 📋 Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-base-200 p-6 rounded-lg shadow-lg max-w-3xl w-full">
                        <h2 className="text-xl font-bold mb-4">📋 Edit Import Data</h2>

                        {/* Table with Editable Inputs */}
                        <div className="overflow-auto max-h-80 border rounded bg-base-100">
                            <table className="table w-full">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>📖 Subject</th>
                                    <th>✅ Present</th>
                                    <th>❌ Absent</th>
                                    <th>🏥 Sick</th>
                                    <th>🎓 Excused</th>
                                    <th>📊 Strict</th>
                                    <th>📊 Relaxed</th>
                                    <th>📊 Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {importData?.subjects?.map((subject, index) => {
                                    // Count occurrences of each status
                                    const attendanceRecords = subject.attendanceRecords || [];
                                    const present = attendanceRecords.filter((record) => record.status === "Present").length;
                                    const absent = attendanceRecords.filter((record) => record.status === "Absent").length;
                                    const sick = attendanceRecords.filter((record) => record.status === "Sick Leave").length;
                                    const excused = attendanceRecords.filter((record) => record.status === "Excused").length;

                                    // Calculate totals
                                    const totalStrict = present + absent;
                                    const totalRelaxed = excused + sick;
                                    const totalClasses = totalStrict + totalRelaxed;

                                    console.log(`Subject ${subject.name}: Present=${present}, Absent=${absent}, Sick=${sick}, Excused=${excused}`); // Debugging

                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={subject.name}
                                                    onChange={(e) => handleEditChange(index, "name", e.target.value)}
                                                    className="input input-sm input-bordered w-full"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={present}
                                                    readOnly
                                                    className="input input-sm input-bordered w-16 text-center"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={absent}
                                                    readOnly
                                                    className="input input-sm input-bordered w-16 text-center"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={sick}
                                                    readOnly
                                                    className="input input-sm input-bordered w-16 text-center"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={excused}
                                                    readOnly
                                                    className="input input-sm input-bordered w-16 text-center"
                                                />
                                            </td>
                                            <td className="text-center font-bold">{totalStrict}</td>
                                            <td className="text-center font-bold">{totalRelaxed}</td>
                                            <td className="text-center font-bold">{totalClasses}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* ✅ Buttons */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <button onClick={() => confirmImport("append")} className="btn btn-success">✅ Append</button>
                            <button onClick={() => confirmImport("overwrite")} className="btn btn-warning">⚠️ Overwrite</button>
                            <button onClick={() => {
                                setIsPreviewOpen(false);
                                setImportData(null);
                            }} className="btn btn-error">
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
