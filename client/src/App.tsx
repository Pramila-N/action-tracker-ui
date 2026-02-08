import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UsersManagement } from "@/pages/admin/UsersManagement";
import { AdminReports } from "@/pages/admin/AdminReports";
import { AdminSettings } from "@/pages/admin/AdminSettings";

// Faculty Pages
import { FacultyDashboard } from "@/pages/faculty/FacultyDashboard";
import { FacultyTasks } from "@/pages/faculty/FacultyTasks";
import { CreateTask } from "@/pages/faculty/CreateTask";
import { TaskDetails } from "@/pages/faculty/TaskDetails";
import { FacultyReports } from "@/pages/faculty/FacultyReports";

// Student Pages
import { StudentDashboard } from "@/pages/student/StudentDashboard";
import { StudentTasks } from "@/pages/student/StudentTasks";
import { StudentTaskDetails } from "@/pages/student/StudentTaskDetails";
import { TimeReports } from "@/pages/student/TimeReports";

// Common Pages
import { ProfilePage } from "@/pages/ProfilePage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      
      {/* Faculty Routes */}
      <Route path="/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/tasks" element={<ProtectedRoute><FacultyTasks /></ProtectedRoute>} />
      <Route path="/faculty/tasks/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
      <Route path="/faculty/tasks/:taskId" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
      <Route path="/faculty/tasks/:taskId/edit" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
      <Route path="/faculty/reports" element={<ProtectedRoute><FacultyReports /></ProtectedRoute>} />
      <Route path="/faculty/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/tasks" element={<ProtectedRoute><StudentTasks /></ProtectedRoute>} />
      <Route path="/student/tasks/:taskId" element={<ProtectedRoute><StudentTaskDetails /></ProtectedRoute>} />
      <Route path="/student/time-reports" element={<ProtectedRoute><TimeReports /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Common Profile Route */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
