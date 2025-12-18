import Tesseract from 'tesseract.js';

/**
 * Parses OCR text to extract subjects and their schedules.
 * Returns an array of subjects with schedule: { name: "Maths", schedule: ["Monday", "Wednesday"] }
 */
export const parseTimetable = async (imageFile, onProgress) => {
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

/**
 * Heuristic parsing logic.
 * Simple V1: Splits by lines, looks for common day names, assumes other text is subject?
 * Actually, for V1, let's just extract unique words that look like subjects and map them to "all days" or let user edit.
 * Smart V2 (Regex):
 * Look for "Mon", "Tue"... 
 * If a line has "Mon 10:00 Maths", extract it.
 */
const parseTextToSubjects = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const subjects = [];
    const dayKeywords = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    // Basic heuristic: lines that aren't just days or times are likely subjects.
    // This is "dirty" parsing, relying on the user to fix it in the modal.
    lines.forEach(line => {
        const lower = line.toLowerCase();

        // Skip lines that are just day headers like "Monday Tuesday..."
        if (dayKeywords.every(d => lower.includes(d))) return;

        // Try to identify potential subject names (words > 2 chars, not numbers)
        const words = line.split(/\s+/).filter(w => w.length > 2 && isNaN(w));

        if (words.length > 0) {
            const subjectName = words.join(' ');
            // Check if duplicates
            if (!subjects.some(s => s.name === subjectName)) {
                subjects.push({
                    name: subjectName,
                    totalStrictClasses: 0, // Default
                    totalRelaxedClasses: 0,
                    schedule: [], // To be filled by user
                    attendanceRecords: []
                });
            }
        }
    });

    return subjects;
};
