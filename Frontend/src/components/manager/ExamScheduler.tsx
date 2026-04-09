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
          <DialogContent className="w-full sm:max-w-[750px] p-0 overflow-hidden border-none shadow-[0_0_80px_rgba(0,0,0,0.15)] rounded-none sm:rounded-[2.5rem] bg-white flex flex-col max-h-screen sm:max-h-[85vh]">
            <div className="flex flex-col h-full overflow-hidden">
               {/* Image-Style Stepper Header */}
               <div className="px-8 pt-10 pb-6 border-b border-slate-50 shrink-0 bg-white">
                  <div className="max-w-xl mx-auto flex items-center justify-between relative mb-8">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0" />
                     {[
                       { n: "1", label: "Protocol Details" },
                       { n: "2", label: "Constraints" },
                       { n: "3", label: "Finalize" }
                     ].map((step, idx) => (
                       <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group/step">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 border-2 ${idx === 0 ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-300 group-hover/step:border-slate-200'}`}>
                             {step.n}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${idx === 0 ? 'text-black' : 'text-slate-300'}`}>{step.label}</span>
                       </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-0.5">
                      <DialogTitle className="text-2xl font-black text-black tracking-tighter uppercase italic">Protocol Setup</DialogTitle>
                      <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocol Configuration Terminal</DialogDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full hover:bg-slate-50 transition-colors"
                      onClick={() => setIsAddOpen(false)}
                    >
                      <X className="h-5 w-5 text-black" />
                    </Button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto admin-scrollbar p-6 sm:p-10 bg-white">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProfile)} className="max-w-4xl mx-auto space-y-16">
                      
                      {/* Section 1: Visual Identity (Poster View) */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <span className="h-px flex-1 bg-slate-100" />
                           <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Visual Identity</Label>
                           <span className="h-px flex-1 bg-slate-100" />
                        </div>
                        
                        <div 
                           className="aspect-video w-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group/poster cursor-pointer hover:border-black transition-all duration-500"
                           onDragOver={(e) => e.preventDefault()}
                           onDrop={onDropPoster}
                           onClick={() => document.getElementById('poster-upload')?.click()}
                        >
                           {form.watch("assigned_image") ? (
                             <>
                               <img src={getImageSrc(form.watch("assigned_image"))!} className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110" />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                  <div className="flex flex-col items-center gap-3">
                                     <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-2xl">
                                        <ImageIcon className="h-6 w-6 text-black" />
                                     </div>
                                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Poster</span>
                                  </div>
                               </div>
                             </>
                           ) : (
                             <div className="flex flex-col items-center gap-4 text-slate-300 group-hover/poster:text-black transition-colors">
                                <ImageIcon className="h-16 w-16" />
                                <div className="text-center">
                                   <p className="text-sm font-bold uppercase tracking-widest">Drop Youtube Thumbnail Size Image</p>
                                   <p className="text-[10px] font-medium opacity-60">Standard 16:9 Aspect Ratio (e.g. 1280x720)</p>
                                </div>
                             </div>
                           )}
                           <input id="poster-upload" type="file" hidden accept="image/*" onChange={handleFileUpload} />
                        </div>
                      </div>

                      {/* Section 2: Core Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black">Protocol Title</FormLabel>
                              <FormControl>
                               <Input 
                                  placeholder="E.g. FullStack Certification A" 
                                  className="h-14 rounded-2xl border border-slate-100 bg-white font-bold px-5 text-black focus:border-black transition-all shadow-none outline-none border-b-[3px] border-b-slate-50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scheduled_date"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black">Release Timeline</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local"
                                  className="h-14 rounded-2xl border border-slate-100 bg-white font-bold px-5 text-black focus:border-black transition-all shadow-none outline-none border-b-[3px] border-b-slate-50"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 3: Performance Tuning */}
                      <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                           {[
                             { name: "duration_minutes", label: "Duration", icon: Clock },
                             { name: "total_marks", label: "Max Marks", icon: Target },
                             { name: "negative_marking", label: "Neg Marking", icon: ShieldAlert },
                             { name: "max_attempts", label: "Retakes", icon: RefreshCw },
                           ].map((item) => (
                             <FormField
                               key={item.name}
                               control={form.control}
                               name={item.name as keyof ExamFormValues}
                               render={({ field }) => (
                                 <FormItem className="space-y-2">
                                   <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <item.icon className="h-3 w-3" /> {item.label}
                                   </FormLabel>
                                   <FormControl>
                                     <Input 
                                       type="number" 
                                       className="h-12 rounded-xl border-none bg-white font-black text-center text-black focus:ring-2 focus:ring-black transition-all shadow-sm"
                                       {...field}
                                       value={(typeof field.value === 'number' || typeof field.value === 'string') ? field.value : ''}
                                     />
                                   </FormControl>
                                 </FormItem>
                               )}
                             />
                           ))}
                        </div>
                      </div>

                      {/* Section 4: Shuffling Protocol */}
                      <div className="space-y-6">
                        <FormField
                           control={form.control}
                           name="shuffle_questions"
                           render={({ field }) => (
                             <div 
                               className={`p-10 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between group ${field.value ? 'bg-white border-orange-500 shadow-2xl shadow-orange-500/10' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                             >
                                <div className="flex items-center gap-8">
                                   <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all ${field.value ? 'bg-orange-500 text-white rotate-6' : 'bg-white text-slate-300 shadow-sm'}`}>
                                      <Shuffle className="h-7 w-7" />
                                   </div>
                                   <div className="space-y-1">
                                      <h4 className={`text-sm font-black uppercase tracking-widest transition-colors ${field.value ? 'text-black' : 'text-slate-400'}`}>Shuffle Integrity</h4>
                                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Randomize session data vectors</p>
                                   </div>
                                </div>
                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-orange-500" />
                             </div>
                           )}
                        />
                      </div>

                      {/* Section 5: Custom Protocol Nodes (Others) */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-black">Custom Protocol Nodes (Others)</Label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-full border-black text-black font-black text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-all px-4"
                              onClick={addCustomField}
                            >
                              Add Proto Node
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                           {customFields.map((field: { label: string; value: string }, index: number) => (
                             <div key={index} className="flex gap-3 group/node">
                                <Input 
                                  placeholder="Label" 
                                  className="flex-1 h-12 rounded-xl bg-slate-50 border-none font-bold text-xs" 
                                  value={field.label}
                                  onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                                />
                                <Input 
                                  placeholder="Value" 
                                  className="flex-[2] h-12 rounded-xl bg-slate-50 border-none font-bold text-xs" 
                                  value={field.value}
                                  onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                                />
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => removeCustomField(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                             </div>
                           ))}
                           {customFields.length === 0 && (
                             <div className="py-8 text-center border border-dashed border-slate-100 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No custom nodes attached</p>
                             </div>
                           )}
                        </div>
                      </div>

                      {/* Submit Footer */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-10">
                         <Button 
                           type="submit" 
                           disabled={createExam.isPending}
                           className="flex-1 h-16 rounded-3xl bg-white text-black border-2 border-slate-100 hover:border-black hover:bg-white font-black uppercase text-xs tracking-[0.4em] shadow-xl hover:shadow-2xl transition-all active:scale-95 group overflow-hidden relative"
                         >
                            <div className="absolute inset-0 bg-black/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {createExam.isPending ? "Syncing..." : "Initialize Session"}
                         </Button>
                      </div>
                    </form>
                  </Form>
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
