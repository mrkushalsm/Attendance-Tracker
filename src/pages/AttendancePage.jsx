import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../database/db";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faTimes,
    faFrown,
    faLightbulb,
    faCalendarAlt,
    faArrowLeft,
    faPlusSquare,
    faRefresh
} from "@fortawesome/free-solid-svg-icons";

const AttendancePage = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState("");

    const getToday = () => new Date().toLocaleDateString("en-CA");

    useEffect(() => {
        const fetchSubjects = async () => {
            const storedSubjects = await db.subjects.toArray();
            setSubjects(storedSubjects.map(subject => {
                const todayAttendance = subject.attendanceRecords?.find(a => a.date === getToday());
                return {
                    ...subject,
                    attendance: todayAttendance ? todayAttendance.status : null
                };
            }));
        };
        fetchSubjects();
    }, []);

    const addSubject = async () => {
        if (newSubject.trim() !== "" && !subjects.some((s) => s.name === newSubject)) {
            const id = await db.subjects.add({ name: newSubject, attendanceRecords: [], totalStrictClasses: 0, totalRelaxedClasses: 0 });
            setSubjects([...subjects, { id, name: newSubject, attendanceRecords: [], attendance: null }]);
            setNewSubject("");
        }
    };

    const markAttendance = async (id, status) => {
        const subject = await db.subjects.get(id);
        const today = getToday();
        const existingRecord = subject.attendanceRecords?.find(a => a.date === today);

        let newStrictTotal = subject.totalStrictClasses || 0;
        let newRelaxedTotal = subject.totalRelaxedClasses || 0;

        if (existingRecord) {
            if (existingRecord.status === status) return; // No change needed

            // Adjust totals when changing attendance status
            if (["Present", "Absent"].includes(existingRecord.status) && ["Excused", "Sick Leave"].includes(status)) {
                newStrictTotal--;
                newRelaxedTotal++;
            } else if (["Excused", "Sick Leave"].includes(existingRecord.status) && ["Present", "Absent"].includes(status)) {
                newStrictTotal++;
                newRelaxedTotal--;
            }

            const updatedRecords = subject.attendanceRecords.map(a =>
                a.date === today ? { ...a, status } : a
            );

            await db.subjects.update(id, { attendanceRecords: updatedRecords, totalStrictClasses: newStrictTotal, totalRelaxedClasses: newRelaxedTotal });

        } else {
            if (["Present", "Absent"].includes(status)) {
                newStrictTotal++;
            } else if (["Excused", "Sick Leave"].includes(status)) {
                newRelaxedTotal++;
            }

            const updatedRecords = [...(subject.attendanceRecords || []), { date: today, status }];

            await db.subjects.update(id, {
                attendanceRecords: updatedRecords,
                totalStrictClasses: newStrictTotal,
                totalRelaxedClasses: newRelaxedTotal
            });
        }

        setSubjects(subjects.map(s => s.id === id ? { ...s, attendance: status } : s));
    };



    const resetTodayAttendance = async () => {
        const confirmed = window.confirm("Are you sure you want to reset today's attendance?");
        if (!confirmed) return;

        await Promise.all(subjects.map(async (subject) => {
            const today = getToday();
            const existingRecord = subject.attendanceRecords.find(a => a.date === today);

            if (!existingRecord) return;

            let newStrictTotal = subject.totalStrictClasses;
            let newRelaxedTotal = subject.totalRelaxedClasses;

            if (["Present", "Absent"].includes(existingRecord.status)) {
                newStrictTotal--;
            } else if (["Excused", "Sick Leave"].includes(existingRecord.status)) {
                newRelaxedTotal--;
            }

            await db.subjects.update(subject.id, {
                attendanceRecords: subject.attendanceRecords.filter(a => a.date !== today),
                totalStrictClasses: Math.max(0, newStrictTotal),
                totalRelaxedClasses: Math.max(0, newRelaxedTotal)
            });
        }));

        setSubjects(subjects.map(s => ({ ...s, attendance: null })));
        toast.success("Today's attendance has been reset!");
    };


    return (
        <div className="flex flex-col p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
                <FontAwesomeIcon className="mr-2" icon={faCalendarAlt} /> Mark Attendance
            </h1>

            <Link to="/dashboard" className="btn btn-outline w-full sm:w-auto mt-10">
                <FontAwesomeIcon className="mr-2" icon={faArrowLeft} /> Back to Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row gap-2 mt-10">
                <input
                    type="text"
                    placeholder="Enter subject name"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="input input-bordered w-full"
                />
                <button onClick={addSubject} className="btn btn-primary">
                    <FontAwesomeIcon className="mr-1 mt-0.5" icon={faPlusSquare} /> Add
                </button>
            </div>

            {subjects.length > 0 && (
                <button onClick={resetTodayAttendance} className="btn btn-warning w-full">
                    <FontAwesomeIcon className="mr-1 mt-0.5" icon={faRefresh} /> Reset Today's Attendance
                </button>
            )}

            <div className="space-y-4">
                {subjects.length === 0 ? (
                    <p className="text-gray-500 text-center">No subjects added yet.</p>
                ) : (
                    subjects.map(({ id, name, attendance }) => (
                        <div key={id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-base-200 rounded-lg shadow">
                            <span className="text-lg font-semibold">{name}</span>
                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 p-4">
                                <button onClick={() => markAttendance(id, "Present")}
                                        className={`btn h-12 w-13 ${attendance === "Present" ? "btn-success" : "btn-outline"}`}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button onClick={() => markAttendance(id, "Absent")}
                                        className={`btn h-12 w-13 ${attendance === "Absent" ? "btn-error" : "btn-outline"}`}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                                <button onClick={() => markAttendance(id, "Excused")}
                                        className={`btn h-12 w-13 ${attendance === "Excused" ? "btn-info" : "btn-outline"}`}>
                                    <FontAwesomeIcon icon={faLightbulb} />
                                </button>
                                <button onClick={() => markAttendance(id, "Sick Leave")}
                                        className={`btn h-12 w-13 ${attendance === "Sick Leave" ? "btn-secondary" : "btn-outline"}`}>
                                    <FontAwesomeIcon icon={faFrown} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
