import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, CheckCircle, Calendar, User, Clock } from 'lucide-react';
import { mockTasks, formatTime } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const task = mockTasks.find(t => t.id === taskId);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task?.timeSpent || 0);
  const [progress, setProgress] = useState(task?.progress || 0);
  const [status, setStatus] = useState(task?.status || 'pending');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
    if (!isTimerRunning) {
      setStatus('in_progress');
      toast({
        title: 'Timer Started',
        description: 'Your work session has begun.',
      });
    } else {
      toast({
        title: 'Timer Paused',
        description: `Time saved: ${formatTime(elapsedTime)}`,
      });
    }
  }, [isTimerRunning, elapsedTime, toast]);

  const handleMarkComplete = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }
    setStatus('completed');
    setProgress(100);
    toast({
      title: 'Task Completed! 🎉',
      description: 'Great job! The task has been marked as complete.',
    });
  }, [isTimerRunning, toast]);

  const handleProgressChange = useCallback((value: number[]) => {
    setProgress(value[0]);
    if (value[0] === 100 && status !== 'completed') {
      handleMarkComplete();
    }
  }, [status, handleMarkComplete]);

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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Timer Card */}
            <Card className={cn(
              "shadow-card transition-all duration-300",
              isTimerRunning && "ring-2 ring-primary shadow-card-hover"
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
                    isTimerRunning && "text-primary animate-pulse"
                  )}>
                    {formatTimerDisplay(elapsedTime)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isTimerRunning ? 'Timer running...' : 'Timer paused'}
                  </p>
                </div>

                <Button
                  onClick={handleToggleTimer}
                  className={cn(
                    "w-full gap-2 h-12 text-lg",
                    isTimerRunning 
                      ? "bg-warning hover:bg-warning/90" 
                      : "bg-success hover:bg-success/90"
                  )}
                  disabled={status === 'completed'}
                >
                  {isTimerRunning ? (
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
                    <p className="font-medium">{formatTime(elapsedTime)}</p>
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
