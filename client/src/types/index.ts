export type UserRole = 'admin' | 'faculty' | 'student';

export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'rework_required' | 'late_rework_required' | 'completed' | 'completed_late_rework' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  productivityScore?: number; // Students' productivity score
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date;
  createdAt: Date;
  assignedTo: User;
  createdBy: User;
  timeSpent: number; // in seconds (deprecated, use currentElapsedTime)
  progress: number; // 0-100
  
  // Timer fields
  totalElapsedTime?: number; // Total accumulated time in seconds
  currentStartTime?: Date | string; // When current session started
  isRunning?: boolean; // Is timer currently running
  currentElapsedTime?: number; // Computed: totalElapsedTime + current session time

  // Submission tracking
  submittedAt?: Date | string | null; // When student submitted the task

  submission?: {
    fileName?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    uploadedAt?: Date | string | null;
  };
  
  review?: {
    remarks?: string | null;
    reviewedAt?: Date | string | null;
    reviewedBy?: User | string | null;
    status?: 'accepted' | 'rejected' | null; // Review decision
  };

  // Deadline notifications tracking
  notifications?: {
    twentyFourHoursBefore?: boolean;
    twoHoursBefore?: boolean;
    afterDeadline?: boolean;
  };

  // Productivity tracking
  isLate?: boolean; // Was the submission late?
  isEarly?: boolean; // Was the submission early?
  rejectionCount?: number; // Number of times rejected
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
}

export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}
