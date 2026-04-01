<!-- PDF Print Styling -->
<style>
@media print {
  h1, h2, h3 { page-break-after: avoid; }
  .page-break { page-break-before: always; }
}
</style>

<div style="text-align:center; margin-top:120px;">
<h1>ACTION ITEM TRACKER</h1>
<h2>PROJECT REPORT</h2>
<p>PDF-ready formatted version with manual page breaks</p>
</div>

<div class="page-break"></div>
# ACTION ITEM TRACKER
## PROJECT REPORT

Submitted in partial fulfillment for the award of the degree of

## BACHELOR OF ENGINEERING
### in
### INFORMATION SCIENCE AND ENGINEERING

BANNARI AMMAN INSTITUTE OF TECHNOLOGY  
(An Autonomous Institution Affiliated to Anna University, Chennai)  
SATHYAMANGALAM - 638401  
ANNA UNIVERSITY: CHENNAI 600025  
APRIL 2026

---

<div class="page-break"></div>

## BONAFIDE CERTIFICATE

Certified that this project report "ACTION ITEM TRACKER" is the bonafide work of the candidate who carried out the project work under my supervision.

SIGNATURE (Guide)  
SIGNATURE (HoD)

Submitted for Project Viva Voce examination held on: __________

Internal Examiner I: __________  
Internal Examiner II: __________

---

<div class="page-break"></div>

## DECLARATION

I affirm that the project work titled "Action Item Tracker" being submitted in partial fulfillment for the award of the degree of Bachelor of Engineering in Information Science and Engineering is the record of original work done by me under the guidance of my project mentor. It has not formed a part of any other project work submitted for the award of any degree or diploma, either in this or any other institution.

Candidate Signature: __________

Guide Signature: __________

---

<div class="page-break"></div>

## ACKNOWLEDGEMENT

I express my sincere gratitude to the management, principal, department faculty, and project guide for their support and guidance throughout this project. I also thank my peers and friends for their valuable feedback during design, implementation, and testing phases.

---

<div class="page-break"></div>

## ABSTRACT

Action Item Tracker is a full-stack web application designed to improve task execution visibility and accountability across three user roles: Admin, Faculty, and Student. The system supports end-to-end task lifecycle management including task creation, assignment, progress tracking, submission, review, rework handling, deadline monitoring, and productivity scoring.

The platform introduces a structured workflow where faculty create tasks and assign them to students, students track progress with timer-supported effort logging, and faculty review submissions with accept/reject actions. The application captures detailed activity logs and notification events to ensure transparency and timely follow-up.

A major contribution of the project is the inclusion of deadline-aware automation and measurable productivity analytics. Notifications are triggered at key milestones (24-hour reminder, 2-hour urgent reminder, and overdue alert), while leaderboard logic identifies top performers using score rules tied to task outcomes (early completion, on-time completion, late completion, and rejection penalties).

The backend is implemented using Node.js, Express.js, and MongoDB (Mongoose), and the frontend uses React.js (Vite + TypeScript) with component-driven UI patterns and data visualizations using Recharts. The system demonstrates how role-based workflow design, analytics, and consistent tracking can significantly improve operational efficiency in academic task management.

---

<div class="page-break"></div>

## TABLE OF CONTENTS

1. INTRODUCTION  
1.1 Background of the Work  
1.2 Motivation and Scope of the Proposed Work  
1.3 Challenges and Proposed Solution  

2. LITERATURE SURVEY  

3. OBJECTIVES AND METHODOLOGY  
3.1 Objectives of the Proposed Work  
3.2 Methodological Overview  
3.3 Algorithmic Approach  
3.4 System Architecture  
3.5 Database Design  
3.6 Notification and Productivity Engine  
3.7 Data Visualization Techniques  
3.8 Security Mechanisms  
3.9 Performance Metrics  
3.10 Scalability and System Performance  
3.11 Limitations of Methodology  
3.12 Future Enhancements in Methodology  
3.13 System Implementation and Deployment  
3.14 User Interaction Flow  
3.15 System Workflow Analysis  
3.16 API Design and Communication  
3.17 Error Handling and Validation  

4. PROPOSED WORK MODULES  
4.1 User Authentication Module  
4.2 Task Management Module  
4.3 Progress and Timer Module  
4.4 Submission and Review Module  
4.5 Deadline Notification Module  
4.6 Productivity and Leaderboard Module  
4.7 Discussion Forum Module  
4.8 Reports and Analytics Module  
4.9 Admin Management Module  
4.10 System Integration Module  

5. RESULTS AND DISCUSSION  
5.1 Results  
5.2 Significance, Strengths and Limitations  
5.3 Cost Benefit Analysis  

6. CONCLUSIONS AND FUTURE WORK  
6.1 Conclusions  
6.2 Future Enhancements  

REFERENCES  
APPENDICES

---

<div class="page-break"></div>

# CHAPTER 1
# INTRODUCTION

Modern academic and organizational workflows require timely execution of assigned activities. However, many teams still rely on fragmented communication channels and manual tracking methods, resulting in missed deadlines, unclear ownership, and inconsistent reporting. To address this, the proposed system, Action Item Tracker, provides a role-based platform for assigning, executing, reviewing, and analyzing tasks in a structured way.

Unlike basic to-do systems, this platform focuses on accountability and measurable performance. It tracks progress percentage, time spent, submission state, review decisions, and productivity outcomes. With this approach, task execution becomes transparent and data-driven.

## 1.1 Background of the Work

Task tracking tools are common, but many of them do not provide role-specific workflow control for academic supervision models (faculty-student). In educational contexts, tasks require not only completion but review, feedback, and rework support. Existing generic systems rarely provide these controls in one flow.

Action Item Tracker combines assignment, submission, review, and analytics into one platform to support realistic academic task governance.

## 1.2 Motivation and Scope of the Proposed Work

The project is motivated by the need to:
- avoid unstructured task communication,
- provide real-time progress visibility,
- reduce deadline misses,
- improve student accountability,
- help faculty identify high and low performers quickly.

Scope of the system includes:
- multi-role login and dashboards (Admin, Faculty, Student),
- task lifecycle from creation to completion/rework,
- timer-based time tracking,
- review accept/reject workflow,
- automated deadline notifications,
- productivity scoring and leaderboard,
- analytics dashboards and reports.

## 1.3 Challenges and Proposed Solution

### 1.3.1 Tracking Real Progress
Challenge: Binary completion status does not reflect actual work progression.  
Solution: Progress slider (0 to 100), task status transitions, and timer logs.

### 1.3.2 Managing Review Cycles
Challenge: Students need clear review feedback and resubmission path.  
Solution: Faculty accept/reject endpoints with mandatory rejection remarks and rework states.

### 1.3.3 Deadline Awareness
Challenge: Users often miss deadlines due to lack of proactive reminders.  
Solution: Automated reminder checks at 24 hours, 2 hours, and post-deadline.

### 1.3.4 Measuring Productivity Fairly
Challenge: Completion count alone cannot represent quality and timeliness.  
Solution: Rule-based productivity score based on early/on-time/late/rejected outcomes.

### 1.3.5 Collaboration and Clarification
Challenge: Task ambiguity causes delays.  
Solution: Per-task discussion forum with participation control and daily student message limit.

---

<div class="page-break"></div>

# CHAPTER 2
# LITERATURE SURVEY

Task management research and industry platforms (for example Trello, Asana, Jira) provide strong issue tracking and collaboration features. However, most systems are optimized for software teams and not for role-specific academic workflows where faculty issue action items and students submit reviewed work.

Studies on educational workflow tools emphasize the importance of:
- timely feedback,
- measurable performance indicators,
- transparent activity logs,
- learner engagement through dashboards.

From a system design perspective, recent full-stack applications demonstrate that MERN-based architecture offers rapid development and easy scalability. Yet many implementations do not include integrated review loops, deadline automation, and individual productivity scoring in a single workflow.

The Action Item Tracker project addresses these gaps by combining:
- role-based dashboards,
- formal review states,
- task-level discussion,
- notification automation,
- and analytics-driven performance interpretation.

---

<div class="page-break"></div>

# CHAPTER 3
# OBJECTIVES AND METHODOLOGY

## 3.1 Objectives of the Proposed Work

Primary objectives:
- Develop a role-based task management platform for Admin, Faculty, and Student.
- Implement complete task lifecycle with submission and review control.
- Provide measurable tracking for time, progress, and completion quality.
- Introduce productivity scoring and ranking for performance motivation.

Secondary objectives:
- Enable analytics through visual charts and KPI cards.
- Maintain auditable logs for each key task action.
- Support file-based submissions (PDF/DOCX).
- Keep backend modular and scalable.

## 3.2 Methodological Overview

The methodology follows a structured operational pipeline:
1. User authentication and role routing.
2. Faculty creates one or multiple student tasks.
3. Student tracks work using progress and timer.
4. Student uploads submission and submits for review.
5. Faculty accepts or rejects with remarks.
6. Rework and late-rework handled by status transitions.
7. Notification engine evaluates deadlines periodically.
8. Productivity score and reports are updated from final outcomes.

## 3.3 Algorithmic Approach

### 3.3.1 Completion Rate
Completion Rate (%) = (Completed Tasks / Total Tasks) x 100

### 3.3.2 Productivity Scoring Rules
- Early completion: +7
- On-time completion: +5
- Late completion (first accepted late path): -2
- Rejection penalty: -1 per rejection (non-negative lower bound)

### 3.3.3 Status Transition Logic
Normal flow:
pending -> in_progress -> submitted -> completed

Rework flow:
submitted -> rework_required -> submitted -> completed

Late rework flow:
submitted -> late_rework_required -> submitted -> completed_late_rework

Deadline overflow state:
if deadline crossed and not finalized -> overdue

## 3.4 System Architecture

Architecture style: 3-tier client-server architecture.

Flow:
Browser (React frontend) -> REST APIs (Express backend) -> MongoDB (Mongoose models)

The frontend handles role-specific routing, dashboard rendering, and interactions. The backend manages validations, workflow business rules, score updates, notifications, and persistence.

## 3.5 Database Design

Major collections:
- User: name, email, passwordHash, role, productivityScore.
- Task: title, description, priority, status, progress, time fields, review, submission, deadline flags.
- Notification: userId, type, message, read status.
- ActivityLog: action-level event history with change snapshots.
- LoginHistory: audit records for logins.
- TaskForumMessage: forum chat records per task/group.

The schema design prioritizes workflow traceability and report-oriented queries.

## 3.6 Notification and Productivity Engine

Notification engine triggers reminders based on time remaining to deadline. It also emits task events for creation, updates, submissions, acceptance, rejection, and forum messages.

Productivity engine updates student score during review outcomes and supports both faculty-level and global leaderboards.

## 3.7 Data Visualization Techniques

The frontend uses chart visualizations for performance insights:
- Bar charts for productivity trend and student-wise comparisons.
- Pie charts for status and priority distributions.
- Area charts for weekly time trend.
- KPI cards for total tasks, completion, pending, and time metrics.

These visualizations reduce interpretation effort and improve decision speed.

## 3.8 Security Mechanisms

Implemented controls:
- Password hashing using bcryptjs.
- Role field validation and role-based UI protection.
- CORS origin restrictions on backend.
- Input checks and required-field validations on APIs.
- Upload constraints (file type and size limits).

Note: Current version uses local user session persistence on client storage. Token-based API authorization middleware can be added in next phase for stronger security.

## 3.9 Performance Metrics

System-level metrics:
- API response consistency under repeated polling.
- Task fetch/update turnaround in multi-user workflows.

User-level metrics:
- completion rate,
- average time per task,
- pending/in-progress/submitted counts,
- productivity score,
- rejection count and rework frequency.

## 3.10 Scalability and System Performance

Scalability support comes from:
- separated frontend and backend deployments,
- modular route grouping,
- indexed fields in frequently queried collections,
- lightweight JSON REST communication.

The architecture supports further extension to background workers, caching, and socket-based real-time updates.

## 3.11 Limitations of Methodology

- Authentication layer is session-based on client state; API-level token middleware not yet enforced.
- Notification checks are periodic and request-driven, not fully event-bus based.
- Productivity model is rule-based and may not capture all behavioral factors.
- Daily time analytics are inferred from task-level totals rather than full session logs.

## 3.12 Future Enhancements in Methodology

- Add JWT-based protected APIs and refresh token strategy.
- Add scheduler/queue for automated deadline checks.
- Add AI-assisted prioritization and risk prediction for overdue tasks.
- Add richer analytics with per-day timer sessions and trend forecasting.
- Add WebSocket notifications for real-time updates.

## 3.13 System Implementation and Deployment

Frontend stack:
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Recharts for dashboard analytics

Backend stack:
- Node.js + Express.js
- MongoDB + Mongoose
- Multer for file submissions

Deployment-ready configuration is available for separate client and server hosting.

## 3.14 User Interaction Flow

### Admin
Login -> Dashboard -> User monitoring -> Platform reports

### Faculty
Login -> Create task -> Assign student(s) -> Monitor progress -> Review submissions -> Track leaderboard

### Student
Login -> View assigned tasks -> Update progress/time -> Upload work -> Submit -> Receive review -> Rework/complete

## 3.15 System Workflow Analysis

The system creates a closed feedback loop:
assignment -> effort tracking -> submission -> review decision -> notification -> analytics.

This loop ensures both operational control and measurable outcomes.

## 3.16 API Design and Communication

Route groups:
- /api/auth
- /api/tasks
- /api/users
- /api/notifications
- /api/activity-logs
- /api/forum

Standard HTTP methods (GET, POST, PUT, DELETE) with JSON payloads are used. The API structure is modular and easy to extend.

## 3.17 Error Handling and Validation

- Required field checks return explicit 400 messages.
- Missing resources return 404.
- Server exceptions return 500 with safe message.
- File upload validation blocks unsupported MIME types and oversize payloads.
- Duplicate notification prevention reduces alert spam.

---

<div class="page-break"></div>

# CHAPTER 4
# PROPOSED WORK MODULES

## 4.1 User Authentication Module

Handles registration and login for Admin, Faculty, and Student. Passwords are hashed before storage. Login history is recorded for auditing.

## 4.2 Task Management Module

Faculty can create, edit, and delete tasks with title, description, priority, deadline, and assignee. Multi-student assignment creates linked task groups.

## 4.3 Progress and Timer Module

Students can update progress percentage and run timer sessions. Timer start/stop events are logged and aggregated into total elapsed time.

## 4.4 Submission and Review Module

Students upload PDF/DOCX submissions and submit tasks when progress reaches 100%. Faculty can accept or reject with remarks. Rejections trigger rework states.

## 4.5 Deadline Notification Module

Deadline checks trigger reminders at major milestones and mark tasks as overdue if deadline passes without completion.

## 4.6 Productivity and Leaderboard Module

Score updates occur automatically from review outcomes. Faculty dashboard shows top performers; student view shows global leaderboard.

## 4.7 Discussion Forum Module

Task-level forum enables faculty-student communication. For grouped tasks, discussion is shared by taskGroupId. Student daily message limit is enforced.

## 4.8 Reports and Analytics Module

Admin/faculty/student report pages provide KPI summaries and charts for task status, time distribution, and completion metrics.

## 4.9 Admin Management Module

Admin views platform-wide counts, user distribution, and task trends through dashboard analytics.

## 4.10 System Integration Module

Integrates frontend routes, backend APIs, database models, file uploads, logging, and notifications into a cohesive system.

---

<div class="page-break"></div>

# CHAPTER 5
# RESULTS AND DISCUSSION

## 5.1 Results

The implemented system demonstrates successful completion of the core objectives:
- role-specific dashboards are functional,
- end-to-end task workflow is operational,
- review/rework lifecycle is enforced,
- timer and progress data are captured,
- productivity and leaderboard outputs are generated,
- notification and activity logs are recorded.

### 5.1.1 Task Lifecycle Validation

Testing confirms valid transitions from pending to in-progress, submitted, completed, and rework variants. Invalid transitions are blocked with clear API responses.

### 5.1.2 Review Workflow Effectiveness

Faculty review endpoints enforce decision consistency. Rejection remarks improve student clarity and reduce ambiguous rework.

### 5.1.3 Notification Effectiveness

24-hour and 2-hour reminders improve deadline awareness. Overdue notifications provide actionable follow-up.

### 5.1.4 Analytics and Visualization Outcomes

Dashboard charts provide immediate visibility into status mix, completion, and productivity trends, helping both faculty and admins make quicker decisions.

### 5.1.5 Comparative Discussion

Compared with generic task apps, this system adds educational workflow-specific controls such as:
- faculty-mediated review,
- rework states,
- submission constraints,
- productivity scoring by quality and timeliness.

## 5.2 Significance, Strengths and Limitations

Significance:
- bridges task assignment and measurable execution quality,
- improves accountability and transparency.

Strengths:
- complete lifecycle coverage,
- modular architecture,
- role-based dashboards,
- integrated analytics and logs,
- practical deployment-ready stack.

Limitations:
- no API-level token authorization middleware in current build,
- limited predictive analytics,
- periodic polling may be less efficient than event-driven updates.

## 5.3 Cost Benefit Analysis

Cost factors:
- development effort for full-stack implementation,
- cloud hosting and database cost,
- maintenance and iterative improvements.

Benefits:
- reduced deadline misses,
- improved faculty monitoring efficiency,
- better student productivity tracking,
- auditable operations through logs and notifications.

Overall, benefits significantly outweigh implementation and maintenance costs for academic use cases.

---

<div class="page-break"></div>

# CHAPTER 6
# CONCLUSIONS AND FUTURE WORK

## 6.1 Conclusions

Action Item Tracker successfully delivers a structured and measurable framework for academic task governance. The project integrates assignment, execution, review, and analytics in one platform. By combining role-based control, lifecycle-aware status management, and productivity scoring, it improves both operational efficiency and accountability.

The system demonstrates that full-stack web technologies can be effectively used to build workflow-centric applications that are practical, scalable, and data-driven.

## 6.2 Future Enhancements

- JWT-based API authorization and refresh-token session model.
- Real-time notifications via WebSockets.
- Calendar integration and reminder scheduling.
- Exportable reports (PDF/Excel) for faculty and admins.
- AI-assisted risk alerts for likely overdue tasks.
- Mobile application support for task operations.

---

<div class="page-break"></div>

## REFERENCES

1. React Documentation. https://react.dev  
2. Vite Documentation. https://vite.dev  
3. Node.js Documentation. https://nodejs.org  
4. Express.js Documentation. https://expressjs.com  
5. MongoDB Documentation. https://www.mongodb.com/docs  
6. Mongoose Documentation. https://mongoosejs.com/docs  
7. Tailwind CSS Documentation. https://tailwindcss.com/docs  
8. Recharts Documentation. https://recharts.org/en-US  
9. Multer Documentation. https://github.com/expressjs/multer  
10. bcryptjs Package Documentation. https://www.npmjs.com/package/bcryptjs

---

<div class="page-break"></div>

## APPENDICES

### Appendix A: Core API Endpoints

Auth:
- POST /api/auth/login
- POST /api/auth/register

Tasks:
- POST /api/tasks
- GET /api/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- POST /api/tasks/:id/timer/start
- POST /api/tasks/:id/timer/stop
- POST /api/tasks/:id/submission
- POST /api/tasks/:id/submit
- POST /api/tasks/:id/review/accept
- POST /api/tasks/:id/review/reject
- GET /api/tasks/productivity/student/:studentId
- GET /api/tasks/productivity/leaderboard
- GET /api/tasks/productivity/leaderboard/all
- POST /api/tasks/:id/check-deadline-notifications

Users:
- GET /api/users

Notifications:
- GET /api/notifications
- PUT /api/notifications/mark-all-read
- PUT /api/notifications/:id/read

Forum:
- GET /api/forum/status/:taskId
- GET /api/forum/messages/:taskId
- POST /api/forum/message

Activity Logs:
- GET /api/activity-logs
- GET /api/activity-logs/task/:taskId
- GET /api/activity-logs/user/:userId

### Appendix B: Task Status Definitions

- pending: task created, work not started
- in_progress: active work in progress
- submitted: student submitted for faculty review
- rework_required: rejected before deadline, resubmission required
- late_rework_required: rejected after deadline, resubmission required
- completed: accepted completion
- completed_late_rework: accepted completion after late rework path
- overdue: deadline passed without final completion

### Appendix C: Database Collections

- users
- tasks
- notifications
- activitylogs
- loginhistories
- taskforummessages


