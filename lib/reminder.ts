import { db } from "../lib/db";

export const checkReminder = async (): Promise<boolean> => {
    try {
        const setting = await db.settings.get("collegeEndTime");
        if (!setting) return false;

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
                // @ts-ignore
                if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                    // @ts-ignore
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.showNotification("⏳ Reminder", {
                            body: "Fill your attendance now!",
                            icon: "/icons/reminder.png",
                            actions: [
                                { action: "open", title: "Open Attendance" },
                                { action: "snooze", title: "Snooze (1 Hour)" }
                            ],
                            tag: "attendance-reminder",
                            renotify: true
                        } as any);
                    });
                } else {
                    new Notification("⏳ Reminder", { body: "Fill your attendance now!" });
                }

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
