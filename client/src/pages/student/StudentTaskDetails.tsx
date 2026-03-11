import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, User, Clock, Send, AlertTriangle } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { TaskDiscussionForum } from '@/components/TaskDiscussionForum';

export function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<any>('pending');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Load task from backend
  const loadTask = async () => {
    if (!taskId || !user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load task.');
      }

      const loadedTask: Task = {
        ...data.task,
        createdAt: new Date(data.task.createdAt),
        deadline: new Date(data.task.deadline),
      };

      setTask(loadedTask);
      setProgress(loadedTask.progress || 0);
      setStatus(loadedTask.status || 'pending');
    } catch (error) {
      console.error('Load task error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load task details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId, user]);

  // Update deadline countdown
  useEffect(() => {
    if (!task) return;

    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h remaining`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeRemaining(`${minutes}m remaining`);
        }
      } else {
        setTimeRemaining('Deadline passed');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [task?.deadline]);

  // Update task directly (for progress, status, etc.)
  const updateTask = async (updates: Partial<Task>) => {
    if (!task || !user) return;

    try {
      // Build payload with only necessary fields (extracting IDs from objects)
      const payload = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
        progress: task.progress,
        timeSpent: task.timeSpent,
        assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo.id : task.assignedTo,
        userId: user.id, // Include userId for activity logging
        ...updates,
      };

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update task.');
      }

      // Use the updated task from response instead of reloading
      const updatedTask: Task = {
        ...data.task,
        createdAt: new Date(data.task.createdAt),
        deadline: new Date(data.task.deadline),
      };

      setTask(updatedTask);
      setProgress(updatedTask.progress || 0);
      setStatus(updatedTask.status || 'pending');
    } catch (error) {
      console.error('Update task error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes.',
        variant: 'destructive',
      });
    }
  };

  const handleProgressChange = async (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    
    await updateTask({ progress: newProgress });
  };

  // Submit task for review when progress is 100%
  const handleSubmitTaskForReview = async () => {
    if (!taskId || !user || !task) {
      return;
    }

    if (progress < 100) {
      toast({
        title: 'Not Ready',
        description: 'Task progress must reach 100% to submit.',
        variant: 'destructive',
      });
      return;
    }

    if (!submissionFile) {
      toast({
        title: 'File Required',
        description: 'Please upload a PDF or DOCX file before submitting for review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (task.progress < 100) {
        await updateTask({ progress: 100 });
      }

      const formData = new FormData();
      formData.append('file', submissionFile);
      formData.append('userId', user.id);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/submission`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData?.message || 'Failed to upload submission file.');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, progress: 100 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit task.');
      }

      const loadedTask: Task = {
        ...data.task,
        createdAt: new Date(data.task.createdAt),
        deadline: new Date(data.task.deadline),
      };

      setTask(loadedTask);
      setStatus(loadedTask.status);
      setSubmissionFile(null);

      toast({
        title: 'Task Submitted!',
        description: 'Your task has been submitted for review. Faculty will review it soon.',
      });
    } catch (error: any) {
      console.error('Submit task error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit task.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-lg text-muted-foreground">Loading task...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-lg text-muted-foreground">Task not found</p>
          <Button onClick={() => navigate('/student/tasks')}>Back to Tasks</Button>
        </div>
      </DashboardLayout>
    );
  }

  const isSubmitted = ['submitted', 'rework_required', 'late_rework_required', 'completed', 'completed_late_rework'].includes(status);
  const isRejected = ['rework_required', 'late_rework_required'].includes(status);
  const isCompleted = ['completed', 'completed_late_rework'].includes(status);
  const canSubmitForReview = progress === 100 && (status === 'pending' || status === 'in_progress' || isRejected || status === 'overdue');
  const submissionUrl = task.submission?.fileName
    ? `${API_BASE_URL}/api/tasks/download/${task.submission.fileName}`
    : null;

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student/tasks')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </div>

        {isRejected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This task was {task.status === 'late_rework_required' ? 'rejected after deadline' : 'rejected'}. 
              Please review the feedback and make corrections before resubmitting.
            </AlertDescription>
          </Alert>
        )}

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
                <CardTitle>Update Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-2xl font-bold">{progress}%</span>
                  </div>
                  <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={5}
                    disabled={isCompleted || progress === 100}
                    className="w-full"
                  />
                  <Progress value={progress} className="h-3" />
                  {progress === 100 && (
                    <p className="text-xs text-muted-foreground">
                      Progress is locked after reaching 100%.
                    </p>
                  )}
                </div>

                {canSubmitForReview && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload Work File</p>
                      <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOCX</p>
                    </div>
                    <input
                      type="file"
                      aria-label="Upload submission file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                    />
                    <Button
                      onClick={handleSubmitTaskForReview}
                      className="w-full gap-2"
                      disabled={isSubmitting || !submissionFile}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Submitting...' : 'Upload and Submit for Review'}
                    </Button>
                  </div>
                )}

                {/* Submitted Status */}
                {isSubmitted && (
                  <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <p className="font-semibold text-green-900">Task Submitted</p>
                    {task.submittedAt && (
                      <p className="text-sm text-green-800 mt-1">
                        Submitted at {new Date(task.submittedAt).toLocaleString()}
                      </p>
                    )}
                    {isRejected && (
                      <p className="text-sm text-amber-800 mt-2">
                        This task requires rework. Upload a corrected file and resubmit.
                      </p>
                    )}
                  </div>
                )}

                {task.submission?.fileName && submissionUrl && (
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-medium">Latest Uploaded File</p>
                    <a
                      href={submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      {task.submission.originalName || 'Download submission'}
                    </a>
                    {task.submission.uploadedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {new Date(task.submission.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Show Review Remarks if available */}
                {task.review?.remarks && (
                  <div className={cn(
                    "rounded-md border p-4",
                    task.review.status === 'accepted' 
                      ? "bg-green-50 border-green-200" 
                      : "bg-amber-50 border-amber-200"
                  )}>
                    <p className="font-semibold mb-2">
                      {task.review.status === 'accepted' ? 'Accepted' : 'Feedback Required'}
                    </p>
                    <p className="text-muted-foreground">{task.review.remarks}</p>
                    {task.review.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed: {new Date(task.review.reviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Task Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Task Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(task.deadline).toLocaleDateString()}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      timeRemaining.includes('passed') ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {timeRemaining}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned By</p>
                    <p className="font-medium">{task.createdBy.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="font-medium">{formatTime(task.timeSpent || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <TaskDiscussionForum taskId={task.id} />
      </div>
    </DashboardLayout>
  );
}
