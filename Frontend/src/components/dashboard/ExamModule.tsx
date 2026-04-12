import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
  examId: string;
  totalQuestions: number;
  answers: Record<string, string>;
  timeSpent: number;
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((item: StudentExam) => (
                <motion.div
                   key={item.id}
                   whileHover={{ y: -5 }}
                   className="group relative flex flex-col rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full"
                   onClick={() => !item.is_completed && setActiveExam(item)}
                >
                   <div className="aspect-video relative overflow-hidden bg-slate-50">
                      {item.assigned_image ? (
                        <img 
                          src={item.assigned_image.startsWith('http') ? item.assigned_image : `${API_URL}/s3/public/${item.assigned_image}`} 
                          className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                          alt="" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-100">
                           <FileText className="h-10 w-10 text-slate-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[4px]">
                         <Button className={cn(
                            "rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-8 border-none transform translate-y-4 group-hover:translate-y-0 transition-all duration-500",
                            item.is_completed ? "bg-red-500 text-white" : "bg-white text-black"
                         )}>
                            {item.is_completed ? "🚫 Already Attempted" : "Begin Session"}
                         </Button>
                      </div>
                      <div className="absolute top-4 right-4">
                         <Badge className={cn("text-[8px] font-black uppercase tracking-widest h-6 rounded-full px-3 border-none shadow-lg", 
                           item.is_completed ? "bg-red-500 text-white" : "bg-emerald-500 text-white animate-pulse"
                         )}>
                            {item.is_completed ? "🚫 Completed" : "Active Node"}
                         </Badge>
                      </div>
                   </div>

                   <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                         <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 line-clamp-2">{item.title}</h4>
                         <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration_minutes}m</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {item.total_marks}pts</span>
                         </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => (
                               <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                  L{i}
                               </div>
                             ))}
                         </div>
                         <Button variant="ghost" className="h-8 w-8 rounded-full p-0 text-slate-300 group-hover:text-primary transition-colors">
                            <ArrowRight className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </motion.div>
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
