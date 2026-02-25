import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Clock, Calendar, User } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { Task } from '@/types';

export function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const normalizeTask = (data: Task): Task => ({
    ...data,
    createdAt: new Date(data.createdAt),
    deadline: new Date(data.deadline),
  });

  useEffect(() => {
    let isMounted = true;

    const loadTask = async () => {
      if (!taskId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load task.');
        }

        if (isMounted) {
          setTask(normalizeTask(data.task));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, taskId]);

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="faculty">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-lg text-muted-foreground">Loading task...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout requiredRole="faculty">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-lg text-muted-foreground">Task not found</p>
          <Button onClick={() => navigate('/faculty/tasks')}>Back to Tasks</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/faculty/tasks')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <Button onClick={() => navigate(`/faculty/tasks/${task.id}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Task
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{task.description}</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(task.assignedTo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{task.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">{task.assignedTo.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="font-medium">{formatTime(task.timeSpent)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{task.createdBy.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
