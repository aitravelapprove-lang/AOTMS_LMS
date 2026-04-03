import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam, useCreateQuestion, type Exam } from '@/hooks/useManagerData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Settings2,
  ChevronRight,
  ChevronLeft,
  FileText,
  MousePointer2,
  Loader2,
  Layout,
  Rocket,
  RefreshCw,
  Eye,
  ArrowRight,
  X,
  Zap,
  ShieldCheck,
  Dna,
  Link as LinkIcon,
  Upload,
  ArrowLeft,
  Target,
  Layers,
  Activity,
  UserPlus2,
  ShieldAlert,
  GraduationCap,
  Scale,
  PlayCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// ─── 1. Validation Schema ────────────────────────────────────────────────────

const examSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  exam_type: z.string().min(1, 'Please select or enter an exam type'),
  assigned_image: z.string().optional(),
  scheduled_date: z.string().optional(),
  duration_minutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes').default(60),
  total_marks: z.coerce.number().min(1, 'Total marks must be at least 1').default(100),
  passing_percentage: z.coerce.number().min(0).max(100).default(40),
  negative_marking: z.coerce.number().min(0).default(0),
  max_attempts: z.coerce.number().min(1).default(1),
  show_results: z.boolean().default(true),
  browser_security: z.boolean().default(false),
  shuffle_questions: z.boolean().default(true),
  proctoring_enabled: z.boolean().default(false),
  topics: z.array(z.string()).default([]),
  source_topic: z.string().optional(),
  question_count: z.coerce.number().min(1).default(10),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface GeneratedQuestion {
  id: string;
  text: string;
  type: string;
  options: { text: string; is_correct: boolean }[];
  correct_answer: string;
  difficulty: string;
}

interface AIQuestion {
  id: number;
  text: string;
  type: string;
}

// ─── 2. Internal Components ──────────────────────────────────────────────────

function getImageSrc(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `/s3/public/${path}`;
}

function ExamCard({ 
  exam, 
  onUpdate, 
  onDelete, 
  onConfigure,
  isPast 
}: { 
  exam: Exam; 
  onUpdate: (params: { id: string; status?: string; approval_status?: string }) => void;
  onDelete: (id: string) => void;
  onConfigure: (exam: Exam) => void;
  isPast?: boolean;
}) {
  const isPending = exam.approval_status === 'pending';
  const isRejected = exam.approval_status === 'rejected';
  const imgSource = getImageSrc(exam.assigned_image);

  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group h-full flex flex-col rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer",
        isPast && "opacity-75 grayscale-[0.2]"
      )}
      onClick={() => onConfigure(exam)}
    >
      <div className="h-44 relative bg-slate-50 overflow-hidden border-b border-slate-50">
        {imgSource ? (
          <img 
            src={imgSource} 
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-700" 
            alt={exam.title} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
             <Layout className="h-10 w-10 text-slate-200" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-white/40 group-hover:bg-white/80 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[4px]">
           <div className="flex flex-col items-center gap-2 text-slate-900">
              <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                 <Settings2 className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Setup</span>
           </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
          <Badge className="bg-white hover:bg-white text-slate-900 border border-slate-100 text-[9px] font-bold uppercase tracking-widest h-6 rounded-full px-3 shadow-sm">
             {exam.exam_type}
          </Badge>
          <Badge className={cn(
             "border-none text-[9px] font-bold uppercase tracking-widest h-6 rounded-full px-3",
             isPending ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
             isRejected ? "bg-rose-500 text-white" :
             exam.status === 'active' ? "bg-slate-900 text-white animate-pulse" : "bg-slate-200 text-slate-500"
          )}>
            {isPending ? 'Under review' : isRejected ? 'Rejected' : (exam.approval_status === 'approved' ? 'Approved' : (exam.status || 'Draft'))}
          </Badge>
        </div>
      </div>
      
      <div className="p-8 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-3">
          <h4 className="font-bold text-xl text-slate-900 leading-tight transition-colors line-clamp-2 uppercase tracking-tighter">{exam.title}</h4>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {exam.duration_minutes} min</span>
            <span className="h-1 w-1 rounded-full bg-slate-100" />
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3" /> 
              {exam.scheduled_date ? format(new Date(exam.scheduled_date), 'MMM dd') : 'Unscheduled'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
           {!isPast && exam.approval_status === 'approved' && (
             <Button
               className={cn(
                 "flex-1 h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95",
                 exam.status === 'active' ? "bg-slate-900 hover:bg-black text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
               )}
               onClick={(e) => { e.stopPropagation(); onUpdate({ id: exam.id, status: exam.status === 'active' ? 'completed' : 'active' }); }}
             >
               {exam.status === 'active' ? 'End Protocol' : 'Launch Protocol'}
             </Button>
           )}
           {exam.approval_status === 'pending' && (
             <div className="flex flex-1 gap-2">
               <Button
                 className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                 onClick={(e) => { e.stopPropagation(); onUpdate({ id: exam.id, approval_status: 'approved', status: 'ready' }); }}
               >
                 Approve
               </Button>
               <Button
                 className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                 onClick={(e) => { e.stopPropagation(); onUpdate({ id: exam.id, approval_status: 'rejected' }); }}
               >
                 Reject
               </Button>
             </div>
           )}
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-12 w-12 rounded-2xl text-slate-200 hover:text-destructive hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100" 
             onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
           >
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 3. Main Horizontal Scheduler ──────────────────────────────────────────

export function ExamScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: exams = [], isLoading } = useExams();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isOtherType, setIsOtherType] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      exam_type: 'mock',
      assigned_image: '',
      duration_minutes: 60,
      total_marks: 100,
      passing_percentage: 40,
      negative_marking: 0,
      max_attempts: 1,
      show_results: true,
      browser_security: false,
      shuffle_questions: true,
      proctoring_enabled: false,
      topics: [],
      scheduled_date: '',
      source_topic: '',
      question_count: 10,
    },
  });

  const onDropPoster = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      form.setValue('assigned_image', url);
      toast({ title: 'Visual Identity Attached' });
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => form.setValue('assigned_image', ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [form, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => form.setValue('assigned_image', ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data: ExamFormValues) => {
    if (!user?.id) return;
    try {
      const passing_marks = Math.round((data.total_marks * data.passing_percentage) / 100);
      await createExam.mutateAsync({
        ...(data as Omit<Exam, "id" | "created_at">),
        course_id: null,
        passing_marks,
        status: 'draft',
        approval_status: 'pending',
        created_by: user.id || '',
        scheduled_date: data.scheduled_date || new Date().toISOString(),
      });
      setIsAddOpen(false);
      form.reset();
      toast({ title: 'Architecture Successfully Committed' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedExam || !aiPrompt) {
      toast({ title: "Inference Error", description: "Subject vectors or context prompts are missing.", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      // Calling the backend proxy to n8n
      const response = await fetchWithAuth('/manager/generate-questions', {
        method: 'POST',
        body: JSON.stringify({
          topic: selectedExam.source_topic || selectedExam.title,
          prompt: aiPrompt,
          type: 'mcq',
          count: 5,
          difficulty: 'medium'
        })
      });

      // Handle both direct array and nested 'questions' object from AI
      const aiQuestions = response.questions || (Array.isArray(response) ? response : []);
      
      const mapped = aiQuestions.map((q: any, idx: number) => {
        // Find the text of the correct option for the correct_answer field
        const correctOption = q.options?.find((o: any) => o.isCorrect === true || o.is_correct === true);
        
        return {
          id: `ai-${idx}-${Date.now()}`,
          text: q.questionText || q.question_text || q.text,
          type: 'mcq',
          options: q.options?.map((o: any) => ({
             text: o.text || o.option_text,
             is_correct: o.isCorrect || o.is_correct || false
          })) || [],
          correct_answer: correctOption?.text || correctOption?.option_text || "",
          difficulty: q.difficulty || 'medium'
        };
      });

      setGeneratedQuestions(mapped);
      toast({ title: 'Neural Vectors Synchronized', description: `${mapped.length} assessment items generated.` });
    } catch (error) {
      console.error('AI Sync Failed:', error);
      toast({ title: 'AI Grid Sync Failed', description: 'Quantum handshake unsuccessful. Please retry.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const createQuestions = useCreateQuestion();

  const handleDeploySync = async () => {
    if (!generatedQuestions.length) return;
    
    try {
      const payload = generatedQuestions.map(q => ({
        topic: selectedExam?.source_topic || selectedExam?.title || "General",
        question_text: q.text,
        type: 'multiple_choice',
        difficulty: q.difficulty || 'medium',
        options: q.options,
        correct_answer: q.correct_answer,
        created_by: user?.id || ""
      }));

      await createQuestions.mutateAsync(payload);
      setIsConfigureOpen(false);
      setGeneratedQuestions([]);
      toast({ title: 'Architecture Successfully Committed', description: 'Assessment repository core updated.' });
    } catch (error) {
      console.error('Deployment Failed:', error);
    }
  };

  const pendingExams = useMemo(() => exams.filter(e => e.approval_status === 'pending'), [exams]);
  const approvedExams = useMemo(() => exams.filter(e => e.approval_status === 'approved'), [exams]);
  const rejectedExams = useMemo(() => exams.filter(e => e.approval_status === 'rejected'), [exams]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-6">
        <div />
        <Dialog open={isAddOpen} onOpenChange={(val) => {
          setIsAddOpen(val);
          if (!val) {
            setIsOtherType(false);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-12 bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-widest text-[10px] gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" /> Initialize Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] bg-white">
            <DialogHeader className="p-16 border-b border-slate-50 relative space-y-0">
               <DialogTitle className="text-4xl font-bold text-slate-900 tracking-tighter uppercase italic leading-none">Initialize <br/> Workspace</DialogTitle>
               <DialogDescription className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.5em] mt-3 block">Unified Assessment Module Builder</DialogDescription>
               <div className="absolute top-16 right-16 h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-200">
                  <Layout className="h-5 w-5" />
               </div>
            </DialogHeader>
            <div className="p-16 overflow-y-auto max-h-[65vh] custom-scrollbar bg-white/50">
               <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-12">
                   <div className="space-y-10">
                     <FormField
                       control={form.control}
                       name="title"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Assessment Identity</FormLabel>
                           <FormControl>
                             <Input placeholder="E.g. FullStack Logic Protocol" className="h-16 rounded-[1.5rem] border-slate-100 bg-slate-50/30 font-medium px-8 focus:bg-white focus:border-slate-900 transition-all text-sm outline-none shadow-none" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />

                     <div className="grid grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="exam_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Class Profile</FormLabel>
                              {isOtherType ? (
                                <div className="relative group">
                                  <Input 
                                    placeholder="Enter custom type..." 
                                    className="h-16 rounded-[1.5rem] border-slate-100 bg-slate-50/30 font-medium px-8 focus:bg-white focus:border-slate-900 transition-all text-sm outline-none shadow-none pr-12"
                                    {...field}
                                    autoFocus
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                                    onClick={() => {
                                      setIsOtherType(false);
                                      field.onChange('mock');
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Select onValueChange={(val) => {
                                  if (val === 'others') {
                                    setIsOtherType(true);
                                    field.onChange('');
                                  } else {
                                    field.onChange(val);
                                  }
                                }} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-16 rounded-[1.5rem] border-slate-100 bg-slate-50/30 font-medium px-8 outline-none shadow-none">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-2xl border-slate-100 p-2 shadow-2xl">
                                    {['mock', 'certification', 'live', 'others'].map(t => (
                                      <SelectItem key={t} value={t} className="font-bold py-4 uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">{t} paper</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="assigned_image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Visual Poster</FormLabel>
                              <FormControl>
                                <div className="space-y-4">
                                  {field.value ? (
                                    <div className="relative h-16 w-full rounded-[1.5rem] overflow-hidden group border border-slate-100 shadow-sm">
                                       <img src={field.value} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt="" />
                                       <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-full" onClick={() => field.onChange('')}>
                                            <Trash2 className="h-5 w-5" />
                                          </Button>
                                       </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="group h-16 rounded-[1.5rem] border-2 border-dashed border-slate-100 bg-slate-50/30 flex items-center px-8 hover:border-slate-900 transition-all cursor-pointer"
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={onDropPoster}
                                      onClick={() => document.getElementById('init-pos')?.click()}
                                    >
                                       <ImageIcon className="h-4 w-4 text-slate-200 mr-4 group-hover:text-slate-900 transition-colors" />
                                       <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-900 uppercase tracking-[0.2em] transition-colors font-sans">Initialize Poster</span>
                                    </div>
                                  )}
                                  <input id="init-pos" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                     </div>

                     <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100/50 space-y-10">
                        <FormField
                           control={form.control}
                           name="scheduled_date"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                  <CalendarIcon className="h-3 w-3" /> Activation Timeline
                               </FormLabel>
                               <FormControl>
                                 <Input type="datetime-local" className="h-14 rounded-xl border-slate-100 font-medium px-8 shadow-none focus:border-slate-900 transition-all" {...field} />
                               </FormControl>
                             </FormItem>
                           )}
                         />
                         
                         <div className="grid grid-cols-2 gap-8">
                            <FormField
                              control={form.control}
                              name="duration_minutes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Duration (M)</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-14 rounded-xl border-slate-100 font-medium px-8 text-center shadow-none focus:border-slate-900 transition-all" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="total_marks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Total Score</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-14 rounded-xl border-slate-100 font-medium px-8 text-center shadow-none focus:border-slate-900 transition-all" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>

                         <div className="grid grid-cols-3 gap-6">
                            <FormField
                              control={form.control}
                              name="negative_marking"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Neg. Marks</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.25" className="h-14 rounded-xl border-slate-100 font-medium px-6 text-center shadow-none focus:border-slate-900 transition-all" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="max_attempts"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Max Retakes</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-14 rounded-xl border-slate-100 font-medium px-6 text-center shadow-none focus:border-slate-900 transition-all" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="passing_percentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Threshold %</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-14 rounded-xl border-slate-100 font-medium px-6 text-center shadow-none focus:border-slate-900 transition-all" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>
                     </div>

                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Assessment Briefing</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Instructions for protocol candidates..." className="min-h-[100px] rounded-[1.5rem] border-slate-100 bg-slate-50/30 p-8 font-medium text-slate-600 focus:bg-white focus:border-slate-900 transition-all" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                   </div>
                   <div className="flex gap-4 pt-10">
                     <Button type="button" variant="ghost" className="h-18 flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-300 hover:text-slate-900 hover:bg-slate-50" onClick={() => setIsAddOpen(false)}>Abort Change</Button>
                     <Button 
                        type="submit"
                        disabled={createExam.isPending}
                        className="h-18 flex-[2] rounded-2xl bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-widest text-[11px] shadow-2xl transition-all flex items-center justify-center gap-2"
                      >
                        {createExam.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Synchronizing Architecture...</span>
                          </>
                        ) : (
                          <>
                            <span>Initialize Profile</span>
                            <ChevronRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                   </div>
                 </form>
               </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-12 h-20 rounded-[2.5rem] bg-white border border-slate-100 p-2 shadow-sm flex items-center gap-2">
           {['pending', 'approved', 'rejected'].map(tab => (
             <TabsTrigger 
               key={tab} 
               value={tab} 
               className="flex-1 h-full rounded-full font-bold text-[10px] uppercase tracking-widest text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500"
             >
               {tab === 'pending' ? `Pending Approval (${pendingExams.length})` : tab === 'approved' ? `Approved Protocols (${approvedExams.length})` : `Rejected Protocols (${rejectedExams.length})`}
             </TabsTrigger>
           ))}
        </TabsList>
        {['pending', 'approved', 'rejected'].map((tabVal) => (
          <TabsContent key={tabVal} value={tabVal} className="focusVisible:outline-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {(() => {
                const list = tabVal === 'pending' ? pendingExams : tabVal === 'approved' ? approvedExams : rejectedExams;
                if (list.length === 0) return (
                  <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
                     <Rocket className="h-12 w-12 text-slate-100 mx-auto mb-6" />
                     <h4 className="text-2xl font-bold text-slate-200 uppercase tracking-[0.3em] font-sans">Workspace Empty</h4>
                     <p className="text-[10px] font-medium text-slate-200 uppercase tracking-widest mt-2">Analytical data set is currently zero</p>
                  </div>
                );
                return list.map(exam => (
                  <ExamCard key={exam.id} exam={exam} onUpdate={(p) => updateExam.mutate({ id: p.id, ...p })} onDelete={(id) => deleteExam.mutate(id)} onConfigure={(e) => { setSelectedExam(e); setIsConfigureOpen(true); }} isPast={tabVal === 'past'} />
                ));
              })()}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="sm:max-w-none w-screen h-screen m-0 rounded-none p-0 border-none bg-white overflow-hidden text-slate-900">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedExam?.title || 'Exam Configuration'}</DialogTitle>
            <DialogDescription>Modify protocol settings and deployment parameters</DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom duration-1000">
              
              {/* Clean Header Bar */}
              <div className="h-28 border-b border-slate-50 flex items-center justify-between px-16 bg-white/80 backdrop-blur-3xl sticky top-0 z-50">
                <div className="flex items-center gap-8">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900" onClick={() => setIsConfigureOpen(false)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase italic">{selectedExam.title}</h3>
                    <div className="flex items-center gap-4 text-[9px] font-medium text-slate-400 uppercase tracking-[0.3em]">
                       <span className="flex items-center gap-2"><Target className="h-3 w-3" /> Protocol Build</span>
                       <span className="h-1 w-1 rounded-full bg-slate-100" />
                       <span className="flex items-center gap-2 font-mono text-slate-300">#{selectedExam.id?.toUpperCase().slice(0, 12)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-300 hover:text-rose-500 hover:bg-rose-50" onClick={() => deleteExam.mutate(selectedExam.id)}>Delete Protocol</Button>
                  <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-400 border-slate-100 hover:bg-slate-50 gap-3" onClick={() => {
                    toast({ title: 'Simulation Initialized', description: 'Entering Sandbox Preview Environment...' });
                  }}>
                    <PlayCircle className="h-4 w-4" /> Simulation Suite
                  </Button>
                  <Button className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold uppercase text-[11px] tracking-widest shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02]" onClick={() => {
                    updateExam.mutate({ id: selectedExam.id, approval_status: 'pending' });
                    toast({ title: 'Admin Request Dispatched', description: 'Your protocol is now in the review queue.' });
                    setIsConfigureOpen(false);
                  }}>Submit for Admin Approval</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-16 lg:p-28 bg-white selection:bg-slate-100">
                <div className="max-w-7xl mx-auto space-y-32">
                  
                  {/* Hero Specs Area */}
                  <div className="grid lg:grid-cols-2 gap-24 items-start">
                    <div className="space-y-16 py-10">
                      <div className="space-y-6">
                        <Badge className="bg-slate-50 text-slate-400 border border-slate-100 text-[9px] px-5 py-2 rounded-full font-bold uppercase tracking-[0.2em] shadow-sm">Workspace // Architecture</Badge>
                        <h4 className="text-7xl font-bold text-slate-900 tracking-tighter leading-[0.9] max-w-xl italic uppercase">Exam <br/> Scheduling <br/> <span className="not-italic text-slate-300 font-medium">Protocol</span></h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-16 pt-8 border-t border-slate-50">
                        <div className="space-y-3">
                           <span className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em]">Deployment Status</span>
                           <div className="flex items-center gap-4 text-2xl font-bold text-slate-900 tracking-tighter">
                             <div className="h-2 w-2 rounded-full bg-slate-900" /> {selectedExam.status?.toUpperCase() || 'DRAFT'}
                           </div>
                        </div>
                        <div className="space-y-3">
                           <span className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em]">Protocol Type</span>
                           <div className="text-2xl font-bold text-slate-900 uppercase tracking-tighter">{selectedExam.exam_type} Module</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                           <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                           <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Candidate Briefing</h5>
                           <p className="text-xs font-medium text-slate-400 line-clamp-2 italic">"{selectedExam.description || 'No specific instructions initialized for this protocol.'}"</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative group perspective-1000">
                      <div className="relative h-[600px] w-full bg-slate-50 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-1000 group-hover:shadow-[0_80px_150px_-40px_rgba(0,0,0,0.12)]">
                         {selectedExam.assigned_image ? (
                           <img src={getImageSrc(selectedExam.assigned_image)!} className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105" alt="" />
                         ) : (
                           <div className="h-full flex flex-col items-center justify-center gap-6">
                              <Layout className="h-24 w-24 text-slate-100" />
                              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.5em]">No Visual Key</span>
                           </div>
                         )}
                         <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[4rem]" />
                      </div>
                      <div className="absolute -bottom-12 -right-12 h-44 w-44 bg-white border border-slate-50 rounded-[3rem] shadow-2xl p-10 flex flex-col justify-center gap-2 transition-all duration-700 delay-100 group-hover:-translate-y-4">
                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Latency</span>
                         <span className="text-4xl font-bold text-slate-900 tracking-tighter">0.8<span className="text-sm font-medium text-slate-300 ml-1">ms</span></span>
                         <div className="w-full h-1 bg-slate-50 mt-2 relative overflow-hidden rounded-full">
                            <div className="absolute inset-0 bg-slate-900 w-2/3" />
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Matrix Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                     {[
                       { label: 'Total Score Load', value: `${selectedExam.total_marks || 100} PTS`, icon: Target, color: 'text-slate-900' },
                       { label: 'Duration Allocation', value: `${selectedExam.duration_minutes || 60} MIN`, icon: Clock, color: 'text-slate-900' },
                       { label: 'Neg. Marks Load', value: `${selectedExam.negative_marking || 0} PER`, icon: Scale, color: 'text-rose-500' },
                       { label: 'Proficiency Threshold', value: `${((selectedExam.passing_marks || 1) / (selectedExam.total_marks || 1) * 100).toFixed(0)}%`, icon: GraduationCap, color: 'text-emerald-500' },
                     ].map((stat, i) => (
                       <div key={i} className="p-12 rounded-[3rem] bg-white border border-slate-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 group flex flex-col items-center text-center">
                         <div className={cn("h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700", stat.color)}>
                            <stat.icon className="h-6 w-6" />
                         </div>
                         <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-3">{stat.label}</h5>
                         <p className="text-4xl font-bold text-slate-900 tracking-tighter leading-none italic">{stat.value}</p>
                       </div>
                     ))}
                  </div>

                  {/* Behavioral Protocol Suite */}
                  <div className="grid lg:grid-cols-2 gap-12">
                    <div className="p-16 rounded-[4rem] border border-slate-50 bg-slate-50/30 space-y-12">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                          <div>
                            <h5 className="text-2xl font-bold text-slate-900 tracking-tight uppercase italic">Security Protocol Suite</h5>
                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.4em] mt-2">Integrity Vector Management</p>
                          </div>
                          <ShieldAlert className="h-8 w-8 text-slate-200" />
                       </div>
                       
                       <div className="grid sm:grid-cols-2 gap-6">
                         {[
                           { label: 'Biometric AI', icon: BrainCircuit, active: selectedExam.proctoring_enabled },
                           { label: 'OS Airlock', icon: ShieldCheck, active: selectedExam.browser_security },
                           { label: 'Entropy Shuffle', icon: RefreshCw, active: selectedExam.shuffle_questions },
                           { label: 'Instant Sync', icon: CheckCircle2, active: selectedExam.show_results }
                         ].map((p, i) => (
                           <div key={i} className="flex items-center justify-between p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-300 transition-all group">
                             <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-900 transition-colors">
                                <p.icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{p.label}</span>
                             </div>
                             <Switch checked={p.active} className="data-[state=checked]:bg-slate-900" />
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="p-16 rounded-[4rem] border border-slate-50 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] space-y-12 relative overflow-hidden">
                       <div className="absolute top-16 right-16 scale-150 opacity-[0.02] pointer-events-none">
                          <Rocket className="h-40 w-40 text-slate-900" />
                       </div>
                       <div className="space-y-4">
                          <h5 className="text-2xl font-bold text-slate-900 tracking-tight uppercase italic">Candidate Allocation</h5>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.4em]">Protocol Participant Boundaries</p>
                       </div>
                       
                       <div className="space-y-10">
                          <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4">
                             <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                <span>Retake Capability</span>
                                <span className="text-slate-900">{selectedExam.max_attempts || 1} ATTEMPTS</span>
                             </div>
                             <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900" style={{ width: `${Math.min(100, (selectedExam.max_attempts || 1) * 20)}%` }} />
                             </div>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="flex-1 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] block mb-2">Subject Matter Vectors</span>
                                <span className="text-3xl font-bold text-slate-900 tracking-tighter italic">{selectedExam.total_questions || 10} ITEMS</span>
                             </div>
                             <Button className="h-24 w-24 rounded-full bg-slate-900 hover:bg-black text-white flex flex-col items-center justify-center p-0 shadow-2xl transition-all hover:scale-105">
                                <Plus className="h-5 w-5 mb-1" />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Add Meta</span>
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* n8n Neural Core Sync */}
                  <div className="p-20 rounded-[5rem] bg-slate-900 text-white relative overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] group">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                     <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 blur-[150px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                     
                     <div className="relative z-10 space-y-16">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                           <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                 <Zap className="h-8 w-8 text-yellow-400" />
                                 <h4 className="text-4xl font-bold tracking-tighter uppercase italic leading-none">Neural <br/> Synchronizer</h4>
                              </div>
                              <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.6em] max-w-sm">Autonomous subject matter population via topic analysis engine</p>
                           </div>
                           <Button className="h-20 px-16 rounded-[2.5rem] bg-white hover:bg-slate-100 text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95" onClick={handleGenerateAI} disabled={isGenerating}>
                             {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Dna className="h-5 w-5" />}
                             {isGenerating ? 'Analyzing Logic Grid...' : 'Sync Subject Matter'}
                           </Button>
                        </div>

                        <div className="relative group/input max-w-4xl mx-auto">
                           <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[3rem] blur opacity-20 group-hover/input:opacity-50 transition duration-700" />
                           <Input 
                             placeholder="Define assessment subject vectors..." 
                             className="relative h-24 rounded-[3rem] bg-white/5 border-white/10 text-white font-bold text-2xl px-12 placeholder:text-white/10 focus:border-white/20 transition-all outline-none shadow-none" 
                             value={aiPrompt}
                             onChange={(e) => setAiPrompt(e.target.value)}
                           />
                        </div>

                        {generatedQuestions.length > 0 && (
                          <div className="grid md:grid-cols-3 gap-8 pt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                             {generatedQuestions.map(q => (
                               <div key={q.id} className="p-12 rounded-[3.5rem] bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group/card">
                                  <Badge className="bg-white/10 text-white/60 border-none text-[8px] font-bold uppercase tracking-widest mb-6 group-hover/card:bg-white group-hover/card:text-slate-900 transition-colors uppercase italic">{q.type} item</Badge>
                                  <p className="text-sm font-medium text-white/80 leading-relaxed group-hover/card:text-white transition-colors">"{q.text}"</p>
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Clean Footer Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-12 pt-20 border-t border-slate-50">
                    <div className="flex items-center gap-10">
                       <div className="flex items-center gap-4 text-slate-400 group cursor-help">
                          <ShieldCheck className="h-5 w-5 group-hover:text-slate-900 transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">AOTMS SECURED</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-400 group cursor-help">
                          <Activity className="h-5 w-5 group-hover:text-slate-900 transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">VECTORS VERIFIED</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" className="h-18 px-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-300 hover:text-slate-900 hover:bg-slate-50" onClick={() => setIsConfigureOpen(false)}>Discard Workspace</Button>
                      <Button 
                        className="h-18 px-20 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold uppercase text-[11px] tracking-widest shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.05] active:scale-95 gap-4" 
                        onClick={handleDeploySync}
                        disabled={createQuestions.isPending || !generatedQuestions.length}
                      >
                        {createQuestions.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        {createQuestions.isPending ? 'Committing Core...' : 'Commence Deployment'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="h-60" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
