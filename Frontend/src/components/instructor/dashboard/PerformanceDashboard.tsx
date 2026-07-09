import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Search
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useInstructorCourses,
  useInstructorStats,
  useInstructorStudentStats,
  useInstructorAllStudents
} from '@/hooks/useInstructorData';
import { PerformanceCharts } from './PerformanceCharts';
import { SmartAlerts } from './SmartAlerts';
import { Skeleton } from '@/components/ui/skeleton';

const PerformanceDashboard: React.FC = () => {
  const { data: courses = [], isLoading: coursesLoading } = useInstructorCourses();
  const { data: generalStats, isLoading: statsLoading } = useInstructorStats();
  const { stats: studentStats, isLoading: studentStatsLoading } = useInstructorStudentStats();
  const { data: students = [] } = useInstructorAllStudents();
  const [timeRange, setTimeRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = coursesLoading || statsLoading || studentStatsLoading;

  // Use real data or fallbacks
  const trends = [
    { label: 'Platform Students', value: studentStats.totalStudents.toString(), trend: '+5.2%', isUp: true },
    { label: 'Active Enrollments', value: studentStats.totalEnrollments.toString(), trend: '+8.2%', isUp: true },
    { label: 'Avg. Course Progress', value: `${studentStats.avgProgress}%`, trend: '+2.4%', isUp: true },
    { label: 'Completed Students', value: studentStats.completedStudents.toString(), trend: '+1.5%', isUp: true },
  ];

  // Calculate course-specific stats from the students data
  const coursePerformanceMap = useMemo(() => {
    const map: Record<string, { count: number; totalProgress: number }> = {};
    
    students.forEach(student => {
      student.courseEnrollments.forEach(enrollment => {
        if (!map[enrollment.courseId]) {
          map[enrollment.courseId] = { count: 0, totalProgress: 0 };
        }
        map[enrollment.courseId].count += 1;
        map[enrollment.courseId].totalProgress += enrollment.progress;
      });
    });
    
    return map;
  }, [students]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your course performance and student engagement metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {trends.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${item.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-20" /> : item.value}</div>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-semibold flex items-center ${item.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.isUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {item.trend}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">vs last month</span>
                </div>
              </CardContent>
              {/* Subtle accent line */}
              <div className={`absolute bottom-0 left-0 h-1 w-full opacity-50 ${item.isUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Detailed Analytics</CardTitle>
                  <CardDescription>Visualizing student behavior and trends</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <PerformanceCharts loading={isLoading} />
            </CardContent>
          </Card>

          {/* Course Performance Table */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Course Specific Performance</CardTitle>
                  <CardDescription>Performance breakdown by individual courses</CardDescription>
                </div>
                <div className="relative w-full sm:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Course Name</th>
                      <th className="px-4 py-3 font-semibold">Students</th>
                      <th className="px-4 py-3 font-semibold text-center">Avg. Progress</th>
                      <th className="px-4 py-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
                          <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-4 py-4"><Skeleton className="h-4 w-24 mx-auto" /></td>
                          <td className="px-4 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                          No courses found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => {
                        const perf = coursePerformanceMap[course.id] || { count: 0, totalProgress: 0 };
                        const avgProgress = perf.count > 0 ? Math.round(perf.totalProgress / perf.count) : 0;
                        
                        return (
                          <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{course.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-mono">{perf.count}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1.5 items-center">
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                                  <div className="h-full bg-primary" style={{ width: `${avgProgress}%` }} />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">{avgProgress}% complete</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                                {course.status || 'Active'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Components Area */}
        <div className="space-y-6">
          <SmartAlerts />

          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                < Award className="h-5 w-5 text-amber-500" />
                Teaching Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4 text-center">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4 bg-background shadow-inner">
                  <span className="text-2xl font-bold text-primary italic">A+</span>
                </div>
                <p className="font-bold text-lg">Top 5% Instructor</p>
                <p className="text-sm text-muted-foreground px-4 mt-1">
                  Based on student satisfaction and completion rates this month.
                </p>
                <Button variant="ghost" className="mt-4 h-8 text-xs gap-2">
                  View Badges <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Grade Project 1', date: 'Tomorrow, 5 PM', color: 'bg-red-500' },
                { title: 'New Course Launch', date: 'Oct 15, 2024', color: 'bg-blue-500' },
                { title: 'Live Q&A Session', date: 'Oct 18, 2024', color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className={`mt-1.5 h-2 w-2 rounded-full cursor-help ${item.color} group-hover:ring-4 ring-${item.color.split('-')[1]}-500/20 transition-all`} />
                  <div>
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors cursor-pointer">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;