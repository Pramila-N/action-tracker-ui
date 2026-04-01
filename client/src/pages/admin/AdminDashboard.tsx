import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';

export function AdminDashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load users.');
      }
      return data.users || [];
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/tasks`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load tasks.');
      }
      return data.tasks || [];
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const isLoading = usersLoading || tasksLoading;

  // Calculate stats from real data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalTimeTracked = tasks.reduce((acc, t) => acc + (t.currentElapsedTime || t.totalElapsedTime || 0), 0);
  const hours = Math.floor(totalTimeTracked / 3600);

  // Productivity data - last 7 days
  const getProductivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap = new Map<string, { tasks: number; hours: number }>();
    
    // Initialize last 7 days
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

  const productivityData = getProductivityData();

  // Task status distribution
  const taskStatusData = [
    { name: 'Completed', value: completedTasks, fill: 'hsl(var(--success))' },
    { name: 'In Progress', value: inProgressTasks, fill: 'hsl(var(--primary))' },
    { name: 'Pending', value: pendingTasks, fill: 'hsl(var(--warning))' },
  ].filter(item => item.value > 0);

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
            value={users.length}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Tasks"
            value={totalTasks}
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Completed Tasks"
            value={completedTasks}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
          <KPICard
            title="Total Time Tracked"
            value={`${hours}h`}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Productivity Over Time</CardTitle>
              <CardDescription>Tasks created and hours tracked this week</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : productivityData.every(d => d.tasks === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No productivity data available yet.</p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Overview of all task statuses</CardDescription>
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
