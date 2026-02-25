import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Clock } from 'lucide-react';
import { formatTime } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';

export function StudentTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentTasks, setStudentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const normalizeTask = (task: Task): Task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    deadline: new Date(task.deadline),
  });

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks?assignedTo=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load tasks.');
        }

        if (isMounted) {
          setStudentTasks((data.tasks || []).map(normalizeTask));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, user]);

  const filteredTasks = studentTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">View and manage your assigned tasks</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks available yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-card-hover transition-all cursor-pointer"
                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold line-clamp-2">{task.title}</h3>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {task.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(task.timeSpent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
