import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Clock, Calendar, User } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
          const normalized = normalizeTask(data.task);
          setTask(normalized);
          setRemarks(normalized.review?.remarks || '');
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

  const submissionUrl = task.submission?.fileName
    ? `${API_BASE_URL}/api/tasks/download/${task.submission.fileName}`
    : null;

  const handleSaveRemarks = async () => {
    if (!taskId || !user) {
      return;
    }

    if (!remarks.trim()) {
      toast({
        title: 'Remarks required',
        description: 'Please add remarks before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/remarks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks, reviewedBy: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save remarks.');
      }

      setTask(normalizeTask(data.task));

      toast({
        title: 'Remarks saved',
        description: 'Your review has been sent to the student.',
      });
    } catch (error: any) {
      console.error('Save remarks error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save remarks.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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
                    <p className="font-medium">
                      {formatTime(task.currentElapsedTime || task.totalElapsedTime || task.timeSpent)}
                    </p>
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

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Submission Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!task.submission?.fileName ? (
                  <p className="text-sm text-muted-foreground">No submission received yet.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-md border p-3 text-sm">
                      <p className="font-medium">Submitted File</p>
                      {submissionUrl && (
                        <a
                          href={submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          {task.submission.originalName || 'Download submission'}
                        </a>
                      )}
                      {task.submission.uploadedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded: {new Date(task.submission.uploadedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Remarks</p>
                      <Textarea
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value)}
                        placeholder="Add your feedback for the student..."
                        rows={4}
                      />
                      <Button onClick={handleSaveRemarks} disabled={isSaving} className="w-full">
                        {isSaving ? 'Saving...' : 'Save Remarks'}
                      </Button>
                    </div>

                    {task.review?.remarks && task.review.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last reviewed: {new Date(task.review.reviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
