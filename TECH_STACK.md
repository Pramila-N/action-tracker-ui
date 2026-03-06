# TECH STACK

- **Frontend:** Vite + React.js
- **UI Styling:** HTML5, CSS3, Tailwind CSS
- **UI Components:** shadcn/ui
- **API:** Axios (REST API)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Token (JWT)
- **Password Hashing:** bcryptjs
- **File Uploads:** Multer

---

# ARCHITECTURE

- **Architecture Type:** Client – Server Architecture (3 Tier)
- **Flow:** User (Browser) → React Frontend → REST API → Node.js + Express → MongoDB

---

# PROJECT STRUCTURE

```
action-tracker-ui/
├── client/                    # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts (Auth, etc.)
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Root component
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.ts     # Tailwind CSS config
│   └── package.json           # Frontend dependencies
│
└── server/                    # Backend (Node.js + Express)
    ├── routes/                # API routes
    │   ├── auth.js            # Authentication endpoints
    │   ├── tasks.js           # Task management endpoints
    │   ├── users.js           # User management endpoints
    │   ├── notifications.js   # Notification endpoints
    │   └── activityLogs.js    # Activity log endpoints
    ├── models/                # MongoDB models
    │   ├── User.js
    │   ├── Task.js
    │   ├── Notification.js
    │   ├── ActivityLog.js
    │   └── LoginHistory.js
    ├── server.js              # Express server entry point
    ├── seed.js                # Database seeding script
    └── package.json           # Backend dependencies
```

---

# KEY FEATURES

- **Multi-role User System:** Admin, Faculty, Student
- **Task Management:** Create, assign, and track action items
- **Dashboard Analytics:** KPIs and performance metrics
- **Real-time Notifications:** Activity logging and user alerts
- **User Management:** Admin capabilities for user control
- **File Uploads:** Support for task attachments
- **JWT Authentication:** Secure token-based authentication
