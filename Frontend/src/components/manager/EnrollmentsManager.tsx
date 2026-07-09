import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Search, 
  BookOpen, 
  Calendar, 
  CreditCard,
  Globe,
  RefreshCw,
  Filter
} from "lucide-react";
import { CourseEnrollment } from "@/hooks/useCourses";

interface ManagerEnrollmentsProps {
  enrollments: CourseEnrollment[];
  loading: boolean;
  onRefresh: () => void;
}

export function ManagerEnrollments({ enrollments, loading, onRefresh }: ManagerEnrollmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");

  const courses = [...new Set(enrollments.map(e => e.course_name))];

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === "all" || e.course_name === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xl font-bold">{enrollments.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold">{courses.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xl font-bold">
                  {new Set(enrollments.map(e => e.user_id)).size}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xl font-bold">
                  ₹{enrollments.reduce((acc, e) => acc + parseInt(e.price?.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm w-full sm:min-w-[160px] sm:w-auto"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No enrollments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {enrollment.user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {enrollment.user_name || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.user_email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div className="text-left sm:text-right">
                      <Badge variant="secondary" className="mb-1">
                        {enrollment.course_name}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(enrollment.enrollment_date)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right min-w-0">
                      <p className="text-lg font-bold text-green-600">
                        {enrollment.price}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
