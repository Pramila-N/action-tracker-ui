import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import { Task } from '@/types';

export function FacultyReports() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks?createdBy=${user.id}`);

        if (!response.ok) {
          throw new Error(`Failed to load tasks: ${response.status}`);
        }

        const data = await response.json();

        const loadedTasks = (data.tasks || []).map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          deadline: new Date(task.deadline),
        }));

        console.log('📊 FacultyReports - Tasks loaded:', loadedTasks.length);
        if (loadedTasks.length > 0) {
          console.log('📊 Sample task:', {
            id: loadedTasks[0].id,
            title: loadedTasks[0].title,
            assignedTo: loadedTasks[0].assignedTo,
            status: loadedTasks[0].status,
          });
        }

        setTasks(loadedTasks);
      } catch (error) {
        console.error('Load tasks error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [API_BASE_URL, user]);

  // Calculate student performance data
  const studentPerformance = Array.from(
    tasks.reduce((map, task) => {
      const studentId = typeof task.assignedTo === 'object' ? task.assignedTo.id : task.assignedTo;
      const studentName = typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Unknown';
      
      if (!map.has(studentId)) {
        map.set(studentId, {
          id: studentId,
          name: studentName,
          total: 0,
          completed: 0,
          hours: 0,
        });
      }

      const student = map.get(studentId)!;
      student.total += 1;
      
      const taskTime = task.currentElapsedTime || task.timeSpent || 0;
      student.hours += taskTime / 3600;

      if (task.status === 'completed') {
        student.completed += 1;
      }

      return map;
    }, new Map<string, any>())
  ).map(([_, student]) => ({
    name: student.name,
    total: student.total,
    completed: student.completed,
    hours: Math.round(student.hours * 100) / 100,
  }));

  console.log('📊 Student Performance Data:', studentPerformance);
  console.log('📊 Tasks for calculation:', tasks.length);

  // Calculate tasks by priority
  const tasksByPriority = [
    {
      name: 'High',
      value: tasks.filter(t => t.priority === 'high').length,
      fill: '#ef4444',
    },
    {
      name: 'Medium',
      value: tasks.filter(t => t.priority === 'medium').length,
      fill: '#f59e0b',
    },
    {
      name: 'Low',
      value: tasks.filter(t => t.priority === 'low').length,
      fill: '#10b981',
    },
  ];

  // Calculate tasks by status
  const tasksByStatus = [
    {
      name: 'Pending',
      value: tasks.filter(t => t.status === 'pending').length,
      fill: '#6b7280',
    },
    {
      name: 'In Progress',
      value: tasks.filter(t => t.status === 'in_progress').length,
      fill: '#3b82f6',
    },
    {
      name: 'Completed',
      value: tasks.filter(t => t.status === 'completed').length,
      fill: '#10b981',
    },
    {
      name: 'Overdue',
      value: tasks.filter(t => t.status === 'overdue').length,
      fill: '#ef4444',
    },
  ];

  // Calculate KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Track student performance and task analytics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Tasks"
            value={totalTasks}
            icon={<Zap className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed"
            value={completedTasks}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          />
          <KPICard
            title="In Progress"
            value={inProgressTasks}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
          />
          <KPICard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Student Performance Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Tasks completed vs assigned per student</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading data...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks created yet. Create a task to see performance data.</p>
              ) : studentPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No valid student assignments found. Check task assignments.</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentPerformance} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        style={{ fontSize: '12px' }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '14px' }} />
                      <Bar dataKey="total" name="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks by Priority Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tasks by Priority</CardTitle>
              <CardDescription>Distribution across priority levels</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading data...</p>
              ) : tasksByPriority.every(p => p.value === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks created yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksByPriority}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      >
                        {tasksByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Spent by Student Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Time Spent by Student</CardTitle>
              <CardDescription>Hours tracked per student</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading data...</p>
              ) : studentPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No time tracking data yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={studentPerformance} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="name" type="category" style={{ fontSize: '12px' }} width={100} />
                      <Tooltip 
                        formatter={(val) => `${(val as number).toFixed(2)}h`}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="hours" name="Hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks by Status Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading data...</p>
              ) : tasksByStatus.every(s => s.value === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks created yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      >
                        {tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
