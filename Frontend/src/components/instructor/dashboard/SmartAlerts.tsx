import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
    AlertTriangle, Clock, Calendar, TrendingDown, UserX,
    CheckCircle2, Bell, ExternalLink, RefreshCw, MessageSquare
} from "lucide-react";

interface Alert {
    id: string;
    type: "inactive" | "performance" | "exam" | "liveClass" | "rejection" | "doubt";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    action?: string;
    url?: string;
}

interface Task {
    id: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    deadline: string;
    count?: number;
    url?: string;
}

const alertIcon = {
    inactive: UserX,
    performance: TrendingDown,
    exam: AlertTriangle,
    liveClass: Calendar,
    rejection: AlertTriangle,
    doubt: MessageSquare,
};

const priorityColor = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const taskPriorityDot = {
    High: "bg-red-500",
    Medium: "bg-orange-400",
    Low: "bg-blue-400",
};

export function SmartAlerts() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRealData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch Rejected/Pending Courses
            const coursesData = await fetchWithAuth(`/data/courses?instructor_id=eq.${user.id}`);
            const courseAlerts = (coursesData as any[])
                .filter(c => c.status === 'rejected' || c.status === 'pending')
                .map(c => ({
                    id: `c-${c.id}`,
                    type: 'rejection' as const,
                    title: c.status === 'rejected' ? "Course Rejected" : "Course Pending Review",
                    description: c.status === 'rejected' ? `Your course "${c.title}" was rejected: ${c.rejectionReason || 'Check criteria'}` : `Your course "${c.title}" is under technical review.`,
                    priority: c.status === 'rejected' ? 'high' as const : 'medium' as const,
                    action: "Fix Course",
                    url: "/instructor/my-courses"
                }));

            // 2. Fetch Doubts (Simulated as no direct query for 'unreplied' yet without complex query)
            // For now, take latest doubts
            const doubtsData = await fetchWithAuth(`/data/doubts?limit=5&sort=created_at&order=desc`);
            const doubtAlerts = (doubtsData as any[]).map(d => ({
                id: `d-${d.id}`,
                type: 'doubt' as const,
                title: "New Student Doubt",
                description: d.question,
                priority: 'medium' as const,
                action: "Reply Now",
                url: "/instructor/chat"
            }));

            // 3. Pending Tasks (derive from course content count or static)
            const pendingTasks: Task[] = [];
            
            const draftCourses = (coursesData as any[]).filter(c => c.status === 'draft');
            if (draftCourses.length > 0) {
                pendingTasks.push({
                    id: 't-draft',
                    title: `Finish ${draftCourses.length} Draft Courses`,
                    priority: 'High',
                    deadline: 'Soon',
                    count: draftCourses.length,
                    url: "/instructor/my-courses"
                });
            }

            // Questions pending approval
            const questionsData = await fetchWithAuth(`/data/question_bank?created_by=eq.${user.id}&approval_status=eq.pending`);
            if (Array.isArray(questionsData) && questionsData.length > 0) {
              pendingTasks.push({
                  id: 't-questions',
                  title: `${questionsData.length} Questions Pending Approval`,
                  priority: 'Medium',
                  deadline: 'Next Sync',
                  count: questionsData.length,
                  url: "/instructor/question-bank"
              });
            }

            setAlerts([...courseAlerts, ...doubtAlerts]);
            setTasks(pendingTasks);
        } catch (err) {
            console.error("Failed to fetch real-time alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRealData();
    }, [user?.id]);

    return (
        <div className="space-y-6">
            {/* Alerts */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <Bell className="h-4 w-4 text-orange-500 fill-orange-500/10" />
                            Smart Alerts
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {loading ? (
                                <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                            ) : (
                                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 text-[10px] font-black">
                                    {alerts.length} Active
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-72">
                        <div className="px-4 py-4 space-y-3">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-20 w-full rounded-lg bg-slate-100 animate-pulse" />
                                ))
                            ) : alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 opacity-40 text-center space-y-2">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    <p className="text-xs font-black uppercase tracking-widest">No Alerts</p>
                                    <p className="text-[10px] font-bold">Everything is in optimal state</p>
                                </div>
                            ) : (
                                alerts.map((alert, i) => {
                                    const Icon = alertIcon[alert.type] || Bell;
                                    return (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all group"
                                        >
                                            <div className={`p-2 rounded-lg flex-shrink-0 h-fit ${priorityColor[alert.priority]}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{alert.title}</p>
                                                    <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 ${priorityColor[alert.priority]} border-0 font-black uppercase`}>
                                                        {alert.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{alert.description}</p>
                                                {alert.action && (
                                                    <button 
                                                        onClick={() => alert.url && (window.location.href = alert.url)}
                                                        className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 hover:opacity-70 flex items-center gap-1 transition-all"
                                                    >
                                                        {alert.action}
                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Task Manager */}
            <Card className="border-border/50 shadow-sm bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                            Pending Tasks
                        </CardTitle>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tasks.length} items</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="px-4 py-4 space-y-2">
                        {loading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
                            ))
                        ) : tasks.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">All Tasks Completed</p>
                            </div>
                        ) : (
                            tasks.map((task, i) => (
                                <div key={task.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        onClick={() => task.url && (window.location.href = task.url)}
                                        className="flex items-center gap-3 py-2.5 group cursor-pointer hover:bg-white hover:shadow-sm rounded-lg px-2 -mx-2 transition-all"
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${taskPriorityDot[task.priority]} shadow-glow`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{task.deadline}</span>
                                                {task.count && (
                                                    <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0 bg-primary/10 text-primary border-none font-black">
                                                        +{task.count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            className={`text-[9px] px-1.5 py-0 border-0 font-black uppercase ${task.priority === "High" ? priorityColor.high :
                                                    task.priority === "Medium" ? priorityColor.medium : priorityColor.low
                                                }`}
                                        >
                                            {task.priority}
                                        </Badge>
                                    </motion.div>
                                    {i < tasks.length - 1 && <Separator className="opacity-40" />}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
