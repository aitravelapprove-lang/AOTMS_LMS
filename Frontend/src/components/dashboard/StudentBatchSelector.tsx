import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEnrolledCourses, StudentCourse } from "@/hooks/useStudentData";

export function StudentBatchSelector() {
    const { data: courses, isLoading } = useEnrolledCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const allCourses: StudentCourse[] = courses || [];

    return (
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[200px] h-10 rounded-xl border-slate-200 bg-white text-[11px] font-bold shadow-sm shrink-0">
                {isLoading
                    ? <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Loading...</span></div>
                    : <SelectValue placeholder="Select Course" />
                }
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100">
                {!isLoading && allCourses.length === 0 && (
                    <div className="px-3 py-4 text-[11px] text-slate-400 text-center">No courses found</div>
                )}
                {allCourses.map((course: StudentCourse) => (
                    <SelectItem key={course.id} value={course.id} className="text-[11px] font-medium p-3 cursor-pointer">
                        {course.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}