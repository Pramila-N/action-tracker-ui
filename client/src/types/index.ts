export type UserRole = 'admin' | 'faculty' | 'student';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
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
