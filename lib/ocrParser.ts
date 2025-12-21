import Tesseract from 'tesseract.js';
import { Subject } from './db';

interface ParsedSubject extends Subject {
    // Helper type for matching structure before DB insertion
}

/**
 * Parses OCR text to extract subjects.
 */
export const parseTimetable = async (imageFile: File, onProgress?: (progress: number) => void): Promise<Subject[]> => {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'eng',
            {
                logger: m => {
                    if (onProgress && m.status === 'recognizing text') {
                        onProgress(Math.floor(m.progress * 100));
                    }
                }
            }
        );

        const text = result.data.text;
        console.log("OCR Text:", text);
        return parseTextToSubjects(text);

    } catch (error) {
        console.error("OCR Failed:", error);
        throw new Error("Failed to scan image.");
    }
};

const parseTextToSubjects = (text: string): Subject[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const subjects: Subject[] = [];
    const dayKeywords = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    lines.forEach(line => {
        const lower = line.toLowerCase();

        // Skip lines that are just day headers
        if (dayKeywords.every(d => lower.includes(d))) return;

        // Try to identify potential subject names (words > 2 chars, not numbers)
        const words = line.split(/\s+/).filter(w => w.length > 2 && isNaN(Number(w)));

        if (words.length > 0) {
            const subjectName = words.join(' ');
            // Check if duplicates
            if (!subjects.some(s => s.name === subjectName)) {
                subjects.push({
                    name: subjectName,
                    totalStrictClasses: 0,
                    totalRelaxedClasses: 0,
                    schedule: [],
                    attendanceRecords: []
                });
            }
        }
    });

    return subjects;
};
