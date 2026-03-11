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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Clock, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TaskDiscussionForum } from '@/components/TaskDiscussionForum';

export function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

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

  // Check if task is in submitted/reviewable state
  const isReviewable = ['submitted', 'rework_required', 'late_rework_required'].includes(task.status);
  const isAlreadyReviewed = task.review?.status === 'accepted' || task.review?.status === 'rejected';

  const handleAcceptTask = async () => {
    if (!taskId || !user) {
      return;
    }

    try {
      setIsReviewing(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/review/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewedBy: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to accept task.');
      }

      setTask(normalizeTask(data.task));

      toast({
        title: 'Task Accepted',
        description: 'The task has been marked as completed.',
      });
    } catch (error: any) {
      console.error('Accept task error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept task.',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRejectTask = async () => {
    if (!taskId || !user) {
      return;
    }

    if (!rejectReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsReviewing(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/review/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewedBy: user.id, remarks: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to reject task.');
      }

      setTask(normalizeTask(data.task));
      setRejectReason('');
      setShowRejectForm(false);

      toast({
        title: 'Task Rejected',
        description: 'The student has been notified and can now make corrections.',
      });
    } catch (error: any) {
      console.error('Reject task error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject task.',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
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

        {isReviewable && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              This task is ready for review. The student submitted their work and is awaiting your feedback.
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
                  <div className="space-y-4">
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

                    {/* Review Decision Section */}
                    {isReviewable && !isAlreadyReviewed && (
                      <div className="border-t pt-4 space-y-3">
                        <p className="text-sm font-medium">Review Decision</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAcceptTask}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                            disabled={isReviewing}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            variant="destructive"
                            className="flex-1 gap-2"
                            disabled={isReviewing}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>

                        {showRejectForm && (
                          <div className="space-y-2 pt-2 border-t">
                            <label className="text-sm font-medium">Reason for Rejection</label>
                            <Textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Explain what needs to be fixed..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={handleRejectTask}
                                variant="destructive"
                                className="flex-1"
                                disabled={isReviewing}
                              >
                                {isReviewing ? 'Rejecting...' : 'Confirm Rejection'}
                              </Button>
                              <Button
                                onClick={() => setShowRejectForm(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isReviewing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show Review Status if already reviewed */}
                    {isAlreadyReviewed && task.review?.remarks && (
                      <div className={`rounded-md border-l-4 p-3 ${
                        task.review.status === 'accepted' 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-orange-50 border-orange-400'
                      }`}>
                        <p className="font-medium mb-1">
                          {task.review.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </p>
                        <p className="text-muted-foreground text-sm">{task.review.remarks}</p>
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
        </div>

        <TaskDiscussionForum taskId={task.id} />
      </div>
    </DashboardLayout>
  );
}
