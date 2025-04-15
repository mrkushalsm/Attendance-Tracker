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
[{"revision":null,"url":"assets/index-BLteg4u5.js"},{"revision":null,"url":"assets/index-Dp8_pjcL.css"},{"revision":"6329bfe3b3a5f372cbe66d643c6ff48f","url":"attendance-tracker.png"},{"revision":"7dfa467f20cf3cc07fb92d93f7a31805","url":"index.html"},{"revision":"1872c500de691dce40960bb85481de07","url":"registerSW.js"},{"revision":"178eee067f5205ed9aa6e417185ff62f","url":"sw.js"},{"revision":"6329bfe3b3a5f372cbe66d643c6ff48f","url":"attendance-tracker.png"},{"revision":"b5fdc369c1f8935aee0e242663a672a0","url":"manifest.webmanifest"}];
