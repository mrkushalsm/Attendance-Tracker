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
//             <div className="mt-10 p-5 bg-base-200 text-base-content rounded-lg shadow">
//                 <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">
//                     <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Attendance Trends
//                 </h2>
//                 {attendanceData.length === 0 ? (
//                     <p className="text-lg text-gray-500 text-center">No attendance data available</p>
//                 ) : (
//                     <div className="flex justify-center items-center">
//                         <ResponsiveContainer width="90%" height={300}>
//                             <LineChart data={attendanceData}>
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 <XAxis dataKey="date" />
//                                 <YAxis />
//                                 <Tooltip />
//                                 {subjects.map(subject => (
//                                     <Line key={subject.id} type="monotone" dataKey={subject.name} stroke="#82ca9d" strokeWidth={2} />
//                                 ))}
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//                 )}
//             </div>
//
//             {/* Per-Subject Attendance */}
//             <div className="mt-10">
//                 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Your Subjects</h2>
//
//                 {subjects.length === 0 ? (
//                     <p className="text-lg text-gray-500 text-center">No subjects found</p>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//                         {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
//                             const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
//                             const adjustedPresent = attendanceRecords?.reduce(
//                                 (count, a) =>
//                                     (a.status === "Present" || a.status === "Excused" || a.status === "Sick Leave") ? count + 1 : count,
//                                 0
//                             );
//
//                             const hasAdjustedAttendance = attendanceRecords?.some(
//                                 (a) => a.status === "Excused" || a.status === "Sick Leave"
//                             );
//
//                             return (
//                                 <div key={id} className="p-5 bg-base-200 text-base-content rounded-lg shadow">
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
//                                     <p className="mt-2">
//                                         <FontAwesomeIcon icon={faChartLine} className="mr-1" />
//                                         <strong>Core Attendance:</strong> {calculatePercentage(strictPresent, totalStrictClasses)}
//                                     </p>
//
//                                     {hasAdjustedAttendance && (
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
//                 )}
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
import { useState, useEffect } from "react";
import { db } from "../database/db";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faThumbTack,
    faBook,
    faCheckCircle,
    faTimesCircle,
    faCalendarAlt,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

const DashboardPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const storedSubjects = await db.subjects.toArray();
            setSubjects(storedSubjects);
            setAttendanceData(processAttendanceData(storedSubjects));
        };

        fetchData();
    }, []);

    const calculatePercentage = (present, total) => {
        return total > 0 ? `${((present / total) * 100).toFixed(2)}%` : "0%";
    };

    const processAttendanceData = (subjects) => {
        const dates = new Set();
        subjects.forEach(subject => {
            subject.attendanceRecords?.forEach(record => dates.add(record.date));
        });

        const sortedDates = [...dates].sort();
        let cumulativeAttendance = subjects.reduce((acc, subject) => {
            acc[subject.name] = 0;
            return acc;
        }, {});

        return sortedDates.map(date => {
            let dataEntry = { date };

            subjects.forEach(subject => {
                // Get all records for this date (support multiple classes per day)
                const records = subject.attendanceRecords?.filter(a => a.date === date) || [];
                
                records.forEach(record => {
                    if (["Present", "Excused", "Sick Leave"].includes(record.status)) {
                        cumulativeAttendance[subject.name] += 1;
                    }
                });
                
                dataEntry[subject.name] = cumulativeAttendance[subject.name];
            });

            return dataEntry;
        });
    };

    const predefinedColors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFF5", "#FF8C33", "#8C33FF", "#33FF8C", "#FF3333"
    ];

    // Assign distinct colors dynamically
    const getColorForSubject = (index) => {
        if (index < predefinedColors.length) {
            return predefinedColors[index]; // Use predefined distinct colors first
        }
        // Generate high-contrast random colors if predefined colors are exhausted
        const hue = (index * 137) % 360; // Ensures well-spaced hues
        return `hsl(${hue}, 85%, 50%)`;
    };

    // Generate a color map for subjects
    const colorMap = subjects.reduce((acc, subject, index) => {
        acc[subject.name] = getColorForSubject(index);
        return acc;
    }, {});

    return (
        <div className="p-4 sm:p-6 flex flex-col items-center">
            {/* Heading Outside Container */}
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-10">
                <FontAwesomeIcon icon={faThumbTack} className="mr-2" /> Attendance Dashboard
            </h1>

            {/* Centered Content */}
            <div className="w-full max-w-3xl bg-base-200 text-base-content p-6 rounded-lg shadow">
                {/* Attendance Trends */}
                <div className="mb-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
                        <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Attendance Trends
                    </h2>
                    {attendanceData.length === 0 ? (
                        <p className="text-lg text-gray-500 text-center">No attendance data available</p>
                    ) : (
                        <>
                            <div className="flex justify-center items-center">
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={attendanceData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend verticalAlign="top" height={36} />
                                        {subjects.map((subject, index) => (
                                            <Line
                                                key={subject.id}
                                                type="monotone"
                                                dataKey={subject.name}
                                                stroke={colorMap[subject.name]} // Assign unique color
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Color Legend */}
                            <div className="flex flex-wrap justify-center mt-4">
                                {subjects.map((subject, index) => (
                                    <div key={index} className="flex items-center mr-4 mb-2">
                                        <span className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: colorMap[subject.name] }}></span>
                                        <span className="text-sm">{subject.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Per-Subject Attendance */}
                <div className="mb-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-10">Your Subjects</h2>
                    {subjects.length === 0 ? (
                        <p className="text-lg text-gray-500 text-center">No subjects found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
                                const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
                                const adjustedPresent = attendanceRecords?.reduce(
                                    (count, a) =>
                                        (a.status === "Present" || a.status === "Excused" || a.status === "Sick Leave") ? count + 1 : count,
                                    0
                                );

                                const totalClasses = totalRelaxedClasses + totalStrictClasses
                                const absentClasses = totalClasses - adjustedPresent;

                                const hasAdjustedAttendance = attendanceRecords?.some(
                                    (a) => a.status === "Excused" || a.status === "Sick Leave"
                                );

                                return (
                                    <div key={id} className="p-5 bg-base-100 rounded-lg shadow">
                                        <h3 className="text-lg sm:text-xl font-bold text-center mb-5">
                                            <FontAwesomeIcon icon={faBook} className="mr-2" /> {name}
                                        </h3>

                                        {/* Attendance Stats */}
                                        <p className="mt-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                            <strong>Total Classes:</strong> {totalClasses}
                                        </p>
                                        <p className="mt-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                            <strong>Attended:</strong> {strictPresent}
                                        </p>
                                        <p className="mt-2">
                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                                            <strong>Absent:</strong> {absentClasses}
                                        </p>
                                        <p className="mt-2">
                                            <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                                            <strong>Core Attendance:</strong> {calculatePercentage(strictPresent, totalStrictClasses)}
                                        </p>

                                        {hasAdjustedAttendance && (
                                            <>
                                                <p className="mt-2">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                                    <strong>Total Adjusted Classes:</strong> {totalRelaxedClasses}
                                                </p>
                                                <p className="mt-2">
                                                    <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                                                    <strong>Adjusted Attendance:</strong> {calculatePercentage(adjustedPresent, totalClasses)}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* View Attendance Page */}
                <Link to="/attendance" className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faArrowRight} /> Mark Attendance
                </Link>
            </div>
        </div>
    );
};

export default DashboardPage;
