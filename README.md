# ☕ Study Cafe


> Your academic edge, brewed to perfection.

A full-featured academic resource platform for engineering students in Pune, built with **React.js**, **Context API**, and beautiful modern UI.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start

# 3. Open in browser
http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email              | Password |
|---------|--------------------|----------|
| Student | student@demo.com   | demo123  |
| Teacher | teacher@demo.com   | demo123  |
| Admin   | admin@demo.com     | demo123  |

> Tip: On the login page, click the quick-access buttons to auto-fill credentials.

---

## 📁 Project Structure

```
study-cafe/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── App.js                  # Root app + router
│   ├── index.js                # React DOM entry
│   ├── context/
│   │   └── AppContext.js       # Global state (auth, resources, theme)
│   ├── data/
│   │   └── dummyData.js        # All dummy data (users, colleges, resources)
│   ├── utils/
│   │   ├── theme.js            # Dark/light style helpers
│   │   └── icons.js            # SVG icon components
│   ├── styles/
│   │   └── global.css          # Global CSS, animations, utilities
│   ├── components/
│   │   ├── common/
│   │   │   ├── Toast.js        # Toast notification system
│   │   │   ├── StatCard.js     # Dashboard stat card
│   │   │   ├── SearchBar.js    # Reusable search input
│   │   │   └── Badge.js        # Role/status badges
│   │   └── layout/
│   │       ├── AppShell.js     # Main layout wrapper
│   │       ├── Sidebar.js      # Collapsible sidebar nav
│   │       └── Header.js       # Top header bar
│   └── pages/
│       ├── Landing.js          # Public landing page
│       ├── Auth.js             # Login + Signup
│       ├── Dashboard.js        # Role-based dashboard
│       ├── Colleges.js         # College selection cards
│       ├── Resources.js        # Notes / Papers / Videos / Sessions
│       ├── Upload.js           # Teacher upload page
│       ├── Routine.js          # Student daily routine tracker
│       └── Admin.js            # Admin panel (users, colleges, resources)
└── package.json
```

---

## 👥 User Roles

### 🎓 Student
- Register / Login
- Browse Colleges
- View Notes, Papers, Videos, Doubt Sessions
- Daily Study Routine Tracker with circular progress

### 👨‍🏫 Teacher
- Register / Login
- Upload Notes (PDF), Videos (YouTube), Papers, Schedule Sessions
- View resources across colleges

### 🛡 Admin
- Full platform control
- Manage Users (view, remove)
- View Colleges and their stats
- Browse all Resources

---

## 🎨 UI Features

- **Dark / Light mode** toggle (persistent per session)
- **Collapsible sidebar** navigation
- **Smooth animations** — fade-in, slide-in, stagger effects
- **Toast notifications** for all actions
- **Responsive design** — works on mobile and desktop
- **Search + Subject filter** on resources
- **Circular SVG progress** on routine tracker
- **Seat fill progress bar** on doubt sessions
- **Color-coded college cards** with ratings

---

## 🛠 Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React 18 (functional + hooks)|
| State     | Context API + useReducer     |
| Routing   | Custom page-state router     |
| Styling   | Inline styles + global CSS   |
| Icons     | Custom SVG components        |
| Fonts     | Sora (Google Fonts)          |
| Data      | Local dummy data (JS arrays) |

---

## 📦 Connect a Real Backend

To connect to a Node.js + Express + MongoDB backend, replace the functions in `src/context/AppContext.js`:

```js
// Replace login() with:
const login = async (email, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setPage('dashboard');
  }
};
```

MongoDB collections needed:
- `users` — name, email, password (hashed), role, avatar, joinDate
- `colleges` — name, short, city, students, rating, color, courses
- `resources` — type, title, subject, college, uploadedBy, date, ...

---

## 📝 License

MIT — free to use and modify.
