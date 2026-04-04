import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardCheck, Clock, Award, ArrowRight, CheckCircle2, BarChart, Home, XCircle, BookOpen } from "lucide-react";
import { useStudentExams, useStudentMockPapers, StudentExam } from "@/hooks/useStudentData";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamSession } from "./ExamSession";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ExamReview } from "./ExamReview";

interface ExamModuleProps {
    type: 'mock' | 'live';
}

interface SubmissionResults {
    score: number;
    totalQuestions: number;
}

export function ExamModule({ type }: ExamModuleProps) {
    const { data: liveExams, isLoading: loadingExams } = useStudentExams();
    const { data: mockPapers, isLoading: loadingMocks } = useStudentMockPapers();
    const [activeExam, setActiveExam] = useState<StudentExam | null>(null);
    const [showResults, setShowResults] = useState<{ id?: string, score: number, total: number, percentage: number, correctCount?: number, wrongCount?: number } | null>(null);
    const [viewingReviewId, setViewingReviewId] = useState<string | null>(null);
    const { toast } = useToast();

    const data = type === 'live' ? liveExams : mockPapers;
    const isLoading = type === 'live' ? loadingExams : loadingMocks;
    const icon = type === 'live' ? <ClipboardCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />;

    const handleFinish = async (results: SubmissionResults) => {
        try {
            const data = await fetchWithAuth('/student/submit-exam', {
                method: 'POST',
                body: JSON.stringify(results)
            }) as { resultId: string, score: number, percentage: number, correctCount: number, wrongCount: number };
            
            setShowResults({
                id: data.resultId,
                score: data.score,
                total: results.totalQuestions,
                percentage: Math.round(data.percentage),
                correctCount: data.correctCount,
                wrongCount: data.wrongCount
            });

            toast({
                title: "Exam Submitted",
                description: "Your results have been saved to your profile.",
                className: "bg-emerald-50 border-emerald-200"
            });
            setActiveExam(null);
        } catch (err) {
            toast({
                title: "Submission Error",
                description: "Failed to save exam results. Please contact support.",
                variant: "destructive"
            });
        }
    };

    if (viewingReviewId) {
        return <ExamReview resultId={viewingReviewId} onClose={() => setViewingReviewId(null)} />;
    }

    if (activeExam) {
        return (
            <ExamSession 
                examId={activeExam.id}
                examTitle={activeExam.title}
                durationMinutes={activeExam.duration_minutes || 60}
                onFinish={handleFinish}
                onExit={() => setActiveExam(null)}
                type={type}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    {type === 'live' ? <ClipboardCheck className="h-10 w-10 mb-2 opacity-50" /> : <FileText className="h-10 w-10 mb-2 opacity-50" />}
                    <p>No {type === 'live' ? 'live exams' : 'mock papers'} available at the moment.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {data?.map((item: StudentExam) => (
                <Card key={item.id} className="hover:border-primary/50 transition-colors bg-card/50">
                    <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {icon}
                                </span>
                                <CardTitle className="text-base">
                                    {item.title}
                                    {type === 'mock' && <span className="text-red-500 ml-1" title="All answers must be attempted">*</span>}
                                </CardTitle>
                            </div>
                            <CardDescription>{item.description}</CardDescription>
                        </div>
                        <div className="hidden md:block">
                            {item.is_completed ? (
                                <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 font-black text-[9px] uppercase tracking-widest">
                                    Completed
                                </Badge>
                            ) : type === 'live' ? (
                                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 font-semibold">
                                    LIVE SOON
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                                    PRACTICE
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{item.duration_minutes} mins</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Award className="h-4 w-4" />
                                <span>{item.total_marks} Marks</span>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            className={`gap-2 ${item.is_completed ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-80' : 'group bg-primary text-white hover:bg-primary/90'}`}
                            onClick={() => !item.is_completed && setActiveExam(item)}
                            disabled={item.is_completed}
                        >
                            {item.is_completed ? (
                                <>
                                    COMPLETED 🚫
                                </>
                            ) : (
                                <>
                                    {type === 'live' ? 'Enter Exam' : 'Start Mock'}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={!!showResults} onOpenChange={() => setShowResults(null)}>
                <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-0">
                    {showResults && (
                        <>
                            <div className="h-32 bg-primary/10 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                <div className="relative z-10 p-4 rounded-2xl bg-white shadow-xl shadow-primary/10">
                                    <Award className="h-12 w-12 text-primary" />
                                </div>
                            </div>

                            <div className="px-8 pt-6 pb-8 space-y-6 text-center">
                                <div className="space-y-2">
                                    <DialogTitle className="text-2xl font-black text-slate-900">Performance Summary</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Great job completing the mock paper! Here is how you did.
                                    </DialogDescription>
                                </div>

                                <div className="py-4 space-y-4">
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                                        <span>Score Overview</span>
                                        <span className={showResults.percentage >= 70 ? 'text-emerald-600' : 'text-orange-600'}>
                                            {showResults.percentage}% Success Rate
                                        </span>
                                    </div>
                                    
                                    <div className="relative pt-2">
                                        <Progress value={showResults.percentage} className="h-3 rounded-full bg-slate-100" />
                                        <div className="flex justify-between mt-6 gap-3">
                                            <div className="flex-1 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Correct</span>
                                                </div>
                                                <div className="text-xl font-black text-emerald-700">{showResults.correctCount ?? showResults.score}</div>
                                            </div>
                                            <div className="flex-1 p-3 rounded-2xl bg-red-50 border border-red-100 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Wrong</span>
                                                </div>
                                                <div className="text-xl font-black text-red-700">{showResults.wrongCount ?? 0}</div>
                                            </div>
                                            <div className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                                    <BarChart className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Total</span>
                                                </div>
                                                <div className="text-xl font-black text-slate-700">{showResults.total}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex-col sm:flex-col gap-3">
                                    <Button 
                                        onClick={() => {
                                            if (showResults.id) setViewingReviewId(showResults.id);
                                            setShowResults(null);
                                        }}
                                        className="w-full h-14 rounded-2xl text-lg font-bold pro-button-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        <BookOpen className="mr-2 h-5 w-5" /> 
                                        Review My Answers
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        onClick={() => setShowResults(null)}
                                        className="w-full h-12 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50"
                                    >
                                        <Home className="mr-2 h-4 w-4" /> 
                                        Return to Dashboard
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
