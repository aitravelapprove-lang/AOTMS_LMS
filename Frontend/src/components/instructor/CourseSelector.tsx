import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstructorCourses, Course } from '@/hooks/useInstructorData';
import { BookOpen } from 'lucide-react';

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onSelectCourse: (course: Course | null) => void;
}

export function CourseSelector({ selectedCourse, onSelectCourse }: CourseSelectorProps) {
  const { data: courses = [], isLoading } = useInstructorCourses();

  return (
    <div className="flex items-center gap-3">
      <BookOpen className="h-5 w-5 text-primary" />
      <Select
        value={selectedCourse?.id || ''}
        onValueChange={(value) => {
          const course = (courses || []).find((c: Course) => c.id === value) || null;
          onSelectCourse(course);
        }}
        disabled={isLoading || !courses || courses.length === 0}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder={isLoading ? "Loading courses..." : (!courses || courses.length === 0 ? "No courses available" : "Select a course")} />
        </SelectTrigger>
        <SelectContent>
          {(courses || []).length > 0 ? (
            (courses || []).map((course: Course) => (
              <SelectItem key={course.id} value={course.id}>
                <div className="flex items-center gap-2">
                  <span>{course.title}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No courses found. Create or claim a course first.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
