import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    Calendar,
    Clock,
    Plus,
    Search,
    MoreVertical,
    ExternalLink,
    Play,
    Settings,
    X,
    AlertCircle,
    VideoOff,
    Users,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useInstructorLiveClasses, useCreateLiveClass, useDeleteLiveClass, useInstructorCourses, Course, LiveClass } from '@/hooks/useInstructorData';
import { format } from 'date-fns';

export function LiveClassManager() {
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();
    const { data: liveClasses = [], isLoading } = useInstructorLiveClasses();
    const { data: courses = [] } = useInstructorCourses();
    const createMeeting = useCreateLiveClass();
    const deleteMeeting = useDeleteLiveClass();

    const [formData, setFormData] = useState({
        topic: '',
        startTime: '',
        duration: 60,
        agenda: '',
        courseId: ''
    });

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this scheduled class? This action cannot be undone.")) {
            try {
                await deleteMeeting.mutateAsync(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMeeting.mutateAsync(formData);
            setIsAdding(false);
            setFormData({ topic: '', startTime: '', duration: 60, agenda: '', courseId: '' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Live Class Manager 📡
                    </h2>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Schedule and manage your interactive Zoom sessions.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12 px-6 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" /> Schedule New Class
                </Button>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-dashed animate-pulse">
                        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                        <p className="text-muted-foreground">Fetching your scheduled sessions...</p>
                    </div>
                ) : liveClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-card/30 rounded-3xl border border-dashed backdrop-blur-sm">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <VideoOff className="w-10 h-10 text-primary opacity-60" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No Live Classes Scheduled</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            Engagement is key! Start your first live session to interact with your students in real-time.
                        </p>
                        <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-xl">
                            Create Your First Session
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {liveClasses.map((session: LiveClass, index: number) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group overflow-hidden border border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-2 transition-all" />
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                            {session.status.toUpperCase()}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> Zoom Meeting
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                        {session.title}
                                                    </CardTitle>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    onClick={() => handleDelete(session.id)}
                                                    title="Delete Class"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                                {session.description || "No agenda provided for this session."}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Date</p>
                                                        <p className="font-semibold">{format(new Date(session.scheduled_at), 'MMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Time</p>
                                                        <p className="font-semibold">{format(new Date(session.scheduled_at), 'hh:mm a')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {session.meeting_password && (
                                                <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg border border-border/50">
                                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                        <Users className="w-3 h-3" />
                                                    </div>
                                                    <div className="flex-1 text-xs">
                                                        <span className="font-bold text-muted-foreground uppercase mr-2">Passcode:</span>
                                                        <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">{session.meeting_password}</code>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                                    onClick={() => session.meeting_id && navigate(`/live/${session.meeting_id}?role=1&pwd=${session.meeting_password || ''}`)}
                                                >
                                                    <Play className="w-4 h-4 mr-2" /> Start Meeting
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal - Schedule Class */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-card border border-border/50 shadow-2xl rounded-3xl p-8 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-blue-500" />

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold">Schedule Live Session</h3>
                                    <p className="text-muted-foreground text-sm">Powered by Zoom Video SDK</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Session Topic</label>
                                    <Input
                                        placeholder="e.g. Masterclass on React Patterns"
                                        className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all"
                                        required
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Start Time</label>
                                        <Input
                                            type="datetime-local"
                                            className="h-12 bg-muted/50 border-transparent transition-all"
                                            required
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Duration (Min)</label>
                                        <Input
                                            type="number"
                                            className="h-12 bg-muted/50 border-transparent transition-all"
                                            required
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="course-select" className="text-sm font-semibold ml-1">Associated Course (Optional)</label>
                                    <select
                                        id="course-select"
                                        title="Associated Course"
                                        className="w-full h-12 rounded-lg bg-muted/50 border-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={formData.courseId}
                                        onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                    >
                                        <option value="">Standalone Meeting</option>
                                        {courses.map((course: Course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Agenda / Description</label>
                                    <textarea
                                        className="w-full min-h-[100px] rounded-lg bg-muted/50 border-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Tell your students what to expect..."
                                        value={formData.agenda}
                                        onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-primary shadow-lg shadow-primary/20"
                                        disabled={createMeeting.isPending}
                                    >
                                        {createMeeting.isPending ? "Generating Zoom Link..." : "Publish Live Class"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12"
                                        onClick={() => setIsAdding(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                {createMeeting.isError && (
                                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-xs">
                                        <AlertCircle className="w-4 h-4" />
                                        {createMeeting.error.message}
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
