# 📊 Smart Attendance Tracker App

A fully responsive, privacy-focused attendance tracker for college students — no login required, works offline, and stores your data locally using IndexedDB. Designed for mobile-first use, with planned AI integration to simplify subject entry and tracking.

---

## 🚀 Features

- ✅ **Mark attendance** for each subject with custom categories:
    - Present
    - Absent
    - Excused (e.g. for events)
    - Sick Leave
- 📅 **Flexible tracking**:
    - Total strict vs relaxed attendance
    - Custom thresholds and reminders
- 📈 **Attendance dashboard** with subject-wise and overall stats
- 🌗 **Light/Dark mode** toggle with theme persistence
- 📦 **Offline-first** via IndexedDB + Dexie.js
- ⚙️ **Settings page** to customize the app
- 🔐 No login required — works per browser

---

## 🧠 AI Integration (In Progress)

We're in the process of integrating **AI-based timetable extraction** using Google Gemini AI:

- 🖼️ Upload an image of your timetable (screenshot/photo)
- 🤖 AI will extract subjects and auto-fill them into your tracker
    - 🔁 Future plans: Auto-increment attendance using schedule

      >   ⚠️ Currently using local Gemini API integration — subject extraction from image is under development and may return raw text.

---

## 🛠️ Tech Stack

- **React** + **Vite**
- **Tailwind CSS v4** + **DaisyUI**
- **Dexie.js** for IndexedDB
- **PWA-ready** structure
- **Google Gemini API** (for OCR + AI processing)

---

## 📂 Project Structure

```
src/ 
├── components/ 
│   ├── Dashboard/ 
│   ├── Attendance/
│   └── Settings/
├── database/
│   └── db.js
├── pages/
│   ├── DashboardPage.jsx
│   ├── AttendancePage.jsx
│   ├── Home.jsx
│   └── SettingsPage.jsx
├── utils/
│   ├── reminder.js
│   └── geminiApi.js (not implemented yet)
├── App.jsx
├── index.css
└── main.jsx
```

---

## 📲 Usage

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/smart-attendance-tracker.git
   cd smart-attendance-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Two ways to approach this,
   1. Run without PWA Service Worker
      ```bash
      npm run dev
      ```
      ### (OR)
   2. Run with PWA Service Worker
        ```bash
      npm install -g serve
      ```
      ```bash
      npm run build
      ```
      ```bash
      npx serve -s dist
      ```

---

## 📌 Roadmap

- [x] Attendance dashboard
- [x] Manual subject entry
- [x] Light/Dark theme support
- [ ] ✅ AI-powered timetable upload (in progress)
- [ ] 🔁 Auto-increment based on schedule (uses different method for now)
- [x] 🧪 Subject editing with preview
- [x] 🔔 Notifications/reminders after college end time
- [x] 📱 Full PWA support

---

## 🙌 Contributions
Coming soon! Once AI features are stabilized, we'll open the repo for community contributions.

## 📄 License
MIT License

---

Let me know if you'd like a version with your GitHub repo URL added, or if you want it split in