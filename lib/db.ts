import Dexie, { Table } from 'dexie';

export interface AttendanceRecord {
    date: string;
    timestamp: number;
    status: "Present" | "Absent" | "Excused" | "Sick Leave";
}

export interface Subject {
    id?: number; // Auto-increment
    name: string;
    totalStrictClasses: number;
    totalRelaxedClasses: number;
    attendanceRecords: AttendanceRecord[];
    schedule: string[]; // e.g., ["Monday", "Wednesday"]
}

export interface Setting {
    id: string;
    value: any;
}

export class AttendanceDatabase extends Dexie {
    subjects!: Table<Subject, number>;
    settings!: Table<Setting, string>;

    constructor() {
        super('AttendanceTracker_v4');
        this.version(1).stores({
            subjects: '++id, name',
            settings: 'id'
        });
    }
}

export const db = new AttendanceDatabase();
