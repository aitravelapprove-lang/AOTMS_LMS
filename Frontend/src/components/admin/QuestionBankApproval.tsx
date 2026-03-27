import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, FileText, AlertCircle, LayoutGrid, Clock, History, Eye, Users, Trash2, ShieldCheck, BrainCircuit } from 'lucide-react';
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
}

interface StudentAccess {
    student_id: string;
    student_name: string;
    student_email: string;
    student_avatar: string;
    assigned_by: string;
    granted_at: string;
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
    options?: any;
    correct_answer?: any;
    topic: string;
}

export function QuestionBankApproval() {
    const [pendingBanks, setPendingBanks] = useState<PendingQuestionBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const [showCourseDialog, setShowCourseDialog] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [viewTab, setViewTab] = useState<'pending' | 'library'>('pending');
    const { data: courses } = useCourses();
    const [approvedBanks, setApprovedBanks] = useState<PendingQuestionBank[]>([]);

    const [showAccessDialog, setShowAccessDialog] = useState(false);
    const [accessingTopic, setAccessingTopic] = useState<string | null>(null);
    const [accessList, setAccessList] = useState<StudentAccess[]>([]);
    const [loadingAccess, setLoadingAccess] = useState(false);
    const [accessCount, setAccessCount] = useState<Record<string, number>>({});

    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [removingTopic, setRemovingTopic] = useState<string | null>(null);

    const fetchPendingBanks = async (showLoading = true) => {
        try {
            if (showLoading && pendingBanks.length === 0 && approvedBanks.length === 0) setLoading(true);
            const questions = await fetchWithAuth('/data/question_bank') as QuestionBankResponse[];
            
            const groupData = (data: QuestionBankResponse[], status: string) => {
                return data.filter(q => q.approval_status === status).reduce((acc: Record<string, PendingQuestionBank>, q) => {
                    if (!acc[q.topic]) {
                        acc[q.topic] = {
                            topic: q.topic,
                            count: 0,
                            created_by: q.created_by,
                            created_at: q.created_at
                        };
                    }
                    acc[q.topic].count++;
                    return acc;
                }, {});
            };

            setPendingBanks(Object.values(groupData(questions, 'pending')));
            setApprovedBanks(Object.values(groupData(questions, 'approved')));

            const counts: Record<string, number> = {};
            for (const bank of Object.values(groupData(questions, 'approved'))) {
                try {
                    const res = await fetchWithAuth<{ total_count: number }>(`/admin/question-bank/${encodeURIComponent(bank.topic)}/access-list`);
                    counts[bank.topic] = res?.total_count || 0;
                } catch {
                    counts[bank.topic] = 0;
                }
            }
            setAccessCount(counts);
        } catch (err) {
            console.error('Failed to fetch question banks', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBanks();
        const interval = setInterval(() => fetchPendingBanks(), 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [viewingQuestions, setViewingQuestions] = useState<string | null>(null);
    const [questionsList, setQuestionsList] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const handlePreviewQuestions = async (topic: string) => {
        setViewingQuestions(topic);
        setLoadingQuestions(true);
        try {
            const res = await fetchWithAuth(`/data/question_bank?topic=${encodeURIComponent(topic)}`);
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

    if (loading && pendingBanks.length === 0 && approvedBanks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching pending approvals...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                        Question Bank Approvals
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">Review and activate curated question repositories.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'pending' | 'library')} className="bg-slate-100 p-1 rounded-xl">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending</TabsTrigger>
                            <TabsTrigger value="library" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Library</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Badge variant="secondary" className="h-7 px-3 bg-primary/10 text-primary border-none font-bold">
                        {pendingBanks.length} Total Requests
                    </Badge>
                </div>
            </div>

            <Tabs value={viewTab} className="w-full">
                <TabsContent value="pending" className="mt-0">
                    {pendingBanks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner border border-slate-100">
                                    <CheckCircle className="h-10 w-10 text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-900">Queue is empty!</p>
                                    <p className="text-sm font-medium text-slate-500 max-w-sm">There are no pending question banks awaiting review.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingBanks.map((bank) => (
                                <Card key={bank.topic} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                                            <div className="bg-primary/5 p-8 flex flex-col justify-center border-r border-slate-100 min-w-[200px]">
                                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                                    <FileText className="h-6 w-6 text-primary" />
                                                </div>
                                                <Badge variant="secondary" className="w-fit bg-primary/20 text-primary border-none font-bold px-3">
                                                    {bank.count} Questions
                                                </Badge>
                                            </div>

                                            <div className="flex-1 p-8 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-xl text-slate-900">{bank.topic}</h3>
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-black">Pending</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 mt-2">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                        <span>Submitted: {new Date(bank.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        <span>Source: {bank.created_by?.substring(0, 8) || 'System'}...</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 lg:bg-slate-50/50 flex flex-row lg:flex-col justify-center gap-3 border-l border-slate-100 min-w-[220px]">
                                                <div className="flex gap-2 w-full">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handlePreviewQuestions(bank.topic)}
                                                        className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
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

                <TabsContent value="library" className="mt-0">
                    {approvedBanks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner border border-slate-100">
                                    <LayoutGrid className="h-10 w-10 text-slate-200" />
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
                                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                                            <div className="bg-emerald-50 p-6 flex flex-col justify-center border-r border-emerald-100 min-w-[160px]">
                                                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <Badge variant="secondary" className="w-fit bg-emerald-100 text-emerald-700 border-none font-bold px-2 py-0 text-xs">
                                                    {bank.count} Questions
                                                </Badge>
                                            </div>

                                            <div className="flex-1 p-6 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg text-slate-900">{bank.topic}</h3>
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-black">Approved</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        <Users className="h-3.5 w-3.5 text-primary" />
                                                        <span>{accessCount[bank.topic] || 0} Students Accessed</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 lg:bg-slate-50/50 flex flex-row lg:flex-col justify-center gap-3 border-l border-slate-100 min-w-[200px]">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleViewAccess(bank.topic)}
                                                    className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all font-bold"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View ({accessCount[bank.topic] || 0})
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
            </Tabs>

            <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-[2rem] bg-white p-0 overflow-hidden">
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
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
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
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
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
                <DialogContent className="sm:max-w-3xl overflow-hidden p-0 border-none shadow-2xl rounded-[2rem] bg-white">
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
        </div>
    );
}
