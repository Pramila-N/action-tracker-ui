# Action Item Tracker - Project Flow

This document explains how the Action Item Tracker works end-to-end.

## 1. System Flow (High Level)

1. User opens the React app in browser.
2. User logs in or registers.
3. Frontend receives JWT and user details (role: admin, faculty, or student).
4. Frontend routes user to role-specific dashboard.
5. User actions (create task, update progress, review task, view notifications) call REST APIs.
6. Node.js + Express validates request, applies business logic, and updates MongoDB.
7. Response is returned to frontend and UI refreshes with latest data.

Flow summary:

User -> React Frontend -> REST API -> Express Server -> MongoDB -> Response -> UI Update

## 2. Authentication and Routing Flow

Frontend routes are defined in client/src/App.tsx.

1. Public routes:
- /login
- /register

2. Protected routes (auth required):
- /admin/*
- /faculty/*
- /student/*
- /profile

3. Route guards:
- ProtectedRoute: blocks unauthenticated access and redirects to /login.
- PublicRoute: if already authenticated, redirects to role home.
- RootRedirect: sends authenticated users to /{role} and guests to /login.

## 3. Role-Based Project Flow

### Admin Flow

1. Admin logs in.
2. Lands on /admin dashboard.
3. Manages users via /admin/users.
4. Reviews analytics/reports via /admin/reports.

### Faculty Flow

1. Faculty logs in.
2. Lands on /faculty dashboard.
3. Creates tasks at /faculty/tasks/create.
4. Assigns tasks to student(s) with deadline and details.
5. Tracks tasks at /faculty/tasks and opens /faculty/tasks/:taskId.
6. Reviews student submissions:
- Accept -> task completes.
- Reject with remarks -> student gets rework state.
7. Checks leaderboard/productivity and reports.

### Student Flow

1. Student logs in.
2. Lands on /student dashboard.
3. Opens assigned tasks at /student/tasks.
4. Works on task at /student/tasks/:taskId:
- updates progress (0-100)
- starts/stops timer
- posts in task discussion forum
5. At 100% progress, submits for review.
6. If rejected, reads remarks and resubmits after rework.
7. Tracks productivity score, notifications, and time reports.

## 4. Task Lifecycle Flow

Normal lifecycle:

pending -> in_progress -> submitted -> completed

Rework lifecycle:

submitted -> rework_required -> submitted -> completed

Late rework lifecycle:

submitted -> late_rework_required -> submitted -> completed_late_rework

Extra states:
- overdue (deadline crossed without completion)

## 5. Backend API Flow

Server entry: server/server.js

Mounted route groups:
- /api/auth
- /api/tasks
- /api/users
- /api/notifications
- /api/activity-logs
- /api/forum

Typical API request flow:

1. Frontend sends request with payload and auth token.
2. Express route handler validates input and access.
3. Mongoose model performs DB read/write.
4. Optional side effects run (notifications, activity logs, productivity updates).
5. JSON response returns updated state.

## 6. Discussion Forum Flow

1. Student or faculty opens a task detail page.
2. Frontend loads forum status/messages for task.
3. If task has shared group assignment, forum uses shared taskGroupId context.
4. User posts message to forum endpoint.
5. Server stores message and triggers participant notifications.
6. Thread remains visible after completion (read-only when posting is disabled).

## 7. Notification Flow

Deadline checks are triggered to notify students at:
- 24 hours before deadline
- 2 hours before deadline
- after deadline passes

Frontend dashboard shows these alerts with severity styling.

## 8. Local Development Flow

### Prerequisites
- Node.js installed
- MongoDB connection string

### Run Backend

From server/:

npm install
npm start

### Run Frontend

From client/:

npm install
npm run dev

Frontend default: http://localhost:5173
Backend default: http://localhost:5000

## 9. Core Tech Stack

- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT
- Uploads: Multer

---

If needed, this README can be expanded with sequence diagrams for:
- login/auth token flow
- task submission and review flow
- forum notification flow
