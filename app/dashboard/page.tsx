"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faThumbTack,
    faBook,
    faExclamationTriangle,
    faHistory
} from "@fortawesome/free-solid-svg-icons";
import { db, Subject } from "../../lib/db";

const DashboardPage = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lowAttendanceList, setLowAttendanceList] = useState<{name: string, percentage: string}[]>([]);
    const [attendanceGoal, setAttendanceGoal] = useState(75);

    useEffect(() => {
        const fetchData = async () => {
             // Fetch settings first
             try {
                const goalSetting = await db.settings.get("attendanceGoal");
                if (goalSetting) setAttendanceGoal(goalSetting.value);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }

            const storedSubjects = await db.subjects.toArray();
            setSubjects(storedSubjects);
            
            // Get the goal for calculation (default 75 if state update is slow, but we settled local var)
            const goalSetting = await db.settings.get("attendanceGoal");
            const goalPercent = goalSetting?.value || 75;
            const threshold = goalPercent / 100;

            // Calculate low attendance subjects for the top warning card
            const low = storedSubjects.filter(sub => {
                const present = sub.attendanceRecords?.filter(a => a.status === "Present").length || 0;
                const total = sub.totalStrictClasses || 0;
                return total > 0 && (present / total) < threshold;
            }).map(sub => ({
                 name: sub.name,
                 percentage: ((sub.attendanceRecords?.filter(a => a.status === "Present").length || 0) / sub.totalStrictClasses * 100).toFixed(0)
            }));
            setLowAttendanceList(low);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const calculatePercentage = (present: number, total: number) => {
        return total > 0 ? `${((present / total) * 100).toFixed(0)}%` : "N/A";
    };

    const getInsightBadge = (present: number, total: number, totalStrict: number) => {
         if (totalStrict === 0) return null;
         const percentage = present / totalStrict;
         const threshold = attendanceGoal / 100;

         if (percentage < threshold) {
             // Recovery Needed
             const needed = Math.ceil(((threshold * totalStrict) - present) / (1 - threshold));
             const val = Math.max(needed, 1);
             return (
                 <span className="badge badge-error text-white font-bold ml-2 text-xs">
                     Attend: {val}
                 </span>
             );
         } else {
             // Safe Bunks
             const bunks = Math.floor((present / threshold) - totalStrict);
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
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    <FontAwesomeIcon icon={faThumbTack} className="mr-2 text-primary" /> Dashboard
                </h1>
                <Link href="/settings" className="btn btn-ghost btn-circle">
                   {/* Settings Icon placeholder or actual link */}
                   <FontAwesomeIcon icon={faThumbTack} className="opacity-0" />
                </Link>
            </div>

            <div className="w-full max-w-6xl space-y-8">
                
                {/* Critical Warning Card - Centered max width */}
                {lowAttendanceList.length > 0 && (
                    <div className="card bg-base-200 border-l-4 border-error shadow-md max-w-3xl mx-auto w-full">
                        <div className="card-body p-6">
                            <h3 className="text-xl font-bold text-error flex items-center mb-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                Action Needed
                            </h3>
                            <div className="text-base text-base-content/80">
                                <span className="font-semibold text-error">{lowAttendanceList.length} Subject{lowAttendanceList.length > 1 ? 's' : ''}</span> below {attendanceGoal}%.
                                <ul className="list-disc list-inside mt-2 ml-2 opacity-80 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                    {lowAttendanceList.map((sub, i) => (
                                        <li key={i}>{sub.name} ({sub.percentage}%)</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Your Subjects List - Responsive Grid */}
                <div>
                     <h2 className="text-lg font-semibold mb-4 px-1 text-gray-500 uppercase tracking-wider text-xs">
                        Your Subjects
                    </h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : subjects.length === 0 ? (
                        <p className="text-gray-500 text-center py-10 text-xl">No subjects found. Add some in Settings!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map(({ id, name, attendanceRecords, totalStrictClasses, totalRelaxedClasses }) => {
                                const strictPresent = attendanceRecords?.filter((a) => a.status === "Present").length || 0;
                                const pct = totalStrictClasses > 0 ? (strictPresent / totalStrictClasses) * 100 : 0;
                                const isLow = pct < attendanceGoal && totalStrictClasses > 0;
                                
                                return (
                                    <div key={id} className={`collapse collapse-arrow bg-base-200 border ${isLow ? 'border-red-200 dark:border-red-900/50' : 'border-base-300'} shadow-sm rounded-2xl h-fit`}>
                                        <input type="checkbox" /> 
                                        <div className="collapse-title flex justify-between items-center pr-10 py-4">
                                            <div className="flex flex-col truncate pr-2">
                                                <span className="font-semibold text-lg truncate" title={name}>{name}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* History Button */}
                                                <Link 
                                                    href={`/history/${id}`} 
                                                    className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary z-50 mr-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FontAwesomeIcon icon={faHistory} className="text-base" />
                                                </Link>

                                                {/* Insight Badge */}
                                                <div className="hidden sm:block">
                                                    {getInsightBadge(strictPresent, 0, totalStrictClasses)}
                                                </div>

                                                <span className={`font-bold ml-1 text-xl ${
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
                                                        {/* Physical Presence */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-base-content/70">Strict</span>
                                                                <span className="font-bold">
                                                                    {((strictPresent / (totalStrictClasses + totalRelaxedClasses)) * 100).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                            <progress 
                                                                className="progress progress-primary w-full h-2" 
                                                                value={(strictPresent / (totalStrictClasses + totalRelaxedClasses)) * 100} 
                                                                max="100">
                                                            </progress>
                                                        </div>

                                                        {/* Medical/Credited */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-base-content/70">Credited</span>
                                                                <span className="font-bold">
                                                                    {(((strictPresent + totalRelaxedClasses) / (totalStrictClasses + totalRelaxedClasses)) * 100).toFixed(0)}%
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
                <div className="max-w-md mx-auto w-full">
                    <Link href="/attendance" className="btn btn-primary w-full shadow-xl shadow-primary/20 text-xl font-bold h-16 rounded-2xl flex items-center justify-center gap-3">
                        <FontAwesomeIcon icon={faArrowRight} /> Mark Attendance
                    </Link>
                </div>
                
                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default DashboardPage;
