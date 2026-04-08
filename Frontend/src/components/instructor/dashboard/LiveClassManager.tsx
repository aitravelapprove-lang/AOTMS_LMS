import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    Calendar,
    Clock,
    Plus,
    Play,
    X,
    AlertCircle,
    VideoOff,
    Users,
    Trash2,
    ImagePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const posterInputRef = useRef<HTMLInputElement>(null);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPosterFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPosterPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const removePoster = () => {
        setPosterFile(null);
        setPosterPreview(null);
        if (posterInputRef.current) posterInputRef.current.value = '';
    };

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
            await createMeeting.mutateAsync({
                ...formData,
                poster_url: posterPreview || undefined
            });
            setIsAdding(false);
            setFormData({ topic: '', startTime: '', duration: 60, agenda: '', courseId: '' });
            setPosterFile(null);
            setPosterPreview(null);
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
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-2 transition-all z-10" />
                                        
                                        {session.poster_url && (
                                            <div className="w-full h-40 overflow-hidden relative border-b border-border/50">
                                                <img 
                                                    src={session.poster_url} 
                                                    alt={session.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                />
                                            </div>
                                        )}

                                        <CardHeader className="pb-2 relative">
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
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsAdding(false)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>

                            {/* Header */}
                            <div className="text-center px-8 pt-10 pb-6 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule Live Session</h3>
                                <p className="text-slate-500 text-sm mt-1">Powered by Zoom Video SDK</p>
                            </div>

                            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

                                {/* Session Topic */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Session Topic</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Masterclass on React Patterns"
                                        required
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Start Time + Duration */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Duration (Min)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Associated Course */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Associated Course (Optional)</label>
                                    <select
                                        title="Associated Course"
                                        value={formData.courseId}
                                        onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                                    >
                                        <option value="">Standalone Meeting</option>
                                        {courses.map((course: Course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Agenda */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Agenda / Description</label>
                                    <textarea
                                        placeholder="Tell your students what to expect..."
                                        value={formData.agenda}
                                        onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                {/* Session Poster */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        Session Poster
                                        <span className="normal-case font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">1280 × 720 recommended</span>
                                    </label>

                                    {posterPreview ? (
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                            <div className="relative w-full h-[180px]">
                                                <img
                                                    src={posterPreview}
                                                    alt="Poster preview"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                                    <button type="button" onClick={() => posterInputRef.current?.click()}
                                                        className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-all">
                                                        Change
                                                    </button>
                                                    <button type="button" onClick={removePoster}
                                                        className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                <span className="font-medium truncate max-w-[70%]">{posterFile?.name}</span>
                                                <span className="font-bold text-primary shrink-0">1280 × 720 px</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => posterInputRef.current?.click()}
                                            className="w-full h-[110px] rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                                <ImagePlus className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-slate-700">Upload Session Poster</p>
                                                <p className="text-xs text-slate-400 mt-0.5">YouTube thumbnail · 1280 × 720 px · PNG / JPG</p>
                                            </div>
                                        </button>
                                    )}
                                    <input ref={posterInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePosterChange} />
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={createMeeting.isPending}
                                        className="flex-1 h-11 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                    >
                                        {createMeeting.isPending ? 'Generating Zoom Link...' : 'Publish Live Class'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-5 h-11 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {createMeeting.isError && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-xs border border-red-100">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
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
