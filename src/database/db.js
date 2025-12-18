import Dexie from "dexie";

export const db = new Dexie("AttendanceTracker_v4");

// Define database schema for v4 (Fresh Start)
db.version(1).stores({
    subjects: "++id, name, totalStrictClasses, totalRelaxedClasses, attendanceRecords, schedule",
    settings: "id, value"
});