import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTasks, formatTime, productivityData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

export function TimeReports() {
  const [activeTab, setActiveTab] = useState('daily');

  // Simulate time data
  const studentTasks = mockTasks;
  const totalTime = studentTasks.reduce((acc, t) => acc + t.timeSpent, 0);
  const totalHours = Math.floor(totalTime / 3600);
  const totalMinutes = Math.floor((totalTime % 3600) / 60);

  const taskTimeData = studentTasks.map(task => ({
    name: task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title,
    hours: Math.round((task.timeSpent / 3600) * 10) / 10,
    status: task.status,
  }));

  const weeklyData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 7.1 },
    { day: 'Fri', hours: 5.5 },
    { day: 'Sat', hours: 2.3 },
    { day: 'Sun', hours: 1.2 },
  ];

  const monthlyData = [
    { week: 'Week 1', hours: 28 },
    { week: 'Week 2', hours: 35 },
    { week: 'Week 3', hours: 30 },
    { week: 'Week 4', hours: 42 },
  ];

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
                <p className="text-4xl font-bold">{studentTasks.length}</p>
                <p className="text-sm text-muted-foreground mt-2">Tasks Tracked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {totalTime > 0 ? Math.round((totalTime / studentTasks.length) / 60) : 0}m
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
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Hours worked per day this week</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Trend</CardTitle>
                <CardDescription>Hours tracked over the past weeks</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Time by Task</CardTitle>
                <CardDescription>Time spent on each task this month</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
