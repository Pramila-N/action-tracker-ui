import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ListTodo, Clock, CheckCircle, AlertCircle, Plus, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface TopStudent {
  rank: number;
  id: string;
  name: string;
  completedTasks: number;
  productivityScore: number;
}

export function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

  const normalizeTask = (task: Task): Task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    deadline: new Date(task.deadline),
  });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['faculty-tasks', user?.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/tasks?createdBy=${user?.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load tasks.');
      }
      return (data.tasks || []).map(normalizeTask);
    },
    enabled: !!user,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const { data: topStudents = [], isLoading: isLoadingLeaderboard } = useQuery<TopStudent[]>({
    queryKey: ['faculty-top-students', user?.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/tasks/productivity/leaderboard?createdBy=${user?.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load leaderboard.');
      }
      return data.leaderboard || [];
    },
    enabled: !!user,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'pending').length,
    submitted: tasks.filter((task) => task.status === 'submitted').length,
    completed: tasks.filter((task) => task.status === 'completed' || task.status === 'completed_late_rework').length,
    overdue: tasks.filter((task) => task.status === 'overdue').length,
  };
  const recentTasks = tasks.slice(0, 4);

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage tasks, track student progress, and identify top performers</p>
          </div>
          <Button onClick={() => navigate('/faculty/tasks/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Total Tasks"
            value={stats.total}
            icon={<ListTodo className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Awaiting Review"
            value={stats.submitted}
            icon={<AlertCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Quick overview of recently created tasks</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/faculty/tasks')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading tasks...</p>
                ) : recentTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-card-hover transition-shadow cursor-pointer"
                        onClick={() => navigate(`/faculty/tasks/${task.id}`)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {task.assignedTo.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performers Leaderboard */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Based on productivity score</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : topStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students yet.</p>
              ) : (
                <div className="space-y-3">
                  {topStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => {}}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 font-semibold text-sm">
                        {student.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.completedTasks} completed
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Zap className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-sm">{student.productivityScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
