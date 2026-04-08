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
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Batches</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-xl border-slate-200 bg-white text-[11px] font-bold">
                        <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                        {activeCourses.map(course => (
                            <SelectItem key={course.id} value={course.id} className="text-[11px] font-medium">
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedCourseId && (
                    <div className="flex items-center gap-2 w-full sm:w-auto animate-in slide-in-from-left-2">
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="w-full sm:w-[140px] h-9 rounded-xl border-slate-200 bg-white text-[11px] font-bold">
                                {batchesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue placeholder="Select Batch" />}
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                {batches?.map(batch => (
                                    <SelectItem key={batch.id} value={batch.id} className="text-[11px] font-medium">
                                        {batch.batch_name} ({batch.batch_type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button 
                            size="sm" 
                            className="h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm shadow-primary/10"
                            disabled={!selectedBatchId || isPending || (currentBatch?.id === selectedBatchId)}
                            onClick={handleConfirm}
                        >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : (currentBatch ? 'Transfer' : 'Confirm')}
                        </Button>
                    </div>
                )}
            </div>

            {currentBatch && !selectedBatchId && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl animate-in slide-in-from-right-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">Active: {currentBatch.batch_name}</span>
                </div>
            )}
        </div>
    );
}
