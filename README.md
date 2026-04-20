# 🧠 MindMap – Emotional Pattern Tracker

🌐 Live Demo: https://mindmap-app.netlify.app/

---

## 📌 Overview

**MindMap** is a modern mental wellness web application that helps users track their emotions, identify patterns, and gain meaningful insights into their mental state.

The app goes beyond simple mood tracking by providing **real-time insights, behavioral patterns, and actionable suggestions** to improve emotional awareness.

---

## 🎯 Problem Statement

Students and individuals often experience stress, burnout, and emotional fluctuations but struggle to understand **why** they feel a certain way.

MindMap solves this by:

* Tracking daily emotional data
* Analyzing patterns over time
* Providing intelligent, human-like insights

---

## ✨ Key Features

### 🔐 Authentication

* Secure user login/signup using Firebase Authentication
* Protected routes for user-specific data

---

### 😊 Mood Logging (Core Feature)

* Track:

  * Mood (emoji scale)
  * Stress level
  * Energy level
  * Tags (study, sleep, social, etc.)
  * Notes
* Full CRUD support (Create, Read, Update, Delete)

---

### 📊 Dashboard

* Daily mood summary
* Weekly progress tracking
* Streak tracking
* Visual circular progress indicators
* Dynamic insight cards

---

### 📈 Insights & Analytics

* Mood trends over time
* Stress distribution
* Tag-based behavioral analysis
* Pattern detection:

  * Mood vs sleep
  * Mood vs workload
  * Mood vs social activity

---

### 🧠 Real-Time Insight Engine

* Instant feedback on mood entry
* Smart suggestions based on emotional state

#### Example insights:

* “You seem a bit overwhelmed today. Try taking a short break.”
* “Your mood improves after social interactions.”
* “You’ve been improving — keep it up!”

---

### 🔔 Smart Alerts

* Mood streak detection
* High stress warnings
* Reminder to log daily entries

---

### 📅 History View

* Calendar-based tracking
* View past entries
* Analyze consistency

---

### 📊 Data Visualization

* Line charts (mood trends)
* Bar charts (stress levels)
* Pie charts (activity tags)

---

### 🎨 UI/UX

* Modern glassmorphic design
* Responsive layout (mobile + desktop)
* Smooth transitions and clean navigation

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Recharts (for charts)

### Backend / Services

* Firebase Authentication
* Firebase Firestore (Database)

### Deployment

* Netlify for hosting and deployment

👉 Netlify enables building and deploying web apps directly from Git repositories with automated workflows ([Wikipedia][1])

---

## 📂 Project Structure

```
/src
  /components
  /pages
  /context
  /hooks
  /services
  /utils
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Swarit-Parida/mindmap-app.git
cd mindmap-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add Firebase Config

Create a file:

```
src/services/firebase.ts
```

Add your Firebase config:

```js
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};
```

---

### 4. Run locally

```bash
npm run dev
```

---

## 🔐 Security Note

This application:

* Uses Firebase Authentication for user identity
* Restricts database access using Firestore rules
* Does NOT provide medical advice

---

## ⚠️ Disclaimer

MindMap is a **self-awareness tool** designed for emotional tracking and insights.
It is **not a substitute for professional mental health care**.

---

## 🚀 Future Improvements

* AI-powered insights (OpenAI integration)
* Push notifications
* Social/community support features
* Wearable data integration

---

## 👨‍💻 Author

**Swarit Parida**

---

## ⭐ Final Note

> “This project is not just a tracker — it’s a step towards understanding yourself better.”

[1]: https://en.wikipedia.org/wiki/Netlify?utm_source=chatgpt.com "Netlify"
