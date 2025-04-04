import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const extractTextFromImage = async (imageBase64) => {
    const structuredPrompt = `
        Extract a structured college timetable from the given image. **Ensure that all weekdays (Monday to Friday) are extracted, even if some subjects are missing.**

        ## **📌 Output Format Example (Strict JSON Format Only, Subject Codes Only):**
        {
          "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "subjects": [
            {
              "code": "MA202",
              "timings": [
                {"day": "Monday", "start": "10:00 AM", "end": "11:00 AM"},
                {"day": "Wednesday", "start": "11:00 AM", "end": "12:00 PM"}
              ]
            },
            {
              "code": "PH101",
              "timings": [
                {"day": "Tuesday", "start": "9:00 AM", "end": "10:00 AM"},
                {"day": "Thursday", "start": "2:00 PM", "end": "3:00 PM"}
              ]
            }
          ]
        }
        
        ---

        ## **📌 Critical Extraction Rules (Ensure No Days Are Skipped!):**
        ✅ **Extract only subject codes (e.g., CS101, MA202). Ignore subject names.**  
        ✅ **Force extraction of all weekdays** (Monday to Friday).  
        ✅ If a day has **no subjects**, return an **empty array** instead of skipping it.  
        ✅ **Strictly use table format extraction** (rows = days, columns = subjects).  
        ✅ Ignore **LABS & practicals** (e.g., "Physics Lab").  
        ✅ **Ensure no subjects are duplicated**—combine multiple timings under one subject code.  
        ✅ **Use exact timings** as seen in the timetable (keep AM/PM format).  
        ✅ **If some text is unclear, attempt best-effort extraction rather than skipping the day.**  
        
        ---

        ## **📌 Additional Fixes for Better Accuracy**
        🔹 **If Gemini detects only 2-3 days, explicitly ask it to check again and extract ALL days.**  
        🔹 **If days are missing due to table misinterpretation, force it to recognize full week structure.**  
        🔹 **Ensure JSON format is strictly followed—no extra explanations.**  
        🔹 **Ensure start time stores only one time value and not more than one**    
        
        ---
        
        💡 **Output the data strictly in JSON format. Do not add explanations or extra text.**
    `;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/png", // Change if needed
                                data: imageBase64,
                            },
                        },
                        { text: structuredPrompt }
                    ]
                }
            ]
        });

        let extractedData = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("✅ Initial Extracted Data:", extractedData);

        // Convert to JSON
        let parsedData;
        try {
            // Remove both the starting ```json and the closing ```
            const cleanData = extractedData
                .replace(/^```json\s*/g, '')  // Remove starting ```json and any space
                .replace(/```$/g, '')         // Remove the closing ```
                .trim();                      // Remove any leading or trailing whitespace

            // Log the cleaned data to inspect its format
            console.log("Cleaned Data:", cleanData);

            // Now try parsing the cleaned-up string
            parsedData = JSON.parse(cleanData);
            console.log(parsedData);
        } catch (jsonError) {
            console.warn("⚠️ Failed to parse extracted data. Returning as raw text.");
            console.error(jsonError);  // Log the error for better diagnostics
            alert("⚠️ Failed to read the timetable. Upload again or try after sometime.")
            return extractedData;
        }

        // Check if all days are present (Retry if missing days)
        const extractedDays = new Set(parsedData?.days || []);
        const requiredDays = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"]);

        // Convert Set to array before using `.every()`
        if (![...requiredDays].every(day => extractedDays.has(day))) {
            console.warn("⚠️ Missing days detected! Retrying with a stronger prompt...");

            const retryResponse = await axios.post(GEMINI_API_URL, {
                contents: [
                    {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: imageBase64,
                                },
                            },
                            {
                                text: structuredPrompt + "\n\n🚨 Important: DO NOT SKIP ANY DAYS!"
                            }
                        ]
                    }
                ]
            });

            extractedData = retryResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log("🔄 Retried Extracted Data:", extractedData);
            try {
                // Remove both the starting ```json and the closing ```
                const cleanData = extractedData
                    .replace(/^```json\s*/g, '')  // Remove starting ```json and any space
                    .replace(/```$/g, '')         // Remove the closing ```
                    .trim();                      // Remove any leading or trailing whitespace

                // Log the cleaned data to inspect its format
                console.log("Cleaned Data:", cleanData);

                // Now try parsing the cleaned-up string
                parsedData = JSON.parse(cleanData);
                console.log(parsedData);
            } catch (jsonError) {
                console.warn("⚠️ Failed to parse extracted data. Returning as raw text.");
                console.error(jsonError);  // Log the error for better diagnostics
                return extractedData;
            }
        }

        return parsedData;
    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);
        alert(`❌ Gemini API Error: ${JSON.stringify(error.response?.data)}`);
        return null;
    }
};
