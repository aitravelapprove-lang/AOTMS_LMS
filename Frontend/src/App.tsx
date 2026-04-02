import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SocketProvider } from "@/hooks/useSocket";
import { useEffect, useRef } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LearningPaths from "./pages/LearningPaths";
import InstructorRegister from "./pages/InstructorRegister";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import LiveSession from "./pages/LiveSession";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import PendingApproval from "./pages/PendingApproval";
import Courses from "./pages/Courses";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { SuspensionOverlay } from "@/components/auth/SuspensionOverlay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 120000, // 2 minutes - Reduce redundant fetches
      refetchOnWindowFocus: false, // Prevent refetches on tab switch
      retry: 1, // Only retry once on failure
    },
  },
});

const RoleRedirector = () => {
  const { userRole, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lastRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !user || !userRole) return;

    // Redirection Map
    const dashboardMap: Record<string, string> = {
      student: "/student-dashboard",
      instructor: "/instructor",
      admin: "/admin",
      manager: "/manager"
    };

    const target = dashboardMap[userRole];
    
    // 1. Handle Role Change during session
    if (lastRoleRef.current !== null && lastRoleRef.current !== userRole) {
      console.log(`[REAL-TIME] Role update detected: ${lastRoleRef.current} -> ${userRole}.`);
      if (target && !location.pathname.startsWith(target)) {
        navigate(target);
      }
    } 
    // 2. Handle Initial Load / Wrong Page
    // If user is at root/auth OR if they are an admin on a non-admin page
    else if (location.pathname === '/' || location.pathname === '/auth') {
       if (target) navigate(target);
    }
    // Force specific redirection for non-students if they wander into the student area
    // This ensures that when a role changes (e.g. Student -> Instructor), they are bumped to their portal
    else if (userRole !== 'student' && location.pathname.startsWith('/student-dashboard')) {
        // Allow admins to view student dashboard if explicitly needed, but for now we redirect
        // to ensure the "role change" creates a visible "rooting change"
        if (target && target !== '/student-dashboard') {
            navigate(target);
        }
    }
    
    lastRoleRef.current = userRole;
  }, [userRole, user, loading, navigate, location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SuspensionOverlay />
            <ScrollToTop />
            <RoleRedirector />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
              <Route path="/become-instructor" element={<InstructorRegister />} />
              <Route path="/learning-paths" element={<LearningPaths />} />

              <Route
                path="/student-dashboard/*"
                element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/instructor/*"
                element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin/*"
                element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
              />
              <Route
                path="/manager/*"
                element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerDashboard /></ProtectedRoute>}
              />

              <Route path="/live/:meetingId" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
