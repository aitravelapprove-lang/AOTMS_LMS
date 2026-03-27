import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical, 
  Eye, 
  Search, 
  Filter, 
  History,
  FileText,
  Calendar,
  ShieldCheck,
  BrainCircuit,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  useExams, 
  useUpdateExam, 
  useDeleteExam,
  useCourses,
  type Exam 
} from '@/hooks/useManagerData'; 
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';

export function ExamApproval() {
  const { data: exams, isLoading, refetch } = useExams();
  const { data: courses = [] } = useCourses();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();
  const { toast } = useToast();
  
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const filteredExams = (exams || []).filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || e.approval_status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (id: string, approval_status: 'approved' | 'rejected') => {
    // Courses are now optional for approval to allow faster deployment
    /*
    if (approval_status === 'approved' && !selectedCourseId && !selectedExam?.course_id) {
        toast({ title: 'Course Required', description: 'Please associate this exam with a course before publishing.', variant: 'destructive' });
        return;
    }
    */

    try {
      await updateExam.mutateAsync({ 
        id, 
        approval_status, 
        course_id: approval_status === 'approved' ? (selectedCourseId || selectedExam?.course_id) : undefined,
        status: approval_status === 'approved' ? 'active' : 'cancelled' 
      });
      toast({
        title: approval_status === 'approved' ? 'Exam Published' : 'Exam Rejected',
        description: `The assessment has been successfully ${approval_status}.`,
        variant: approval_status === 'approved' ? 'default' : 'destructive'
      });
      setIsDetailOpen(false);
      setSelectedCourseId('');
      refetch();
    } catch (error) {
       toast({ title: 'System Error', description: 'Failed to update approval status.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("PERMANENT PROTOCOL PURGE: Are you sure you want to permanently delete this assessment? This cannot be undone.")) return;
    
    try {
      await deleteExam.mutateAsync(id);
      toast({
        title: 'Protocol Purged',
        description: 'The assessment has been permanently removed from the system.',
        variant: 'destructive'
      });
      setIsDetailOpen(false);
      refetch();
    } catch (error) {
       toast({ title: 'System Error', description: 'Failed to delete assessment.', variant: 'destructive' });
    }
  };

  // Instant-fetch mode: Bypass full-page blocking loader
  // if (isLoading && !exams) return <div ...> is gone.
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Quality Assurance</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Review & Protocol Verification for Assessments</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                placeholder="Search protocol ID..." 
                className="h-11 w-64 rounded-xl border-slate-100 bg-white shadow-sm pl-10 text-xs font-bold" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex bg-slate-100 rounded-xl p-1">
             {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
               <Button 
                key={f}
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                )}
                onClick={() => setFilter(f)}
               >
                 {f}
               </Button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid gap-6">
         <AnimatePresence mode="popLayout">
           {filteredExams.length > 0 ? filteredExams.map((exam) => (
             <motion.div
               layout
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               key={exam.id}
               className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500"
             >
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-3xl bg-slate-900 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      {exam.assigned_image ? (
                        <img src={exam.assigned_image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                           <FileText className="h-6 w-6 text-white/10" />
                        </div>
                      )}
                   </div>
                   
                   <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-lg leading-none">{exam.title}</h4>
                        <Badge className={cn(
                          "h-5 text-[9px] font-black uppercase border-none px-2 rounded-full",
                          exam.approval_status === 'pending' ? "bg-amber-100 text-amber-600" :
                          exam.approval_status === 'approved' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                          {exam.approval_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {exam.scheduled_date ? format(new Date(exam.scheduled_date), 'MMM dd, HH:mm') : 'Unscheduled'}</span>
                        <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> {exam.duration_minutes} Mins</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> {exam.proctoring_enabled ? 'SECURE' : 'OPEN'}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <Button 
                    variant="outline" 
                    className="h-12 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary gap-2 transition-all hover:bg-slate-50"
                    onClick={() => { setSelectedExam(exam); setIsDetailOpen(true); }}
                   >
                     <Eye className="h-4 w-4" /> Comprehensive Audit
                   </Button>
                   
                    <div className="flex gap-2">
                       {exam.approval_status === 'pending' && (
                         <>
                           <Button 
                             className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-none shadow-none transition-all"
                             onClick={() => handleAction(exam.id, 'approved')}
                           >
                             <CheckCircle2 className="h-5 w-5" />
                           </Button>
                           <Button 
                             className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border-none shadow-none transition-all"
                             onClick={() => handleAction(exam.id, 'rejected')}
                           >
                             <XCircle className="h-5 w-5" />
                           </Button>
                         </>
                       )}
                       <Button 
                         className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white border-none shadow-none transition-all"
                         onClick={() => handleDelete(exam.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
             </motion.div>
            )) : isLoading ? (
              // Inline skeleton for instant framework display
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 w-full bg-slate-50/50 animate-pulse rounded-[2.5rem] border-4 border-dashed border-slate-100/30" />
              ))
            ) : (
              <div className="py-32 text-center border-4 border-dashed border-slate-50 rounded-[4rem] bg-slate-50/20">
                 <ShieldAlert className="h-16 w-16 text-slate-200 mx-auto mb-6 opacity-30" />
                 <h4 className="text-2xl font-black text-slate-200 uppercase tracking-tighter italic">Queue is Empty</h4>
                 <p className="text-xs font-bold text-slate-100 uppercase tracking-widest mt-2">All protocols have been successfully reviewed</p>
              </div>
            )}
         </AnimatePresence>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
           <DialogHeader className="sr-only">
             <DialogTitle>Audit Assessment Protocol</DialogTitle>
             <DialogDescription>Review details before authorizing or denying.</DialogDescription>
           </DialogHeader>
           {selectedExam && (
             <div className="flex flex-col h-[700px]">
                <div className="h-40 relative bg-slate-900">
                   {selectedExam.assigned_image && (
                     <img src={selectedExam.assigned_image} className="w-full h-full object-cover opacity-60" alt="" />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                   <div className="absolute bottom-8 left-10">
                      <h3 className="text-3xl font-black text-white leading-tight">{selectedExam.title}</h3>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mt-1">Audit Protocol ID: {selectedExam.id.slice(0, 8)}</p>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12">
                   <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Complexity', value: selectedExam.exam_type, icon: Filter },
                        { label: 'Time Allocated', value: `${selectedExam.duration_minutes}m`, icon: Clock },
                        { label: 'Passing Mark', value: `${selectedExam.passing_marks}/${selectedExam.total_marks}`, icon: CheckCircle2 },
                        { label: 'Max Attempts', value: selectedExam.max_attempts, icon: History }
                      ].map((stat, i) => (
                        <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <stat.icon className="h-3 w-3" /> {stat.label}
                           </div>
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{stat.value}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-3">
                         <ChevronRight className="h-3 w-3" /> Target Curriculum Association
                      </h4>
                      <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Associate with Active Course</Label>
                         <Select 
                            value={selectedCourseId || selectedExam.course_id || ""} 
                            onValueChange={setSelectedCourseId}
                            disabled={selectedExam.approval_status === 'approved'}
                         >
                            <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6 focus:ring-slate-700">
                               <SelectValue placeholder="Select Deployment Course..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-slate-200">
                               {courses.map(course => (
                                 <SelectItem key={course.id} value={course.id} className="font-bold py-3 hover:bg-white/5 rounded-xl">
                                    {course.title}
                                 </SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                         <p className="text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">
                            {selectedExam.approval_status === 'approved' 
                               ? "This protocol is locked to the curriculum above." 
                               : "Linked students will automatically receive this protocol upon authorization."}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-3">
                         <ShieldCheck className="h-3 w-3" /> Security & Protocol Suite
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         {[
                           { label: 'Browser Isolation', active: selectedExam.browser_security, icon: ShieldAlert },
                           { label: 'AI Proctoring Live', active: selectedExam.proctoring_enabled, icon: Eye },
                           { label: 'Question Scrambling', active: selectedExam.shuffle_questions, icon: RefreshCw },
                           { label: 'Instant Score Reveal', active: selectedExam.show_results, icon: CheckCircle2 }
                         ].map((rule, i) => (
                           <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-100">
                              <div className="flex items-center gap-4">
                                 <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", rule.active ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300")}>
                                    <rule.icon className="h-5 w-5" />
                                 </div>
                                 <p className="text-xs font-black uppercase tracking-widest text-slate-700">{rule.label}</p>
                              </div>
                              <Badge className={cn("border-none text-[8px] font-black uppercase rounded-full h-5 px-3", rule.active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>{rule.active ? 'Armed' : 'Inactive'}</Badge>
                           </div>
                         ))}
                      </div>
                   </div>

                   {selectedExam.description && (
                     <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Candidate Instructions</h4>
                        <div className="p-8 rounded-[2rem] bg-slate-50 text-sm font-bold text-slate-500 leading-relaxed italic border-l-4 border-slate-200">
                           {selectedExam.description}
                        </div>
                     </div>
                   )}
                </div>

                <div className="p-10 bg-slate-50/50 border-t flex items-center justify-between">
                   <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-900 group transition-all" onClick={() => setIsDetailOpen(false)}>
                      Close Session <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1" />
                   </Button>
                   
                    <div className="flex gap-4">
                       {selectedExam.approval_status === 'pending' && (
                         <>
                           <Button 
                             className="h-14 px-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-rose-100"
                             onClick={() => handleAction(selectedExam.id, 'rejected')}
                           >
                             <XCircle className="h-4 w-4" /> Deny Logic
                           </Button>
                           <Button 
                             className="h-14 px-10 rounded-2xl pro-button-primary font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-blue-200"
                             onClick={() => handleAction(selectedExam.id, 'approved')}
                           >
                             <CheckCircle2 className="h-4 w-4" /> Authorize Session
                           </Button>
                         </>
                       )}
                       <Button 
                         className="h-14 px-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs gap-3 shadow-none border border-slate-200"
                         onClick={() => handleDelete(selectedExam.id)}
                       >
                         <Trash2 className="h-4 w-4" /> Nuke Assessment
                       </Button>
                    </div>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
