// import { db } from "../database/db";
//
// export const checkReminder = async () => {
//     try {
//         const setting = await db.settings.get("collegeEndTime");
//
//         const storedEndTime = setting.value;
//
//         // Get current time in HH:MM format
//         const now = new Date();
//         const currentTime = now.toTimeString().slice(0, 5);
//
//         // Get today's date as YYYY-MM-DD
//         const today = now.toISOString().split("T")[0];
//         const lastNotified = localStorage.getItem("lastReminderDate");
//
//         if (lastNotified === today) {
//             console.log("🚫 Reminder already sent today.");
//             return false; // Prevent multiple notifications in one day
//         }
//
//         // Check if it's time to notify (within 10-seconds window)
//         if (currentTime === storedEndTime) {
//             console.log("✅ Time Matched! Reminder should trigger.");
//             new Notification("⏳ Reminder", { body: "Fill your attendance now!" });
//
//             // Store today's date to prevent duplicate reminders
//             localStorage.setItem("lastReminderDate", today);
//             return true;
//         }
//         return false;
//     } catch (error) {
//         console.error("❌ Error checking reminder:", error);
//         return false;
//     }
// };
import { db } from "../database/db";

export const checkReminder = async () => {
    try {
        const setting = await db.settings.get("collegeEndTime");

        const storedEndTime = setting.value;

        // Get current time in HH:MM format
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);

        // Get today's date as YYYY-MM-DD
        const today = now.toISOString().split("T")[0];
        const lastNotified = localStorage.getItem("lastReminderDate");

        if (lastNotified === today) {
            console.log("🚫 Reminder already sent today.");
            return false;
        }

        // Check if it's time to notify
        if (currentTime === storedEndTime) {
            console.log("✅ Time Matched! Reminder should trigger.");

            // Check Notification permission
            if (Notification.permission === "granted") {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification("⏳ Reminder", {
                        body: "Fill your attendance now!",
                        icon: "/icons/reminder.png", // Optional icon
                        actions: [
                            { action: "open", title: "Open Attendance" },
                            { action: "snooze", title: "Snooze (1 Hour)" }
                        ],
                        tag: "attendance-reminder", // Ensures only one reminder at a time
                        renotify: true
                    });
                });

                // Store today's date to prevent duplicate reminders
                localStorage.setItem("lastReminderDate", today);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Error checking reminder:", error);
        return false;
    }
};

