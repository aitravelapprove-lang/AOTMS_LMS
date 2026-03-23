import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BookOpen, 
    FileText, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    History, 
    Calendar,
    ArrowUpRight,
    Trophy,
    Search,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExamReview } from './ExamReview';

interface Enrollment {
    id: string;
    course_id: string;
    status: string;
    enrolled_at: string;
    progress_percentage: number;
    course?: {
        title: string;
        category: string;
        thumbnail_url: string;
    }
}

interface ExamResult {
    id: string;
    exam_id: string | null;
    mock_paper_id: string | null;
    score: number;
    total_questions: number;
    percentage: number;
    submitted_at: string;
    time_spent: number;
    exam_title?: string;
}

export function StudentHistory() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'tests'>('all');
    const [viewingResultId, setViewingResultId] = useState<string | null>(null);

    const { data: enrollments, isLoading: enrollLoading } = useQuery({
        queryKey: ['student-enrollments-history', user?.id],
        queryFn: async () => {
            const data = await fetchWithAuth(`/student/my-courses`) as Array<any>;
            return data.map(e => ({
                ...e,
                type: 'course'
            }));
        },
        enabled: !!user?.id
    });

    const { data: results, isLoading: resultsLoading } = useQuery({
        queryKey: ['student-exam-history', user?.id],
        queryFn: async () => {
            const data = await fetchWithAuth(`/data/exam_results?user_id=eq.${user?.id}&sort=submitted_at&order=desc`) as Array<any>;
            // Fetch exam titles if possible, though for now we can rely on ID or generic name
            return data.map(r => ({
                ...r,
                type: 'test'
            }));
        },
        enabled: !!user?.id
    });

    const isLoading = enrollLoading || resultsLoading;

    if (viewingResultId) {
        return <ExamReview resultId={viewingResultId} onClose={() => setViewingResultId(null)} />;
    }

    // Combine and sort by date
    const allHistory = [
        ...(enrollments || []).map(e => ({
            id: e.enrollmentId || e.id,
            title: e.title || 'Course Enrollment',
            date: e.enrolled_at,
            type: 'course',
            status: e.enrollmentStatus,
            meta: `${e.progress}% Progress`,
            icon: <BookOpen className="h-5 w-5 text-blue-500" />
        })),
        ...(results || []).map(r => ({
            id: r._id || r.id,
            title: r.mock_paper_id ? 'Mock Test Score' : 'Exam Score',
            date: r.submitted_at,
            type: 'test',
            status: r.percentage >= 60 ? 'passed' : 'completed',
            meta: `${Math.round(r.percentage)}% Score • ${Math.floor(r.time_spent / 60)}m ${r.time_spent % 60}s`,
            icon: <Trophy className="h-5 w-5 text-amber-500" />
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredHistory = allHistory.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || 
                         (activeTab === 'courses' && item.type === 'course') || 
                         (activeTab === 'tests' && item.type === 'test');
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="pro-card bg-primary text-white border-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Courses Joined</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-black mb-1">{enrollments?.length || 0}</div>
                        <p className="text-xs text-white/60 font-medium">Total learning commitments</p>
                    </CardContent>
                    <BookOpen className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 rotate-12" />
                </Card>

                <Card className="pro-card border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Tests Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 mb-1">{results?.length || 0}</div>
                        <p className="text-xs text-slate-400 font-medium">Scored assessments</p>
                    </CardContent>
                </Card>

                <Card className="pro-card border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Avg. Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 mb-1">
                            {results && results.length > 0 
                                ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
                                : 0}%
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Score across all modules</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search activity..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20"
                    />
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
                    <TabsList className="bg-transparent">
                        <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">All activity</TabsTrigger>
                        <TabsTrigger value="courses" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Courses</TabsTrigger>
                        <TabsTrigger value="tests" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Test Scores</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* History List */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                    ))
                ) : filteredHistory.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <History className="h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">No records found</h3>
                        <p className="text-slate-500 text-sm mt-1">Your academic footprint will appear here once you start learning.</p>
                    </div>
                ) : (
                    filteredHistory.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="bg-white border border-slate-100 rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors border border-slate-50">
                                {item.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-slate-900 text-lg md:text-xl truncate">{item.title}</h4>
                                    <Badge variant="outline" className={`capitalize font-bold text-[10px] ${
                                        item.status === 'active' || item.status === 'passed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                        item.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                        'text-slate-500 bg-slate-50 border-slate-200'
                                    }`}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200">{item.meta}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {item.type === 'test' ? (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setViewingResultId(item.id)}
                                        className="h-10 rounded-xl px-4 border-slate-200 text-primary hover:bg-primary/5 hover:border-primary/20 font-bold transition-all"
                                    >
                                        Review Score
                                        <ArrowUpRight className="h-4 w-4 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary" asChild>
                                        <a href={item.type === 'course' ? `/student-dashboard/courses?courseId=${item.id}` : '#'}>
                                            <ChevronRight className="h-5 w-5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Future Footer Policy Note */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Retention Policy</p>
                <p className="text-sm text-slate-500 mt-2 font-medium">History records are permanent and used for academic verification and personalized learning recommendations.</p>
            </div>
        </div>
    );
}
