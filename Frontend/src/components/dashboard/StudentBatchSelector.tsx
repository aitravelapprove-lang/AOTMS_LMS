import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { useEnrolledCourses, useAvailableBatches, useStudentBatch, useRequestBatchAssignment } from "@/hooks/useStudentData";
import { useToast } from "@/components/ui/use-toast";

export function StudentBatchSelector() {
    const { data: courses, isLoading: coursesLoading } = useEnrolledCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const { data: batches, isLoading: batchesLoading } = useAvailableBatches(selectedCourseId || null);
    const { data: currentBatch, isLoading: batchLoading } = useStudentBatch(selectedCourseId || null);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const { mutateAsync: requestBatch, isPending } = useRequestBatchAssignment();
    const { toast } = useToast();

    // Find courses that don't have a batch yet
    const activeCourses = courses?.filter(c => c.enrollmentStatus === 'active') || [];

    const handleConfirm = async () => {
        if (!selectedCourseId || !selectedBatchId) return;
        
        try {
            const resp = await requestBatch({ courseId: selectedCourseId, batchId: selectedBatchId });
            toast({
                title: currentBatch ? "Transfer Requested" : "Batch Assigned",
                description: currentBatch 
                    ? "Instructor permission requested for your batch change." 
                    : "You have been assigned to your selected batch.",
                className: currentBatch ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
            });
            setSelectedBatchId("");
        } catch (err: unknown) {
            const error = err as Error;
            toast({
                title: "Request Failed",
                description: error.message || "Could not process batch request.",
                variant: "destructive"
            });
        }
    };

    if (coursesLoading || activeCourses.length === 0) return null;

    return (
        <div className="flex flex-col lg:flex-row items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-[1.5rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-300 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-xl shrink-0 group hover:bg-primary transition-colors cursor-help w-full lg:w-auto justify-center lg:justify-start">
                <Layers className="h-4 w-4 text-white" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Course Batches</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-full lg:w-[220px] h-11 rounded-xl border-slate-200 bg-white text-[11px] font-bold shadow-sm">
                        <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                        {activeCourses.map(course => (
                            <SelectItem key={course.id} value={course.id} className="text-[11px] font-medium p-3">
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedCourseId && (
                    <div className="flex items-center gap-2 w-full lg:w-auto animate-in slide-in-from-left-2">
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-xl border-slate-200 bg-white text-[11px] font-bold shadow-sm">
                                {batchesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select Batch" />}
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                {batches?.map(batch => (
                                    <SelectItem key={batch.id} value={batch.id} className="text-[11px] font-medium p-3">
                                        {batch.batch_name} ({batch.batch_type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button 
                            size="sm" 
                            className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10 flex items-center gap-2"
                            disabled={!selectedBatchId || isPending || (currentBatch?.id === selectedBatchId)}
                            onClick={handleConfirm}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <Clock className="h-3 w-3" />
                                    {currentBatch ? 'Transfer' : 'Confirm'}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {currentBatch && !selectedBatchId && (
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl animate-in slide-in-from-right-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">Locked: {currentBatch.batch_name}</span>
                </div>
            )}
        </div>
    );
}
