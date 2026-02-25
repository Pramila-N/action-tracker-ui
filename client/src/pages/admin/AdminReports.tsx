import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

export function AdminReports() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        const data = await response.json();

        if (response.ok) {
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error('Load tasks error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // Weekly completion data - last 4 weeks
  const getWeeklyData = () => {
    const weeklyMap = new Map<number, { completed: number; assigned: number }>();
    
    for (let i = 3; i >= 0; i--) {
      weeklyMap.set(i, { completed: 0, assigned: 0 });
    }

    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const now = new Date();
      const weeksDiff = Math.floor((now.getTime() - createdDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksDiff >= 0 && weeksDiff < 4) {
        const data = weeklyMap.get(weeksDiff)!;
        data.assigned += 1;
        if (task.status === 'completed') {
          data.completed += 1;
        }
      }
    });

    return Array.from(weeklyMap.entries())
      .reverse()
      .map(([weekIndex, data], index) => ({
        week: `Week ${index + 1}`,
        completed: data.completed,
        assigned: data.assigned,
      }));
  };

  // Time usage by priority
  const getTimeUsageData = () => {
    const priorityMap = new Map<string, number>();
    priorityMap.set('high', 0);
    priorityMap.set('medium', 0);
    priorityMap.set('low', 0);

    tasks.forEach(task => {
      const hours = (task.currentElapsedTime || task.totalElapsedTime || 0) / 3600;
      const priority = task.priority || 'medium';
      priorityMap.set(priority, priorityMap.get(priority)! + hours);
    });

    return [
      { name: 'High Priority', hours: Math.round(priorityMap.get('high')! * 10) / 10 },
      { name: 'Medium Priority', hours: Math.round(priorityMap.get('medium')! * 10) / 10 },
      { name: 'Low Priority', hours: Math.round(priorityMap.get('low')! * 10) / 10 },
    ].filter(item => item.hours > 0);
  };

  // Daily productivity - last 7 days
  const getProductivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap = new Map<string, { tasks: number; hours: number }>();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dayMap.set(dayName, { tasks: 0, hours: 0 });
    }

    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const dayName = days[createdDate.getDay()];
      if (dayMap.has(dayName)) {
        const data = dayMap.get(dayName)!;
        data.tasks += 1;
        data.hours += (task.currentElapsedTime || task.totalElapsedTime || 0) / 3600;
      }
    });

    return Array.from(dayMap.entries()).map(([name, data]) => ({
      name,
      tasks: data.tasks,
      hours: Math.round(data.hours * 10) / 10,
    }));
  };

  // Task status distribution
  const getTaskStatusData = () => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    return [
      { name: 'Completed', value: completed, fill: 'hsl(var(--success))' },
      { name: 'In Progress', value: inProgress, fill: 'hsl(var(--primary))' },
      { name: 'Pending', value: pending, fill: 'hsl(var(--warning))' },
    ].filter(item => item.value > 0);
  };

  const weeklyData = getWeeklyData();
  const timeUsageData = getTimeUsageData();
  const productivityData = getProductivityData();
  const taskStatusData = getTaskStatusData();
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive platform analytics and insights</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Weekly Task Completion</CardTitle>
              <CardDescription>Tasks completed vs assigned over the last 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : weeklyData.every(d => d.assigned === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No weekly data available yet.</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="assigned" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" />
                      <Area type="monotone" dataKey="completed" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Time Usage by Priority</CardTitle>
              <CardDescription>Hours tracked by task priority level</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : timeUsageData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No time tracking data available yet.</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeUsageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Daily Productivity Trend</CardTitle>
              <CardDescription>Tasks created and hours tracked per day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : productivityData.every(d => d.tasks === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No daily productivity data available yet.</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Task Status Overview</CardTitle>
              <CardDescription>Current distribution of task statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : taskStatusData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No tasks available yet.</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
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
