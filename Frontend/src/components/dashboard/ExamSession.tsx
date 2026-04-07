import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Flag,
  Monitor,
  Layout,
  Maximize2,
  Minimize2,
  LogOut,
  HelpCircle,
  Timer,
  Play,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useExamQuestions } from '@/hooks/useStudentData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';

interface ExamSessionProps {
  examId: string;
  examTitle: string;
  durationMinutes: number;
  onFinish: (results: any) => void;
  onExit: () => void;
  type: 'mock' | 'live';
}

export function ExamSession({ examId, examTitle, durationMinutes, onFinish, onExit, type }: ExamSessionProps) {
  const { data: questions, isLoading } = useExamQuestions(examId);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Coding Execution State
  const [consoleOutput, setConsoleOutput] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);

  const { toast } = useToast();

  // Fullscreen management
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const currentQuestion = questions?.[currentIdx];
  const progress = questions ? ((Object.keys(answers).length / questions.length) * 100) : 0;

  const handleAnswerChange = (val: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };

  const runCode = async () => {
    if (!currentQuestion) return;
    const code = answers[currentQuestion.id];
    if (!code || !code.trim()) {
        toast({ title: "Empty Code", description: "Please write some code to run.", variant: "destructive" });
        return;
    }

    setIsRunning(true);
    setConsoleOutput(prev => ({ ...prev, [currentQuestion.id]: 'Running...' }));

    try {
        const res = await fetchWithAuth('/run-code', {
            method: 'POST',
            body: JSON.stringify({
                language: 'js', // Force JS for local execution as per backend fix
                version: '*',
                files: [{ content: code }]
            })
        });

        const output = res.run?.stdout || res.run?.stderr || (res.message ? res.message : "No output");
        setConsoleOutput(prev => ({ ...prev, [currentQuestion.id]: output }));
        
        if (res.run?.stderr) {
            toast({ title: "Execution Error", description: "Check the console output for details.", variant: "destructive" });
        } else {
            toast({ title: "Execution Success", description: "Code ran successfully." });
        }

    } catch (err) {
        console.error("Run Code Error:", err);
        const errorMsg = err instanceof Error ? err.message : "Execution failed";
        setConsoleOutput(prev => ({ ...prev, [currentQuestion.id]: `Error: ${errorMsg}` }));
        toast({ title: "Execution Failed", description: errorMsg, variant: "destructive" });
    } finally {
        setIsRunning(false);
    }
  };

  const handleComplete = () => {
    if (type === 'mock' && Object.keys(answers).length < (questions?.length || 0)) {
      toast({
        title: "Incomplete Assessment",
        description: `You have answered ${Object.keys(answers).length} of ${questions?.length} questions.`,
        variant: "destructive",
      });
      // Allow submission anyway if time is up, but warn if manual
      if (timeLeft > 0) return; 
    }

    const results = {
        examId,
        totalQuestions: questions?.length || 0,
        answers: answers,
        timeSpent: (durationMinutes * 60) - timeLeft,
        // Score calculation should ideally happen on backend to be secure
        // But we pass answers for processing
    };
    onFinish(results);
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white space-y-4">
        <Monitor className="h-12 w-12 text-primary animate-pulse" />
        <h2 className="text-xl font-bold tracking-widest uppercase">Initializing Assessment Environment</h2>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-primary" 
                initial={{ width: 0 }} 
                animate={{ width: '100%' }} 
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
    </div>
  );

  if (!questions || questions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="text-slate-600 font-bold">No questions found for this exam.</p>
        <Button onClick={onExit}>Return to Dashboard</Button>
    </div>
  );

  // Determine Question Type (fallback to MCQ)
  // Ensure we handle 'coding', 'short', 'long', 'fill_blank', 'true_false'
  const qType = currentQuestion.type || currentQuestion.question_type || 'mcq'; 

  return (
    <div className={cn(
        "fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col transition-all",
        isFullScreen ? "p-0" : "p-0"
    )}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm relative z-10 gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
                    <Layout className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none truncate max-w-[200px] sm:max-w-none">
                        {examTitle}
                    </h1>
                    <div className="hidden sm:flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200 bg-slate-50">Authorized Session</Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                            <Monitor className="h-3 w-3" /> Secure Connection
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className={cn(
                    "flex flex-col items-end px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border transition-all duration-500",
                    timeLeft < 300 ? "bg-red-50 border-red-200 text-red-600" : "bg-primary/5 border-primary/10 text-primary"
                )}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <Timer className={cn("h-4 w-4", timeLeft < 300 && "animate-pulse")} />
                        <span className="text-lg sm:text-2xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Remaining Time</span>
                </div>
                <Separator orientation="vertical" className="h-10 bg-slate-200 hidden sm:block" />
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-xl"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="h-10 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold flex items-center gap-2"
                        onClick={onExit}
                    >
                        <LogOut className="h-4 w-4" /> Exit
                    </Button>
                </div>
            </div>
        </header>

        {/* Main Interface Content */}
        <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-[320px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col overflow-hidden max-h-[160px] lg:max-h-none">
                <div className="p-3 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Progress
                        </span>
                        <span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-slate-200 [&>div]:bg-primary shadow-sm" />
                </div>

                <div className="p-3 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {questions.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isCurrent = currentIdx === idx;
                            const isFlagged = flagged[q.id];

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={cn(
                                        "h-10 w-12 sm:w-full sm:h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center relative group shrink-0",
                                        isCurrent ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10" : 
                                        isAnswered ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                        "bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {idx + 1}
                                    {isFlagged && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                                    {isAnswered && !isCurrent && <CheckCircle2 className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-emerald-500 fill-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Question Workspace */}
            <section className="flex-1 relative bg-slate-50/30 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4 sm:p-8">
                    <div className="max-w-5xl mx-auto py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Question Header */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="h-8 px-3 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">Q{currentIdx + 1}</span>
                                        <Badge variant="secondary" className="uppercase text-[10px] tracking-widest font-bold">
                                            {qType.replace('_', ' ')}
                                        </Badge>
                                        <Button 
                                            variant="outline" size="sm" 
                                            className={cn("h-8 ml-auto rounded-lg text-[10px] font-bold uppercase", flagged[currentQuestion.id] && "bg-red-50 text-red-600 border-red-200")}
                                            onClick={() => setFlagged(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                                        >
                                            <Flag className={cn("h-3.5 w-3.5 sm:mr-1.5", flagged[currentQuestion.id] && "fill-current")} />
                                            <span className="hidden sm:inline">{flagged[currentQuestion.id] ? "Flagged" : "Flag"}</span>
                                        </Button>
                                    </div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                                        {currentQuestion.question_text || currentQuestion.text}
                                    </h2>
                                </div>

                                <Separator className="bg-slate-200" />

                                {/* Render Input Based on Type */}
                                <div className="min-h-[300px]">
                                    {/* MCQ */}
                                    {(qType === 'mcq' || qType === 'multiple_choice') && (
                                        <div className="grid grid-cols-1 gap-3">
                                            {currentQuestion.options?.map((option: any, oIdx: number) => {
                                                const optId = option.id || option.text || option; // Handle object or string options
                                                const optText = option.text || option;
                                                const isSelected = answers[currentQuestion.id] === optId;
                                                
                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => handleAnswerChange(optId)}
                                                        className={cn(
                                                            "group relative flex items-center p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200",
                                                            isSelected ? "bg-white border-primary shadow-lg shadow-primary/5" : "bg-white/50 border-white hover:border-slate-300"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs mr-3 sm:mr-4 transition-colors",
                                                            isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <span className={cn("font-medium text-sm sm:text-base leading-snug w-full", isSelected ? "text-slate-900" : "text-slate-600")}>{optText}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* True / False */}
                                    {qType === 'true_false' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {['True', 'False'].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAnswerChange(val)}
                                                    className={cn(
                                                        "h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                                                        answers[currentQuestion.id] === val 
                                                            ? (val === 'True' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-red-50 border-red-500 text-red-700")
                                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                                    )}
                                                >
                                                    <span className="text-2xl font-black uppercase tracking-widest">{val}</span>
                                                    {answers[currentQuestion.id] === val && <CheckCircle2 className="h-6 w-6" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Short / Long Answer */}
                                    {(qType === 'short' || qType === 'short_answer' || qType === 'long' || qType === 'long_answer') && (
                                        <div className="space-y-2">
                                            <Textarea
                                                placeholder="Type your answer here..."
                                                value={answers[currentQuestion.id] || ''}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                className="min-h-[200px] text-base p-4 rounded-xl border-slate-200 focus:border-primary resize-y"
                                            />
                                            <p className="text-xs text-muted-foreground text-right">
                                                {(answers[currentQuestion.id] || '').length} characters
                                            </p>
                                        </div>
                                    )}

                                    {/* Fill in Blanks */}
                                    {qType === 'fill_blank' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">Type the missing word(s) exactly.</p>
                                            <Input
                                                placeholder="Your answer..."
                                                value={answers[currentQuestion.id] || ''}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                className="h-14 text-lg px-4 rounded-xl border-slate-200 focus:border-primary"
                                            />
                                        </div>
                                    )}

                                    {/* Coding / Practical */}
                                    {(qType === 'coding' || qType === 'practical') && (
                                        <div className="flex flex-col gap-4 h-full">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Code Editor (JavaScript)</span>
                                                <Button 
                                                    size="sm" 
                                                    onClick={runCode} 
                                                    disabled={isRunning}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold"
                                                >
                                                    {isRunning ? <Monitor className="h-3 w-3 animate-pulse" /> : <Play className="h-3 w-3" />}
                                                    {isRunning ? "Running..." : "Run Code"}
                                                </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
                                                <Textarea
                                                    value={answers[currentQuestion.id] || ''}
                                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                                    placeholder="// Write your solution here..."
                                                    className="font-mono text-sm p-4 bg-slate-950 text-slate-50 resize-none h-full rounded-xl border-slate-800 focus:border-emerald-500/50"
                                                    spellCheck={false}
                                                />
                                                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col h-full">
                                                    <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-800 pb-2">
                                                        <Terminal className="h-4 w-4" />
                                                        <span className="text-xs font-mono font-bold uppercase">Console Output</span>
                                                    </div>
                                                    <ScrollArea className="flex-1">
                                                        <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                                                            {consoleOutput[currentQuestion.id] || "> Ready to execute..."}
                                                        </pre>
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </ScrollArea>

                {/* Footer Controls */}
                <div className="bg-white border-t border-slate-200 p-3 sm:p-6">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentIdx === 0}
                                className="h-10 sm:h-12 px-3 sm:px-6 rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                            >
                                <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentIdx === questions.length - 1}
                                className="h-10 sm:h-12 px-3 sm:px-6 rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            onClick={handleComplete}
                            className="h-10 sm:h-12 px-4 sm:px-8 rounded-xl bg-slate-900 text-white hover:bg-black font-black uppercase tracking-wider text-[10px] sm:text-xs flex items-center gap-2 shadow-xl"
                        >
                            <span className="hidden sm:inline">Finish Assessment</span>
                            <span className="sm:hidden">Finish</span>
                            <HelpCircle className="h-4 w-4 shrink-0" />
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    </div>
  );
}
