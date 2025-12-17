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
    faTrash
} from "@fortawesome/free-solid-svg-icons";

const AttendancePage = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState("");
    const [todaySessions, setTodaySessions] = useState({});

    const getToday = () => new Date().toLocaleDateString("en-CA");

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        const storedSubjects = await db.subjects.toArray();
        const initialSessions = {};
        
        // Initialize sessions for each subject
        storedSubjects.forEach(subject => {
             const todayRecords = subject.attendanceRecords?.filter(a => a.date === getToday()) || [];
             // If records exist, use them. If not, start with one empty session.
             initialSessions[subject.id] = todayRecords.length > 0 
                ? todayRecords.map(r => ({ ...r, timestamp: r.timestamp || Date.now() })) // Ensure timestamp exists
                : [{ timestamp: Date.now(), status: null, date: getToday() }];
        });

        setSubjects(storedSubjects);
        setTodaySessions(initialSessions);
    };

    const addSubject = async () => {
        if (newSubject.trim() !== "" && !subjects.some((s) => s.name === newSubject)) {
            const id = await db.subjects.add({ name: newSubject, attendanceRecords: [], totalStrictClasses: 0, totalRelaxedClasses: 0 });
            setSubjects([...subjects, { id, name: newSubject, attendanceRecords: [], attendance: null }]);
            setTodaySessions(prev => ({ ...prev, [id]: [{ timestamp: Date.now(), status: null, date: getToday() }] }));
            setNewSubject("");
        }
    };

    const addSession = (subjectId) => {
        setTodaySessions(prev => ({
            ...prev,
            [subjectId]: [...prev[subjectId], { timestamp: Date.now(), status: null, date: getToday() }]
        }));
    };

    const removeSession = async (subjectId, sessionTimestamp) => {
        const sessionToRemove = todaySessions[subjectId].find(s => s.timestamp === sessionTimestamp);
        
        // Remove from local state
        const updatedSessions = todaySessions[subjectId].filter(s => s.timestamp !== sessionTimestamp);
        setTodaySessions(prev => ({ ...prev, [subjectId]: updatedSessions }));

        // If it was a saved record, update DB
        if (sessionToRemove?.status) {
             const subject = await db.subjects.get(subjectId);
             
             // Recalculate totals
             let newStrictTotal = subject.totalStrictClasses;
             let newRelaxedTotal = subject.totalRelaxedClasses;

             if (["Present", "Absent"].includes(sessionToRemove.status)) newStrictTotal--;
             if (["Excused", "Sick Leave"].includes(sessionToRemove.status)) newRelaxedTotal--;

             const updatedRecords = subject.attendanceRecords.filter(r => r.timestamp !== sessionTimestamp && (r.date !== sessionToRemove.date || r.status !== sessionToRemove.status)); // Fallback filter if timestamp missing in old records
             
             await db.subjects.update(subjectId, {
                 attendanceRecords: updatedRecords,
                 totalStrictClasses: Math.max(0, newStrictTotal),
                 totalRelaxedClasses: Math.max(0, newRelaxedTotal)
             });
             
             fetchSubjects(); // Refresh to ensure sync
        }
    };

    const markSession = async (subjectId, sessionTimestamp, status) => {
        const subject = await db.subjects.get(subjectId);
        const currentSessions = todaySessions[subjectId];
        const sessionIndex = currentSessions.findIndex(s => s.timestamp === sessionTimestamp);
        const oldSession = currentSessions[sessionIndex];

        // Optimistic UI Update
        const updatedSession = { ...oldSession, status, date: getToday(), timestamp: sessionTimestamp };
        const newSessions = [...currentSessions];
        newSessions[sessionIndex] = updatedSession;
        
        setTodaySessions(prev => ({ ...prev, [subjectId]: newSessions }));

        // DB Update Logic
        let newStrictTotal = subject.totalStrictClasses || 0;
        let newRelaxedTotal = subject.totalRelaxedClasses || 0;
        let updatedRecords = subject.attendanceRecords || [];

        // If updating an existing saved record (has status previously)
        if (oldSession.status) {
             if (oldSession.status === status) return; // No change

             // Revert old counts
             if (["Present", "Absent"].includes(oldSession.status)) newStrictTotal--;
             if (["Excused", "Sick Leave"].includes(oldSession.status)) newRelaxedTotal--;
             
             // Update record in array
             updatedRecords = updatedRecords.map(r => r.timestamp === sessionTimestamp ? updatedSession : r);
        } else {
             // New record
             updatedRecords.push(updatedSession);
        }

        // Add new counts
        if (["Present", "Absent"].includes(status)) newStrictTotal++;
        if (["Excused", "Sick Leave"].includes(status)) newRelaxedTotal++;

        await db.subjects.update(subjectId, {
            attendanceRecords: updatedRecords,
            totalStrictClasses: newStrictTotal,
            totalRelaxedClasses: newRelaxedTotal
        });
        
        // Reload to ensure consistency (e.g. if we just saved a new record, it's now "saved")
        // fetchSubjects(); // Optional, but good for data integrity
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

            <div className="space-y-6">
                {subjects.length === 0 ? (
                    <p className="text-gray-500 text-center">No subjects added yet.</p>
                ) : (
                    subjects.map((subject) => (
                        <div key={subject.id} className="p-4 bg-base-200 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-center mb-4">{subject.name}</h2>
                            
                            <div className="space-y-3">
                                {todaySessions[subject.id]?.map((session, index) => (
                                    <div key={session.timestamp} className="flex flex-wrap items-center gap-2 justify-center p-2 bg-base-100 rounded-md">
                                        <div className="flex gap-2">
                                            <button onClick={() => markSession(subject.id, session.timestamp, "Present")}
                                                    className={`btn btn-sm ${session.status === "Present" ? "btn-success" : "btn-outline"}`}>
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button onClick={() => markSession(subject.id, session.timestamp, "Absent")}
                                                    className={`btn btn-sm ${session.status === "Absent" ? "btn-error" : "btn-outline"}`}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                            <button onClick={() => markSession(subject.id, session.timestamp, "Excused")}
                                                    className={`btn btn-sm ${session.status === "Excused" ? "btn-info" : "btn-outline"}`}>
                                                <FontAwesomeIcon icon={faLightbulb} />
                                            </button>
                                            <button onClick={() => markSession(subject.id, session.timestamp, "Sick Leave")}
                                                    className={`btn btn-sm ${session.status === "Sick Leave" ? "btn-secondary" : "btn-outline"}`}>
                                                <FontAwesomeIcon icon={faFrown} />
                                            </button>
                                        </div>
                                        
                                        {/* Delete Button (Only show if there's more than 1 session OR this one is already saved to allow reset) */}
                                        <button onClick={() => removeSession(subject.id, session.timestamp)} 
                                                className="btn btn-ghost btn-xs text-error" 
                                                title="Remove this session">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => addSession(subject.id)} className="btn btn-ghost btn-sm w-full mt-3 border-dashed border-2 border-base-content/20">
                                <FontAwesomeIcon icon={faPlusSquare} /> Add Class
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
