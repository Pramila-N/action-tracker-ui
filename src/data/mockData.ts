import { User, Task, TaskStatus, TaskPriority } from '@/types';

export const mockStudents: User[] = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@university.edu', role: 'student', createdAt: new Date('2024-01-15') },
  { id: 's2', name: 'Bob Smith', email: 'bob@university.edu', role: 'student', createdAt: new Date('2024-01-20') },
  { id: 's3', name: 'Carol Williams', email: 'carol@university.edu', role: 'student', createdAt: new Date('2024-02-01') },
  { id: 's4', name: 'David Brown', email: 'david@university.edu', role: 'student', createdAt: new Date('2024-02-10') },
  { id: 's5', name: 'Eva Martinez', email: 'eva@university.edu', role: 'student', createdAt: new Date('2024-02-15') },
];

export const mockFaculty: User[] = [
  { id: 'f1', name: 'Dr. Sarah Chen', email: 'sarah.chen@university.edu', role: 'faculty', createdAt: new Date('2023-08-01') },
  { id: 'f2', name: 'Prof. James Wilson', email: 'james.wilson@university.edu', role: 'faculty', createdAt: new Date('2023-09-15') },
];

export const mockAdmins: User[] = [
  { id: 'a1', name: 'Admin User', email: 'admin@university.edu', role: 'admin', createdAt: new Date('2023-01-01') },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Complete Literature Review',
    description: 'Review and summarize 10 research papers on machine learning applications in healthcare.',
    status: 'in_progress',
    priority: 'high',
    deadline: new Date('2024-03-15'),
    createdAt: new Date('2024-02-01'),
    assignedTo: mockStudents[0],
    createdBy: mockFaculty[0],
    timeSpent: 7200, // 2 hours
    progress: 45,
  },
  {
    id: 't2',
    title: 'Implement Data Pipeline',
    description: 'Create an ETL pipeline for processing sensor data from IoT devices.',
    status: 'pending',
    priority: 'medium',
    deadline: new Date('2024-03-20'),
    createdAt: new Date('2024-02-10'),
    assignedTo: mockStudents[1],
    createdBy: mockFaculty[0],
    timeSpent: 0,
    progress: 0,
  },
  {
    id: 't3',
    title: 'Write Project Documentation',
    description: 'Document the system architecture, API endpoints, and deployment procedures.',
    status: 'completed',
    priority: 'low',
    deadline: new Date('2024-02-28'),
    createdAt: new Date('2024-02-05'),
    assignedTo: mockStudents[2],
    createdBy: mockFaculty[1],
    timeSpent: 14400, // 4 hours
    progress: 100,
  },
  {
    id: 't4',
    title: 'Design UI Mockups',
    description: 'Create wireframes and high-fidelity mockups for the mobile application.',
    status: 'overdue',
    priority: 'high',
    deadline: new Date('2024-02-25'),
    createdAt: new Date('2024-02-01'),
    assignedTo: mockStudents[3],
    createdBy: mockFaculty[1],
    timeSpent: 3600, // 1 hour
    progress: 30,
  },
  {
    id: 't5',
    title: 'Conduct User Testing',
    description: 'Perform usability testing with 5 participants and document findings.',
    status: 'pending',
    priority: 'medium',
    deadline: new Date('2024-03-25'),
    createdAt: new Date('2024-02-20'),
    assignedTo: mockStudents[4],
    createdBy: mockFaculty[0],
    timeSpent: 0,
    progress: 0,
  },
  {
    id: 't6',
    title: 'Database Optimization',
    description: 'Optimize database queries and add proper indexing for better performance.',
    status: 'in_progress',
    priority: 'high',
    deadline: new Date('2024-03-10'),
    createdAt: new Date('2024-02-15'),
    assignedTo: mockStudents[0],
    createdBy: mockFaculty[1],
    timeSpent: 5400, // 1.5 hours
    progress: 60,
  },
];

export const allUsers = [...mockAdmins, ...mockFaculty, ...mockStudents];

export const getTasksByStudent = (studentId: string) => 
  mockTasks.filter(task => task.assignedTo.id === studentId);

export const getTasksByFaculty = (facultyId: string) => 
  mockTasks.filter(task => task.createdBy.id === facultyId);

export const getTaskStats = () => {
  const total = mockTasks.length;
  const completed = mockTasks.filter(t => t.status === 'completed').length;
  const inProgress = mockTasks.filter(t => t.status === 'in_progress').length;
  const pending = mockTasks.filter(t => t.status === 'pending').length;
  const overdue = mockTasks.filter(t => t.status === 'overdue').length;
  
  return { total, completed, inProgress, pending, overdue };
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const productivityData = [
  { name: 'Mon', tasks: 4, hours: 6 },
  { name: 'Tue', tasks: 6, hours: 8 },
  { name: 'Wed', tasks: 3, hours: 5 },
  { name: 'Thu', tasks: 8, hours: 9 },
  { name: 'Fri', tasks: 5, hours: 7 },
  { name: 'Sat', tasks: 2, hours: 3 },
  { name: 'Sun', tasks: 1, hours: 2 },
];

export const taskStatusData = [
  { name: 'Completed', value: 35, fill: 'hsl(var(--success))' },
  { name: 'In Progress', value: 25, fill: 'hsl(var(--info))' },
  { name: 'Pending', value: 30, fill: 'hsl(var(--muted-foreground))' },
  { name: 'Overdue', value: 10, fill: 'hsl(var(--destructive))' },
];
