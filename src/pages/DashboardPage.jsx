// import { useState, useEffect } from "react";
// import { db } from "../database/db";
// import { Link } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//     faArrowRight,
//     faThumbTack,
//     faBook,
//     faCheckCircle,
//     faCalendarAlt,
//     faChartLine
// } from "@fortawesome/free-solid-svg-icons";
//
// const DashboardPage = () => {
//     const [subjects, setSubjects] = useState([]);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             const storedSubjects = await db.subjects.toArray();
//             setSubjects(storedSubjects);
//         };
//
//         fetchData();
//     }, []);
//
//     // Function to calculate percentage safely
//     const calculatePercentage = (present, total) => {
//         return total > 0 ? ((present / total) * 100).toFixed(2) + "%" : "N/A";
//     };
//
//     return (
//         <div className="p-4 sm:p-6 max-w-3xl mx-auto">
//             <h1 className="text-2xl sm:text-3xl font-bold text-center">
//                 <FontAwesomeIcon icon={faThumbTack} className="mr-2" /> Attendance Dashboard
//             </h1>
//
//             {/* Per-Subject Attendance */}
//             <div className="mt-10">
//                 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Your Subjects</h2>
//
//                 {subjects.length === 0 ? (
//                     <p className="text-lg text-gray-500">No subjects found</p>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
//                         {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
//                             const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
//                             const adjustedPresent = attendanceRecords?.reduce((count, a) =>
//                                 (a.status === "Present" || a.status === "Excused" || a.status === "Sick Leave") ? count + 1 : count, 0);
//
//                             const hasExcusedOrSickLeave = attendanceRecords?.some(
//                                 (a) => a.status === "Excused" || a.status === "Sick Leave"
//                             );
//
//                             return (
//                                 <div key={id} className="p-5 bg-base-200 text-base-content rounded-lg shadow">
//                                     {/* Centered Subject Name */}
//                                     <h3 className="text-lg sm:text-xl font-bold text-center mb-3">
//                                         <FontAwesomeIcon icon={faBook} className="mr-2" /> {name}
//                                     </h3>
//
//                                     {/* Attendance Stats */}
//                                     <p className="mt-2">
//                                         <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
//                                         <strong>Total Classes:</strong> {totalStrictClasses}
//                                     </p>
//                                     <p className="mt-2">
//                                         <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
//                                         <strong>Attended:</strong> {strictPresent}
//                                     </p>
//
//                                     <p className="mt-2">
//                                         <FontAwesomeIcon icon={faChartLine} className="mr-1" />
//                                         <strong>Core Attendance:</strong> {calculatePercentage(strictPresent, totalStrictClasses)}
//                                     </p>
//
//                                     {hasExcusedOrSickLeave && (
//                                         <>
//                                             <p className="mt-2">
//                                                 <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
//                                                 <strong>Total Adjusted Classes:</strong> {totalRelaxedClasses}
//                                             </p>
//                                             <p className="mt-2">
//                                                 <FontAwesomeIcon icon={faChartLine} className="mr-1" />
//                                                 <strong>Adjusted Attendance:</strong> {calculatePercentage(adjustedPresent, totalRelaxedClasses)}
//                                             </p>
//                                         </>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                     )}
//             </div>
//
//             {/* View Attendance Page */}
//             <Link to="/attendance" className="btn btn-primary w-full mt-10 flex items-center justify-center gap-2">
//                 <FontAwesomeIcon icon={faArrowRight} /> Mark Attendance
//             </Link>
//         </div>
//     );
// };
//
// export default DashboardPage;
// import { useState, useEffect } from "react";
// import { db } from "../database/db";
// import { Link } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//     faArrowRight,
//     faThumbTack,
//     faBook,
//     faCheckCircle,
//     faCalendarAlt,
//     faChartLine,
//     faChartBar
// } from "@fortawesome/free-solid-svg-icons";
// import {
//     LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
// } from "recharts";
//
// const DashboardPage = () => {
//     const [subjects, setSubjects] = useState([]);
//     const [attendanceData, setAttendanceData] = useState([]);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             const storedSubjects = await db.subjects.toArray();
//             setSubjects(storedSubjects);
//             setAttendanceData(processAttendanceData(storedSubjects));
//         };
//
//         fetchData();
//     }, []);
//
//     // Function to calculate percentage safely
//     const calculatePercentage = (present, total) => {
//         return total > 0 ? `${((present / total) * 100).toFixed(2)}%` : "0%";
//     };
//
//     // Process attendance data for trends chart
//     const processAttendanceData = (subjects) => {
//         const dates = new Set();
//
//         // Collect all unique dates
//         subjects.forEach(subject => {
//             subject.attendanceRecords?.forEach(record => dates.add(record.date));
//         });
//
//         const sortedDates = [...dates].sort();
//
//         // Store cumulative attendance per subject
//         let cumulativeAttendance = subjects.reduce((acc, subject) => {
//             acc[subject.name] = 0; // Initialize count for each subject
//             return acc;
//         }, {});
//
//         return sortedDates.map(date => {
//             let dataEntry = { date };
//
//             subjects.forEach(subject => {
//                 const record = subject.attendanceRecords?.find(a => a.date === date);
//
//                 if (record) {
//                     // Increment count if status is Present, Excused, or Sick Leave
//                     if (["Present", "Excused", "Sick Leave"].includes(record.status)) {
//                         cumulativeAttendance[subject.name] += 1;
//                     }
//                 }
//
//                 // Store cumulative value
//                 dataEntry[subject.name] = cumulativeAttendance[subject.name];
//             });
//
//             return dataEntry;
//         });
//     };
//
//     return (
//         <div className="p-4 sm:p-6 max-w-3xl mx-auto">
//             <h1 className="text-2xl sm:text-3xl font-bold text-center">
//                 <FontAwesomeIcon icon={faThumbTack} className="mr-2" /> Attendance Dashboard
//             </h1>
//
//             {/* Attendance Trends */}
import { useState, useEffect } from "react";
import { db } from "../database/db";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faThumbTack,
    faExclamationTriangle,
    faHistory
} from "@fortawesome/free-solid-svg-icons";

const DashboardPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [lowAttendanceList, setLowAttendanceList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const storedSubjects = await db.subjects.toArray();
            setSubjects(storedSubjects);
            
            // Calculate low attendance subjects for the top warning card
            const low = storedSubjects.filter(sub => {
                const present = sub.attendanceRecords?.filter(a => a.status === "Present").length || 0;
                const total = sub.totalStrictClasses || 0;
                return total > 0 && (present / total) < 0.75;
            }).map(sub => ({
                 name: sub.name,
                 percentage: ((sub.attendanceRecords?.filter(a => a.status === "Present").length || 0) / sub.totalStrictClasses * 100).toFixed(0)
            }));
            setLowAttendanceList(low);
        };
        fetchData();
    }, []);

    const calculatePercentage = (present, total) => {
        return total > 0 ? `${((present / total) * 100).toFixed(0)}%` : "N/A";
    };

    const getInsightBadge = (present, total, totalStrict) => {
         if (totalStrict === 0) return null;
         const percentage = present / totalStrict;

         if (percentage < 0.75) {
             // Recovery Needed
             const needed = Math.ceil(((0.75 * totalStrict) - present) / 0.25);
             const val = Math.max(needed, 1);
             return (
                 <span className="badge badge-error text-white font-bold ml-2 text-xs">
                     Attend: {val}
                 </span>
             );
         } else {
             // Safe Bunks
             const bunks = Math.floor((present / 0.75) - totalStrict);
             if (bunks > 0) {
                 return (
                     <span className="badge badge-success text-white font-bold ml-2 text-xs">
                         Safe: {bunks}
                     </span>
                 );
             }
         }
         return null;
    };

    return (
        <div className="p-4 sm:p-6 flex flex-col items-center min-h-screen bg-base-100 text-base-content">
            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    <FontAwesomeIcon icon={faThumbTack} className="mr-2 text-primary" /> Dashboard
                </h1>
                <Link to="/settings" className="btn btn-ghost btn-sm btn-circle">
                   {/* Placeholder for settings icon if needed */}
                </Link>
            </div>

            <div className="w-full max-w-md space-y-8">
                
                {/* Critical Warning Card - Only shows if action needed */}
                {lowAttendanceList.length > 0 && (
                    <div className="card bg-base-200 border-l-4 border-error shadow-md">
                        <div className="card-body p-4">
                            <h3 className="text-lg font-bold text-error flex items-center mb-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                Action Needed
                            </h3>
                            <div className="text-sm text-base-content/80">
                                <span className="font-semibold text-error">{lowAttendanceList.length} Subject{lowAttendanceList.length > 1 ? 's' : ''}</span> below 75%.
                                <ul className="list-disc list-inside mt-1 ml-1 opacity-80">
                                    {lowAttendanceList.map((sub, i) => (
                                        <li key={i}>{sub.name} ({sub.percentage}%)</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Your Subjects List */}
                <div>
                     <h2 className="text-lg font-semibold mb-3 px-1 text-gray-500 uppercase tracking-wider text-xs">
                        Your Subjects
                    </h2>
                    {subjects.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">No subjects found. Add some in Settings!</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
                                const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
                                const pct = totalStrictClasses > 0 ? (strictPresent / totalStrictClasses) * 100 : 0;
                                const isLow = pct < 75 && totalStrictClasses > 0;
                                
                                return (
                                    <div key={id} className={`collapse collapse-arrow bg-base-200 border ${isLow ? 'border-red-200 dark:border-red-900/50' : 'border-base-300'} shadow-sm rounded-lg`}>
                                        <input type="checkbox" /> 
                                        <div className="collapse-title flex justify-between items-center pr-10">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base sm:text-lg">{name}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {/* History Button */}
                                                <Link 
                                                    to={`/history/${id}`} 
                                                    className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary z-50 mr-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FontAwesomeIcon icon={faHistory} className="text-base" />
                                                </Link>

                                                {/* Insight Badge */}
                                                {getInsightBadge(strictPresent, 0, totalStrictClasses)}

                                                <span className={`font-bold ml-1 text-lg ${
                                                    isLow ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {calculatePercentage(strictPresent, totalStrictClasses)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="collapse-content">
                                            <div className="grid grid-cols-4 gap-2 text-xs sm:text-sm mt-2 text-center">
                                                <div className="p-2 bg-base-100 rounded-lg flex flex-col">
                                                    <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold">Total</span> 
                                                    <span className="font-bold text-lg">{totalStrictClasses}</span>
                                                </div>
                                                <div className="p-2 bg-base-100 text-green-700 dark:text-green-300 rounded-lg flex flex-col">
                                                    <span className="opacity-75 text-[10px] uppercase font-bold">Present</span> 
                                                    <span className="font-bold text-lg">{strictPresent}</span>
                                                </div>
                                                <div className="p-2 bg-base-100 text-red-700 dark:text-red-300 rounded-lg flex flex-col">
                                                    <span className="opacity-75 text-[10px] uppercase font-bold">Absent</span> 
                                                    <span className="font-bold text-lg">{totalStrictClasses - strictPresent}</span>
                                                </div>
                                                <div className="p-2 bg-base-100 text-yellow-700 dark:text-yellow-300 rounded-lg flex flex-col">
                                                    <span className="opacity-75 text-[10px] uppercase font-bold">Excused</span> 
                                                    <span className="font-bold text-lg">{totalRelaxedClasses}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Granular Stats Section */}
                                            {(totalStrictClasses + totalRelaxedClasses) > 0 && (
                                                <div className="mt-4 pt-3 border-t border-base-200 dark:border-base-300">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Breakdown</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Physical Presence: Actual Present / (Strict + Relaxed) */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-base-content/70">Strict (Physical)</span>
                                                                <span className="font-bold">
                                                                    {((strictPresent / (totalStrictClasses + totalRelaxedClasses)) * 100).toFixed(0)}%
                                                                    <span className="text-[10px] font-normal text-gray-400 ml-1">
                                                                        ({strictPresent}/{totalStrictClasses + totalRelaxedClasses})
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <progress 
                                                                className="progress progress-primary w-full h-2" 
                                                                value={(strictPresent / (totalStrictClasses + totalRelaxedClasses)) * 100} 
                                                                max="100">
                                                            </progress>
                                                        </div>

                                                        {/* Medical/Credited: (Present + Relaxed) / (Strict + Relaxed) */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-base-content/70">Credited (Medical)</span>
                                                                <span className="font-bold">
                                                                    {(((strictPresent + totalRelaxedClasses) / (totalStrictClasses + totalRelaxedClasses)) * 100).toFixed(0)}%
                                                                    <span className="text-[10px] font-normal text-gray-400 ml-1">
                                                                        ({strictPresent + totalRelaxedClasses}/{totalStrictClasses + totalRelaxedClasses})
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <progress 
                                                                className="progress progress-accent w-full h-2" 
                                                                value={((strictPresent + totalRelaxedClasses) / (totalStrictClasses + totalRelaxedClasses)) * 100} 
                                                                max="100">
                                                            </progress>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mark Attendance CTA */}
                <Link to="/attendance" className="btn btn-primary w-full shadow-xl shadow-primary/20 text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faArrowRight} /> Mark Attendance
                </Link>
                
                <div className="h-10"></div> {/* Spacer */}
            </div>
        </div>
    );
};

export default DashboardPage;
