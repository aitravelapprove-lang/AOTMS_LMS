import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useExams,
  useQuestions,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  useCreateQuestion,
  type Exam,
} from "@/hooks/useManagerData";
import { useInstructorRatings } from "@/hooks/useInstructorData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Settings2,
  Loader2,
  Layout,
  Rocket,
  RefreshCw,
  X,
  Zap,
  ShieldCheck,
  Dna,
  ArrowRight,
  ArrowLeft,
  Target,
  Activity,
  ShieldAlert,
  GraduationCap,
  Scale,
  PlayCircle,
  FileText,
  Star,
  Shuffle,
  Brain,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

// ─── 1. Validation Schema ────────────────────────────────────────────────────

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  exam_type: z.string().min(1, "Please select or enter an exam type"),
  assigned_image: z.string().optional(),
  scheduled_date: z.string().optional(),
  duration_minutes: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .default(60),
  total_marks: z.coerce
    .number()
    .min(1, "Total marks must be at least 1")
    .default(100),
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
  marking_scheme: z.enum(["standard", "weighted", "fixed"]).default("standard"),
  exam_mode: z.enum(["automated", "manual"]).default("automated"),
  custom_fields: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
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

// ─── 2. Internal Components ──────────────────────────────────────────────────

function getImageSrc(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `/s3/public/${path}`;
}

function ExamCard({
  exam,
  onUpdate,
  onDelete,
  onConfigure,
  isPast,
  userRole,
}: {
  exam: Exam;
  onUpdate: (params: {
    id: string;
    status?: string;
    approval_status?: string;
  }) => void;
  onDelete: (id: string) => void;
  onConfigure?: (exam: Exam) => void;
  isPast?: boolean;
  userRole?: string | null;
}) {
  const isPending = exam.approval_status === "pending";
  const isRejected = exam.approval_status === "rejected";
  const imgSource = getImageSrc(exam.assigned_image);

  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group h-full flex flex-col rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer",
        isPast && "opacity-75 grayscale-[0.2]",
      )}
      onClick={() => onConfigure?.(exam)}
    >
      <div className="h-44 relative bg-slate-50 overflow-hidden border-b border-slate-50">
        {imgSource ? (
          <img
            src={imgSource}
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-700"
            alt={exam.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Layout className="h-10 w-10 text-slate-200" />
          </div>
        )}

        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all duration-500 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]" />

        <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
          <Badge className="bg-white hover:bg-white text-slate-900 border border-slate-100 text-[9px] font-bold uppercase tracking-widest h-6 rounded-full px-3 shadow-sm">
            {exam.exam_type}
          </Badge>
          <Badge
            className={cn(
              "border-none text-[9px] font-bold uppercase tracking-widest h-6 rounded-full px-3",
              isPending
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                : isRejected
                  ? "bg-rose-500 text-white"
                  : exam.status === "active"
                    ? "bg-slate-900 text-white animate-pulse"
                    : "bg-slate-200 text-slate-500",
            )}
          >
            {isPending
              ? "Under review"
              : isRejected
                ? "Rejected"
                : exam.approval_status === "approved"
                  ? "Approved"
                  : exam.status || "Draft"}
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-8 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-3">
          <h4 className="font-bold text-base sm:text-xl text-slate-900 leading-tight transition-colors line-clamp-2 uppercase tracking-tighter">
            {exam.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <Clock className="h-2.5 w-2.5" /> {exam.duration_minutes}m
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <Target className="h-2.5 w-2.5" /> {exam.total_marks}pts
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <ShieldAlert className="h-2.5 w-2.5" /> -{exam.negative_marking || 0}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <RefreshCw className="h-2.5 w-2.5" /> {exam.max_attempts}x
            </span>
            <span className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border", exam.shuffle_questions ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400")}>
              <Shuffle className="h-2.5 w-2.5" /> {exam.shuffle_questions ? "Shuffled" : "Fixed"}
            </span>
          </div>

          {exam.custom_fields && exam.custom_fields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
               {exam.custom_fields.slice(0, 3).map((f, i: number) => (
                 <Badge key={i} variant="outline" className="text-[7px] font-bold uppercase tracking-tighter h-5 border-slate-100 text-slate-400 px-1.5 rounded-sm">
                    {f.label}: {f.value}
                 </Badge>
               ))}
               {exam.custom_fields.length > 3 && <span className="text-[7px] font-bold text-slate-300">+{exam.custom_fields.length - 3}</span>}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-1">
             <CalendarIcon className="h-3 w-3" />
             {exam.scheduled_date && !isNaN(new Date(exam.scheduled_date).getTime())
               ? format(new Date(exam.scheduled_date), "MMM dd, yyyy")
               : "Unscheduled"}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          {!isPast && exam.approval_status === "approved" && (
            <div className="flex flex-1 gap-2">
              <Button
                className={cn(
                  "flex-[2] h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95",
                  exam.status === "active"
                    ? "bg-slate-900 hover:bg-black text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    id: exam.id,
                    status: exam.status === "active" ? "completed" : "active",
                  });
                }}
              >
                {exam.status === "active" ? "End Protocol" : "Launch Protocol"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 font-bold text-[9px] uppercase tracking-widest transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure?.(exam);
                }}
              >
                View Analysis
              </Button>
            </div>
          )}
          {exam.approval_status === "pending" && userRole !== "instructor" && (
            <div className="flex flex-1 gap-2">
              <Button
                className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    id: exam.id,
                    approval_status: "approved",
                    status: "ready",
                  });
                }}
              >
                Approve
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ id: exam.id, approval_status: "rejected" });
                }}
              >
                Reject
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-2xl text-slate-200 hover:text-destructive hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(exam.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 3. Main Horizontal Scheduler ──────────────────────────────────────────

export function ExamScheduler({ onNavigateToRepository }: { onNavigateToRepository?: () => void }) {
  const { user, userRole } = useAuth();
  const { data: rawRatings } = useInstructorRatings();
  const ratings = useMemo(() => Array.isArray(rawRatings) ? rawRatings : [], [rawRatings]);
  const { toast } = useToast();
  const { data: rawExams, isLoading } = useExams();
  const exams = useMemo(() => Array.isArray(rawExams) ? rawExams : [], [rawExams]);
  const { data: rawQuestions } = useQuestions();
  const questions = useMemo(() => Array.isArray(rawQuestions) ? rawQuestions : [], [rawQuestions]);
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [isOtherType, setIsOtherType] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      exam_type: "mock",
      assigned_image: "",
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
      scheduled_date: "",
      source_topic: "",
      question_count: 10,
      marking_scheme: "standard",
      exam_mode: "automated",
      custom_fields: [{ label: "Batch", value: "Default" }],
    },
  });

  const customFields = form.watch("custom_fields") || [];

  const addCustomField = () => {
    form.setValue("custom_fields", [...customFields, { label: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    form.setValue("custom_fields", updated);
  };

  const updateCustomField = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...customFields];
    updated[index][key] = val;
    form.setValue("custom_fields", updated);
  };

  const onDropPoster = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = e.dataTransfer.getData("text/plain");
      if (url && (url.startsWith("http") || url.startsWith("data:"))) {
        form.setValue("assigned_image", url);
        toast({ title: "Visual Identity Attached" });
        return;
      }
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) =>
          form.setValue("assigned_image", ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [form, toast],
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        form.setValue("assigned_image", ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data: ExamFormValues) => {
    if (!user?.id) return;
    try {
      const passing_marks = Math.round(
        (data.total_marks * data.passing_percentage) / 100,
      );
      await createExam.mutateAsync({
        ...(data as Omit<Exam, "id" | "created_at">),
        course_id: null,
        passing_marks,
        status: "draft",
        approval_status: "pending",
        created_by: user.id || "",
        scheduled_date: data.scheduled_date || new Date().toISOString(),
      });
      setIsAddOpen(false);
      form.reset();
      toast({ title: "Architecture Successfully Committed" });
    } catch (error) {
      console.error(error);
    }
  };

  const pendingExams = useMemo(
    () => exams.filter((e) => e.approval_status === "pending"),
    [exams],
  );
  const approvedExams = useMemo(
    () => exams.filter((e) => e.approval_status === "approved"),
    [exams],
  );
  const rejectedExams = useMemo(
    () => exams.filter((e) => e.approval_status === "rejected"),
    [exams],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-6">
        <div />
        <Dialog
          open={isAddOpen}
          onOpenChange={(val) => {
            setIsAddOpen(val);
            if (!val) {
              setIsOtherType(false);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-xl sm:rounded-2xl h-11 sm:h-14 px-6 sm:px-12 bg-white hover:bg-slate-50 text-black border-2 border-slate-100 font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl hover:shadow-2xl hover:border-black transition-all duration-500 hover:scale-[1.02] active:scale-95 group">
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
              Commence Scheduling
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[640px] p-0 overflow-hidden border-none shadow-[0_0_80px_rgba(0,0,0,0.15)] rounded-[2rem] bg-white flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="flex flex-col h-full overflow-hidden">
               {/* Image-Style Stepper Header */}
                <div className="px-8 pt-8 pb-4 border-b border-slate-50 shrink-0 bg-white">
                  <div className="max-w-md mx-auto flex items-center justify-between relative mb-6">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0" />
                        {[
                          { n: "1", label: "Protocol" },
                          { n: "2", label: "Constraints" },
                          { n: "3", label: "Final" }
                        ].map((step, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center gap-1 sm:gap-2 group/step">
                             <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs transition-all duration-500 border-2 ${idx === 0 ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-300 group-hover/step:border-slate-200'}`}>
                                {step.n}
                             </div>
                             <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-colors ${idx === 0 ? 'text-black' : 'text-slate-300'}`}>{step.label}</span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <DialogHeader className="p-5 sm:p-8 relative space-y-1 bg-white border-b border-slate-50 shrink-0">
                  <DialogTitle className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
                    <span className="bg-gradient-to-r from-slate-900 to-primary bg-clip-text text-transparent">Initialize</span> 
                    <span className="text-[#FD5A1A] italic">Workspace</span>
                  </DialogTitle>
                  <DialogDescription className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                    Master Assessment Configuration Framework
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white relative group/form-scroll" id="exam-form-scroll-container">
                  {/* Floating Scroll Assistant */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-3 pointer-events-none opacity-0 group-hover/form-scroll:opacity-100 transition-all duration-700 translate-x-4 group-hover/form-scroll:translate-x-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-slate-900 shadow-2xl text-white hover:bg-[#FD5A1A] transition-all hover:scale-110 active:scale-95 pointer-events-auto border border-slate-700/50"
                      onClick={() => {
                        const container = document.getElementById('exam-form-scroll-container');
                        if (container) {
                          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                        }
                      }}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white shadow-xl text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95 pointer-events-auto border border-slate-100"
                      onClick={() => {
                        const container = document.getElementById('exam-form-scroll-container');
                        if (container) {
                          container.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto admin-scrollbar p-0 sm:p-2 bg-white">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmitProfile)}
                        className="p-6 sm:p-10 space-y-14"
                      >
                        {/* Visual Identity Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block">
                                  Visual Identity Matrix
                                </FormLabel>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Architectural branding & poster assets</p>
                              </div>
                              {form.watch("assigned_image") && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase px-3 rounded-full">Asset Secured</Badge>
                              )}
                            </div>
                            
                            <div
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onDrop={onDropPoster}
                              className={cn(
                                "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] sm:rounded-[3rem] transition-all duration-1000 overflow-hidden min-h-[240px] sm:min-h-[320px] shadow-sm",
                                form.watch("assigned_image") 
                                  ? "border-emerald-500/50 bg-emerald-50/10" 
                                  : "border-slate-200 bg-slate-50/20 hover:bg-white hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5"
                              )}
                            >
                              {form.watch("assigned_image") ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 group/preview">
                                  <img
                                    src={getImageSrc(form.watch("assigned_image")) || ""}
                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/preview:scale-110"
                                    alt="Identity Poster"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover/preview:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-12 gap-4 backdrop-blur-[2px]">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => form.setValue("assigned_image", "")}
                                      className="rounded-2xl bg-white/20 hover:bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest h-14 px-12 backdrop-blur-md border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-95"
                                    >
                                      Reset Identity
                                    </Button>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="flex flex-col items-center gap-6 p-8 text-center relative z-10">
                                  <div className="h-24 w-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all duration-700 border border-slate-100">
                                    <ImageIcon className="h-10 w-10" />
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                                      Drop <span className="text-primary italic">Artwork</span>
                                    </h4>
                                    <input
                                      type="file"
                                      id="poster-upload"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => document.getElementById("poster-upload")?.click()}
                                      className="rounded-[1.5rem] border-slate-200 font-black uppercase text-[10px] tracking-widest h-14 px-10 hover:bg-slate-900 hover:text-white hover:border-slate-900 bg-white shadow-xl shadow-slate-200/20 transition-all"
                                    >
                                      Browse File
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>

                        {/* Question Strategy */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 space-y-8 relative overflow-hidden shadow-inner">
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                              <BrainCircuit className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Logic Acquisition Strategy</h4>
                          </div>

                          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10 relative z-10">
                            <FormField
                              control={form.control}
                              name="exam_mode"
                              render={({ field }) => (
                                <FormItem className="space-y-4">
                                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-bold">Creation Mode</FormLabel>
                                  <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                      <FormItem>
                                        <FormControl><RadioGroupItem value="automated" className="hidden" id="mode-auto" /></FormControl>
                                        <Label htmlFor="mode-auto" className={cn("flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all cursor-pointer text-center gap-4 min-h-[140px]", field.value === "automated" ? "bg-white border-primary text-primary shadow-lg" : "bg-white border-slate-200 text-slate-600 font-bold hover:border-primary/20")}>
                                          <Zap className={cn("h-8 w-8", field.value === "automated" ? "text-primary" : "text-slate-200")} />
                                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Automated</span>
                                        </Label>
                                      </FormItem>
                                      <FormItem>
                                        <FormControl><RadioGroupItem value="manual" className="hidden" id="mode-manual" /></FormControl>
                                        <Label htmlFor="mode-manual" className={cn("flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all cursor-pointer text-center gap-4 min-h-[140px]", field.value === "manual" ? "bg-white border-primary text-primary shadow-lg" : "bg-white border-slate-200 text-slate-600 font-bold hover:border-primary/20")}>
                                          <Plus className={cn("h-8 w-8", field.value === "manual" ? "text-primary" : "text-slate-200")} />
                                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Manual</span>
                                        </Label>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {form.watch("exam_mode") === "automated" ? (
                              <div className="space-y-6">
                                <FormField
                                  control={form.control}
                                  name="source_topic"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-bold">Target Repository Node</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-16 rounded-[1.5rem] bg-white border-slate-200 text-slate-900 font-bold px-6 shadow-sm">
                                            <SelectValue placeholder="Select Topic" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-slate-200 shadow-3xl">
                                          {[...new Set(questions.map(q => q.topic))].map((t) => (
                                            <SelectItem key={t} value={t} className="font-bold py-3 uppercase text-[10px] tracking-widest">
                                              {t}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="question_count"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600">Total Selection</FormLabel>
                                        <span className="text-xs font-black text-slate-900">{field.value} Q's</span>
                                      </div>
                                      <FormControl>
                                        <Input type="number" className="h-16 rounded-[1.5rem] bg-white border-slate-200 text-slate-900 font-black px-6 shadow-sm" {...field} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center gap-4 bg-white/50">
                                <Plus className="h-8 w-8 text-slate-200" />
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest max-w-[200px]">Manual Mode Activated.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600">Assessment Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Final Protocol" className="h-18 rounded-3xl border-2 border-slate-200 bg-slate-50/50 font-bold px-8 focus:border-primary focus:bg-white text-slate-900 shadow-sm" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="exam_type"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600">Portal Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-18 rounded-3xl border-2 border-slate-200 bg-slate-50/50 font-bold px-8 focus:border-primary transition-all text-slate-900 outline-none">
                                      <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-3xl border-slate-200 shadow-2xl">
                                    {["mock", "certification", "live"].map((t) => (
                                      <SelectItem key={t} value={t} className="font-bold py-4 uppercase text-[10px] tracking-widest">{t.toUpperCase()} PORTAL</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Numeric Parameters Grid */}
                        <div className="bg-gradient-to-br from-slate-50 via-white to-primary/5 rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-md relative overflow-hidden">
                          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 relative z-10 w-full">
                            <FormField control={form.control} name="scheduled_date" render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-[#FD5A1A]">Start Timeline</FormLabel>
                                <FormControl><Input type="datetime-local" className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-bold px-6 text-slate-900 focus:border-primary shadow-sm" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-600 font-bold">Duration (Min)</FormLabel>
                                <div className="relative group"><Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-bold pl-14 text-slate-900 focus:border-primary shadow-sm" {...field} /></div>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="total_marks" render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-600 font-bold">Final Marks</FormLabel>
                                <div className="relative group"><Target className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-bold pl-14 text-slate-900 focus:border-primary shadow-sm" {...field} /></div>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="negative_marking" render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-600 font-bold">Neg. Marks</FormLabel>
                                <Input type="number" step="0.25" className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-bold px-8 text-slate-900 focus:border-primary shadow-sm" {...field} />
                              </FormItem>
                            )} />
                          </div>

                          <div className="mt-14 pt-12 border-t border-slate-200 space-y-12">
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12">
                              <FormField control={form.control} name="passing_percentage" render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-600 font-bold">Success Threshold (%)</FormLabel>
                                    <span className="text-xs font-black text-primary">{field.value}%</span>
                                  </div>
                                  <input type="range" min="0" max="100" step="5" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="max_attempts" render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-600 font-bold">Iteration Limit</FormLabel>
                                  <Input type="number" className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-bold px-8 text-slate-900 focus:border-primary shadow-sm" {...field} />
                                </FormItem>
                              )} />
                            </div>

                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10">
                              <FormField control={form.control} name="browser_security" render={({ field }) => (
                                <div className={cn("p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group shadow-sm", field.value ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200")} onClick={() => field.onChange(!field.value)}>
                                  <div className="flex items-center gap-6">
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all", field.value ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400")}><ShieldCheck className="h-6 w-6" /></div>
                                    <div className="text-left"><h4 className="text-[10px] font-black uppercase tracking-widest">Secure Node</h4><p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Lock Focus</p></div>
                                  </div>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                                </div>
                              )} />
                              <FormField control={form.control} name="proctoring_enabled" render={({ field }) => (
                                <div className={cn("p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group shadow-sm", field.value ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200")} onClick={() => field.onChange(!field.value)}>
                                  <div className="flex items-center gap-6">
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all", field.value ? "bg-white text-emerald-600" : "bg-slate-100 text-slate-400")}><Activity className="h-6 w-6" /></div>
                                    <div className="text-left"><h4 className="text-[10px] font-black uppercase tracking-widest">AI Proctoring</h4><p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Telemetry</p></div>
                                  </div>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                                </div>
                              )} />
                            </div>

                            <FormField control={form.control} name="shuffle_questions" render={({ field }) => (
                              <div className={cn("p-8 sm:p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between group gap-6 shadow-sm", field.value ? "bg-primary/5 border-primary" : "bg-white border-slate-200")} onClick={() => field.onChange(!field.value)}>
                                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                  <div className={cn("h-16 w-16 rounded-[1.25rem] flex items-center justify-center transition-all", field.value ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-100 text-slate-400")}><Shuffle className="h-7 w-7" /></div>
                                  <div className="space-y-1"><h4 className={cn("text-sm font-black uppercase tracking-widest", field.value ? "text-primary" : "text-slate-600")}>Randomization Protocol</h4><p className="text-[10px] font-semibold text-slate-500 max-w-sm uppercase">Unique sorting vectors for each session.</p></div>
                                </div>
                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                              </div>
                            )} />
                          </div>
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem className="space-y-6">
                            <div className="flex items-center gap-4"><div className="h-1 w-10 bg-slate-200 rounded-full" /><FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-600">Guideline Repository</FormLabel></div>
                            <FormControl><Textarea placeholder="Core logic for candidates..." className="min-h-[180px] rounded-3xl border-2 border-slate-200 bg-slate-50/20 p-10 font-bold text-slate-700 focus:bg-white focus:border-primary transition-all text-sm italic" {...field} /></FormControl>
                          </FormItem>
                        )} />

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-8 pb-10">
                          <Button type="button" variant="ghost" className="h-20 flex-1 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] text-slate-400 hover:text-rose-500 transition-all" onClick={() => setIsAddOpen(false)}>Abort</Button>
                          <Button type="submit" disabled={createExam.isPending} className="h-20 flex-[2.5] rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[13px] shadow-2xl flex items-center justify-center gap-6 active:scale-95 group relative overflow-hidden">
                            {createExam.isPending ? (<><Loader2 className="h-7 w-7 animate-spin" /><span>PROCESSING...</span></>) : (<><span>Initialize Exam</span><div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#FD5A1A] transition-colors"><ArrowRight className="h-6 w-6 group-hover:translate-x-1" /></div></>)}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>

              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 sm:mb-12 h-auto sm:h-20 rounded-2xl sm:rounded-[2.5rem] bg-white border border-slate-100 p-1.5 sm:p-2 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2">
          {["pending", "approved", "rejected"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 h-10 sm:h-full rounded-xl sm:rounded-full font-bold text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500 whitespace-nowrap"
            >
              {tab === "pending"
                ? `Pending (${pendingExams.length})`
                : tab === "approved"
                  ? `Approve (${approvedExams.length})`
                  : `Reject (${rejectedExams.length})`}
            </TabsTrigger>
          ))}
        </TabsList>
        {["pending", "approved", "rejected"].map((tabVal) => (
          <TabsContent
            key={tabVal}
            value={tabVal}
            className="focusVisible:outline-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {(() => {
                const list =
                  tabVal === "pending"
                    ? pendingExams
                    : tabVal === "approved"
                      ? approvedExams
                      : rejectedExams;
                if (list.length === 0)
                  return (
                    <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-400/30 rounded-[4rem] bg-slate-50/10 backdrop-blur-[2px]">
                      <Rocket className="h-12 w-12 text-slate-900/20 mx-auto mb-6" />
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-[0.3em] italic">
                        Workspace Empty
                      </h4>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                        Analytical data set is currently zero
                      </p>
                    </div>
                  );
                return list.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    userRole={userRole}
                    onUpdate={(p) => updateExam.mutate({ id: p.id, ...p })}
                    onDelete={(id) => deleteExam.mutate(id)}
                    onConfigure={() => onNavigateToRepository?.()}
                  />
                ));
              })()}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
