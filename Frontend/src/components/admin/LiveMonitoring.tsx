import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useLiveMonitoring, MonitoringEnrollment, MonitoringResult } from '@/hooks/useAdminData';
import {
    Users, Search, Activity, BookOpen, Trophy, 
    Clock, Mail, ChevronRight, TrendingUp, BarChart, 
    Calendar, CheckCircle2, AlertCircle, Eye, Download, Video, FileText, Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart as ReBarChart, Bar, Cell
} from 'recharts';

export function LiveMonitoring() {
    const { data, loading, refresh, deleteEnrollment, deleteExamResult } = useLiveMonitoring();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('courses');

    if (loading && !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
                <Skeleton className="h-[500px] w-full rounded-3xl" />
            </div>
        );
    }

    const enrollments = data?.enrollments || [];
    const results = data?.results || [];

    const filteredEnrollments = enrollments.filter(e => 
        e.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredResults = results.filter(r => 
        r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.test_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Derived Stats
    const totalEnrollments = enrollments.length;
    const avgProgress = totalEnrollments > 0 
        ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalEnrollments) 
        : 0;
    const completedExams = results.length;
    const avgScore = completedExams > 0 
        ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / completedExams) 
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner flex-shrink-0">
                        <Activity className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase font-sans leading-none">
                            Live <span className="text-primary font-medium tracking-normal capitalize italic">Monitoring</span>
                        </h1>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time learning ecosystem oversight</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search Student, Course..." 
                            className="h-12 w-full lg:w-80 pl-11 rounded-2xl border-none bg-white shadow-xl shadow-slate-200/20 focus:ring-primary/20 transition-all font-medium text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => refresh()} variant="ghost" className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-slate-200/10 hover:bg-slate-50 shrink-0">
                       <Activity className={`h-5 w-5 ${loading ? 'animate-spin text-primary' : 'text-slate-400'}`} />
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard title="Global Progress" value={`${avgProgress}%`} icon={<BookOpen className="h-5 w-5" />} color="blue" description="Average course completion" />
                <StatsCard title="Active Learners" value={totalEnrollments} icon={<Users className="h-5 w-5" />} color="indigo" description="Enrolled & active students" />
                <StatsCard title="Exam Velocity" value={results.filter(r => new Date(r.submitted_at) > new Date(Date.now() - 24*60*60*1000)).length} icon={<Trophy className="h-5 w-5" />} color="amber" description="Tests taken in 24 hours" />
                <StatsCard title="Platform Score" value={`${avgScore}%`} icon={<TrendingUp className="h-5 w-5" />} color="emerald" description="Average across all assessments" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 inline-flex min-w-max">
                        <TabsTrigger value="courses" className="rounded-xl px-4 sm:px-8 h-9 sm:h-10 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                            Course Progress
                        </TabsTrigger>
                        <TabsTrigger value="exams" className="rounded-xl px-4 sm:px-8 h-9 sm:h-10 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                            Mocktest Performance
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Course Progress Tab */}
                <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="pro-card border-none shadow-2xl shadow-slate-200/20 rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-5 sm:p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Active Enrollment Streams</CardTitle>
                            <CardDescription className="text-xs sm:text-sm font-medium italic uppercase tracking-widest text-slate-400">Tracking completion depth across the curriculum</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <tr>
                                            <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Student Identity</th>
                                            <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Course Context</th>
                                            <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Progress Map</th>
                                            <th className="px-5 sm:px-8 py-4 text-center whitespace-nowrap">Last Interaction</th>
                                            <th className="px-5 sm:px-8 py-4 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEnrollments.map((en, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                            {en.student[0]}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900">{en.student}</div>
                                                            <div className="text-[10px] font-bold text-slate-400">{en.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/50">
                                                        <BookOpen className="h-3 w-3" />
                                                        <span className="text-xs font-bold">{en.course}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="w-48 space-y-2">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase font-sans">
                                                            <span className={en.progress === 100 ? "text-emerald-500" : "text-primary"}>
                                                                {en.progress === 100 ? "COMPLETED" : "IN PROGRESS"}
                                                            </span>
                                                            <span className="text-slate-900">{en.progress}%</span>
                                                        </div>
                                                        <Progress 
                                                            value={en.progress} 
                                                            className={`h-1.5 rounded-full ${en.progress === 100 ? '[&>div]:bg-emerald-500' : ''}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-2 uppercase tracking-tighter">
                                                       <Clock className="h-3 w-3 text-slate-400" />
                                                       {formatDate(en.last_accessed)}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        onClick={() => {
                                                            if (window.confirm('Permanently delete this enrollment?')) {
                                                                deleteEnrollment(en.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredEnrollments.length === 0 && (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <AlertCircle className="h-12 w-12 text-slate-200" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active streams found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Exam Performance Tab */}
                <TabsContent value="exams" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Results Table - Spans 2 */}
                        <Card className="lg:col-span-2 pro-card border-none shadow-2xl shadow-slate-200/20 rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-5 sm:p-8 pb-4">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Performance History</CardTitle>
                                <CardDescription className="text-xs sm:text-sm font-medium italic uppercase tracking-widest text-slate-400">Real-time mock and exam submission data</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto scrollbar-thin">
                                    <table className="w-full text-left min-w-[750px]">
                                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <tr>
                                                <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Subject Candidate</th>
                                                <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Test Title</th>
                                                <th className="px-5 sm:px-8 py-4 whitespace-nowrap">Score Analysis</th>
                                                <th className="px-5 sm:px-8 py-4 text-center whitespace-nowrap">Timestamp</th>
                                                <th className="px-5 sm:px-8 py-4 text-right whitespace-nowrap">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredResults.map((r, i) => (
                                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="text-sm font-black text-slate-900">{r.student}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 tracking-tighter">{r.email}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.type === 'live' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                                            {r.type === 'live' ? <Activity className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                                            {r.test_title}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-inner border ${r.percentage >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : r.percentage >= 40 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                {r.percentage}%
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400">
                                                                <span className="text-slate-900 font-black">{r.score}/{r.total}</span> Points
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">{formatDate(r.submitted_at)}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 italic">ID: {r.id.toString().slice(-6)}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            onClick={() => {
                                                                if (window.confirm('Permanently delete this test result?')) {
                                                                    deleteExamResult(r.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredResults.length === 0 && (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <Trophy className="h-12 w-12 text-slate-200" />
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No submission records</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Analysis Sidebar */}
                        <div className="space-y-6">
                            <Card className="pro-card border-none shadow-2xl shadow-slate-200/20 rounded-[2rem]">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black text-slate-900 uppercase font-sans">Grade <span className="text-primary">Distribution</span></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ReBarChart data={calculateDistribution(results)}>
                                                <XAxis dataKey="range" hide />
                                                <Tooltip 
                                                    cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                                />
                                                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                                                    {calculateDistribution(results).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </ReBarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <DistributionRef color="#ec4899" label="0-40%" />
                                        <DistributionRef color="#f59e0b" label="40-75%" />
                                        <DistributionRef color="#10b981" label="75-100%" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="pro-card border-none shadow-2xl shadow-slate-200/20 rounded-[2rem] bg-slate-900 text-white overflow-hidden relative group">
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl -z-0" />
                                <CardHeader className="relative z-10">
                                    <CardTitle className="text-lg font-black uppercase font-sans tracking-wider">Top <span className="text-primary">Performers</span></CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10 space-y-4">
                                    {results.sort((a,b) => b.percentage - a.percentage).slice(0, 3).map((top, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary">#{i+1}</div>
                                                <div>
                                                    <div className="text-sm font-bold truncate w-24">{top.student}</div>
                                                    <div className="text-[9px] font-black uppercase text-white/40 tracking-widest">{top.test_title}</div>
                                                </div>
                                            </div>
                                            <div className="text-lg font-black text-emerald-400">{top.percentage}%</div>
                                        </div>
                                    ))}
                                </CardContent>
                                <Trophy className="absolute -bottom-8 -right-8 h-32 w-32 text-white/5 rotate-12" />
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatsCard({ title, value, icon, color, description }: { title: string, value: string | number, icon: React.ReactNode, color: string, description: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
        <Card className="pro-card border-none shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner ${colors[color] || colors.blue}`}>
                        {icon}
                    </div>
                    <Activity className="h-4 w-4 text-slate-200 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
                    <h3 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">{value}</h3>
                    <p className="text-[10px] font-bold text-slate-400">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function DistributionRef({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
    );
}

function formatDate(date: string) {
    if (!date) return 'Just now';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function calculateDistribution(results: MonitoringResult[]) {
    const dist = [
        { range: '0-40', students: 0, color: '#ec4899' },
        { range: '40-75', students: 0, color: '#f59e0b' },
        { range: '75-100', students: 0, color: '#10b981' }
    ];

    results.forEach(r => {
        if (r.percentage < 40) dist[0].students++;
        else if (r.percentage < 75) dist[1].students++;
        else dist[2].students++;
    });

    return dist;
}
