import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { mockTasks, formatTime } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const navigate = useNavigate();
  
  // Simulate student's tasks
  const studentTasks = mockTasks.slice(0, 4);
  const completedCount = studentTasks.filter(t => t.status === 'completed').length;
  const inProgressCount = studentTasks.filter(t => t.status === 'in_progress').length;
  const totalTime = studentTasks.reduce((acc, t) => acc + t.timeSpent, 0);
  
  const todaysTasks = studentTasks.filter(t => t.status !== 'completed').slice(0, 3);

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your tasks and manage your time</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            change={20}
            trend="up"
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Time"
            value={formatTime(totalTime)}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Today's Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Your tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysTasks.length > 0 ? (
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
                        <span>Time: {formatTime(task.timeSpent)}</span>
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
