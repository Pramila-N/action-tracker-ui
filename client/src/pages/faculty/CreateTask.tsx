import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function CreateTask() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToIds, setAssignedToIds] = useState<string[]>([]);
  const [priority, setPriority] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [students, setStudents] = useState<User[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';
  const isEdit = Boolean(taskId);
  const studentIds = students.map((student) => student.id);
  const isAllSelected = studentIds.length > 0 && studentIds.every((id) => assignedToIds.includes(id));

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users?role=student`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load students.');
        }

        if (isMounted) {
          setStudents(data.users || []);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load students.';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoadingStudents(false);
        }
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, toast]);

  useEffect(() => {
    let isMounted = true;

    const loadTask = async () => {
      if (!taskId) {
        return;
      }

      setIsLoadingTask(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load task.');
        }

        if (isMounted) {
          setTitle(data.task.title || '');
          setDescription(data.task.description || '');
          setAssignedToIds(data.task.assignedTo?.id ? [data.task.assignedTo.id] : []);
          setPriority(data.task.priority || '');
          setDeadline(data.task.deadline ? new Date(data.task.deadline) : undefined);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load task.';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoadingTask(false);
        }
      }
    };

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, taskId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || assignedToIds.length === 0 || !priority || !deadline) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Session Error',
        description: 'Please log in again to create a task.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId || ''}`.replace(/\/$/, ''), {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          assignedTo: isEdit ? assignedToIds[0] : assignedToIds,
          priority,
          deadline,
          ...(isEdit ? {} : { createdBy: user.id }),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create task.');
      }

      toast({
        title: isEdit ? 'Task Updated' : 'Task Created',
        description: isEdit
          ? 'The task has been updated successfully.'
          : assignedToIds.length > 1
            ? 'The task has been created for the selected students.'
            : 'The task has been created successfully.',
      });

      navigate('/faculty/tasks');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task.';
      toast({
        title: 'Create Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{taskId ? 'Edit Task' : 'Create Task'}</h1>
          <p className="text-muted-foreground mt-1">
            {taskId ? 'Update task details' : 'Assign a new task to one or more students'}
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                {taskId ? 'Update the information for this task' : 'Fill in the information for the new task'}
              </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  {isLoadingTask ? (
                    <div className="text-sm text-muted-foreground">Loading task...</div>
                  ) : isLoadingStudents ? (
                    <div className="text-sm text-muted-foreground">Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No students available.</div>
                  ) : (
                    <div className="space-y-2">
                      {!isEdit && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Quick select</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAssignedToIds(isAllSelected ? [] : studentIds)}
                          >
                            {isAllSelected ? 'Clear all' : 'Select all'}
                          </Button>
                        </div>
                      )}
                      <div className="rounded-md border p-3 space-y-2 max-h-56 overflow-y-auto">
                        {students.map((student) => {
                          const isChecked = assignedToIds.includes(student.id);
                          return (
                            <label key={student.id} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const isNowChecked = checked === true;
                                  if (isEdit) {
                                    setAssignedToIds(isNowChecked ? [student.id] : []);
                                    return;
                                  }

                                  setAssignedToIds((prev) =>
                                    isNowChecked
                                      ? [...prev, student.id]
                                      : prev.filter((id) => id !== student.id)
                                  );
                                }}
                              />
                              <span className="text-muted-foreground">{student.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isEdit ? 'Select one student for this task.' : `${assignedToIds.length} student(s) selected.`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/faculty/tasks')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || isLoadingTask}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {taskId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    taskId ? 'Update Task' : 'Create Task'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
