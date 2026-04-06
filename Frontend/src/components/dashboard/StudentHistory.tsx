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
    ChevronRight
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

export interface ExamResult {
    id: string;
    _id?: string;
    score: number;
    total_questions: number;
    percentage: number;
    submitted_at: string;
    time_spent: number;
    test_title?: string;
    exam_id?: { title: string } | string | null;
    mock_paper_id?: { title: string } | string | null;
}

export function StudentHistory() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'tests'>('all');
    const [viewingResultId, setViewingResultId] = useState<string | null>(null);

    const { data: results, isLoading } = useQuery({
        queryKey: ['student-exam-history', user?.id],
        queryFn: async () => {
            const data = await fetchWithAuth(`/data/exam_results?student_id=eq.${user?.id}&sort=submitted_at&order=desc`) as ExamResult[];
            return data;
        },
        enabled: !!user?.id
    });

    if (viewingResultId) {
        return <ExamReview resultId={viewingResultId} onClose={() => setViewingResultId(null)} />;
    }

    const filteredResults = (results || []).filter(r => {
        const title = r.test_title || 
                    (typeof r.exam_id === 'object' && r.exam_id?.title) || 
                    (typeof r.mock_paper_id === 'object' && r.mock_paper_id?.title) || 
                    'Assessment';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl mx-auto">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="pro-card border-slate-200 shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-1 py-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Trophy className="h-3 w-3" /> Mocktests Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 pb-5">
                        <div className="text-3xl font-black text-slate-900">{results?.length || 0}</div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total scored assessments</p>
                    </CardContent>
                </Card>

                <Card className="pro-card border-slate-200 shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-1 py-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ArrowUpRight className="h-3 w-3" /> Average Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 pb-5">
                        <div className="text-3xl font-black text-primary">
                            {results && results.length > 0 
                                ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
                                : 0}%
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Aggregated performance</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                        placeholder="Filter by test name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200 bg-white text-sm"
                    />
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full hidden sm:block">
                    Performance Log
                </h3>
            </div>

            {/* History List */}
            <div className="space-y-3">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
                    ))
                ) : filteredResults.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-100">
                        <History className="h-10 w-10 text-slate-100 mb-3" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">No Exam Records</h3>
                        <p className="text-slate-400 text-xs mt-1">Complete a mocktest to see your performance here.</p>
                    </div>
                ) : (
                    filteredResults.map((item, idx) => {
                        const title = item.test_title || 
                                     (typeof item.exam_id === 'object' && item.exam_id?.title) || 
                                     (typeof item.mock_paper_id === 'object' && item.mock_paper_id?.title) || 
                                     (item.mock_paper_id ? 'Mock Paper' : 'Assessment');
                        
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={item._id || item.id}
                                className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/20 transition-all shadow-sm"
                            >
                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors border border-slate-50">
                                    <Trophy className={`h-5 w-5 ${item.percentage >= 60 ? 'text-amber-500' : 'text-slate-400'}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                            {title}
                                        </h4>
                                        <Badge variant="outline" className={`font-black text-[8px] uppercase px-1.5 py-0 h-4 border-none ${item.percentage >= 60 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                            {item.percentage >= 60 ? 'PASSED' : 'FAILED'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.submitted_at).toLocaleDateString()}</span>
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px]">{Math.round(item.percentage)}% SCORE</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="ghost"
                                        size="sm" 
                                        onClick={() => setViewingResultId(item._id || item.id)}
                                        className="h-8 rounded-lg px-3 text-primary font-black text-[10px] uppercase hover:bg-primary/5 transition-all"
                                    >
                                        Review
                                        <ArrowUpRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-slate-300" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified Result Ledger</p>
            </div>

            {/* Policy Note */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Retention Policy</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">History records are permanent and used for academic verification.</p>
            </div>
        </div>
    );
}
