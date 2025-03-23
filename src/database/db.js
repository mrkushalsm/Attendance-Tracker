import Dexie from "dexie";

export const db = new Dexie("AttendanceDB");

// Define database schema
db.version(1).stores({
    subjects: "++id, name, totalStrictClasses, totalRelaxedClasses, attendanceRecords",
});

// Upgrade database to include settings table
db.version(2).stores({
    settings: "id, value", // For storing general settings like college end time
});
