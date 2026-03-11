import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';

export function TimeReports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks?assignedTo=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load tasks');
        }

        setTasks(data.tasks || []);
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
  }, [API_BASE_URL, user]);

  // Calculate real-time data from actual tasks
  const totalTime = tasks.reduce((acc, t) => acc + (t.currentElapsedTime || t.totalElapsedTime || 0), 0);
  const totalHours = Math.floor(totalTime / 3600);
  const totalMinutes = Math.floor((totalTime % 3600) / 60);

  // Task time data for monthly view
  const taskTimeData = tasks
    .filter(task => (task.currentElapsedTime || task.totalElapsedTime || 0) > 0)
    .map(task => ({
      name: task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title,
      hours: Math.round(((task.currentElapsedTime || task.totalElapsedTime || 0) / 3600) * 10) / 10,
      status: task.status,
    }))
    .sort((a, b) => b.hours - a.hours);

  // Daily data - group by day of week (last 7 days)
  const getDayData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyMap = new Map<string, number>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyMap.set(dayName, 0);
    }

    // Since we don't have daily breakdown, show total time distributed
    // In a real app, you'd track daily sessions
    tasks.forEach(task => {
      const taskTime = (task.currentElapsedTime || task.totalElapsedTime || 0) / 3600;
      if (taskTime > 0) {
        const createdDate = new Date(task.createdAt);
        const dayName = days[createdDate.getDay()];
        if (dailyMap.has(dayName)) {
          dailyMap.set(dayName, dailyMap.get(dayName)! + taskTime);
        }
      }
    });

    return Array.from(dailyMap.entries()).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 10) / 10,
    }));
  };

  // Weekly data - group by weeks (last 4 weeks)
  const getWeeklyData = () => {
    const weeklyMap = new Map<number, number>();
    
    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      weeklyMap.set(i, 0);
    }

    tasks.forEach(task => {
      const taskTime = (task.currentElapsedTime || task.totalElapsedTime || 0) / 3600;
      if (taskTime > 0) {
        const createdDate = new Date(task.createdAt);
        const now = new Date();
        const weeksDiff = Math.floor((now.getTime() - createdDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        if (weeksDiff >= 0 && weeksDiff < 4) {
          weeklyMap.set(weeksDiff, weeklyMap.get(weeksDiff)! + taskTime);
        }
      }
    });

    return Array.from(weeklyMap.entries())
      .reverse()
      .map(([weekIndex, hours], index) => ({
        week: `Week ${index + 1}`,
        hours: Math.round(hours * 10) / 10,
      }));
  };

  const weeklyData = getDayData();
  const monthlyData = getWeeklyData();

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your time spent on tasks</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{totalHours}h {totalMinutes}m</p>
                <p className="text-sm text-muted-foreground mt-2">Total Time Tracked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{tasks.length}</p>
                <p className="text-sm text-muted-foreground mt-2">Tasks Tracked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {totalTime > 0 && tasks.length > 0 ? Math.round((totalTime / tasks.length) / 60) : 0}m
                </p>
                <p className="text-sm text-muted-foreground mt-2">Avg. Time Per Task</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Hours worked per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : weeklyData.every(d => d.hours === 0) ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">No time data available. Start tracking time on your tasks!</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`${value}h`, 'Hours']}
                        />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Trend</CardTitle>
                <CardDescription>Hours tracked over the past 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : monthlyData.every(d => d.hours === 0) ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">No weekly time data available yet.</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`${value}h`, 'Hours']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Time by Task</CardTitle>
                <CardDescription>Time spent on each of your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : taskTimeData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">No tasks with tracked time yet.</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taskTimeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" className="text-xs" width={150} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`${value}h`, 'Hours']}
                        />
                        <Bar dataKey="hours" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
