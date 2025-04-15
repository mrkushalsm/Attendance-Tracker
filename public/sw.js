// public/sw.js

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "open") {
        clients.openWindow("/attendance");
    } else if (event.action === "snooze") {
        console.log("🔔 Snooze activated. Reminding in 1 hour...");

        setTimeout(() => {
            self.registration.showNotification("⏳ Reminder (Snoozed)", {
                body: "Time to fill your attendance!",
                icon: "/icons/reminder.png",
                actions: [
                    { action: "open", title: "Open Attendance" },
                    { action: "snooze", title: "Snooze (1 Hour)" },
                ],
                tag: "attendance-reminder",
                renotify: true,
            });
        }, 60 * 60 * 1000);
    }
});

// 💥 Workbox will inject cached asset list here
self.__WB_MANIFEST;