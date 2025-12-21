"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, Subject, AttendanceRecord } from "../../lib/db";
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

interface DailySession {
    timestamp: number;
    status: AttendanceRecord['status'] | null;
    date: string;
}

const AttendancePage = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubject, setNewSubject] = useState("");
    const [todaySessions, setTodaySessions] = useState<{[key: number]: DailySession[]}>({});

    const getToday = () => new Date().toLocaleDateString("en-CA");

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        const storedSubjects = await db.subjects.toArray();
        const initialSessions: {[key: number]: DailySession[]} = {};
        
        // Initialize sessions for each subject
        storedSubjects.forEach(subject => {
             const todayRecords = subject.attendanceRecords?.filter(a => a.date === getToday()) || [];
             if (subject.id) {
                initialSessions[subject.id] = todayRecords.length > 0 
                    ? todayRecords.map(r => ({ 
                        ...r, 
                        timestamp: r.timestamp || Date.now(),
                        status: r.status // Ensure status type safety
                    }))
                    : [{ timestamp: Date.now(), status: null, date: getToday() }];
             }
        });

        setSubjects(storedSubjects);
        setTodaySessions(initialSessions);
    };

    const addSubject = async () => {
        if (newSubject.trim() !== "" && !subjects.some((s) => s.name === newSubject)) {
            const id = await db.subjects.add({ 
                name: newSubject, 
                attendanceRecords: [], 
                totalStrictClasses: 0, 
                totalRelaxedClasses: 0,
                schedule: []
            });
            setSubjects([...subjects, { 
                id, 
                name: newSubject, 
                attendanceRecords: [], 
                totalStrictClasses: 0,
                totalRelaxedClasses: 0,
                schedule: []
            }]);
            setTodaySessions(prev => ({ 
                ...prev, 
                [id]: [{ timestamp: Date.now(), status: null, date: getToday() }] 
            }));
            setNewSubject("");
        }
    };

    const addSession = (subjectId: number) => {
        setTodaySessions(prev => ({
            ...prev,
            [subjectId]: [...(prev[subjectId] || []), { timestamp: Date.now(), status: null, date: getToday() }]
        }));
    };

    const removeSession = async (subjectId: number, sessionTimestamp: number) => {
        const sessionToRemove = todaySessions[subjectId]?.find(s => s.timestamp === sessionTimestamp);
        if (!sessionToRemove) return;

        // Remove from local state
        const updatedSessions = todaySessions[subjectId].filter(s => s.timestamp !== sessionTimestamp);
        setTodaySessions(prev => ({ ...prev, [subjectId]: updatedSessions }));

        // If it was a saved record, update DB
        if (sessionToRemove.status) {
             const subject = await db.subjects.get(subjectId);
             if (!subject) return;

             let newStrictTotal = subject.totalStrictClasses;
             let newRelaxedTotal = subject.totalRelaxedClasses;

             if (["Present", "Absent"].includes(sessionToRemove.status)) newStrictTotal--;
             if (["Excused", "Sick Leave"].includes(sessionToRemove.status)) newRelaxedTotal--;

             const updatedRecords = subject.attendanceRecords.filter(r => r.timestamp !== sessionTimestamp);
             
             await db.subjects.update(subjectId, {
                 attendanceRecords: updatedRecords,
                 totalStrictClasses: Math.max(0, newStrictTotal),
                 totalRelaxedClasses: Math.max(0, newRelaxedTotal)
             });
             
             fetchSubjects(); 
        }
    };

    const markSession = async (subjectId: number, sessionTimestamp: number, status: AttendanceRecord['status']) => {
        const subject = await db.subjects.get(subjectId);
        if (!subject) return;

        const currentSessions = todaySessions[subjectId];
        const sessionIndex = currentSessions.findIndex(s => s.timestamp === sessionTimestamp);
        if (sessionIndex === -1) return;
        
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

        if (oldSession.status) {
             if (oldSession.status === status) return;
             if (["Present", "Absent"].includes(oldSession.status)) newStrictTotal--;
             if (["Excused", "Sick Leave"].includes(oldSession.status)) newRelaxedTotal--;
             updatedRecords = updatedRecords.map(r => r.timestamp === sessionTimestamp ? updatedSession : r);
        } else {
             updatedRecords.push(updatedSession);
        }

        if (["Present", "Absent"].includes(status)) newStrictTotal++;
        if (["Excused", "Sick Leave"].includes(status)) newRelaxedTotal++;

        await db.subjects.update(subjectId, {
            attendanceRecords: updatedRecords,
            totalStrictClasses: newStrictTotal,
            totalRelaxedClasses: newRelaxedTotal
        });
    };

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center min-h-screen bg-base-100 text-base-content">
             {/* Header */}
             <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    <FontAwesomeIcon className="mr-2" icon={faCalendarAlt} /> Mark Attendance
                </h1>
                <Link href="/dashboard" className="btn btn-ghost btn-sm btn-circle">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                </Link>
            </div>


            <div className="w-full max-w-4xl space-y-8">
                {/* Add Subject Input */}
                <div className="join w-full max-w-lg mx-auto shadow-sm">
                    <input
                        type="text"
                        placeholder="Enter new subject..."
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="input input-bordered join-item w-full"
                    />
                    <button onClick={addSubject} className="btn btn-primary join-item px-6">
                        <FontAwesomeIcon icon={faPlusSquare} className="text-lg" />
                    </button>
                </div>

                {/* Subject List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjects.length === 0 ? (
                        <div className="col-span-full text-center py-10 opacity-50 bg-base-200 rounded-2xl border border-base-300 border-dashed">
                             <p className="text-lg">No subjects added yet.</p>
                        </div>
                    ) : (
                        subjects.map((subject) => (
                            <div key={subject.id} className="collapse collapse-arrow bg-base-200 shadow-sm rounded-2xl h-fit">
                                <input type="checkbox" defaultChecked /> 
                                <div className="collapse-title text-lg font-semibold flex justify-between items-center py-4">
                                    {subject.name}
                                </div>
                                
                                <div className="collapse-content space-y-3">
                                    {subject.id && todaySessions[subject.id]?.map((session, index) => (
                                        <div key={session.timestamp} className="p-3 bg-base-100 rounded-xl mb-3 border border-base-300">
                                            {/* Status Buttons Grid */}
                                            <div className="grid grid-cols-4 gap-3 mb-2">
                                                <button onClick={() => subject.id && markSession(subject.id, session.timestamp, "Present")}
                                                        className={`btn h-12 text-lg rounded-xl shadow-sm ${session.status === "Present" ? "btn-success text-white" : "btn-outline border-base-content/20 bg-base-100 hover:bg-base-200"}`}>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>
                                                <button onClick={() => subject.id && markSession(subject.id, session.timestamp, "Absent")}
                                                        className={`btn h-12 text-lg rounded-xl shadow-sm ${session.status === "Absent" ? "btn-error text-white" : "btn-outline border-base-content/20 bg-base-100 hover:bg-base-200"}`}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                                <button onClick={() => subject.id && markSession(subject.id, session.timestamp, "Excused")}
                                                        className={`btn h-12 text-lg rounded-xl shadow-sm ${session.status === "Excused" ? "btn-info text-white" : "btn-outline border-base-content/20 bg-base-100 hover:bg-base-200"}`}>
                                                    <FontAwesomeIcon icon={faLightbulb} />
                                                </button>
                                                <button onClick={() => subject.id && markSession(subject.id, session.timestamp, "Sick Leave")}
                                                        className={`btn h-12 text-lg rounded-xl shadow-sm ${session.status === "Sick Leave" ? "btn-secondary text-white" : "btn-outline border-base-content/20 bg-base-100 hover:bg-base-200"}`}>
                                                    <FontAwesomeIcon icon={faFrown} />
                                                </button>
                                            </div>
                                            
                                            {/* Footer: Delete Action */}
                                            <div className="flex justify-between items-center px-1">
                                                <div className="text-xs text-base-content/40 font-mono">
                                                    Session {index + 1}
                                                </div>
                                                <button onClick={() => subject.id && removeSession(subject.id, session.timestamp)} 
                                                        className="btn btn-ghost btn-xs text-error opacity-60 hover:opacity-100 hover:bg-error/10">
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button onClick={() => subject.id && addSession(subject.id)} className="btn btn-ghost btn-sm w-full border-dashed border-2 border-base-content/20 text-xs">
                                        <FontAwesomeIcon icon={faPlusSquare} /> Split / Add Class
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default AttendancePage;
