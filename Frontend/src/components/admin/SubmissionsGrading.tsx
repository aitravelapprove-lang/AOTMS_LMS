import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Clock, CheckCircle2, AlertCircle, ChevronRight, 
  MessageSquare, Mic, Play, Square, Loader2, Info, Search, Filter,
  BookOpen, User as UserIcon, Calendar, Star, Send, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fetchWithAuth } from '@/lib/api';
import { cn } from "@/lib/utils";
import { SyncDataButton } from './data/SyncDataButton';

interface QuestionSnapshot {
  question_id: string;
  question_text: string;
  type: string;
  marks: number;
  correct_answer?: string;
  student_answer?: string;
}

interface PendingResult {
  _id: string;
  student_id: {
    _id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  test_title: string;
  exam_id?: string;
  mock_paper_id?: string;
  submitted_at: string;
  grading_status: 'pending' | 'reevaluation';
  reevaluation_reason?: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  questions_snapshot?: QuestionSnapshot[];
}

interface Question {
  _id: string;
  question_text: string;
  type: string;
  marks: number;
  correct_answer?: string;
}

interface SubjectiveGrade {
  marks: number;
  feedback: string;
}

interface SubmissionsGradingProps {
  onSync?: () => void;
  loading?: boolean;
}

export default function SubmissionsGrading({ onSync, loading: parentLoading = false }: SubmissionsGradingProps) {
  const [submissions, setSubmissions] = useState<PendingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Grading state
  const [subjectiveGrading, setSubjectiveGrading] = useState<Record<string, SubjectiveGrade>>({});
  const [globalFeedback, setGlobalFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  
  // Search/Filter
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async (showToast = false) => {
    setLoading(true);
    try {
      const data = await fetchWithAuth<PendingResult[]>('/instructor/pending-grading');
      setSubmissions(data || []);
      if (showToast) {
        toast.success("Submissions synchronized");
      }
    } catch {
      toast.error("Failed to load pending submissions");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = (sub: PendingResult) => {
    setSelectedSubmission(sub);
    setLoadingDetail(true);
    setSubjectiveGrading({});
    setGlobalFeedback("");
    
    try {
      // Use the snapshot directly if available
      let subjectiveFs: Question[] = [];
      
      if (sub.questions_snapshot && sub.questions_snapshot.length > 0) {
        // Snapshot already has question details
        subjectiveFs = sub.questions_snapshot
          .filter(q => ['short', 'long', 'subjective', 'short_answer', 'long_answer', 'coding'].includes(q.type))
          .map(q => ({
            _id: q.question_id,
            question_text: q.question_text,
            type: q.type,
            marks: q.marks,
            correct_answer: q.correct_answer
          }));
      }
      
      setQuestions(subjectiveFs);
      
      // Initialize grading state
      const initial: Record<string, SubjectiveGrade> = {};
      subjectiveFs.forEach(q => {
        initial[q._id] = { marks: 0, feedback: "" };
      });
      setSubjectiveGrading(initial);
    } catch {
      toast.error("Failed to process submission details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkChange = (qId: string, val: string) => {
    const marks = parseFloat(val) || 0;
    setSubjectiveGrading(prev => ({
      ...prev,
      [qId]: { ...prev[qId], marks }
    }));
  };

  const handleFeedbackChange = (qId: string, feedback: string) => {
    setSubjectiveGrading(prev => ({
      ...prev,
      [qId]: { ...prev[qId], feedback }
    }));
  };

  const submitGrades = async () => {
    if (!selectedSubmission) return;
    setIsGrading(true);
    
    try {
      await fetchWithAuth(`/instructor/grade-result/${selectedSubmission._id}`, {
        method: 'POST',
        body: JSON.stringify({
          subjective_grading: subjectiveGrading,
          global_feedback: globalFeedback
        })
      });
      toast.success("Grading submitted successfully");
      setSelectedSubmission(null);
      loadSubmissions();
    } catch {
      toast.error("Failed to submit grades");
    } finally {
      setIsGrading(false);
    }
  };

  const filtered = submissions.filter(s => 
    s.student_id.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.test_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 p-2 lg:p-4">
      
      {/* List Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manual Grading</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review & Score Subjective Answers</p>
          </div>
          <div className="flex items-center gap-2">
            <SyncDataButton 
              onSync={onSync || (() => loadSubmissions(true))} 
              isLoading={parentLoading || loading} 
              className="h-8 px-3"
            />
            <Badge className="h-6 gap-1 bg-indigo-50 text-indigo-600 border-none font-bold">
              {submissions.length} Pending
            </Badge>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Search students or tests..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl font-bold text-slate-700"
          />
        </div>

        <ScrollArea className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div className="p-3 space-y-2">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-100 mx-auto mb-2" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">All caught up!</p>
              </div>
            ) : (
              filtered.map(sub => (
                <motion.div
                  key={sub._id}
                  onClick={() => loadDetail(sub)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSubmission?._id === sub._id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                    : "bg-white border-slate-100 text-slate-900 hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 rounded-lg border-2 border-white/20">
                      <AvatarImage src={sub.student_id.avatar_url} />
                      <AvatarFallback className="bg-white/10 text-xs font-black">
                        {sub.student_id.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate leading-tight">{sub.student_id.full_name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-wider opacity-60`}>
                        {sub.test_title || "Mock Test"}
                      </p>
                    </div>
                    {sub.grading_status === 'reevaluation' && (
                       <Badge className="bg-rose-500 text-white border-none h-4 px-1.5 text-[8px] animate-pulse">RE</Badge>
                    )}
                    <ChevronRight className={`h-4 w-4 opacity-30`} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[8px] font-black uppercase tracking-widest opacity-40">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(sub.submitted_at).toLocaleDateString()}</div>
                    <div>{sub.total_questions} Questions</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {!selectedSubmission ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">Select a submission to grade</p>
          </div>
        ) : loadingDetail ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyzing Submission...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Context Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-2xl shadow-lg">
                  <AvatarImage src={selectedSubmission.student_id.avatar_url} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                    {selectedSubmission.student_id.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{selectedSubmission.student_id.full_name}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedSubmission.student_id.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-black text-indigo-600">{selectedSubmission.test_title}</p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Submitted on {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-8 py-6">
              <div className="max-w-3xl mx-auto space-y-10 pb-10">
                
                {selectedSubmission.grading_status === 'reevaluation' && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-rose-800 uppercase tracking-widest mb-1">Re-evaluation Requested</p>
                      <p className="text-sm font-medium text-rose-600">"{selectedSubmission.reevaluation_reason || "No specific reason provided."}"</p>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">Subjective Questions ({questions.length})</h3>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Info className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-400">No subjective questions found in this submission</p>
                    </div>
                  ) : (
                    questions.map((q, i) => (
                      <div key={q._id} className="group">
                        <div className="flex items-start gap-4 mb-3">
                          <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-lg shadow-slate-200">
                            {i+1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">{q.question_text}</h4>
                            
                            <div className={cn(
                              "rounded-2xl p-6 border shadow-inner mb-6",
                              q.type === 'coding' ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"
                            )}>
                              <p className={cn(
                                "text-[8px] font-black uppercase tracking-widest mb-3",
                                q.type === 'coding' ? "text-slate-500" : "text-slate-400"
                              )}>
                                Student Answer {q.type === 'coding' ? "(Source Code)" : ""}
                              </p>
                              <div className={cn(
                                "whitespace-pre-wrap leading-relaxed text-[15px]",
                                q.type === 'coding' ? "text-emerald-400 font-mono" : "text-slate-700 font-medium"
                              )}>
                                {selectedSubmission.answers[q._id] || "— No Answer Provided —"}
                              </div>
                            </div>

                            {q.correct_answer && (
                              <Card className={cn(
                                "rounded-2xl mb-6 shadow-none overflow-hidden border-dashed",
                                q.type === 'coding' ? "bg-slate-950 border-slate-800" : "bg-emerald-50/50 border-emerald-100"
                              )}>
                                <CardHeader className={cn("py-2 px-6", q.type === 'coding' ? "bg-slate-900" : "bg-emerald-100/30")}>
                                  <CardTitle className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    q.type === 'coding' ? "text-slate-500" : "text-emerald-700"
                                  )}>
                                    Ideal Answer / Reference Logic
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className={cn(
                                  "py-4 px-6 text-sm font-medium opacity-80 whitespace-pre-wrap",
                                  q.type === 'coding' ? "text-slate-300 font-mono" : "text-emerald-800"
                                )}>
                                  {q.correct_answer}
                                </CardContent>
                              </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assign Score</p>
                                  <span className="text-[10px] font-black text-indigo-600">Max: {q.marks || 1} Marks</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    max={q.marks}
                                    value={subjectiveGrading[q._id]?.marks || 0}
                                    onChange={e => handleMarkChange(q._id, e.target.value)}
                                    className="h-12 w-28 bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl text-center font-black text-lg"
                                  />
                                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(((subjectiveGrading[q._id]?.marks || 0) / (q.marks || 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question Feedback</p>
                                <Textarea 
                                  placeholder="Specific feedback for this answer..."
                                  value={subjectiveGrading[q._id]?.feedback || ""}
                                  onChange={e => handleFeedbackChange(q._id, e.target.value)}
                                  className="min-h-12 bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold py-3 px-4 shadow-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {i < questions.length - 1 && <div className="h-px w-full bg-slate-50 my-10" />}
                      </div>
                    ))
                  )}
                </div>

                <div className="h-px w-full bg-slate-100 my-8" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">Final Feedback & Summary</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Overall Remarks</p>
                      <Textarea 
                        placeholder="Type whole submission feedback here..."
                        value={globalFeedback}
                        onChange={e => setGlobalFeedback(e.target.value)}
                        className="h-32 bg-slate-50 border-none focus-visible:ring-indigo-500 rounded-3xl p-6 font-bold shadow-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audio Feedback</p>
                      <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg text-indigo-500 cursor-pointer hover:scale-105 transition-transform">
                          <Mic className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Record Feedback</p>
                          <p className="text-[8px] font-bold text-indigo-400 mt-1">Talk to the student directly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-10">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedSubmission(null)}
                    className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={isGrading}
                    onClick={submitGrades}
                    className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-200 gap-2"
                  >
                    {isGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Finalize & Submit Marks
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
