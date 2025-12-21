import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../database/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft, 
    faCheck, 
    faTimes, 
    faLightbulb, 
    faFrown, 
    faCalendarAlt,
    faClock
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

const SubjectHistoryPage = () => {
    const { subjectId: id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            // Try lookup as Number first (native)
            let sub = await db.subjects.get(parseInt(id));
            
            // Fallback: Try as String (imported data)
            if (!sub) {
                sub = await db.subjects.get(id.toString());
            }

            if (sub) {
                setSubject(sub);
                // Sort by date descending (newest first), then by timestamp desc
                const sorted = [...(sub.attendanceRecords || [])].sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (dateB - dateA !== 0) return dateB - dateA;
                    return (b.timestamp || 0) - (a.timestamp || 0);
                });
                setHistory(sorted);
            } else {
                console.error("Subject not found for ID:", id);
                toast.error("Subject not found");
                navigate("/dashboard");
            }
        };
        fetchData();
    }, [id]);

    const handleStatusChange = async (timestamp, newStatus) => {
        if (!subject) return;

        try {
            // 1. Find the old record
            const recordIndex = subject.attendanceRecords.findIndex(r => r.timestamp === timestamp);
            if (recordIndex === -1) return;
            
            const oldRecord = subject.attendanceRecords[recordIndex];
            const oldStatus = oldRecord.status;
            
            if (oldStatus === newStatus) return;

            // 2. Calculate Strict/Relaxed changes
            let strictDelta = 0;
            let relaxedDelta = 0;

            // Remove old impact
            if (["Present", "Absent"].includes(oldStatus)) strictDelta--;
            if (["Excused", "Sick Leave"].includes(oldStatus)) relaxedDelta--;

            // Add new impact
            if (["Present", "Absent"].includes(newStatus)) strictDelta++;
            if (["Excused", "Sick Leave"].includes(newStatus)) relaxedDelta++;

            // 3. Update the record
            const updatedRecords = [...subject.attendanceRecords];
            updatedRecords[recordIndex] = { ...oldRecord, status: newStatus };

            // 4. Update DB
            const newStrictTotal = Math.max(0, (subject.totalStrictClasses || 0) + strictDelta);
            const newRelaxedTotal = Math.max(0, (subject.totalRelaxedClasses || 0) + relaxedDelta);

            await db.subjects.update(subject.id, {
                attendanceRecords: updatedRecords,
                totalStrictClasses: newStrictTotal,
                totalRelaxedClasses: newRelaxedTotal
            });

            // 5. Update Local State
            setSubject(prev => ({
                ...prev,
                attendanceRecords: updatedRecords,
                totalStrictClasses: newStrictTotal,
                totalRelaxedClasses: newRelaxedTotal
            }));
            
            // Re-sort history to be safe (though timestamp/date shouldn't change usually)
            setHistory(prev => prev.map(r => r.timestamp === timestamp ? { ...r, status: newStatus } : r));

            toast.success("Attendance updated!");
        } catch (error) {
            console.error("Failed to update attendance:", error);
            toast.error("Failed to update status");
        }
    };

    if (!subject) return <div className="p-10 text-center">Loading...</div>;

    // Helper for formatting date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
            weekday: date.toLocaleDateString('default', { weekday: 'short' })
        };
    };

    // Badge styling helper
    const getBadgeStyle = (status) => {
        switch (status) {
            case "Present": return "badge-success text-white";
            case "Absent": return "badge-error text-white";
            case "Excused": return "badge-warning text-white";
            case "Sick Leave": return "badge-secondary text-white";
            default: return "badge-ghost";
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 w-full bg-base-100/80 backdrop-blur-md border-b border-base-200 dark:border-base-300 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/dashboard")} className="btn btn-ghost btn-circle btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold leading-tight">{subject.name}</h1>
                            <p className="text-xs text-base-content/60">Attendance History</p>
                        </div>
                    </div>
                    
                    {/* Mini Stats Bar */}
                    <div className="flex gap-4 mt-3 text-xs justify-around bg-base-200/50 p-2 rounded-lg">
                        <div className="text-center">
                            <span className="block text-base-content/50">Total</span>
                            <span className="font-bold text-base">{subject.totalStrictClasses}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-green-600 dark:text-green-400">Present</span>
                            <span className="font-bold text-base">{subject.attendanceRecords?.filter(r => r.status === "Present").length}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-blue-600 dark:text-blue-400">Pct</span>
                            <span className="font-bold text-base">
                                {subject.totalStrictClasses > 0 
                                    ? ((subject.attendanceRecords?.filter(r => r.status === "Present").length / subject.totalStrictClasses) * 100).toFixed(0) 
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable History List */}
            <div className="w-full max-w-md p-4 space-y-3 pb-20">
                {history.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl mb-2" />
                        <p>No attendance records yet.</p>
                    </div>
                ) : (
                    history.map((record) => {
                        const { day, month, weekday } = formatDate(record.date);
                        return (
                            <div key={record.timestamp} className="flex items-center justify-between p-3 bg-base-200 rounded-xl hover:bg-base-300 transition-colors">
                                {/* Date Block */}
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center bg-base-100 w-12 h-12 rounded-lg border border-base-300 shadow-sm">
                                        <span className="text-xs font-bold text-base-content/50 leading-none">{month}</span>
                                        <span className="text-xl font-black leading-none">{day}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{weekday}</div>
                                        <div className="text-xs text-base-content/50 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} style={{ fontSize: '0.7em' }} />
                                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Status Badge */}
                                <div className="dropdown dropdown-end dropdown-bottom">
                                    <div tabIndex={0} role="button" className={`badge ${getBadgeStyle(record.status)} badge-lg gap-2 cursor-pointer shadow-sm active:scale-95 transition-transform`}>
                                        {record.status === "Present" && <FontAwesomeIcon icon={faCheck} />}
                                        {record.status === "Absent" && <FontAwesomeIcon icon={faTimes} />}
                                        {record.status === "Excused" && <FontAwesomeIcon icon={faLightbulb} />}
                                        {record.status === "Sick Leave" && <FontAwesomeIcon icon={faFrown} />}
                                        <span className="font-semibold">{record.status}</span>
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-40 border border-base-200 mt-2">
                                        <li><a onClick={() => handleStatusChange(record.timestamp, "Present")} className="text-success"><FontAwesomeIcon icon={faCheck} /> Present</a></li>
                                        <li><a onClick={() => handleStatusChange(record.timestamp, "Absent")} className="text-error"><FontAwesomeIcon icon={faTimes} /> Absent</a></li>
                                        <li><a onClick={() => handleStatusChange(record.timestamp, "Excused")} className="text-warning"><FontAwesomeIcon icon={faLightbulb} /> Excused</a></li>
                                        <li><a onClick={() => handleStatusChange(record.timestamp, "Sick Leave")} className="text-secondary"><FontAwesomeIcon icon={faFrown} /> Sick Leave</a></li>
                                    </ul>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SubjectHistoryPage;
