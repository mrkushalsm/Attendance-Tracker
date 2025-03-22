import Dexie from "dexie";

export const db = new Dexie("AttendanceDB");

// Define database schema
db.version(1).stores({
    subjects: '++id, name, totalStrictClasses, totalRelaxedClasses, attendanceRecords',
});
