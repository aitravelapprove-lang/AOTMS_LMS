import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen, Users, Video, TrendingUp, Star, Calendar,
    ClipboardList, UserCheck, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface StatCard {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change: string;
    trend: string;
    positive: boolean;
}

interface InstructorStatsProps {
    coursesCount: number;
    stats?: {
        totalStudents: number;
        contentItems: number;
        avgCompletion: number;
        activeStudents?: number;
        pendingAssignments?: number;
        upcomingClasses?: number;
        avgRating?: number;
    };
    loading?: boolean;
}

function AnimatedCounter({ to, duration = 1.5 }: { to: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * to));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [to, duration]);

    return <>{count.toLocaleString()}</>;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] as const },
    }),
};

export function InstructorStats({ coursesCount, stats, loading }: InstructorStatsProps) {
    const cards: StatCard[] = [
        {
            title: "Total Courses",
            value: coursesCount,
            icon: BookOpen,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            change: "Published courses",
            trend: "+2",
            positive: true,
        },
        {
            title: "Total Students",
            value: stats?.totalStudents ?? 0,
            icon: Users,
            color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
            change: "Active enrollments",
            trend: "+12%",
            positive: true,
        },
        {
            title: "Active Students",
            value: stats?.activeStudents ?? Math.round((stats?.totalStudents ?? 0) * 0.72),
            icon: UserCheck,
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
            change: "Last 7 days",
            trend: "+8%",
            positive: true,
        },
        {
            title: "Content Items",
            value: stats?.contentItems ?? 0,
            icon: Video,
            color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
            change: "Videos & Resources",
            trend: "+5",
            positive: true,
        },
        {
            title: "Avg. Completion",
            value: `${stats?.avgCompletion ?? 0}%`,
            icon: TrendingUp,
            color: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
            change: "Across all courses",
            trend: "+5%",
            positive: true,
        },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="border-border/50">
                        <CardContent className="p-5">
                            <Skeleton className="h-4 w-24 mb-3" />
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
                <motion.div key={card.title} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${card.color} group-hover:scale-105 transition-transform`}>
                                    <card.icon className="h-4 w-4" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-1.5 py-0.5 border-0 font-medium ${card.positive
                                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                        }`}
                                >
                                    <span className="flex items-center gap-0.5">
                                        {card.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {card.trend}
                                    </span>
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{card.title}</p>
                            <p className="text-2xl font-bold tracking-tight text-foreground">
                                {typeof card.value === "number" ? (
                                    <AnimatedCounter to={card.value} />
                                ) : (
                                    card.value
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
