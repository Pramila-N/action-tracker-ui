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

## BONAFIDE CERTIFICATE

Certified that this project report "ACTION ITEM TRACKER" is the bonafide work of the candidate who carried out the project work under my supervision.

SIGNATURE (Guide)  
SIGNATURE (HoD)

Submitted for Project Viva Voce examination held on: __________

Internal Examiner I: __________  
Internal Examiner II: __________

---

## DECLARATION

I affirm that the project work titled "Action Item Tracker" being submitted in partial fulfillment for the award of the degree of Bachelor of Engineering in Information Science and Engineering is the record of original work done by me under the guidance of my project mentor. It has not formed a part of any other project work submitted for the award of any degree or diploma, either in this or any other institution.

Candidate Signature: __________

Guide Signature: __________

---

## ACKNOWLEDGEMENT

I express my sincere gratitude to the management, principal, department faculty, and project guide for their support and guidance throughout this project. I also thank my peers and friends for their valuable feedback during design, implementation, and testing phases.

---

## ABSTRACT

Action Item Tracker is a full-stack web application designed to improve task execution visibility and accountability across three user roles: Admin, Faculty, and Student. The system supports end-to-end task lifecycle management including task creation, assignment, progress tracking, submission, review, rework handling, deadline monitoring, and productivity scoring.

The platform introduces a structured workflow where faculty create tasks and assign them to students, students track progress with timer-supported effort logging, and faculty review submissions with accept/reject actions. The application captures detailed activity logs and notification events to ensure transparency and timely follow-up.

A major contribution of the project is the inclusion of deadline-aware automation and measurable productivity analytics. Notifications are triggered at key milestones (24-hour reminder, 2-hour urgent reminder, and overdue alert), while leaderboard logic identifies top performers using score rules tied to task outcomes (early completion, on-time completion, late completion, and rejection penalties).

The backend is implemented using Node.js, Express.js, and MongoDB (Mongoose), and the frontend uses React.js (Vite + TypeScript) with component-driven UI patterns and data visualizations using Recharts. The system demonstrates how role-based workflow design, analytics, and consistent tracking can significantly improve operational efficiency in academic task management.

---

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

7. DETAILED SYSTEM DESIGN AND ENGINEERING DECISIONS  
7.1 Frontend Design Rationale  
7.2 Backend Design Rationale  
7.3 Data Modeling Strategy  
7.4 State Management and UI Synchronization  
7.5 API Contract Design  
7.6 File Management and Submission Integrity  
7.7 Notification Architecture Decisions  
7.8 Discussion Forum Design Decisions  
7.9 Scalability and Maintainability Decisions  

8. TESTING, VALIDATION, AND QUALITY ASSURANCE  
8.1 Testing Strategy  
8.2 Functional Test Scenarios  
8.3 Workflow Validation Matrix  
8.4 API Validation Checklist  
8.5 UI and Usability Validation  
8.6 Performance and Load Considerations  
8.7 Security and Data Integrity Checks  
8.8 Defect Tracking and Resolution  
8.9 Acceptance Criteria and Sign-off  

9. DEPLOYMENT, OPERATIONS, AND MAINTENANCE HANDBOOK  
9.1 Environment Configuration  
9.2 Deployment Workflow  
9.3 Backup and Recovery Plan  
9.4 Monitoring and Observability  
9.5 Incident Response Guide  
9.6 Versioning and Release Management  
9.7 Operational SOPs for Admin and Faculty  
9.8 Risk Register and Mitigation Plan  
9.9 Long-term Product Roadmap  

REFERENCES  
APPENDICES

---

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

# CHAPTER 7
# DETAILED SYSTEM DESIGN AND ENGINEERING DECISIONS

This chapter provides a deeper engineering discussion of why key architectural and implementation decisions were made in Action Item Tracker. While previous chapters explain what the system does, this chapter explains why the current design is practical for academic workflow management and how those choices affect extensibility, reliability, and maintainability.

## 7.1 Frontend Design Rationale

The frontend is implemented with React and TypeScript to achieve component-level reusability and strong type safety. The following design goals guided frontend implementation:

1. Role-focused navigation experience.  
Admin, Faculty, and Student users have different responsibilities. Instead of overloading one dashboard with dynamic sections, separate route trees were used to keep role workflows explicit and minimize navigation ambiguity.

2. Predictable interaction patterns.  
Common UI patterns such as cards, badges, status labels, and modal-like interactions were standardized using shared UI primitives. This reduced visual inconsistency and made new feature integration faster.

3. Fast feedback loops.  
Users receive immediate visual state updates after critical actions such as submission, review, and notification read/unread events. This was prioritized because workflow systems fail when users cannot quickly confirm that an action succeeded.

4. Safe extensibility.  
TypeScript type definitions for `Task`, `User`, status enums, and review objects enable compile-time safeguards. This lowers regression risk when introducing new statuses or workflow variants.

5. Reporting readability.  
Analytics screens were intentionally designed around compact visual summaries (KPI + charts) because faculty and admin users typically need rapid situational awareness, not raw record inspection.

## 7.2 Backend Design Rationale

The backend uses Express route groups with model-centric business logic. The decision was driven by clarity and rapid iteration needs:

1. Route group decomposition.  
`auth`, `tasks`, `users`, `notifications`, `activity-logs`, and `forum` routes are split by domain boundary. This separation improves readability and allows domain-specific validation and auditing.

2. Workflow-first API modeling.  
Instead of generic CRUD-only endpoints, domain actions such as `/submit`, `/review/accept`, `/review/reject`, and `/check-deadline-notifications` were implemented as dedicated endpoints. This keeps critical business transitions explicit and auditable.

3. Consistent server responses.  
Endpoints return JSON envelopes with either requested resource objects or concise status messages. This reduces client-side parsing complexity.

4. Embedded event-side effects.  
Business actions trigger side effects (notifications, activity logs, score updates). These side effects are executed in close proximity to domain action handling to preserve consistency and reduce orphan events.

5. Defensive validation.  
Role checks, missing-field checks, and state transition checks prevent invalid data flow from reaching persistence.

## 7.3 Data Modeling Strategy

The MongoDB schema is designed around auditability and state-driven workflows.

### 7.3.1 Core Principles

- Keep the task document authoritative for execution state.  
- Keep user document lightweight but include productivity metadata.  
- Keep notifications independent for read-state management.  
- Keep activity logs append-only for traceability.  
- Keep forum messages isolated to support communication history and moderation.

### 7.3.2 Task Schema as Workflow Anchor

The `Task` model includes:
- business fields: title, description, priority, deadline;
- ownership fields: assignedTo, createdBy;
- workflow fields: status, progress, review, submission;
- time fields: totalElapsedTime, currentStartTime, isRunning, submittedAt;
- behavioral fields: isLate, isEarly, rejectionCount;
- notification checkpoint flags.

This design allows one document to answer most operational questions: current state, timing behavior, review outcome, and timeline context.

### 7.3.3 Log-first Accountability Layer

Each significant transition writes to `ActivityLog` with action and change summary. This supports:
- dispute resolution,
- faculty oversight,
- historical analysis,
- future integration with compliance dashboards.

### 7.3.4 Notification Persistence Strategy

Notifications are persisted rather than transiently pushed only in memory. This ensures:
- users can view missed events,
- read/unread state remains durable,
- dashboard alerts survive session restarts.

## 7.4 State Management and UI Synchronization

Frontend state synchronization follows two parallel paths:

1. Session/identity state in context.  
User identity and role are maintained through a central auth context backed by local storage.

2. Domain data via fetch + interval refresh.  
Task lists, leaderboard values, and reports are refreshed periodically to keep multi-user changes visible with low implementation overhead.

### 7.4.1 Why Polling Was Used

Polling was chosen over WebSockets in the current version due to:
- lower operational complexity,
- easier deployment on lightweight hosting,
- deterministic fetch-and-render behavior for early-stage product validation.

### 7.4.2 Synchronization Risks and Controls

Potential risk: stale data between polling intervals.  
Control: immediate post-action refresh and consistent backend re-fetch on page loads.

## 7.5 API Contract Design

The API contract uses action-centric endpoints with clear role intent.

### 7.5.1 Contract Characteristics

- Human-readable routes (`/review/accept`, `/timer/start`).
- Typed payload expectations at frontend level.
- Explicit error messages for invalid state transitions.
- Minimal hidden behavior in endpoints.

### 7.5.2 Example Contract Patterns

Submission endpoint expectations:
- requires task ID,
- requires uploaded file before final submit,
- enforces 100% progress condition.

Review reject expectations:
- requires remarks,
- increments rejection count,
- updates productivity score with penalty,
- notifies student.

### 7.5.3 Contract Evolution Guidance

Future contract changes should preserve backward compatibility through:
- additive response fields,
- versioned route fallback where needed,
- non-breaking enum expansion strategy.

## 7.6 File Management and Submission Integrity

Multer-based file handling is implemented with validation controls:
- file size limits,
- MIME type allow-list (PDF/DOCX),
- sanitized filename generation,
- centralized uploads directory.

### 7.6.1 Integrity Considerations

- Submission metadata is stored in task document for direct retrieval.
- Faculty review state is reset when new submission is uploaded.
- File download route validates path existence before send.

### 7.6.2 Future Hardening Steps

- content scanning for malware,
- object storage migration with signed URLs,
- immutable submission versions for rework iterations.

## 7.7 Notification Architecture Decisions

Notification events were modeled as domain outputs, not UI-only prompts. This means events are generated by backend transitions and consumed by frontend independently.

Benefits:
- deterministic history,
- easier multi-device consistency,
- no dependence on open browser tabs for event persistence.

Types currently include:
- task lifecycle notifications,
- review-related notifications,
- deadline reminders,
- forum message alerts.

Duplicate suppression logic is used in selected high-frequency actions to minimize notification noise.

## 7.8 Discussion Forum Design Decisions

The forum feature is intentionally task-scoped to keep communication contextual.

Key design decisions:
- access restricted to relevant participants,
- shared context through `taskGroupId` for group assignments,
- daily message cap for student users to encourage concise communication,
- forum closure logic for finalized tasks.

This model balances collaboration with moderation control.

## 7.9 Scalability and Maintainability Decisions

Current maintainability comes from domain separation and schema clarity. To scale further, the following staged approach is recommended:

Stage 1: service extraction for notifications and reports.  
Stage 2: background job queues for deadline and digest operations.  
Stage 3: caching layer for dashboard aggregations.  
Stage 4: event-driven integration for audit and analytics pipeline.

Long-term maintainability should prioritize:
- consistent naming standards for statuses and actions,
- endpoint contract documentation,
- integration test coverage around lifecycle transitions.

---

# CHAPTER 8
# TESTING, VALIDATION, AND QUALITY ASSURANCE

This chapter presents an expanded testing framework for ensuring that Action Item Tracker behaves correctly under realistic academic usage. Since the platform includes role-based workflows, state transitions, file handling, and analytics, quality assurance must combine functional, integration, usability, and operational validation.

## 8.1 Testing Strategy

The testing strategy is divided into four layers:

1. Unit-level checks for model logic and helper transformations.
2. API-level checks for route behavior, response integrity, and role/state validation.
3. Workflow integration checks across multi-step user journeys.
4. UI-level behavior checks for navigation, forms, dashboard rendering, and notifications.

### 8.1.1 Testing Objectives

- Verify correctness of all major role flows.
- Prevent invalid transitions in task lifecycle.
- Validate data integrity after each action.
- Ensure user feedback is timely and unambiguous.
- Detect regression after introducing new statuses or rules.

## 8.2 Functional Test Scenarios

### 8.2.1 Authentication Scenarios

- Valid role-specific login (admin/faculty/student).
- Invalid password handling with proper message.
- Duplicate email registration rejection.
- Minimum password rule enforcement.
- Session persistence across reload.

### 8.2.2 Faculty Task Creation Scenarios

- Single-student assignment.
- Multi-student assignment with shared group behavior.
- Missing required fields rejection.
- Non-student assignment rejection.

### 8.2.3 Student Progress and Submission Scenarios

- Progress update from 0% to 100%.
- Timer start and stop synchronization.
- Submission blocked when progress < 100%.
- Submission blocked when file not uploaded.
- Successful submission updates status and timestamps.

### 8.2.4 Review Scenarios

- Accept action from submitted state.
- Reject action requiring remarks.
- Rework status assignment before deadline.
- Late rework status assignment after deadline.
- Final acceptance after rework.

### 8.2.5 Notification Scenarios

- Task creation notification delivery.
- Deadline reminders (24h, 2h, overdue).
- Mark all notifications read.
- Duplicate prevention for repetitive updates.

### 8.2.6 Forum Scenarios

- Participant access validation.
- Student message limit enforcement.
- Message persistence and ordering.
- Notification on new forum message.

## 8.3 Workflow Validation Matrix

The following matrix style can be used during viva/documentation:

| Workflow | Input Condition | Expected State | Expected Side Effects |
| --- | --- | --- | --- |
| Create task | valid faculty + students | `pending` | notification + activity log |
| Start timer | status `pending` | `in_progress` | timer_started log |
| Submit task | progress 100 + file exists | `submitted` | faculty notification |
| Reject review | submitted + remarks | `rework_required` or `late_rework_required` | student notification + score penalty |
| Accept review | reviewable state | `completed` or `completed_late_rework` | score update + acceptance notification |
| Deadline check | now > deadline and not final | `overdue` | overdue notification |

## 8.4 API Validation Checklist

Each endpoint should be validated for:
- parameter presence,
- role authorization expectation,
- resource existence,
- status transition legality,
- response schema consistency,
- error status code correctness.

### 8.4.1 Status Code Consistency Targets

- `200/201` for successful operation.
- `400` for invalid inputs/state requests.
- `401/403` for unauthorized or forbidden access patterns.
- `404` for not found resources.
- `500` for unexpected server exceptions.

## 8.5 UI and Usability Validation

Usability checks should focus on practical user clarity:

1. Is role route redirect behavior intuitive?
2. Are task status badges easily understandable?
3. Are review remarks prominently visible to students?
4. Is notification urgency visually distinguishable?
5. Are charts readable on laptop and mobile widths?

### 8.5.1 Faculty Usability Focus

- rapid access to pending/submitted tasks,
- quick accept/reject interaction,
- readable performer leaderboard,
- clear indication of overdue tasks.

### 8.5.2 Student Usability Focus

- one-click access to active tasks,
- visible progress controls,
- transparent review feedback,
- clear time-report interpretation.

## 8.6 Performance and Load Considerations

Current load characteristics are typical for departmental scale use. Validation should include:
- multiple concurrent task fetch operations,
- repeated dashboard polling cycles,
- parallel notification fetch and mark-read operations,
- report chart rendering with growing task volume.

### 8.6.1 Performance Indicators to Track

- average API latency for list endpoints,
- p95 latency for task update operations,
- memory growth during polling intervals,
- Mongo query response time for populated task fetch.

### 8.6.2 Optimization Priorities

- index review for high-frequency filters,
- avoid redundant `populate` in non-detail views,
- batch update patterns for notification operations,
- cache derived metrics for report dashboards.

## 8.7 Security and Data Integrity Checks

Although the project is workflow-centered, security validation is critical.

Checklist:
- password hashes never exposed in responses,
- file upload restrictions enforced,
- malformed request handling,
- role-sensitive route behavior,
- CORS validation by origin,
- immutable log record expectations.

### 8.7.1 Data Integrity Scenarios

- Ensure score updates cannot push below zero.
- Ensure review status and task status are coherent.
- Ensure task deletion cascades forum cleanup.
- Ensure timer stop cannot execute when timer is not running.

## 8.8 Defect Tracking and Resolution

Defect handling process recommended:

1. Capture issue with reproducible steps.
2. Classify severity (critical/high/medium/low).
3. Identify root cause (validation, state, rendering, query).
4. Apply fix and run regression against related workflows.
5. Document closure with before/after behavior.

### 8.8.1 Typical Defect Categories

- state transition mismatch,
- stale UI after backend success,
- missing notification side effect,
- chart aggregation inconsistencies,
- submission/review race conditions.

## 8.9 Acceptance Criteria and Sign-off

For final acceptance, the system should satisfy the following minimum criteria:

- All role login and route protections work correctly.
- Task lifecycle transitions pass all mandatory states.
- Review workflow supports accept/reject with audit trail.
- Notification system reflects key events and deadlines.
- Leaderboard and productivity outputs are consistent with rules.
- Reports render without runtime errors for populated data.
- File upload and retrieval operate within constraints.

The above criteria form a practical completion baseline for project demonstration and institutional submission.

---

# CHAPTER 9
# DEPLOYMENT, OPERATIONS, AND MAINTENANCE HANDBOOK

This chapter extends the report with operational knowledge that is usually required in real-world usage but often omitted in student projects. It describes how to configure, deploy, monitor, and maintain the platform after development.

## 9.1 Environment Configuration

The project requires separate frontend and backend environment configuration.

### 9.1.1 Backend Environment Variables

Typical backend variables:
- `MONGO_URI`
- `PORT`
- `CLIENT_ORIGIN`

Recommended additions for production hardening:
- `NODE_ENV`
- `LOG_LEVEL`
- `UPLOAD_MAX_MB`
- `RATE_LIMIT_WINDOW`
- `RATE_LIMIT_MAX`

### 9.1.2 Frontend Environment Variables

Typical frontend variable:
- `VITE_API_URL`

Guidance:
- keep environment files out of version control,
- use deployment-specific variable injection,
- document expected defaults clearly.

## 9.2 Deployment Workflow

A stable deployment workflow should include:

1. Source control push to protected branch.
2. Build and lint checks.
3. Test execution (at least smoke + integration subset).
4. Staged deployment (backend first, frontend next).
5. Post-deploy health checks (`/api/health`).
6. Controlled announcement to users.

### 9.2.1 Zero-downtime Considerations

- Avoid destructive schema updates without migration scripts.
- Preserve backward-compatible API contracts across UI rollout windows.
- Use blue-green or staged cutover strategy when possible.

## 9.3 Backup and Recovery Plan

Operational reliability depends on clear recovery procedures.

### 9.3.1 Backup Scope

- user data,
- task documents,
- activity logs,
- forum messages,
- notification history,
- uploaded files.

### 9.3.2 Recovery Procedures

1. Identify failure scope (database, file storage, app runtime).
2. Restore most recent consistent backup.
3. Validate referential consistency for task-user relations.
4. Reconcile missing uploads if stored separately.
5. Re-run smoke tests for critical workflows.

### 9.3.3 Recovery Targets

- Define Recovery Point Objective (RPO) based on backup cadence.
- Define Recovery Time Objective (RTO) based on team capacity.

## 9.4 Monitoring and Observability

Monitoring should cover application health, data access behavior, and user-visible failures.

### 9.4.1 Core Signals

- API success/error rate,
- p95 latency per route group,
- database query latency,
- server process restart frequency,
- file upload failure rate.

### 9.4.2 Functional Signals

- number of overdue tasks trend,
- rejection frequency trend,
- daily forum message volume,
- notification creation/read ratio,
- leaderboard churn (stability of top ranks).

### 9.4.3 Alerting Priorities

Critical alerts:
- backend unavailable,
- database connection failures,
- repeated upload failures,
- sudden surge in 500 errors.

Warning alerts:
- rising API latency,
- rapid overdue growth,
- unusual rejection spikes.

## 9.5 Incident Response Guide

A simplified incident process ensures faster recovery:

1. Triage severity.
2. Contain impact.
3. Communicate status.
4. Apply tactical fix.
5. Perform root cause analysis.
6. Ship preventive action.

### 9.5.1 Common Incident Types

- Mongo connectivity interruption,
- incorrect route payload assumptions,
- broken dashboard fetch after API change,
- uploads directory permission issues,
- malformed deadline configuration.

### 9.5.2 Post-incident Template

- incident start/end time,
- impacted modules,
- user-visible symptoms,
- direct cause,
- contributing factors,
- corrective and preventive actions.

## 9.6 Versioning and Release Management

To scale beyond single-developer cadence, adopt structured release management.

### 9.6.1 Suggested Versioning

- MAJOR: breaking API or workflow model change,
- MINOR: feature addition,
- PATCH: bug fixes and small improvements.

### 9.6.2 Release Checklist

- changelog updated,
- migration notes prepared,
- API contract impact reviewed,
- rollback plan documented,
- smoke validation completed.

## 9.7 Operational SOPs for Admin and Faculty

### 9.7.1 Admin SOP

Daily:
- review total user/task counts,
- inspect notification and activity trends,
- verify system health endpoint.

Weekly:
- review pending/overdue trend,
- export analytics snapshot,
- verify backup success logs.

### 9.7.2 Faculty SOP

Daily:
- review submitted tasks awaiting review,
- process accept/reject with clear remarks,
- monitor students with repeated rework.

Weekly:
- review leaderboard movements,
- check task workload balance,
- identify tasks with chronic delays for intervention.

## 9.8 Risk Register and Mitigation Plan

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Delayed review by faculty | Student workflow blockage | Medium | Dashboard emphasis on `submitted` queue |
| Polling-based stale views | Moderate UX inconsistency | Medium | Lower interval for key views + manual refresh |
| File upload abuse | Storage/security risk | Medium | size/type checks + scan pipeline roadmap |
| Growing query cost | Slow reports | Medium | indexes + pre-aggregation cache |
| Role misuse attempts | Access violation risk | Low to Medium | strict server-side role validation |

## 9.9 Long-term Product Roadmap

### Phase 1 (Stabilization)

- strengthen API auth middleware,
- improve form validation messaging,
- optimize top slow endpoints.

### Phase 2 (Experience Upgrade)

- real-time event delivery,
- richer faculty insights,
- exportable report packs,
- mobile-responsive refinements.

### Phase 3 (Intelligence Layer)

- delay risk prediction,
- recommended intervention actions,
- personalized workload balancing cues.

### Phase 4 (Institutional Scale)

- multi-department support,
- configurable role hierarchies,
- audit dashboards for program coordinators,
- SSO integration.

---

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

### Appendix D: Sample API Payloads

Create Task (faculty):

```json
{
	"title": "Build module report",
	"description": "Prepare module-wise status summary",
	"assignedTo": ["studentId1", "studentId2"],
	"priority": "high",
	"deadline": "2026-04-20T18:00:00.000Z",
	"createdBy": "facultyId1"
}
```

Submit Task (student):

```json
{
	"userId": "studentId1",
	"progress": 100
}
```

Reject Review (faculty):

```json
{
	"reviewedBy": "facultyId1",
	"remarks": "Please improve documentation clarity and attach test evidence."
}
```

### Appendix E: Sample Activity Log Actions

- `task_created`
- `task_updated`
- `progress_updated`
- `timer_started`
- `timer_stopped`
- `task_submitted`
- `task_rejected`
- `task_accepted`

Each log can store change details in a `changes` object to support historical analysis and debugging.

### Appendix F: Extended Test Case Catalog

Authentication test cases:
- valid login by role,
- invalid role mismatch,
- duplicate email registration,
- password minimum length violation.

Task workflow test cases:
- timer operations on invalid task,
- submission without file,
- submission with progress below threshold,
- reject without remarks,
- accept from invalid state.

Notification test cases:
- mark one read,
- mark all read,
- deadline trigger checkpoints,
- duplicate suppression window checks.

Forum test cases:
- unauthorized participant access,
- daily cap exhaustion,
- message order validation,
- group forum participant visibility.

### Appendix G: Data Dictionary (Key Fields)

User:
- `name`: display name
- `email`: unique identity
- `role`: admin/faculty/student
- `productivityScore`: cumulative performance metric

Task:
- `status`: lifecycle state
- `progress`: completion percent
- `deadline`: due timestamp
- `submittedAt`: final handoff timestamp
- `isLate`: late submission flag
- `rejectionCount`: number of rejection cycles

Notification:
- `type`: event category
- `message`: user-readable text
- `isRead`: state flag

### Appendix H: Suggested Viva Questions and Defense Points

1. Why action-based endpoints instead of generic status update endpoint?
2. How does the design prevent invalid lifecycle jumps?
3. Why choose polling over WebSockets in current version?
4. How can the system scale to multi-department deployment?
5. What are the trade-offs of rule-based productivity scoring?
6. How is auditability guaranteed for review disputes?
7. What is the migration path to token-protected APIs?

### Appendix I: Glossary

- Lifecycle: ordered state progression of a task.
- Rework: correction cycle after review rejection.
- Overdue: deadline crossed before final acceptance.
- Productivity Score: rule-derived indicator of timeliness and review outcomes.
- Activity Log: immutable record of task-related actions.
- Task Group: logical link for multi-student shared discussion contexts.
