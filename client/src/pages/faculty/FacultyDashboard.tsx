import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ListTodo, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { mockTasks, getTaskStats } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function FacultyDashboard() {
  const navigate = useNavigate();
  const stats = getTaskStats();
  const recentTasks = mockTasks.slice(0, 4);

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage tasks and track student progress</p>
          </div>
          <Button onClick={() => navigate('/faculty/tasks/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Tasks"
            value={stats.total}
            change={12}
            trend="up"
            icon={<ListTodo className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed"
            value={stats.completed}
            change={25}
            trend="up"
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Overdue"
            value={stats.overdue}
            change={-5}
            trend="down"
            icon={<AlertCircle className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Recent Tasks */}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
