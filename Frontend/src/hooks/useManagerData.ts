import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Exam {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  exam_type: string;
  scheduled_date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number | null;
  negative_marking: number | null;
  max_attempts: number | null;
  shuffle_questions: boolean | null;
  show_results: boolean | null;
  proctoring_enabled: boolean | null;
  browser_security: boolean | null;
  status: string | null;
  assigned_image: string | null;
  approval_status: string;
  total_questions?: number;
  topics?: string[];
  ai_generated?: boolean;
  source_topic?: string;
  created_by: string;
  created_at: string | null;

}

export interface Question {
  id: string;
  topic: string;
  question_text: string;
  type: string;
  difficulty: string;
  options: any[] | null;
  correct_answer: string;
  explanation: string | null;
  marks: number | null;
  created_by: string;
  is_active?: boolean;
  approval_status?: string;
}

export interface LeaderboardEntry {
  id: string;
  student_id: string;
  student_name: string;
  total_score: number | null;
  exams_completed: number | null;
  average_percentage: number | null;
  rank: number | null;
  badges: string[] | null;
  is_verified: boolean | null;
  verified_by?: string | null;
  verified_at?: string | null;
}

export interface GuestCredential {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  email?: string;
  access_level: string;
  allowed_courses: string[] | null;
  expires_at: string;
  max_sessions: number | null;
  is_active: boolean | null;
  last_login_at: string | null;
  created_by: string;
  created_at?: string;
}

export interface MockTestConfig {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  topics: string[];
  question_count: number;
  duration_minutes: number;
  difficulty_mix: Record<string, number>;
  is_active: boolean | null;
  created_by: string;
}

export interface ExamRule {
  id: string;
  exam_id: string | null;
  exam_schedule_id: string | null;
  duration_minutes: number;
  max_attempts: number;
  negative_marking_value: number; // For frontend compatibility
  passing_percentage: number;    // For frontend compatibility
  negative_marks_per_question?: number; // DB name
  passing_marks?: number;               // DB name
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results_immediately: boolean;
  allow_review: boolean;
  proctoring_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Instructor {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
  mobile_number?: string;
}

export interface InstructorProgress {
  id: string;
  instructor_id: string;
  course_id: string;
  topics_completed: number;
  total_topics: number;
  videos_uploaded: number;
  resources_uploaded: number;
  live_classes_conducted: number;
  last_activity_at: string;
  notes: string | null;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  thumbnail_url: string | null;
  duration_hours: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseTopic {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardAuditEntry {
  id: string;
  user_id: string;
  action: string;
  previous_score: number | null;
  new_score: number | null;
  reason: string | null;
  performed_by: string;
  created_at: string;
}

export interface ExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_marks: number;
  percentage: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
}

// ─── Fetch helper ───────────────────────────────────────────────────────────


// Safe version: returns empty array on error (for tables that may not exist yet)
const safeFetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    return await fetchWithAuth(url, options);
  } catch {
    console.warn(`[Manager] API call failed (table may not exist): ${url}`);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. EXAM SCHEDULING — Schedule daily exams based on completed topics
// ═══════════════════════════════════════════════════════════════════════════

export function useExams() {
  return useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: () => fetchWithAuth('/data/exams?sort=scheduled_date&order=asc'),
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (exam: Omit<Exam, 'id' | 'created_at'>) =>
      fetchWithAuth('/data/exams', { method: 'POST', body: JSON.stringify(exam) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam scheduled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error scheduling exam', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Exam> & { id: string }) =>
      fetchWithAuth(`/data/exams/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating exam', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/data/exams/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting exam', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. QUESTION BANK — Manage predefined topic-wise question papers
// ═══════════════════════════════════════════════════════════════════════════

export function useQuestions() {
  return useQuery<Question[]>({
    queryKey: ['questions'],
    queryFn: () => fetchWithAuth('/data/question_bank?sort=created_at&order=desc'),
  });
}

export function useQuestionsByTopic() {
  const { data: questions = [] } = useQuestions();
  const grouped = questions.reduce(
    (acc: Record<string, { easy: number; medium: number; hard: number; total: number }>, q) => {
      if (!acc[q.topic]) acc[q.topic] = { easy: 0, medium: 0, hard: 0, total: 0 };
      const d = q.difficulty as 'easy' | 'medium' | 'hard';
      if (acc[q.topic][d] !== undefined) acc[q.topic][d]++;
      acc[q.topic].total++;
      return acc;
    },
    {}
  );
  return Object.entries(grouped).map(([topic, stats]) => ({ topic, ...stats }));
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<Question, 'id'> | Omit<Question, 'id'>[]) =>
      fetchWithAuth('/data/question_bank', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      const count = Array.isArray(data) ? data.length : 1;
      toast({
        title: count > 1 ? `${count} questions added` : 'Question added successfully'
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding question', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Question> & { id: string }) =>
      fetchWithAuth(`/data/question_bank/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating question', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/data/question_bank/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. MOCK TEST CONFIGURATION — Assign mock papers to students
// ═══════════════════════════════════════════════════════════════════════════

export function useMockTestConfigs() {
  return useQuery<MockTestConfig[]>({
    queryKey: ['mock-test-configs'],
    queryFn: () => fetchWithAuth('/data/mock_test_configs?sort=created_at&order=desc'),
  });
}

export function useCreateMockTestConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (config: Omit<MockTestConfig, 'id'>) =>
      fetchWithAuth('/data/mock_test_configs', { method: 'POST', body: JSON.stringify(config) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-test-configs'] });
      toast({ title: 'Mock test configured successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error configuring mock test', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMockTestConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<MockTestConfig> & { id: string }) =>
      fetchWithAuth(`/data/mock_test_configs/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-test-configs'] });
      toast({ title: 'Mock test updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating mock test', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMockTestConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/data/mock_test_configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-test-configs'] });
      toast({ title: 'Mock test config deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting config', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. LEADERBOARD — Monitor and validate leaderboard scores
// ═══════════════════════════════════════════════════════════════════════════

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => fetchWithAuth('/data/leaderboard?sort=total_score&order=desc'),
  });
}

export function useVerifyLeaderboardEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, verified_by }: { id: string; verified_by: string }) =>
      fetchWithAuth(`/data/leaderboard/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified: true, verified_by, verified_at: new Date().toISOString() }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({ title: 'Leaderboard entry verified' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error verifying entry', description: error.message, variant: 'destructive' });
    },
  });
}

export function useResetLeaderboardEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      fetchWithAuth(`/data/leaderboard/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified: false, verified_by: null, verified_at: null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({ title: 'Verification reset' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error resetting entry', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. GUEST CREDENTIALS — Create guest login credentials
// ═══════════════════════════════════════════════════════════════════════════

export function useGuestCredentials() {
  return useQuery<GuestCredential[]>({
    queryKey: ['guest-credentials'],
    queryFn: () => fetchWithAuth('/data/guest_credentials?sort=created_at&order=desc'),
  });
}

export function useCreateGuestCredential() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (credential: Omit<GuestCredential, 'id' | 'last_login_at' | 'created_at'>) =>
      fetchWithAuth('/data/guest_credentials', { method: 'POST', body: JSON.stringify(credential) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-credentials'] });
      toast({ title: 'Guest credential created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating credential', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateGuestCredential() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<GuestCredential> & { id: string }) =>
      fetchWithAuth(`/data/guest_credentials/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-credentials'] });
      toast({ title: 'Guest credential updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating credential', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteGuestCredential() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/data/guest_credentials/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-credentials'] });
      toast({ title: 'Guest credential deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting credential', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. EXAM RULES — Configure duration, negative marking, attempts
// ═══════════════════════════════════════════════════════════════════════════

export function useExamRules() {
  return useQuery<ExamRule[]>({
    queryKey: ['exam-rules'],
    queryFn: async () => {
      const data = await safeFetchWithAuth('/data/exam_rules?sort=created_at&order=desc');
      // Normalize data for the frontend if keys match DB schema
      return (data || []).map((rule: Partial<ExamRule>) => ({
        ...rule,
        negative_marking_value: rule.negative_marking_value ?? rule.negative_marks_per_question ?? 0,
        passing_percentage: rule.passing_percentage ?? rule.passing_marks ?? 40
      }));
    },
    retry: false,
  });
}

export function useCreateExamRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (rule: Omit<ExamRule, 'id' | 'created_at' | 'updated_at'>) => {
      // Create a clean payload with only existing DB columns
      const payload = {
        exam_id: rule.exam_id,
        exam_schedule_id: rule.exam_schedule_id,
        duration_minutes: rule.duration_minutes,
        max_attempts: rule.max_attempts,
        negative_marking_value: rule.negative_marking_value,
        passing_percentage: rule.passing_percentage,
        shuffle_questions: rule.shuffle_questions,
        shuffle_options: rule.shuffle_options,
        show_results_immediately: rule.show_results_immediately,
        allow_review: rule.allow_review,
        proctoring_enabled: rule.proctoring_enabled,
        // Aliases for legacy DB support
        negative_marks_per_question: rule.negative_marking_value,
        passing_marks: rule.passing_percentage
      };
      return fetchWithAuth('/data/exam_rules', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-rules'] });
      toast({ title: 'Exam rule created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating exam rule', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateExamRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<ExamRule> & { id: string }) =>
      fetchWithAuth(`/data/exam_rules/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-rules'] });
      toast({ title: 'Exam rule updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating exam rule', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExamRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/data/exam_rules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-rules'] });
      toast({ title: 'Exam rule deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting exam rule', description: error.message, variant: 'destructive' });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. COURSE MONITORING — Track instructor progress & topic completion
// ═══════════════════════════════════════════════════════════════════════════

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ['manager-courses'],
    queryFn: () => fetchWithAuth('/data/courses?sort=created_at&order=desc'),
  });
}

export function useInstructorProgress() {
  return useQuery<InstructorProgress[]>({
    queryKey: ['instructor-progress'],
    queryFn: () => safeFetchWithAuth('/data/instructor_progress?sort=last_activity_at&order=desc'),
    retry: false,
  });
}

export function useCourseTopics(courseId?: string) {
  return useQuery<CourseTopic[]>({
    queryKey: ['course-topics', courseId],
    queryFn: async () => {
      const data = await safeFetchWithAuth('/data/course_topics?sort=order_index&order=asc');
      if (courseId) return data.filter((t: CourseTopic) => t.course_id === courseId);
      return data;
    },
    enabled: true,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ['manager-profiles'],
    queryFn: () => fetchWithAuth('/data/profiles?sort=created_at&order=desc'),
  });
}

export function useInstructors() {
  return useQuery<Instructor[]>({
    queryKey: ['manager-instructors'],
    queryFn: () => fetchWithAuth('/admin/instructors'),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. LIVE WINDOW EXAMS — Configure and monitor live exams
// ═══════════════════════════════════════════════════════════════════════════

export function useExamResults(examId?: string) {
  return useQuery<ExamResult[]>({
    queryKey: ['exam-results', examId],
    queryFn: async () => {
      const data = await safeFetchWithAuth('/data/student_exam_results?sort=completed_at&order=desc');
      if (examId) return data.filter((d: ExamResult) => d.exam_id === examId);
      return data;
    },
    retry: false,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. LEADERBOARD AUDIT — Full audit trail
// ═══════════════════════════════════════════════════════════════════════════

export function useLeaderboardAudit() {
  return useQuery<LeaderboardAuditEntry[]>({
    queryKey: ['leaderboard-audit'],
    queryFn: () => safeFetchWithAuth('/data/leaderboard_audit?sort=created_at&order=desc'),
    retry: false,
  });
}

export function useCreateLeaderboardAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<LeaderboardAuditEntry, 'id' | 'created_at'>) =>
      fetchWithAuth('/data/leaderboard_audit', { method: 'POST', body: JSON.stringify(entry) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard-audit'] });
    },
  });
}
// ═══════════════════════════════════════════════════════════════════════════
// 10. STUDENT ACCESS MANAGEMENT — Grant lookup and access via UUID
// ═══════════════════════════════════════════════════════════════════════════

export function useLookupStudent(studentId: string | null) {
  return useQuery({
    queryKey: ['student-lookup', studentId],
    queryFn: () => fetchWithAuth(`/manager/lookup-student/${studentId}`),
    enabled: !!studentId,
    retry: false,
  });
}

export function useGrantExamAccess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { studentId: string; examId?: string; mockPaperId?: string }) =>
      fetchWithAuth('/manager/grant-exam-access', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessible-exams'] });
      toast({ title: 'Access granted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error granting access', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAccessibleExams() {
  return useQuery({
    queryKey: ['accessible-exams'],
    queryFn: () => fetchWithAuth('/student/accessible-exams'),
  });
}
