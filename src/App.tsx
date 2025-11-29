import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import StudentAuth from "./pages/StudentAuth";
import DriverAuth from "./pages/DriverAuth";
import AdminAuth from "./pages/AdminAuth";
import StudentPortal from "./pages/StudentPortal";
import DriverPortal from "./pages/DriverPortal";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import TestConnection from "./components/TestConnection"; // ADD THIS LINE

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRole
}: {
  children: React.ReactNode;
  allowedRole?: string;
}) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (allowedRole === "student") return <Navigate to="/student/auth" replace />;
    if (allowedRole === "driver") return <Navigate to="/driver/auth" replace />;
    if (allowedRole === "admin") return <Navigate to="/admin/auth" replace />;
    return <Navigate to="/" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    if (userRole === "student") return <Navigate to="/student/dashboard" replace />;
    if (userRole === "driver") return <Navigate to="/driver" replace />;
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* ADD THIS TEST ROUTE */}
            <Route path="/test-connection" element={<TestConnection />} />
            
            {/* Student */}
            <Route path="/student/auth" element={<StudentAuth />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentPortal />
                </ProtectedRoute>
              }
            />

            {/* Driver */}
            <Route path="/driver/auth" element={<DriverAuth />} />
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRole="driver">
                  <DriverPortal />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminPortal />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;