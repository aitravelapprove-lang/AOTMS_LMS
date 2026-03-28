import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useInstructorAllStudents, useInstructorCourses } from "@/hooks/useInstructorData";

interface PerformanceChartsProps {
    loading?: boolean;
}

export function PerformanceCharts({ loading: externalLoading }: PerformanceChartsProps) {
    const { data: students = [], isLoading: studentsLoading } = useInstructorAllStudents();
    const { data: courses = [], isLoading: coursesLoading } = useInstructorCourses();

    const loading = externalLoading || studentsLoading || coursesLoading;

    // 1. Process Activity Data (Mocking daily distribution based on real counts)
    const weeklyActivity = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const now = new Date();
        const activity = days.map(day => ({ day, active: 0, newEnroll: 0 }));

        students.forEach(student => {
            const enrollDate = new Date(student.enrolledAt);
            const activeDate = new Date(student.lastActiveAt);
            
            // Check if enrolled/active in last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);

            if (enrollDate >= weekAgo) {
                activity[enrollDate.getDay()].newEnroll += 1;
            }
            if (activeDate >= weekAgo) {
                activity[activeDate.getDay()].active += 1;
            }
        });

        // Ensure current day is at the end for visual flow
        const currentDayIndex = now.getDay();
        const sortedActivity = [
            ...activity.slice(currentDayIndex + 1),
            ...activity.slice(0, currentDayIndex + 1)
        ];
        
        return sortedActivity;
    }, [students]);

    // 2. Process Engagement Data (Direct distribution)
    const engagementData = useMemo(() => {
        const totals = {
            completed: students.filter(s => s.status === 'completed').length,
            active: students.filter(s => s.status === 'active').length,
            atRisk: students.filter(s => s.status === 'at-risk' || s.status === 'inactive').length
        };

        const total = students.length || 1;
        return [
            { name: "Completed", value: Math.round((totals.completed / total) * 100), color: "#10b981" },
            { name: "In Progress", value: Math.round((totals.active / total) * 100), color: "#3b82f6" },
            { name: "Needs Attention", value: Math.round((totals.atRisk / total) * 100), color: "#f59e0b" },
        ];
    }, [students]);

    // 3. Process Course Performance
    const coursePerformance = useMemo(() => {
        return courses.slice(0, 8).map(course => {
            const courseStudents = students.filter(s => 
                s.courseEnrollments.some(e => e.courseId === course.id)
            );
            const enrolledCount = courseStudents.length || 1;
            const completionRate = Math.round(
                (courseStudents.filter(s => 
                    s.courseEnrollments.find(e => e.courseId === course.id)?.progress === 100
                ).length / enrolledCount) * 100
            );
            const avgProgress = Math.round(
                courseStudents.reduce((acc, s) => acc + (s.courseEnrollments.find(e => e.courseId === course.id)?.progress || 0), 0) / enrolledCount
            );

            return {
                name: course.title.length > 15 ? course.title.substring(0, 12) + '...' : course.title,
                completion: completionRate,
                avgProgress: avgProgress
            };
        });
    }, [courses, students]);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <Tabs defaultValue="activity" className="w-full">
            <TabsList className="mb-4 md:mb-6 bg-muted/50 flex-wrap h-auto p-1 justify-start">
                <TabsTrigger value="activity" className="flex-grow sm:flex-grow-0">Activity</TabsTrigger>
                <TabsTrigger value="performance" className="flex-grow sm:flex-grow-0">Course Sync</TabsTrigger>
                <TabsTrigger value="engagement" className="flex-grow sm:flex-grow-0">Retention</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Weekly Live Activity</CardTitle>
                        <p className="text-xs text-muted-foreground">Recent student activity and enrollments</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden px-1 sm:px-6 pb-2 sm:pb-6">
                        <ResponsiveContainer width="99%" height={300}>
                            <AreaChart data={weeklyActivity} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} width={30} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                <Area type="monotone" dataKey="active" name="Active Students" stroke="#3b82f6" fill="url(#activeGrad)" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="newEnroll" name="New Enrollments" stroke="#10b981" fill="url(#enrollGrad)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="performance">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Course Performance Matrix</CardTitle>
                        <p className="text-xs text-muted-foreground">Completion vs Average Progress across courses</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden px-1 sm:px-6 pb-2 sm:pb-6">
                        <ResponsiveContainer width="99%" height={300}>
                            <BarChart data={coursePerformance} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" domain={[0, 100]} />
                                <Tooltip 
                                     contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                <Bar dataKey="completion" name="Completion Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="avgProgress" name="Avg. Progress" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="engagement">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Retention Distribution</CardTitle>
                        <p className="text-xs text-muted-foreground">Current status of all enrolled students</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden flex items-center justify-center p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={engagementData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {engagementData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
