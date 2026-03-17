# 🚀 HabitOS

A dark-themed 3D habit tracking web app built with React,
Firebase and Three.js — track habits, build streaks,
log water and earn rewards daily.

## 🛠️ Tech Stack
- ⚛️ React + Vite
- 🔥 Firebase (Auth + Firestore)
- 🌐 Three.js + GSAP + Chart.js
- 📊 Chart.js for Analytics

## ✨ Features
- 🔐 Google & Email Authentication
- ✅ Real-time Habit Tracking
- 🔥 Daily Streak System
- 💧 Animated Water Tracker
- 🏆 XP Badges & Rewards
- 📊 Stats & Heatmaps
- 🎨 Glassmorphic Dark 3D UI

## 🚀 Setup & Installation
1. Clone the repo
   git clone https://github.com/shivakumarv047-cyber/Habitos.git

2. Install dependencies
   npm install

3. Create .env file and add Firebase keys
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

4. Run the app
   npm run dev

## 📁 Project Structure
src/
├── components/
│   ├── AuthPage.jsx
│   ├── Dashboard.jsx
│   ├── HabitsTab.jsx
│   ├── WaterTracker.jsx
│   ├── StatsPage.jsx
│   ├── RewardsPage.jsx
│   ├── SettingsPage.jsx
│   └── ThreeBackground.jsx
├── firebase/
│   ├── config.js
│   ├── authFunctions.js
│   └── dbFunctions.js
├── App.jsx
└── index.css

## 🔒 Environment Variables
Never commit your .env file.
All Firebase keys must be stored in .env locally.

## 📄 License
MIT License — free to use and modify.
```

**Step 4 — Scroll down → add commit message:**
```
📝 docs: add project README
