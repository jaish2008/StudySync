# StudySync
 A smart study companion app for students to organize sessions, collaborate in real-time, track progress, and share notes — all in one place.
# 📚 StudySync — College Assignment Tracker

A clean, modern assignment tracker for college students to manage tasks, deadlines, and progress — powered by **Firebase Firestore** for real-time cloud storage.

---

## 🌐 Live Demo

🔗 [https://jaish2008.github.io/studysync](https://jaish2008.github.io/studysync)


---

## ✨ Features

- ✅ **Add, Edit, Delete** assignments easily
- 📊 **Live Stats** — Total, Completed, Pending, Overdue counts
- 🔄 **Progress Ring** — Visual completion percentage
- 🔍 **Search** assignments by title, subject or type
- 🏷️ **Filter** by All / Pending / In Progress / Done / Overdue
- ⚡ **Auto Overdue Detection** — tasks past due date turn red automatically
- ☁️ **Firebase Firestore** — data saved in real-time cloud database
- 📱 **Responsive Design** — works on desktop, tablet and mobile
- 🌙 **Dark Theme** — easy on the eyes during late night study sessions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling & Animations |
| JavaScript (ES6) | Logic & Interactivity |
| Firebase Firestore | Cloud Database |
| Google Fonts | Typography (Syne + DM Mono) |
| GitHub Pages | Hosting & Deployment |

---

## 📁 Project Structure

```
studysync/
├── index.html       # Main HTML file
├── style.css        # All styles and animations
├── script.js        # Firebase logic and app functionality
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/jaish2008/studysync.git
cd studysync
```

### 2. Setup Firebase
1. Go to [firebase.google.com](https://firebase.google.com) → Console
2. Create a new project
3. Enable **Firestore Database** (Blaze plan required)
4. Go to **Project Settings** → Register a Web App
5. Copy your `firebaseConfig` and replace it in `script.js`

### 3. Update Firestore Rules
In Firebase Console → Firestore → Rules, paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Add Authorized Domain
Firebase Console → Authentication → Settings → Authorized Domains → Add:
```
jaish2008.github.io
```

### 5. Open in Browser
Just open `index.html` in Chrome or Edge — no server needed!

---

## 📦 Deployment (GitHub Pages)

1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set branch to `main` → Click **Save**
4. Your site will be live at:
```
https://jaish2008.github.io/studysync
```

---

## 📸 Screenshots

> Add screenshots of your app here after deployment!

---

## 🔮 Future Improvements

- 🔐 User Authentication (login/signup)
- 📅 Calendar view
- 🔔 Due date notifications
- 📂 Subject-wise grouping
- 📈 Weekly progress charts
- 🌐 Multi-user / team support

---

## 👨‍💻 Author

**Jaishmeet kaur**
- GitHub: [@jaish2008](https://github.com/jaish2008)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).





