import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, Clock, PlayCircle, CheckCircle, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentTasks, setStudentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productivityScore, setProductivityScore] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

  const normalizeTask = (task: Task): Task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    deadline: new Date(task.deadline),
  });

  // Check deadline notifications for all tasks
  const checkDeadlineNotifications = async (tasks: Task[]) => {
    const newNotifications: any[] = [];
    
    for (const task of tasks) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${task.id}/check-deadline-notifications`, {
          method: 'POST',
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (data.notificationSent && data.message) {
          newNotifications.push({
            taskId: task.id,
            taskTitle: task.title,
            message: data.message,
            type: data.message.includes('Urgent') ? 'warning' : 'info',
          });
        }
      } catch (error) {
        console.error('Error checking deadline notifications:', error);
      }
    }
    
    setNotifications(newNotifications);
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks?assignedTo=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load tasks.');
        }

        if (isMounted) {
          const normalizedTasks = (data.tasks || []).map(normalizeTask);
          setStudentTasks(normalizedTasks);
          checkDeadlineNotifications(normalizedTasks);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(loadTasks, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_BASE_URL, user]);

  // Load productivity score
  useEffect(() => {
    if (!user) return;

    const loadProductivityScore = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/productivity/student/${user.id}`);
        const data = await response.json();

        if (response.ok) {
          setProductivityScore(data.productivityScore || 0);
        }
      } catch (error) {
        console.error('Error loading productivity score:', error);
      }
    };

    loadProductivityScore();
  }, [API_BASE_URL, user]);

  const completedCount = studentTasks.filter(t => t.status === 'completed' || t.status === 'completed_late_rework').length;
  const inProgressCount = studentTasks.filter(t => t.status === 'in_progress').length;
  const submittedCount = studentTasks.filter(t => t.status === 'submitted').length;
  const rejectedCount = studentTasks.filter(t => t.status === 'rework_required' || t.status === 'late_rework_required').length;
  const totalTime = studentTasks.reduce((acc, t) => acc + (t.currentElapsedTime || t.totalElapsedTime || 0), 0);
  const todaysTasks = studentTasks.filter(t => t.status !== 'completed' && t.status !== 'completed_late_rework').slice(0, 3);

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your tasks, manage your time, and monitor your productivity</p>
        </div>

        {/* Deadline Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif, idx) => (
              <Alert key={idx} variant={notif.type === 'warning' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{notif.taskTitle}:</strong> {notif.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Total Tasks"
            value={studentTasks.length}
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="In Progress"
            value={inProgressCount}
            icon={<PlayCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Time"
            value={formatTime(totalTime)}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Productivity Score"
            value={productivityScore}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Task Status Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          {submittedCount > 0 && (
            <Card className="shadow-card border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Awaiting Review</p>
                    <p className="text-2xl font-bold text-blue-600">{submittedCount}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          )}
          {rejectedCount > 0 && (
            <Card className="shadow-card border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rework Required</p>
                    <p className="text-2xl font-bold text-orange-600">{rejectedCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-card border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round((completedCount / Math.max(studentTasks.length, 1)) * 100)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Your tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : todaysTasks.length > 0 ? (
                todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:shadow-card-hover transition-all cursor-pointer gap-4"
                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{task.title}</p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        <span>Progress: {task.progress}%</span>
                        <span>Time: {formatTime(task.currentElapsedTime || task.totalElapsedTime || 0)}</span>
                      </div>
                      <Progress value={task.progress} className="h-2 w-full max-w-xs" />
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">All caught up! No pending tasks.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
