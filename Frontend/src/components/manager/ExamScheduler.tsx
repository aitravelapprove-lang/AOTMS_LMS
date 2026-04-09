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

        <div className="absolute inset-0 bg-white/40 group-hover:bg-white/80 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[4px]">
          <div className="flex flex-col items-center gap-2 text-slate-900">
            <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
              <Settings2 className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Protocol Setup
            </span>
          </div>
        </div>

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
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {exam.duration_minutes} min
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-100" />
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3" />
              {exam.scheduled_date && !isNaN(new Date(exam.scheduled_date).getTime())
                ? format(new Date(exam.scheduled_date), "MMM dd")
                : "Unscheduled"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          {!isPast && exam.approval_status === "approved" && (
            <Button
              className={cn(
                "flex-1 h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95",
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

export function ExamScheduler() {
  const { user, userRole } = useAuth();
  const { data: rawRatings } = useInstructorRatings();
  const ratings = useMemo(() => Array.isArray(rawRatings) ? rawRatings : [], [rawRatings]);
  const { toast } = useToast();
  const { data: rawExams, isLoading } = useExams();
  const exams = useMemo(() => Array.isArray(rawExams) ? rawExams : [], [rawExams]);
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
    },
  });

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
            <Button className="rounded-xl sm:rounded-2xl h-11 sm:h-14 px-6 sm:px-12 bg-gradient-to-r from-[#001F3D] to-[#000d1a] hover:from-[#FD5A1A] hover:to-[#e04d13] text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-[0_10px_40px_rgba(0,31,61,0.2)] hover:shadow-[0_10px_40px_rgba(253,90,26,0.3)] transition-all duration-500 hover:scale-[1.02] active:scale-95 group">
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
              Commence Scheduling
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1rem)] sm:max-w-4xl p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-[3rem] bg-white flex flex-col max-h-[90vh]">
            <div className="flex h-full">
              {/* Premium Color Sidebar */}
              <div className="hidden lg:flex w-24 bg-gradient-to-b from-slate-900 via-[#001F3D] to-black p-6 flex-col items-center justify-between border-r border-slate-800">
                <div className="space-y-8 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg shadow-primary/20">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div className="h-0.5 w-6 bg-slate-800 rounded-full" />
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-[#FD5A1A] border border-orange-500/30">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
              <DialogHeader className="px-8 pt-8 pb-6 relative space-y-1.5 bg-white border-b border-slate-100 shrink-0">
                <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="text-slate-900">Initialize</span>
                  <span className="text-[#FD5A1A] font-black italic">Workspace</span>
                </DialogTitle>
                <DialogDescription className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.3em]">
                  Master Assessment Configuration Framework
                </DialogDescription>
              </DialogHeader>

              <div
                className="px-8 pb-8 pt-6 flex-1 min-h-0 overflow-y-auto admin-scrollbar bg-white"
                id="exam-form-scroll-container"
              >

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmitProfile)}
                      className="space-y-7"
                    >
                      {/* Row 1: Title + Category */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                Assessment Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Final Certification Protocol"
                                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 font-semibold px-4 text-[14px] text-slate-800 focus:border-primary focus:bg-white transition-all outline-none shadow-none placeholder:text-slate-300"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="exam_type"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                Portal Category
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl border border-slate-200 bg-slate-50 font-semibold px-4 text-[14px] text-slate-800 focus:border-primary transition-all outline-none">
                                    <SelectValue placeholder="Select Category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                  {["mock", "certification", "live"].map((t) => (
                                    <SelectItem
                                      key={t}
                                      value={t}
                                      className="font-semibold py-2.5 text-[13px] capitalize"
                                    >
                                      {t.charAt(0).toUpperCase() + t.slice(1)} Portal
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Numeric Parameters */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Exam Parameters</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Start Timeline */}
                          <FormField
                            control={form.control}
                            name="scheduled_date"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#FD5A1A] flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" /> Start Date
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    className="h-11 rounded-xl border border-slate-200 bg-white font-semibold px-4 text-[13px] focus:border-[#FD5A1A] transition-all outline-none"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Duration */}
                          <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                  Duration (Min)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                      type="number"
                                      className="h-11 rounded-xl border border-slate-200 bg-white font-semibold pl-9 pr-4 text-[14px] text-slate-800 focus:border-primary transition-all outline-none"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Total Marks */}
                          <FormField
                            control={form.control}
                            name="total_marks"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                  Total Marks
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                      type="number"
                                      className="h-11 rounded-xl border border-slate-200 bg-white font-semibold pl-9 pr-4 text-[14px] text-slate-800 focus:border-primary transition-all outline-none"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Negative Marks */}
                          <FormField
                            control={form.control}
                            name="negative_marking"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                  Neg. Marks
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.25"
                                    className="h-11 rounded-xl border border-slate-200 bg-white font-semibold px-4 text-[14px] text-slate-800 focus:border-primary transition-all outline-none"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Retakes */}
                          <FormField
                            control={form.control}
                            name="max_attempts"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                  Retakes
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-11 rounded-xl border border-slate-200 bg-white font-semibold px-4 text-[14px] text-slate-800 focus:border-primary transition-all outline-none"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Shuffle Toggle */}
                      <FormField
                        control={form.control}
                        name="shuffle_questions"
                        render={({ field }) => (
                          <div
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                              field.value
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => field.onChange(!field.value)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                                field.value ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <Shuffle className="h-5 w-5" />
                              </div>
                              <div>
                                <p className={`text-[13px] font-bold transition-colors ${
                                  field.value ? 'text-primary' : 'text-slate-700'
                                }`}>Randomization Protocol</p>
                                <p className="text-[11px] text-slate-400 font-medium">Shuffle questions for each session</p>
                              </div>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        )}
                      />

                      {/* Instructions */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                              Guideline Repository
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Define the core logic and constraints for candidates..."
                                className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 text-[14px] focus:bg-white focus:border-primary transition-all outline-none resize-none leading-relaxed"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-12 flex-1 rounded-xl font-bold text-[13px] tracking-wide text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50"
                          onClick={() => setIsAddOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createExam.isPending}
                          className="h-12 flex-[2.5] rounded-xl bg-gradient-to-r from-slate-900 to-[#001F3D] text-white font-bold text-[14px] tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#FD5A1A]/0 via-[#FD5A1A]/10 to-[#FD5A1A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          {createExam.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Initialize Exam</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
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
                ? `Approval (${pendingExams.length})`
                : tab === "approved"
                  ? `Approved Protocols (${approvedExams.length})`
                  : `Rejected (${rejectedExams.length})`}
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
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
                      <Rocket className="h-12 w-12 text-slate-100 mx-auto mb-6" />
                      <h4 className="text-2xl font-bold text-slate-200 uppercase tracking-[0.3em] font-sans">
                        Workspace Empty
                      </h4>
                      <p className="text-[10px] font-medium text-slate-200 uppercase tracking-widest mt-2">
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
