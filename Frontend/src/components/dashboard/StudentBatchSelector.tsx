import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, CheckCircle2, Loader2, Clock } from "lucide-react";
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

    const activeCourses = courses?.filter(c => c.enrollmentStatus === 'active') || [];

    const handleConfirm = async () => {
        if (!selectedCourseId || !selectedBatchId) return;
        try {
            await requestBatch({ courseId: selectedCourseId, batchId: selectedBatchId });
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
        /* Outer wrapper — fixed height, internal scroll, no overflow outside */
        <div className="w-full overflow-x-auto scrollbar-hide rounded-2xl">
            <div className="flex items-center gap-2 min-w-max px-1 py-1">

                {/* Label pill */}
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 rounded-xl shrink-0">
                    <Layers className="h-3.5 w-3.5 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                        Course Batches
                    </span>
                </div>

                {/* Course select */}
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-[200px] h-10 rounded-xl border-slate-200 bg-white text-[11px] font-bold shadow-sm shrink-0">
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

                {/* Batch select + confirm — visible only when course is selected */}
                {selectedCourseId && (
                    <>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200 bg-white text-[11px] font-bold shadow-sm shrink-0">
                                {batchesLoading
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <SelectValue placeholder="Select Batch" />
                                }
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
                            className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10 flex items-center gap-1.5 shrink-0"
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
                    </>
                )}

                {/* Current batch indicator */}
                {currentBatch && !selectedBatchId && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-tight text-emerald-600 leading-none">Locked</span>
                            <span className="text-[9px] font-bold text-emerald-700 leading-none mt-0.5 whitespace-nowrap">
                                {currentBatch.batch_name}
                            </span>
                        </div>
                    </div>
                )}

               

            </div>
        </div>
    );
}
