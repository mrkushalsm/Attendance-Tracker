import { useState, useEffect } from "react";
import { db } from "../database/db";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faThumbTack,
    faBook,
    faCheckCircle,
    faCalendarAlt,
    faChartLine
} from "@fortawesome/free-solid-svg-icons";

const DashboardPage = () => {
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const storedSubjects = await db.subjects.toArray();
            setSubjects(storedSubjects);
        };

        fetchData();
    }, []);

    // Function to calculate percentage safely
    const calculatePercentage = (present, total) => {
        return total > 0 ? ((present / total) * 100).toFixed(2) + "%" : "N/A";
    };

    return (
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
                <FontAwesomeIcon icon={faThumbTack} className="mr-2" /> Attendance Dashboard
            </h1>

            {/* Per-Subject Attendance */}
            <div className="mt-10">
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Your Subjects</h2>

                {subjects.length === 0 ? (
                    <p className="text-lg text-gray-500">No subjects found</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                        {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
                            const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
                            const adjustedPresent = attendanceRecords?.reduce((count, a) =>
                                (a.status === "Present" || a.status === "Excused" || a.status === "Sick Leave") ? count + 1 : count, 0);

                            const hasExcusedOrSickLeave = attendanceRecords?.some(
                                (a) => a.status === "Excused" || a.status === "Sick Leave"
                            );

                            return (
                                <div key={id} className="p-5 bg-base-200 text-base-content rounded-lg shadow">
                                    {/* Centered Subject Name */}
                                    <h3 className="text-lg sm:text-xl font-bold text-center mb-3">
                                        <FontAwesomeIcon icon={faBook} className="mr-2" /> {name}
                                    </h3>

                                    {/* Attendance Stats */}
                                    <p className="mt-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                        <strong>Total Classes:</strong> {totalStrictClasses}
                                    </p>
                                    <p className="mt-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                        <strong>Attended:</strong> {strictPresent}
                                    </p>

                                    <p className="mt-2">
                                        <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                                        <strong>Core Attendance:</strong> {calculatePercentage(strictPresent, totalStrictClasses)}
                                    </p>

                                    {hasExcusedOrSickLeave && (
                                        <>
                                            <p className="mt-2">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                                <strong>Total Adjusted Classes:</strong> {totalRelaxedClasses}
                                            </p>
                                            <p className="mt-2">
                                                <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                                                <strong>Adjusted Attendance:</strong> {calculatePercentage(adjustedPresent, totalRelaxedClasses)}
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
            <Link to="/attendance" className="btn btn-primary w-full mt-10 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faArrowRight} /> Mark Attendance
            </Link>
        </div>
    );
};

export default DashboardPage;
