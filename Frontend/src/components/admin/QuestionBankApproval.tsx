import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, FileText, AlertCircle, LayoutGrid, Clock, History, Eye, Users, Trash2, ShieldCheck, BrainCircuit, RefreshCw, Award, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCourses } from '@/hooks/useManagerData';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PendingQuestionBank {
    topic: string;
    count: number;
    created_by: string;
    created_at: string;
    assigned_image?: string | null;
    duration?: number;
    total_marks?: number;
    shuffle?: boolean;
    retakes?: number;
    custom_fields?: { label: string; value: string }[];
}

interface StudentAccess {
    student_id: string;
    student_name: string;
    student_email: string;
    student_avatar: string;
    assigned_by: string;
    granted_at: string;
}

interface BatchStudentResponse {
    student_id?: string;
    id?: string;
    student_name?: string;
    student_email?: string;
    profile?: {
        full_name?: string;
        email?: string;
        avatar_url?: string;
    };
}

interface Student {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    profile?: {
        full_name?: string;
        email?: string;
        avatar_url?: string;
    };
    student_name?: string;
    student_email?: string;
    student_id?: string;
    user_id?: string;
}

interface QuestionBankResponse {
    topic: string;
    approval_status: string;
    created_by: string;
    created_at: string;
    question_text?: string;
}

interface Question {
    id?: string;
    question_text: string;
    type: string;
    difficulty: string;
    options?: unknown;
    correct_answer?: unknown;
    topic: string;
}

interface Teacher {
    user_id: string;
    id?: string;
    full_name: string;
}

interface Batch {
    id: string;
    _id?: string;
    batch_name: string;
    batch_type: string;
    instructor_id: string;
    instructor?: string | { _id?: string; id?: string; full_name?: string };
    instructor_name?: string;
    student_count: number;
    start_time?: string;
    end_time?: string;
}

export function QuestionBankApproval() {
    const [pendingBanks, setPendingBanks] = useState<PendingQuestionBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const [showCourseDialog, setShowCourseDialog] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [viewTab, setViewTab] = useState<'pending' | 'approve' | 'reject'>('pending');
    const { data: courses } = useCourses();
    const [approvedBanks, setApprovedBanks] = useState<PendingQuestionBank[]>([]);
    const [rejectedBanks, setRejectedBanks] = useState<PendingQuestionBank[]>([]);

    const [showAccessDialog, setShowAccessDialog] = useState(false);
    const [accessingTopic, setAccessingTopic] = useState<string | null>(null);
    const [accessList, setAccessList] = useState<StudentAccess[]>([]);
    const [loadingAccess, setLoadingAccess] = useState(false);
    const [accessCount, setAccessCount] = useState<Record<string, number>>({});

    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [removingTopic, setRemovingTopic] = useState<string | null>(null);

    const [showGrantDialog, setShowGrantDialog] = useState(false);
    const [grantingTopic, setGrantingTopic] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [isGranting, setIsGranting] = useState(false);

    const [grantType, setGrantType] = useState<'student' | 'batch'>('student');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [instructors, setInstructors] = useState<Teacher[]>([]);
    const [selectedInstructorId, setSelectedInstructorId] = useState("all");
    const [selectedBatchTypeFilter, setSelectedBatchTypeFilter] = useState("all");
    const [batchStudents, setBatchStudents] = useState<Student[]>([]);
    const [loadingBatchStudents, setLoadingBatchStudents] = useState(false);

    const fetchPendingBanks = async (showLoading = true) => {
        try {
            if (showLoading && pendingBanks.length === 0 && approvedBanks.length === 0) setLoading(true);

            // Optimized summary fetch instead of fetching ALL questions and looping access lists
            const summary = await fetchWithAuth('/admin/question-bank-summary') as (PendingQuestionBank & { approval_status: string, access_count: number })[];

            setPendingBanks(summary.filter(s => s.approval_status === 'pending'));
            setApprovedBanks(summary.filter(s => s.approval_status === 'approved'));
            setRejectedBanks(summary.filter(s => s.approval_status === 'rejected'));

            const counts: Record<string, number> = {};
            summary.forEach(s => {
                if (s.approval_status === 'approved') {
                    counts[s.topic] = s.access_count || 0;
                }
            });
            setAccessCount(counts);
        } catch (err) {
            console.error('Failed to fetch question banks summary', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBanks();
        fetchStudents();
        fetchInstructors();
        const interval = setInterval(() => fetchPendingBanks(), 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedBatchId && grantType === 'batch') {
            fetchBatchStudents(selectedBatchId);
        } else {
            setBatchStudents([]);
        }
    }, [selectedBatchId, grantType]);

    const fetchBatchStudents = async (batchId: string) => {
        setLoadingBatchStudents(true);
        try {
            const data = await fetchWithAuth(`/batches/${batchId}/students`) as BatchStudentResponse[];
            // Map the enrollment data to Student format
            const studentsList: Student[] = data.map(item => ({
                id: item.student_id || item.id,
                full_name: item.profile?.full_name || item.student_name || 'Anonymous',
                email: item.profile?.email || item.student_email || 'No email',
                avatar_url: item.profile?.avatar_url
            }));
            setBatchStudents(studentsList || []);
        } catch (err) {
            console.error('Failed to fetch batch students', err);
            setBatchStudents([]);
        } finally {
            setLoadingBatchStudents(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const data = await fetchWithAuth('/admin/instructors') as Teacher[];
            // Ensure every instructor has a string ID for React/Radix selection
            const sanitized = (data || []).map(inst => ({
                ...inst,
                id: (inst.user_id)?.toString()
            }));
            setInstructors(sanitized);
        } catch (err) {
            console.error('Failed to fetch instructors', err);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await fetchWithAuth('/admin/students') as Student[];
            setStudents(res || []);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const [viewingQuestions, setViewingQuestions] = useState<string | null>(null);
    const [questionsList, setQuestionsList] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const handlePreviewQuestions = async (topic: string) => {
        setViewingQuestions(topic);
        setLoadingQuestions(true);
        try {
            const res = await fetchWithAuth(`/data/question_bank?topic=${encodeURIComponent(topic)}`) as Question[];
            setQuestionsList(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Failed to fetch questions preview', err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleApproveClick = (topic: string) => {
        setSelectedTopic(topic);
        setShowCourseDialog(true);
    };

    const confirmApproval = async () => {
        if (!selectedTopic) return;

        await handleAction(selectedTopic, 'approved', selectedCourseId || undefined);
        setShowCourseDialog(false);
    };

    const handleAction = async (topic: string, status: 'approved' | 'rejected', courseId?: string) => {
        try {
            setProcessing(topic);
            await fetchWithAuth('/admin/approve-question-bank', {
                method: 'PUT',
                body: JSON.stringify({
                    topic,
                    status,
                    course_id: courseId
                })
            });

            toast({
                title: `Question Bank ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `Successfully updated topic: ${topic}`
            });

            setPendingBanks(prev => prev.filter(b => b.topic !== topic));
            if (status === 'approved') {
                const bank = pendingBanks.find(b => b.topic === topic);
                if (bank) setApprovedBanks(prev => [...prev, bank]);
            }
            fetchPendingBanks(false);
        } catch (err) {
            toast({
                title: 'Action Failed',
                description: err instanceof Error ? err.message : 'Failed to update status',
                variant: 'destructive'
            });
        } finally {
            setProcessing(null);
            setSelectedTopic(null);
            setSelectedCourseId("");
        }
    };

    const handleRemoveClick = (topic: string) => {
        setRemovingTopic(topic);
        setShowRemoveDialog(true);
    };

    const confirmRemove = async () => {
        if (!removingTopic) return;
        try {
            setProcessing(removingTopic);
            await fetchWithAuth(`/admin/question-bank/${encodeURIComponent(removingTopic)}`, {
                method: 'DELETE'
            });

            toast({
                title: "Question Bank Removed",
                description: `Successfully removed topic: ${removingTopic}`
            });

            setApprovedBanks(prev => prev.filter(b => b.topic !== removingTopic));
            fetchPendingBanks(false);
        } catch (err) {
            toast({
                title: 'Remove Failed',
                description: err instanceof Error ? err.message : 'Failed to remove question bank',
                variant: 'destructive'
            });
        } finally {
            setProcessing(null);
            setRemovingTopic(null);
            setShowRemoveDialog(false);
        }
    };

    const handleViewAccess = async (topic: string) => {
        setAccessingTopic(topic);
        setShowAccessDialog(true);
        setLoadingAccess(true);
        try {
            const res = await fetchWithAuth(`/admin/question-bank/${encodeURIComponent(topic)}/access-list`) as { students: StudentAccess[] };
            setAccessList(res?.students || []);
        } catch (err) {
            console.error('Failed to fetch access list', err);
            setAccessList([]);
            toast({
                title: 'Error',
                description: 'Failed to load student access list',
                variant: 'destructive'
            });
        } finally {
            setLoadingAccess(false);
        }
    };

    const handleGrantAccessClick = async (topic: string) => {
        setGrantingTopic(topic);
        setGrantType('student');
        setSelectedStudentId("");
        setSelectedBatchId("");
        setSelectedInstructorId("all");
        setSelectedBatchTypeFilter("all");
        setShowGrantDialog(true);
        setLoadingBatches(true);
        try {
            // "REMOVE CONCEPT" of course-matching: Just fetch all active batches 
            // and let the user filter by instructor/schedule manually.
            const batchData = await fetchWithAuth('/batches') as Batch[];
            setBatches(batchData || []);
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        } finally {
            setLoadingBatches(false);
        }
    };

    const filteredBatches = useMemo(() => {
        if (!batches || batches.length === 0) return [];

        const filtered = batches.filter(b => {
            const inst = b.instructor;
            const batchInstructorId = (b.instructor_id || (typeof inst === 'object' ? (inst?._id || inst?.id) : inst))?.toString();

            const matchesInstructor = selectedInstructorId === 'all' || batchInstructorId === selectedInstructorId;
            const matchesType = selectedBatchTypeFilter === 'all' || b.batch_type === selectedBatchTypeFilter;

            return matchesInstructor && matchesType;
        });

        // "REMOVE CONCEPT" of empty states: If filtering returns nothing but we have batches, 
        // fallback to just showing all batches so the user can actually select something.
        return filtered.length > 0 ? filtered : batches;
    }, [batches, selectedInstructorId, selectedBatchTypeFilter]);

    const handleGrantAccess = async () => {
        if (!grantingTopic) return;
        if (grantType === 'student' && !selectedStudentId) return;
        if (grantType === 'batch' && !selectedBatchId) return;

        setIsGranting(true);
        try {
            await fetchWithAuth('/admin/question-bank/grant-access', {
                method: 'POST',
                body: JSON.stringify({
                    topic: grantingTopic,
                    userId: selectedStudentId,
                    batchId: grantType === 'batch' ? selectedBatchId : undefined,
                    type: grantType
                })
            });

            toast({
                title: grantType === 'batch' ? 'Batch Access Granted! 🚀' : 'Access Granted! 🚀',
                description: grantType === 'batch'
                    ? `All students in the selected batch now have access to ${grantingTopic}`
                    : `Student now has access to mock tests for ${grantingTopic}`
            });

            setShowGrantDialog(false);
            setGrantingTopic(null);
            setSelectedStudentId("");
            setSelectedBatchId("");
            fetchPendingBanks(false);
        } catch (err) {
            toast({
                title: 'Grant Failed',
                description: err instanceof Error ? err.message : 'Something went wrong',
                variant: 'destructive'
            });
        } finally {
            setIsGranting(false);
        }
    };

    if (loading && pendingBanks.length === 0 && approvedBanks.length === 0) {
        return (
            <div className="py-24 text-center">
                <div className="relative inline-block">
                    <div className="h-20 w-20 rounded-full border-4 border-slate-100 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-6 animate-pulse">Running Integrity Audit...</h4>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                            <span className="truncate">Question Bank Approvals</span>
                        </h2>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-0.5 hidden sm:block">Review and activate curated question repositories.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 sm:h-11 px-3 sm:px-4 rounded-xl border-slate-100 bg-white shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-700 gap-2 hover:bg-slate-50 transition-all active:scale-95 self-start sm:self-auto flex-shrink-0"
                        onClick={() => fetchPendingBanks(true)}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", loading && "animate-spin text-primary")} />
                        <span className="hidden sm:inline">Manual Audit Sync</span>
                        <span className="sm:hidden">Sync</span>
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'pending' | 'approve' | 'reject')} className="bg-slate-100 p-1 rounded-xl">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="pending" className="rounded-lg text-xs sm:text-sm px-2.5 sm:px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending</TabsTrigger>
                            <TabsTrigger value="approve" className="rounded-lg text-xs sm:text-sm px-2.5 sm:px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Approve</TabsTrigger>
                            <TabsTrigger value="reject" className="rounded-lg text-xs sm:text-sm px-2.5 sm:px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Reject</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Badge variant="secondary" className="h-6 sm:h-7 px-2.5 sm:px-3 bg-primary/10 text-primary border-none font-bold text-[10px] sm:text-xs">
                        {pendingBanks.length} Requests
                    </Badge>
                </div>
            </div>

            <Tabs value={viewTab} className="w-full">
                <TabsContent value="pending" className="mt-0">
                    {pendingBanks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner border border-slate-100">
                                    <CheckCircle className="h-10 w-10 text-slate-900/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Queue is empty!</p>
                                    <p className="text-sm font-bold text-slate-600 max-w-sm uppercase tracking-widest text-[10px]">There are no pending question banks awaiting review.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingBanks.map((bank) => (
                                <Card key={bank.topic} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row items-stretch group/card">
                                            <div className="relative bg-slate-900 min-w-0 lg:min-w-[320px] h-[180px] lg:h-[220px] border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden group/poster">
                                                {bank.assigned_image ? (
                                                    <img src={bank.assigned_image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                                        <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                                                            <FileText className="h-8 w-8 text-white" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em]">Logical Cluster</p>
                                                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Repository Node Ready</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 font-black px-3 py-1 text-[10px] uppercase tracking-wider">
                                                        {bank.count} Questions
                                                    </Badge>
                                                    <div className="h-6 w-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                        <BrainCircuit className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-4 sm:p-8 space-y-2 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                    <h3 className="font-bold text-base sm:text-xl text-slate-900 break-words">{bank.topic}</h3>
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-black">Pending</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 mt-2">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                        <span>{bank.duration || 0} Minutes</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <Award className="h-3.5 w-3.5 text-primary" />
                                                        <span>{bank.total_marks || 0} Total Marks</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <RefreshCw className={cn("h-3.5 w-3.5", bank.shuffle ? "text-emerald-500" : "text-slate-300")} />
                                                        <span>Shuffle: {bank.shuffle ? "ON" : "OFF"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <History className="h-3.5 w-3.5 text-primary" />
                                                        <span>{bank.retakes || 1} Retakes</span>
                                                    </div>
                                                </div>

                                                {bank.custom_fields && bank.custom_fields.length > 0 && (
                                                    <div className="pt-4 mt-2 border-t border-slate-50">
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Protocol Variations (Custom Nodes)</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {bank.custom_fields.map((field, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">
                                                                    <span className="opacity-60">{field.label}:</span>
                                                                    <span>{field.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-6 pt-4 border-t border-slate-50 mt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>Submitted {new Date(bank.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <User className="h-3.5 w-3.5" />
                                                        <span>Source: {bank.created_by?.substring(0, 8) || 'System'}...</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-8 lg:bg-slate-50/50 flex flex-row lg:flex-col justify-center gap-2 sm:gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 min-w-0 lg:min-w-[220px]">
                                                <div className="flex gap-2 w-full">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handlePreviewQuestions(bank.topic)}
                                                        className="flex-1 h-11 rounded-xl border-slate-200 text-slate-800 font-bold hover:bg-slate-50"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleRemoveClick(bank.topic)}
                                                        disabled={!!processing}
                                                        className="h-11 w-11 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                                                        title="Nuke Repository Permanently"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2 w-full mt-1">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleAction(bank.topic, 'rejected')}
                                                        disabled={!!processing}
                                                        className="flex-1 h-11 rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all font-bold"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Deny
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleApproveClick(bank.topic)}
                                                        disabled={!!processing}
                                                        className="flex-[2] h-11 rounded-xl pro-button-primary shadow-lg shadow-primary/20 font-bold"
                                                    >
                                                        {processing === bank.topic ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                        )}
                                                        Authorize
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approve" className="mt-0">
                    {approvedBanks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner border border-slate-100">
                                    <LayoutGrid className="h-10 w-10 text-slate-900/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-900">Library is empty!</p>
                                    <p className="text-sm font-medium text-slate-500 max-w-sm">No approved question banks in the library yet.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {approvedBanks.map((bank) => (
                                <Card key={bank.topic} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row items-stretch group/card">
                                            <div className="relative bg-slate-900 min-w-0 lg:min-w-[320px] h-[180px] lg:h-[220px] border-b lg:border-b-0 lg:border-r border-emerald-100 overflow-hidden group/poster">
                                                {bank.assigned_image ? (
                                                    <img src={bank.assigned_image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                                        <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                                                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-[0.2em]">Validated Node</p>
                                                            <p className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-widest mt-1">Repository Sanity Passed</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-emerald-900/80 to-transparent flex items-center justify-between">
                                                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 font-black px-3 py-1 text-[10px] uppercase tracking-wider">
                                                        {bank.count} Questions
                                                    </Badge>
                                                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center">
                                                        <ShieldCheck className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-4 sm:p-6 space-y-2 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 break-words">{bank.topic}</h3>
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-black">Approved</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 mt-4">
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>{bank.duration || 0}m</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <Award className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>{bank.total_marks || 0}pts</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <History className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>{bank.retakes || 1} Retakes</span>
                                                    </div>
                                                </div>

                                                {bank.custom_fields && bank.custom_fields.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50">
                                                        {bank.custom_fields.map((field, idx) => (
                                                            <div key={idx} className="flex items-center gap-1.5 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-black uppercase tracking-tight">
                                                                <span className="opacity-60">{field.label}:</span>
                                                                <span>{field.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-4 border-t border-slate-50 pt-4">
                                                    <div
                                                        className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors text-[10px] font-black uppercase tracking-widest"
                                                        onClick={() => handleViewAccess(bank.topic)}
                                                    >
                                                        <Users className="h-3.5 w-3.5 text-primary" />
                                                        <span>{accessCount[bank.topic] || 0} Students Access</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6 lg:bg-slate-50/50 flex flex-row lg:flex-col justify-center gap-2 sm:gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 min-w-0 lg:min-w-[200px]">
                                                <Button
                                                    onClick={() => handleGrantAccessClick(bank.topic)}
                                                    className="w-full h-11 rounded-xl pro-button-primary shadow-lg shadow-primary/20 font-bold"
                                                >
                                                    <Users className="h-4 w-4 mr-2" />
                                                    + Access
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleRemoveClick(bank.topic)}
                                                    disabled={!!processing}
                                                    className="w-full h-11 rounded-xl border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-100 transition-all font-bold"
                                                >
                                                    {processing === bank.topic ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                    )}
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reject" className="mt-0">
                    {rejectedBanks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner border border-slate-100">
                                    <XCircle className="h-10 w-10 text-slate-900/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-900">No rejected banks!</p>
                                    <p className="text-sm font-medium text-slate-500 max-w-sm">There are no question banks with a rejected status.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {rejectedBanks.map((bank) => (
                                <Card key={bank.topic} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row items-stretch group/card">
                                            <div className="relative bg-slate-900 min-w-0 lg:min-w-[320px] h-[180px] lg:h-[220px] border-b lg:border-b-0 lg:border-r border-rose-100 overflow-hidden group/poster">
                                                {bank.assigned_image ? (
                                                    <img src={bank.assigned_image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                                        <div className="h-16 w-16 rounded-[1.5rem] bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 flex items-center justify-center shadow-2xl">
                                                            <XCircle className="h-8 w-8 text-rose-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black uppercase text-rose-500/60 tracking-[0.2em]">Rejected Node</p>
                                                            <p className="text-[8px] font-bold text-rose-500/30 uppercase tracking-widest mt-1">Review & Resubmit</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-rose-900/80 to-transparent flex items-center justify-between">
                                                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 font-black px-3 py-1 text-[10px] uppercase tracking-wider">
                                                        {bank.count} Questions
                                                    </Badge>
                                                    <div className="h-6 w-6 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/30 flex items-center justify-center">
                                                        <AlertCircle className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-4 sm:p-6 space-y-2 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 break-words">{bank.topic}</h3>
                                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-black">Rejected</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                        <span>Processed: {new Date(bank.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6 lg:bg-slate-50/50 flex flex-row lg:flex-col justify-center gap-2 sm:gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 min-w-0 lg:min-w-[200px]">
                                                <Button
                                                    onClick={() => handleApproveClick(bank.topic)}
                                                    disabled={!!processing}
                                                    className="w-full h-11 rounded-xl pro-button-primary shadow-lg shadow-primary/20 font-bold"
                                                >
                                                    {processing === bank.topic ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                    )}
                                                    Re-Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleRemoveClick(bank.topic)}
                                                    disabled={!!processing}
                                                    className="w-full h-11 rounded-xl border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-100 transition-all font-bold"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete permanently
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                <DialogContent className="w-[95vw] sm:max-w-md border-none shadow-2xl rounded-2xl sm:rounded-[2rem] bg-white p-0 overflow-hidden">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">Authorize Repository</DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">Curriculum Association Required</DialogDescription>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="course-select-dialog" className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Target Curriculum</Label>
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                    <SelectTrigger id="course-select-dialog" className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-primary/20 font-bold text-slate-700">
                                        <SelectValue placeholder="Associate with Course..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                        {(courses as { id: string; title: string }[] | undefined)?.map((course) => (
                                            <SelectItem
                                                key={course.id}
                                                value={course.id}
                                                className="font-bold py-3 hover:bg-slate-50 rounded-xl"
                                            >
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none font-bold">{selectedTopic}</Badge>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Authorization Required</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Granting authorization will allow this repository to be used in future assessments and live class distributions.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowCourseDialog(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmApproval}
                                disabled={!selectedCourseId || !!processing}
                                className="flex-[2] h-12 rounded-xl pro-button-primary shadow-xl shadow-primary/30 font-bold"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                Authorize Set
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
                <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-2xl sm:rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">Student Access List</DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">
                            Students with access to <span className="text-white underline underline-offset-4 decoration-2">{accessingTopic}</span>
                        </DialogDescription>
                    </div>

                    <div className="p-6 bg-white max-h-[400px] overflow-y-auto">
                        {loadingAccess ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : accessList.length === 0 ? (
                            <div className="text-center py-12 space-y-3">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                                    <Users className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-600 font-semibold">No students have accessed this question bank yet.</p>
                                <p className="text-slate-400 text-sm">Students will appear here once granted access.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {accessList.map((student, idx) => (
                                    <div key={student.student_id || idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.student_avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {student.student_name?.charAt(0)?.toUpperCase() || 'S'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{student.student_name}</p>
                                            <p className="text-xs text-slate-500 truncate">{student.student_email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Granted by</p>
                                            <p className="text-sm font-semibold text-slate-700">{student.assigned_by}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(student.granted_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-600 text-center">
                            Total: {accessList.length} student{accessList.length !== 1 ? 's' : ''} accessed
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent className="w-[95vw] sm:max-w-[400px] rounded-2xl sm:rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-red-500 p-8 text-white relative">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <Trash2 className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">Remove Question Bank?</DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">
                            Are you sure you want to remove <span className="text-white font-bold">{removingTopic}</span> from the library?
                        </DialogDescription>
                    </div>

                    <div className="p-6 bg-white space-y-4">
                        <p className="text-sm text-slate-600 text-center">
                            This action will set the question bank status to rejected. Students will lose access immediately.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowRemoveDialog(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmRemove}
                                className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg font-bold"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingQuestions} onOpenChange={(v) => !v && setViewingQuestions(null)}>
                <DialogContent className="w-[95vw] sm:max-w-3xl overflow-hidden p-0 border-none shadow-2xl rounded-2xl sm:rounded-[2rem] bg-white">
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                <BrainCircuit className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black">{viewingQuestions}</DialogTitle>
                                <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Repository Content Inspection</DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        {loadingQuestions ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Analyzing Logic Streams...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scroll-smooth">
                                {questionsList.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 italic">No questions found in this repository.</div>
                                ) : (
                                    questionsList.map((q, idx) => (
                                        <div key={q.id || idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex gap-5 hover:bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                                            <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                <span className="text-[10px] font-black text-slate-400">{idx + 1}</span>
                                            </div>
                                            <div className="space-y-3 flex-1">
                                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.question_text}</p>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className="bg-white text-slate-500 border border-slate-100 font-bold text-[9px] uppercase px-2 py-0.5">
                                                        {q.type}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-white text-slate-500 border border-slate-100 font-bold text-[9px] uppercase px-2 py-0.5">
                                                        {q.difficulty}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
                            <Button
                                onClick={() => setViewingQuestions(null)}
                                className="h-12 px-10 rounded-xl font-black bg-slate-900 hover:bg-black text-white uppercase tracking-widest text-[10px]"
                            >
                                Done Inspection
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-[2rem] bg-white p-0 overflow-hidden">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">Grant Repository Access</DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">Deploy {grantingTopic} to students or batches</DialogDescription>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <Tabs value={grantType} onValueChange={(v) => setGrantType(v as 'student' | 'batch')} className="w-full">
                            <TabsList className="grid grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
                                <TabsTrigger value="student" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Individual</TabsTrigger>
                                <TabsTrigger value="batch" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Logic Batch</TabsTrigger>
                            </TabsList>

                            <TabsContent value="student" className="space-y-4 mt-0">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Student</Label>
                                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-primary/20 font-bold text-slate-700 transition-all hover:bg-white">
                                            <SelectValue placeholder="Pick a student..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl max-h-[300px]">
                                            {students.map((student) => (
                                                <SelectItem
                                                    key={student.id}
                                                    value={student.id}
                                                    className="font-bold py-3 hover:bg-slate-50 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={student.avatar_url} />
                                                            <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{student.full_name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {students.length === 0 && (
                                                <div className="p-4 text-center text-sm text-slate-400">No students available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="batch" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Instructor</Label>
                                        <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-primary/20 font-bold text-slate-700">
                                                <SelectValue placeholder="All Instructors" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                <SelectItem value="all">All Instructors</SelectItem>
                                                {instructors.map((inst) => (
                                                    <SelectItem key={inst.id} value={inst.id?.toString()} className="font-bold py-2">{inst.full_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Batch Schedule</Label>
                                        <Select value={selectedBatchTypeFilter} onValueChange={setSelectedBatchTypeFilter}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-primary/20 font-bold text-slate-700">
                                                <SelectValue placeholder="Any Schedule" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                <SelectItem value="all">All Times</SelectItem>
                                                <SelectItem value="morning">Morning</SelectItem>
                                                <SelectItem value="afternoon">Afternoon</SelectItem>
                                                <SelectItem value="evening">Evening</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {(selectedInstructorId !== "all" || selectedBatchTypeFilter !== "all" || instructors.length > 0) && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Curriculum Batch</Label>
                                        {loadingBatches ? (
                                            <div className="h-14 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-300">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Batches...</span>
                                            </div>
                                        ) : (
                                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-primary/20 font-bold text-slate-700 transition-all hover:bg-white overflow-hidden">
                                                    <SelectValue placeholder={filteredBatches.length > 0 ? "Select from filtered batches..." : "No matching batches"} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-200 shadow-xl max-h-[300px]">
                                                    {filteredBatches.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-slate-400 italic">No batches found for these filters</div>
                                                    ) : (
                                                        filteredBatches.map((batch) => {
                                                            const bId = (batch.id || batch._id)?.toString();
                                                            return (
                                                                <SelectItem
                                                                    key={bId}
                                                                    value={bId}
                                                                    className="font-bold py-3 hover:bg-slate-50 rounded-xl"
                                                                >
                                                                    <div className="flex flex-col items-start gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-slate-900">{batch.batch_name}</span>
                                                                            {batch.student_count !== undefined && (
                                                                                <Badge variant="secondary" className="h-4 px-1.5 text-[8px] bg-emerald-50 text-emerald-600 border-none font-black">
                                                                                    {batch.student_count} Students
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase font-black tracking-tight">
                                                                                {batch.batch_type}
                                                                            </Badge>
                                                                            <span className="text-[9px] text-slate-400 font-medium italic">{batch.start_time} - {batch.end_time}</span>
                                                                            {batch.instructor_name && <span className="text-[9px] text-primary font-black ml-1">• {batch.instructor_name}</span>}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}

                                {selectedBatchId && grantType === 'batch' && (
                                    <div className="space-y-3 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-6 relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-sm">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <Users className="h-3 w-3" />
                                                Cohort Registry
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enrolled Students ({batchStudents.length})</Label>
                                            <div className="flex -space-x-2">
                                                {batchStudents.slice(0, 3).map((s, i) => (
                                                    <Avatar key={i} className="h-5 w-5 border-2 border-white ring-1 ring-slate-100">
                                                        <AvatarImage src={s.profile?.avatar_url} />
                                                        <AvatarFallback className="text-[6px] font-black">{(s.profile?.full_name || 'S').charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {batchStudents.length > 3 && (
                                                    <div className="h-5 w-5 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center text-[6px] font-black text-slate-400">
                                                        +{batchStudents.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <ScrollArea className="h-[140px] rounded-2xl border border-slate-100 bg-slate-50/30 p-2">
                                            {loadingBatchStudents ? (
                                                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                                                    <div className="relative">
                                                        <div className="h-8 w-8 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Users className="h-3 w-3 text-primary/40" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Syncing Roster...</span>
                                                </div>
                                            ) : batchStudents.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                        <Users className="h-5 w-5 text-slate-300" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Zero members discovered</p>
                                                    <p className="text-[9px] text-slate-300 font-medium italic mt-1">This cohort is currently vacant</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {batchStudents.map((s, idx) => (
                                                        <div
                                                            key={s.id}
                                                            className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all group animate-in fade-in slide-in-from-left duration-500"
                                                            style={{ animationDelay: `${idx * 40}ms` }}
                                                        >
                                                            <div className="relative">
                                                                <Avatar className="h-7 w-7 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                                                                    <AvatarImage src={s.avatar_url || s.profile?.avatar_url} />
                                                                    <AvatarFallback className="text-[9px] font-black bg-primary/5 text-primary">{(s.full_name || s.profile?.full_name || 'S').charAt(0).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[10px] font-black text-slate-700 truncate leading-none mb-1 group-hover:text-primary transition-colors">{s.full_name || s.profile?.full_name || s.student_name || `Student #${(s.id || s.student_id)?.toString().slice(-4)}`}</span>
                                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                                    <span className="text-[8px] text-slate-400 font-bold truncate tracking-tight">{s.profile?.email || s.student_email || 'No record'}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-slate-200 flex-shrink-0" />
                                                                    <span className="text-[7px] font-black uppercase text-slate-300 tracking-tighter shrink-0">Active ID: {(s.student_id || s.user_id)?.toString().slice(-4)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase tracking-tighter">Automatic Deployment</Badge>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Encrypted Pipeline</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight opacity-70">
                                {grantType === 'batch'
                                    ? "This will grant access to EVERY student currently assigned to the selected batch. Students will be notified instantly."
                                    : "Individual student will receive immediate access and a push notification for this logic repository."}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowGrantDialog(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGrantAccess}
                                disabled={(grantType === 'student' && !selectedStudentId) || (grantType === 'batch' && !selectedBatchId) || isGranting}
                                className="flex-[2] h-12 rounded-xl pro-button-primary shadow-xl shadow-primary/30 font-bold"
                            >
                                {isGranting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                {grantType === 'batch' ? 'Authorize Batch' : 'Grant Access'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
