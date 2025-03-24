self.addEventListener("notificationclick", (event) => {
    event.notification.close(); // Close the notification

    if (event.action === "open") {
        clients.openWindow("/attendance"); // Open the attendance page
    } else if (event.action === "snooze") {
        console.log("🔔 Snooze activated. Reminding in 1 hour...");

        // Schedule a new reminder 1 hour later
        setTimeout(() => {
            self.registration.showNotification("⏳ Reminder (Snoozed)", {
                body: "Time to fill your attendance!",
                icon: "/icons/reminder.png",
                actions: [
                    { action: "open", title: "Open Attendance" },
                    { action: "snooze", title: "Snooze (1 Hour)" }
                ],
                tag: "attendance-reminder",
                renotify: true
            });
        }, 60 * 60 * 1000); // 1 hour delay
    }
});
