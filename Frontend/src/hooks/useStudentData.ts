import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Course, CourseResource } from './useInstructorData';

interface ExamAccess {
    id: string;
    exam_id?: string;
    mock_paper_id?: string;
    exam_schedules?: Record<string, unknown>;
    mock_papers?: Record<string, unknown>;
    access_type: string;
}

export function useStudentEnrollments() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['student-enrollments', user?.id],
        queryFn: () => fetchWithAuth(`/data/course_enrollments?user_id=eq.${user?.id}`),
        enabled: !!user?.id,
    });
}

export function useStudentStats() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['student-stats', user?.id],
        queryFn: () => fetchWithAuth(`/data/leaderboard_stats?user_id=eq.${user?.id}`),
        enabled: !!user?.id,
        select: (data) => data[0] || null,
    });
}

export function useStudentExams() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['student-exams', user?.id],
        queryFn: async () => {
            const accessible = await fetchWithAuth('/student/accessible-exams') as any[];
            return accessible
                .filter((a) => a.exam_id)
                .map((a) => ({
                    ...a.exam_schedules,
                    id: a.exam_id
                }));
        },
        enabled: !!user?.id,
        refetchInterval: 30000,
    });
}

export function useStudentMockPapers() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['student-mock-papers', user?.id],
        queryFn: async () => {
            const accessible = await fetchWithAuth('/student/accessible-exams') as any[];
            return accessible
                .filter((a) => a.mock_paper_id)
                .map((a) => ({
                    ...a.mock_papers,
                    id: a.mock_paper_id
                }));
        },
        enabled: !!user?.id,
        refetchInterval: 30000,
    });
}

export function useExamQuestions(id: string | null) {
    return useQuery({
        queryKey: ['exam-questions', id],
        queryFn: async () => {
            if (!id) return [];
            return await fetchWithAuth(`/student/exam-questions/${id}`) as any[];
        },
        enabled: !!id,
        staleTime: Infinity, // Keep questions during exam session
    });
}

export function useStudentAnnouncements() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['announcements'],
        queryFn: () => fetchWithAuth('/data/announcements?order=created_at.desc&limit=5'),
        enabled: !!user?.id,
    });
}

export function useLeaderboard() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            return fetchWithAuth('/data/leaderboard_stats?order=total_score.desc&limit=10');
        },
        enabled: !!user?.id,
    });
}

export function useLiveClasses() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['student-live-classes'],
        queryFn: () => fetchWithAuth('/data/live_classes?order=scheduled_at.asc'),
        enabled: !!user?.id,
    });
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    status: string;
    progress_percentage: number;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    user_id: string;
    exams_completed: number;
    total_score: number;
}

export interface LiveClass {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    meeting_id?: string;
    meeting_password?: string;
}

export interface StudentCourse extends Course {
    progress: number;
    enrollmentStatus: string;
    enrollmentId: string;
}

export function useEnrolledCourses() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['enrolled-courses-details', user?.id],
        queryFn: async () => {
            try {
                // Use the streamlined endpoint that already joins course details
                const data = await fetchWithAuth('/student/my-courses') as StudentCourse[];
                return data;
            } catch (error) {
                console.error("[StudentData Error] Failed fetching enrolled courses:", error);
                return [];
            }
        },
        enabled: !!user?.id,
        refetchInterval: 30000, // Refetch every 30s to catch admin approvals quickly
    });
}

export function useAvailableCourses() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['available-courses'],
        queryFn: async () => {
            try {
                // Unlimited view for all courses (published, pending, or active) for catalog discovery
                const data: Course[] = await fetchWithAuth('/data/courses?limit=100&sort=created_at&order=desc');
                let enrolledCourseIds = new Set<string>();

                if (user?.id) {
                    try {
                        const enrollments: Enrollment[] = await fetchWithAuth(`/data/course_enrollments?user_id=eq.${user.id}`);
                        enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
                    } catch (err) {
                        console.warn('Could not fetch enrollments for filtering', err);
                    }
                }

                return data
                    .filter(course => !enrolledCourseIds.has(course.id))
                    .map(course => ({
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        category: course.category || 'Video Course',
                        status: course.status || 'published',
                        thumbnail_url: course.thumbnail_url,
                        instructor_id: course.instructor_id,
                        created_at: course.created_at,
                        price: course.price,
                        original_price: course.original_price,
                        progress: 0
                    } as StudentCourse));
            } catch (error) {
                console.error("Failed fetching available courses:", error);
                return [];
            }
        }
    });
}

export function useEnrollCourse() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ courseId, payment_proof_url, utr_number }: { courseId: string, payment_proof_url?: string | null, utr_number?: string | null }) => {
            if (!user?.id) throw new Error("Not logged in");
            return fetchWithAuth('/courses/enroll', {
                method: 'POST',
                body: JSON.stringify({
                    courseId,
                    payment_proof_url,
                    utr_number
                })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details'] });
            queryClient.invalidateQueries({ queryKey: ['available-courses'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
        }
    });
}


export function useStudentVideoProgress(courseId: string | null) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['student-video-progress', courseId, user?.id],
        queryFn: async () => {
            if (!courseId || !user?.id) return [];
            return await fetchWithAuth(`/student/video-progress/${courseId}`);
        },
        enabled: !!courseId && !!user?.id,
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateVideoProgress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ courseId, videoId, watchedSeconds, totalSeconds }: { courseId: string, videoId: string, watchedSeconds: number, totalSeconds: number }) => {
            return fetchWithAuth('/student/video-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, videoId, watchedSeconds, totalSeconds })
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['student-video-progress', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details'] });
        }
    });
}


export function useStudentVideos(courseId: string | null) {
    return useQuery({
        queryKey: ['student-course-videos', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            return await fetchWithAuth(`/courses/${courseId}/videos`);
        },
        enabled: !!courseId,
    });
}

export function useStudentResources(courseId: string | null) {
    return useQuery({
        queryKey: ['student-course-resources', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            return await fetchWithAuth(`/courses/${courseId}/resources`);
        },
        enabled: !!courseId,
    });
}

export function useStudentDashboardData() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['student-dashboard-stats', user?.id],
        queryFn: () => fetchWithAuth('/student/dashboard-data'),
        enabled: !!user?.id,
        refetchInterval: 60000,
    });
}


