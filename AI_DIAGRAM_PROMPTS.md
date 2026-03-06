# AI PROMPTS FOR DIAGRAMS

## ER Diagram Prompt

```
Generate an Entity-Relationship (ER) Diagram for an "Action Item Tracker" project with the following specifications:

### Project Overview:
- Application: Multi-role Task Management System (Admin, Faculty, Student roles)
- Tech Stack: Node.js + Express + MongoDB
- Purpose: Track action items, assignments, submissions, and activity logs

### Database Entities and Relationships:

1. **User Entity**
   - _id (ObjectId) - Primary Key
   - name (String, required, trimmed)
   - email (String, required, unique, lowercase)
   - passwordHash (String, required)
   - role (Enum: admin, faculty, student)
   - avatar (String, optional)
   - createdAt (Date, default: current timestamp)

2. **Task Entity**
   - _id (ObjectId) - Primary Key
   - title (String, required)
   - description (String, required)
   - status (Enum: pending, in_progress, completed, overdue)
   - priority (Enum: low, medium, high)
   - deadline (Date, required)
   - progress (Number, 0-100)
   - assignedTo (Foreign Key → User._id, required)
   - createdBy (Foreign Key → User._id, required)
   - totalElapsedTime (Number, in seconds)
   - currentStartTime (Date, optional)
   - isRunning (Boolean)
   - createdAt (Date, default: current timestamp)
   - submission { fileName, originalName, mimeType, size, uploadedAt }
   - review { remarks, reviewedAt, reviewedBy (FK → User._id) }

3. **Notification Entity**
   - _id (ObjectId) - Primary Key
   - userId (Foreign Key → User._id, required)
   - type (Enum: task_created, task_updated, task_deleted, work_submitted, review_submitted)
   - message (String, required)
   - taskId (Foreign Key → Task._id, optional)
   - isRead (Boolean, default: false)
   - createdAt (Date, default: current timestamp)

4. **Activity Log Entity**
   - _id (ObjectId) - Primary Key
   - taskId (Foreign Key → Task._id, required, indexed)
   - userId (Foreign Key → User._id, required, indexed)
   - action (Enum: task_created, task_updated, task_deleted, progress_updated, status_changed, timer_started, timer_stopped, task_completed, work_submitted, review_submitted)
   - changes (Mixed type - stores change details)
   - description (String, required)
   - timestamp (Date, default: current timestamp, indexed)

### Relationships:
- User (1) to Task (Many) - via assignedTo
- User (1) to Task (Many) - via createdBy
- User (1) to Notification (Many) - via userId
- Task (1) to Notification (Many) - via taskId
- User (1) to ActivityLog (Many) - via userId
- Task (1) to ActivityLog (Many) - via taskId
- User (1) to Task (Many) - via review.reviewedBy

### Special Requirements:
- Show all primary keys and foreign key relationships
- Indicate required vs optional fields
- Show data types and constraints
- Use proper ER notation (crow's foot or Chen notation)
- Include indexes on frequently queried fields

Please generate a clear, professional ER diagram showing all entities, attributes, and relationships.
```

---

## Class Diagram Prompt

```
Generate a UML Class Diagram for the "Action Item Tracker" project with the following specifications:

### Project Overview:
- Frontend: React.js + TypeScript (Vite)
- Backend: Node.js + Express.js
- Purpose: Multi-role task management system with real-time notifications and activity tracking

### Classes to Include:

1. **User Class**
   - Properties: id, name, email, passwordHash, role (admin|faculty|student), avatar, createdAt
   - Methods: constructor(), setPassword(), verifyPassword(), getProfile(), updateProfile()
   - Note: Role determines access levels and permissions

2. **Task Class**
   - Properties: id, title, description, status (pending|in_progress|completed|overdue), priority (low|medium|high), deadline, progress (0-100)
   - Assignment: assignedTo (User), createdBy (User)
   - Timer: totalElapsedTime, currentStartTime, isRunning
   - Submission: fileName, originalName, mimeType, size, uploadedAt
   - Review: remarks, reviewedAt, reviewedBy (User)
   - Methods: constructor(), updateStatus(), updateProgress(), startTimer(), stopTimer(), calculateElapsedTime(), submitWork(), addReview()
   - Associations: belongs to multiple users (creator, assignee, reviewer)

3. **Notification Class**
   - Properties: id, userId (User), type (task_created|task_updated|task_deleted|work_submitted|review_submitted), message, taskId (Task), isRead, createdAt
   - Methods: constructor(), markAsRead(), markAsUnread(), getNotificationDetails()
   - Associations: belongs to User (1:Many), optionally linked to Task

4. **ActivityLog Class**
   - Properties: id, taskId (Task), userId (User), action, changes (object), description, timestamp
   - Methods: constructor(), logAction(), getActionHistory(), filterByUser(), filterByTask()
   - Actions: task_created, task_updated, task_deleted, progress_updated, status_changed, timer_started, timer_stopped, task_completed, work_submitted, review_submitted

5. **Authentication (JWT-based)**
   - Methods: login(), register(), verifyToken(), refreshToken(), logout()
   - Handles: User authentication and authorization

6. **TaskService (Backend)**
   - Methods: createTask(), updateTask(), deleteTask(), getTaskById(), getAllTasks(), assignTask(), submitWork(), addReview(), updateProgress()

7. **NotificationService (Backend)**
   - Methods: createNotification(), getUserNotifications(), markAsRead(), deleteOldNotifications()

8. **ActivityLogService (Backend)**
   - Methods: logActivity(), getTaskActivityHistory(), getUserActivityHistory(), getChangeSummary()

### Relationships:
- User (1) ----< (Many) Task (via createdBy, assignedTo)
- Task (1) ----< (Many) ActivityLog
- User (1) ----< (Many) ActivityLog
- User (1) ----< (Many) Notification
- Task (1) ----< (Many) Notification (optional)
- User has Role enumeration: admin, faculty, student
- Task has Status enumeration: pending, in_progress, completed, overdue
- Task has Priority enumeration: low, medium, high

### Special Requirements:
- Show all public methods and properties
- Include enumerations (Status, Priority, Role, NotificationType, ActionType)
- Show multiplicity of relationships (1:1, 1:Many, Many:Many where applicable)
- Include service classes for business logic
- Show inheritance or composition where applicable
- Add stereotypes for Entity, Service, and DTO classes

Please generate a comprehensive UML class diagram showing all classes, attributes, methods, and relationships with proper multiplicity indicators.
```

---

## How to Use These Prompts:

1. **For ER Diagram:** Copy the ER Diagram Prompt and paste it into your AI tool
   - You can ask for: Mermaid ER diagram, Draw.io format, or standard ER diagram image

2. **For Class Diagram:** Copy the Class Diagram Prompt and paste it into your AI tool
   - You can ask for: Mermaid class diagram, PlantUML format, or Draw.io format

3. **Additional Tipsy:**
   - Ask for Mermaid syntax if you want to embed diagrams in documentation
   - Request Draw.io XML if you want to edit in a visual tool
   - Ask for PlantUML if you prefer that format
   - Mention your preferred diagram notation (Chen, Crow's Foot, UML, etc.)

### Example follow-up requests:
- "Generate this in Mermaid diagram syntax so I can use it in my documentation"
- "Create this as a Draw.io XML file"
- "Use crow's foot notation for the ER diagram"
- "Add color coding for different entity types"
- "Show query performance implications on indexed fields"
```
