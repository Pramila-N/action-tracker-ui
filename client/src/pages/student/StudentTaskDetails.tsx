import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, CheckCircle, Calendar, User, Clock, Upload } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'overdue'>('pending');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setCurrentElapsedTime(loadedTask.currentElapsedTime || loadedTask.timeSpent || 0);
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

  // Update timer display every second if timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (task?.isRunning && task?.currentStartTime) {
      interval = setInterval(() => {
        const startTime = new Date(task.currentStartTime).getTime();
        const now = Date.now();
        const sessionTime = Math.floor((now - startTime) / 1000);
        const totalElapsedTime = (task.totalElapsedTime || 0) + sessionTime;
        setCurrentElapsedTime(totalElapsedTime);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [task?.isRunning, task?.currentStartTime, task?.totalElapsedTime]);

  // Start the timer
  const handleStartTimer = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to start timer.');
      }

      // Reload task to get updated state
      await loadTask();

      toast({
        title: 'Timer Started',
        description: 'Your work session has begun.',
      });
    } catch (error: any) {
      console.error('Start timer error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start timer.',
        variant: 'destructive',
      });
    }
  };

  // Stop the timer
  const handleStopTimer = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to stop timer.');
      }

      // Reload task to get updated state
      await loadTask();

      toast({
        title: 'Timer Stopped',
        description: `Session saved: ${formatTime(data.sessionTime || 0)}`,
      });
    } catch (error: any) {
      console.error('Stop timer error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop timer.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTimer = useCallback(async () => {
    if (task?.isRunning) {
      await handleStopTimer();
    } else {
      await handleStartTimer();
    }
  }, [task?.isRunning]);

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

      // Reload task to get fresh data from database
      await loadTask();
    } catch (error) {
      console.error('Update task error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkComplete = useCallback(async () => {
    // Stop timer if running
    if (task?.isRunning) {
      await handleStopTimer();
    }
    
    await updateTask({ 
      status: 'completed', 
      progress: 100,
    });
    
    toast({
      title: 'Task Completed! 🎉',
      description: 'Great job! The task has been marked as complete.',
    });
  }, [task?.isRunning]);

  const handleProgressChange = useCallback(async (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    
    if (newProgress === 100 && status !== 'completed') {
      await handleMarkComplete();
    } else {
      await updateTask({ progress: newProgress });
    }
  }, [status, handleMarkComplete]);

  const handleSubmitWork = async () => {
    if (!taskId || !user) {
      return;
    }

    if (!submissionFile) {
      toast({
        title: 'Missing file',
        description: 'Please upload a PDF or DOCX file before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', submissionFile);
      formData.append('userId', user.id);

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/submission`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit work.');
      }

      const loadedTask: Task = {
        ...data.task,
        createdAt: new Date(data.task.createdAt),
        deadline: new Date(data.task.deadline),
      };

      setTask(loadedTask);
      setSubmissionFile(null);

      toast({
        title: 'Work submitted',
        description: 'Your file was submitted successfully for review.',
      });
    } catch (error: any) {
      console.error('Submit work error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit your work.',
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

  const formatTimerDisplay = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
                    disabled={status === 'completed'}
                    className="w-full"
                  />
                  <Progress value={progress} className="h-3" />
                </div>

                {status !== 'completed' && (
                  <Button 
                    onClick={handleMarkComplete} 
                    className="w-full gap-2"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}

                {status === 'completed' && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Submit Your Work</p>
                      <p className="text-xs text-muted-foreground">Accepted files: PDF, DOCX</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
                      aria-label="Upload your work"
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                    />
                    <Button
                      onClick={handleSubmitWork}
                      className="w-full gap-2"
                      variant="default"
                      disabled={isSubmitting}
                    >
                      <Upload className="h-4 w-4" />
                      {task.submission?.fileName ? 'Replace Submission' : 'Submit Your Work'}
                    </Button>
                    {task.submission?.fileName && submissionUrl && (
                      <div className="rounded-md border p-3 text-sm">
                        <p className="font-medium">Submitted File</p>
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
                    {task.review?.remarks && (
                      <div className="rounded-md border bg-muted/40 p-3 text-sm">
                        <p className="font-medium">Faculty Remarks</p>
                        <p className="text-muted-foreground mt-1">{task.review.remarks}</p>
                        {task.review.reviewedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Reviewed: {new Date(task.review.reviewedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Timer Card */}
            <Card className={cn(
              "shadow-card transition-all duration-300",
              task?.isRunning && "ring-2 ring-primary shadow-card-hover"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className={cn(
                    "text-4xl font-mono font-bold tracking-wider",
                    task?.isRunning && "text-primary animate-pulse"
                  )}>
                    {formatTimerDisplay(currentElapsedTime)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {task?.isRunning ? 'Timer running...' : 'Timer stopped'}
                  </p>
                </div>

                <Button
                  onClick={handleToggleTimer}
                  className={cn(
                    "w-full gap-2 h-12 text-lg",
                    task?.isRunning 
                      ? "bg-warning hover:bg-warning/90" 
                      : "bg-success hover:bg-success/90"
                  )}
                  disabled={status === 'completed'}
                >
                  {task?.isRunning ? (
                    <>
                      <Pause className="h-5 w-5" />
                      Stop Timer
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Timer
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Only one timer can run at a time
                </p>
              </CardContent>
            </Card>

            {/* Task Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Task Info</CardTitle>
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
                    <p className="font-medium">{formatTime(currentElapsedTime)}</p>
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
