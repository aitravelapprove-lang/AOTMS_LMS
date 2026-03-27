import { fetchWithAuth } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

// Types for admin data
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  mobile_number?: string | null;
  status: 'active' | 'suspended';
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  last_active_at: string | null;
  created_at: string;
  role?: string;
  suspended_until?: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'instructor' | 'student';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_email?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'disabled' | 'published' | 'draft';
  category: string | null;
  thumbnail_url: string | null;
  submitted_at?: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  price: string | number | null;
  image?: string | null;
  duration?: string | null;
  level?: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'rejected' | string;
  enrollment_date: string;
  user_name?: string;
  user_email?: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown> | null;
  resolved: boolean;
  created_at: string;
}

export interface SystemLog {
  id: string;
  log_type: 'info' | 'warning' | 'error' | 'audit' | 'system';
  module: string;
  action: string;
  user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeCourses: number;
  pendingCourses: number;
  pendingEnrollments: number; // Added field
  securityEvents: number;
  highPriorityEvents: number;
  roleCounts: Record<string, number>;
}


export function useAdminData(userRole?: string | null) {
  const { toast } = useToast();
  // Removed useAuth hook call here to prevent hook order errors
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]); // Typed
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeCourses: 0,
    pendingCourses: 0,
    pendingEnrollments: 0, // Added field
    securityEvents: 0,
    highPriorityEvents: 0,
    roleCounts: {},
  });

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    // Only fetch if role is explicitly admin or manager
    if (!userRole || (userRole !== 'admin' && userRole !== 'manager')) {
      console.warn(`[AdminData] Fetch skipped: current role is "${userRole}"`);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch in parallel with sensible limits
      const [profilesData, rolesData, coursesData, eventsData, logsData, enrollmentsData] = await Promise.all([
        fetchWithAuth('/data/profiles?sort=created_at&order=desc&limit=100'),
        fetchWithAuth('/data/user_roles?limit=500'), // Roles are small, but we still limit
        fetchWithAuth('/data/courses?sort=created_at&order=desc&limit=100'),
        fetchWithAuth('/data/security_events?sort=created_at&order=desc&limit=50'),
        fetchWithAuth('/data/system_logs?sort=created_at&order=desc&limit=100'),
        fetchWithAuth('/courses/enrollments'), // Custom endpoint already limits internally or fetches recent
      ]);

      if (profilesData && rolesData) {
        const rolesMap = (rolesData as UserRole[]).reduce((acc, r) => {
          acc[r.user_id] = r.role;
          return acc;
        }, {} as Record<string, string>);

        const mergedProfiles = (profilesData as Profile[]).map(p => ({
          ...p,
          role: rolesMap[p.id] || 'student',
          approval_status: p.approval_status || 'pending'
        }));

        setProfiles(mergedProfiles as Profile[]);
        setUserRoles(rolesData as UserRole[]);

        // Calculate role counts
        const counts: Record<string, number> = {};
        (rolesData as UserRole[]).forEach((r) => {
          counts[r.role] = (counts[r.role] || 0) + 1;
        });
        setStats((prev) => ({ ...prev, roleCounts: counts }));
      }
      if (coursesData) {
        setCourses(coursesData as Course[]);
        const pending = (coursesData as Course[]).filter((c) => c.status?.toLowerCase() === 'pending').length;
        const approved = (coursesData as Course[]).filter((c) => c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'published').length;
        setStats((prev) => ({ ...prev, pendingCourses: pending, activeCourses: approved }));
      }
      if (enrollmentsData) {
        setEnrollments(enrollmentsData as CourseEnrollment[]);
        const pendingEnrollmentsCount = (enrollmentsData as CourseEnrollment[]).filter(e => e.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingEnrollments: pendingEnrollmentsCount }));
      }
      if (eventsData) {
        setSecurityEvents(eventsData as SecurityEvent[]);
        const highPriority = (eventsData as SecurityEvent[]).filter(
          (e) => e.risk_level === 'high' || e.risk_level === 'critical'
        ).length;
        setStats((prev) => ({
          ...prev,
          securityEvents: eventsData?.length || 0,
          highPriorityEvents: highPriority,
        }));
      }
      if (logsData) setSystemLogs(logsData as SystemLog[]);

      // Update total users count
      setStats((prev) => ({ ...prev, totalUsers: profilesData?.length || 0 }));
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error fetching admin data:', err);
      
      // Handle 403 specifically
      if (err.message && err.message.includes('Administrative access required')) {
        toast({
          title: 'Access Denied',
          description: 'Your account does not have admin permissions. Please contact support or re-login.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load admin data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, userRole]);

  // Set up polling instead of realtime
  useEffect(() => {
    fetchAllData();
    // Poll every 15 seconds for more responsive updates
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const approveCourse = async (courseId: string) => {
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status: 'approved' })
      });
      
      toast({ title: 'Success', description: 'Course approved and published' });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve course', variant: 'destructive' });
      return false;
    }
  };

  const rejectCourse = async (courseId: string, reason: string) => {
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status: 'rejected', rejectionReason: reason })
      });

      toast({ title: 'Success', description: 'Course rejected' });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject course', variant: 'destructive' });
      return false;
    }
  };

  const updateCourseStatus = async (courseId: string, status: string) => {
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status })
      });

      toast({ title: 'Success', description: `Course status updated to ${status}` });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update course status', variant: 'destructive' });
      return false;
    }
  };

  // Admin actions
  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'suspended' | 'active', suspensionDays?: string) => {
    try {
      await fetchWithAuth('/admin/update-user-status', {
        method: 'PUT',
        body: JSON.stringify({ 
            userId, 
            status: status === 'active' ? 'approved' : status,
            suspensionDays 
        })
      });

      // Log action
      await fetchWithAuth('/rpc/log_admin_action', {
        method: 'POST',
        body: JSON.stringify({
          _module: 'User',
          _action: `User status changed to ${status}`,
          _details: { user_id: userId, status },
        })
      });

      toast({ title: 'Success', description: `User status updated to ${status}` });
      fetchAllData(); // Refresh data
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'instructor' | 'student') => {
    try {
      await fetchWithAuth('/admin/update-user-role', {
        method: 'PUT',
        body: JSON.stringify({ userId, role: newRole })
      });

      // Log action
      await fetchWithAuth('/rpc/log_admin_action', {
        method: 'POST',
        body: JSON.stringify({
          _module: 'Role',
          _action: `Role changed to ${newRole}`,
          _details: { user_id: userId, new_role: newRole },
        })
      });

      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
      return false;
    }
  };

  const sendApprovalEmail = async (userId: string) => {
    try {
      await fetchWithAuth('/admin/send-approval-email', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      toast({ title: 'Success', description: 'Approval email sent via N8N' });
      return true;
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error Notification',
        description: err.message || 'Failed to send notification email',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: 'active' | 'rejected') => {
    try {
      await fetchWithAuth('/courses/enrollment-status', {
        method: 'PUT',
        body: JSON.stringify({ enrollmentId, status })
      });

      // Log for debugging
      console.log(`[AdminData] Enrollment ${enrollmentId} updated to ${status}`);

      toast({ 
        title: status === 'active' ? '✅ Enrollment Approved' : '❌ Enrollment Rejected', 
        description: `Student enrollment has been ${status === 'active' ? 'approved' : 'rejected'}.` 
      });
      
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update enrollment status', variant: 'destructive' });
      return false;
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      await fetchWithAuth(`/data/course_enrollments/${enrollmentId}`, {
        method: 'DELETE'
      });

      toast({ 
        title: '🗑️ Enrollment Deleted', 
        description: 'Student enrollment has been permanently removed.' 
      });
      
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete enrollment', variant: 'destructive' });
      return false;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await fetchWithAuth(`/data/courses/${courseId}`, {
        method: 'DELETE'
      });

      toast({ 
        title: '🗑️ Course Deleted', 
        description: 'Course has been permanently removed.' 
      });
      
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
      return false;
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    try {
      const { user } = await fetchWithAuth('/user/profile');

      await fetchWithAuth(`/data/security_events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.user?.id || user.id,
        })
      });

      toast({ title: 'Success', description: 'Security event marked as resolved' });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to resolve security event', variant: 'destructive' });
      return false;
    }
  };

  // Get user with their role
  const getUsersWithRoles = (): Profile[] => {
    return profiles.map((profile) => {
      const userRole = userRoles.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: userRole?.role || 'student',
      };
    });
  };

  return {
    loading,
    profiles: getUsersWithRoles(),
    courses,
    enrollments,
    securityEvents,
    systemLogs,
    stats,
    userRoles,
    refresh: fetchAllData,
    updateUserStatus,
    updateUserRole,
    updateEnrollmentStatus,
    deleteEnrollment,
    deleteCourse,
    resolveSecurityEvent,
    sendApprovalEmail,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
    updateCoursePrice: async (courseId: string, newPrice: string | number) => {
      try {
        await fetchWithAuth(`/data/courses/${courseId}`, {
          method: 'PUT',
          body: JSON.stringify({ price: newPrice })
        });
        toast({ title: 'Success', description: 'Course price updated successfully' });
        fetchAllData();
        return true;
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to update price', variant: 'destructive' });
        return false;
      }
    }
  };
}
