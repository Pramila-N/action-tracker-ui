import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { allUsers, mockTasks, getTaskStats, productivityData, taskStatusData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function AdminDashboard() {
  const stats = getTaskStats();
  const totalTimeTracked = mockTasks.reduce((acc, t) => acc + t.timeSpent, 0);
  const hours = Math.floor(totalTimeTracked / 3600);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your platform.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Users"
            value={allUsers.length}
            change={12}
            changeLabel="from last month"
            trend="up"
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Tasks"
            value={stats.total}
            change={8}
            changeLabel="from last week"
            trend="up"
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed Tasks"
            value={stats.completed}
            change={15}
            changeLabel="completion rate"
            trend="up"
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Time Tracked"
            value={`${hours}h`}
            change={5}
            changeLabel="from last week"
            trend="up"
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Productivity Over Time</CardTitle>
              <CardDescription>Tasks completed and hours worked this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData}>
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
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hours" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Overview of all task statuses</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
