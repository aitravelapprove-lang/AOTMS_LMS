import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, ArrowLeft, Trash2, UploadCloud, GripVertical, Loader2, CheckCircle2, XCircle, Copy, Check, AlertTriangle, Clock, CheckCircle, FileVideo, X, Layers, ChevronUp, ChevronDown, Users, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCourseModules, useCreateCourseModule, useUpdateCourseModule, useModuleVideos, useCreateCourseVideo, useS3Upload, useUpdateCourseStatus, CourseModule, S3CourseVideo, useDeleteCourseVideo, useDeleteCourseModule } from '@/hooks/useCourseBuilder';
import { fetchWithAuth } from '@/lib/api';
import { Course } from '@/hooks/useInstructorData';
import { VideoUploader } from '../VideoUploader';
import { BatchManager } from '../BatchManager';
import { cn } from "@/lib/utils";

interface CourseBuilderProps {
    course: Course;
    onBack: () => void;
}

const deriveBatchType = (selectedIds: string[], allBatches: {id: string, batch_type: string}[]) => {
    if (selectedIds.length === 0) return 'all';
    const selectedBatchTypes = allBatches
        .filter(b => selectedIds.includes(b.id))
        .map(b => b.batch_type);
    const uniqueTypes = [...new Set(selectedBatchTypes)];
    if (uniqueTypes.length === 1) return uniqueTypes[0];
    return 'all';
};

function ModuleItem({ module, course }: { module: CourseModule, course: Course }) {
    const { data: videosData, refetch } = useModuleVideos(module.id, course.id);
    const videos = (videosData || []) as S3CourseVideo[];
    const createVideo = useCreateCourseVideo();
    const deleteVideo = useDeleteCourseVideo();
    const deleteModule = useDeleteCourseModule();
    const uploadS3 = useS3Upload();
    const { toast } = useToast();

    const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
    const [copiedModule, setCopiedModule] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ 
        title: module.title, 
        allowed_batches: module.allowed_batches || [],
        batch_type: module.batch_type || 'all'
    });
    const [batches, setBatches] = useState<{ id: string, batch_name: string, batch_type: string }[]>([]);

    const updateModule = useUpdateCourseModule();

    useEffect(() => {
        if (isEditing) {
            const loadBatches = async () => {
                try {
                    const data = await fetchWithAuth(`/batches?course_id=${course.id}`) as { id: string, batch_name: string, batch_type: string }[];
                    setBatches(data || []);
                } catch (e) {
                    console.error("Failed to load batches", e);
                }
            };
            loadBatches();
        }
    }, [isEditing, course.id]);

    const handleUpdateModule = async () => {
        try {
            await updateModule.mutateAsync({
                id: module.id,
                course_id: course.id,
                title: editData.title,
                allowed_batches: editData.allowed_batches,
                batch_type: editData.batch_type
            });
            setIsEditing(false);
            toast({ title: "Module Updated", description: "Changes have been saved." });
        } catch (err) {
            toast({ title: "Update Failed", variant: "destructive" });
        }
    };

    const handleCopyModuleId = () => {
        try {
            navigator.clipboard.writeText(module.id);
            setCopiedModule(true);
            toast({ title: "Module ID Copied", description: "The unique identifier is now on your clipboard." });
            setTimeout(() => setCopiedModule(false), 2000);
        } catch (err) {
            toast({ title: "Copy Failed", description: "Manual copy required.", variant: "destructive" });
        }
    };

    const handleDeleteVideo = async (videoId: string) => {
        try {
            await deleteVideo.mutateAsync(videoId);
            refetch();
            toast({ title: "Video Removed", description: "The content has been purged from this module." });
        } catch (err) {
            toast({ title: "Deletion Failed", variant: "destructive" });
        }
    };

    const handleDeleteModule = async () => {
        if (!confirm(`Are you sure you want to delete the module "${module.title}"? All videos within this module will be detached.`)) return;
        
        setIsDeleting(true);
        try {
            await deleteModule.mutateAsync(module.id);
            toast({ title: "Module Deleted", description: "The section has been removed from the syllabus." });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Internal server error';
            toast({ title: "Deletion Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const isApproved = course.status === 'approved' || course.status === 'published' || course.status === 'draft' || course.status === 'rejected' || !course.status;

    return (
        <Card className="mb-6 overflow-hidden rounded-[2rem] border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-500 bg-white group">
            <CardHeader className="p-5 sm:p-6 sm:px-8 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm cursor-grab group-active:cursor-grabbing border border-slate-100 shrink-0">
                        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                                {module.title}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-primary transition-colors shrink-0"
                                onClick={handleCopyModuleId}
                            >
                                {copiedModule ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Section {module.order_index + 1}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all shrink-0"
                    >
                        <Edit className="h-5 w-5" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleDeleteModule}
                        disabled={isDeleting}
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </Button>

                    <Dialog open={isVideoUploadOpen} onOpenChange={setIsVideoUploadOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl h-10 sm:h-11 px-4 sm:px-6 gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm border font-black text-xs sm:text-sm transition-all"
                                disabled={!isApproved}
                            >
                                <Plus className="h-4 w-4 text-primary" /> 
                                <span className="truncate">New Video</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border-slate-200 rounded-3xl p-0 max-h-[95vh] overflow-y-auto scrollbar-none shadow-2xl">
                            <div className="p-6 sm:p-8 space-y-8">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2 text-primary font-bold uppercase tracking-widest text-xs">
                                        <Layers className="h-4 w-4" /> Module Specific
                                    </div>
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Upload to "{module.title}"
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                    <VideoUploader 
                                      courseId={course.id} 
                                      courseStatus={course.status} 
                                      initialModuleId={module.id} 
                                      hideVideoList={true} 
                                      onSuccess={() => {
                                        setIsVideoUploadOpen(false);
                                        refetch();
                                      }}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Module Edit Dialog */}
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogContent className="sm:max-w-md rounded-3xl">
                            <DialogHeader>
                                <DialogTitle>Edit Module Settings</DialogTitle>
                                <DialogDescription>Update title and access restrictions for this module.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Title</Label>
                                    <Input 
                                        value={editData.title}
                                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Batch Access Control</Label>
                                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                                        {batches.length === 0 ? (
                                            <p className="text-[10px] text-slate-400 italic">No batches found for this course.</p>
                                        ) : (
                                            batches.map(batch => (
                                                <div key={batch.id} className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox"
                                                        id={`edit-batch-${batch.id}`}
                                                        checked={editData.allowed_batches.includes(batch.id)}
                                                        onChange={(e) => {
                                                            let nextBatches = [...editData.allowed_batches];
                                                            if (e.target.checked) {
                                                                nextBatches.push(batch.id);
                                                            } else {
                                                                nextBatches = nextBatches.filter(id => id !== batch.id);
                                                            }
                                                            setEditData(p => ({ 
                                                                ...p, 
                                                                allowed_batches: nextBatches,
                                                                batch_type: deriveBatchType(nextBatches, batches)
                                                            }));
                                                        }}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary"
                                                    />
                                                    <label htmlFor={`edit-batch-${batch.id}`} className="text-xs font-medium cursor-pointer">
                                                        {batch.batch_name} ({batch.batch_type})
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                        <div className="pt-2 mt-2 border-t border-slate-200">
                                            <p className="text-[9px] text-slate-400 italic">If no batches are selected, the module is visible to ALL enrolled students.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleUpdateModule} disabled={updateModule.isPending} className="rounded-xl px-6">
                                    {updateModule.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-8">
                {!videos || videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40 border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/30">
                        <FileVideo className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Library Empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                        {videos.map((vid: S3CourseVideo, idx: number) => (
                            <motion.div 
                                key={vid.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group/vid relative bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 sm:p-3 hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="relative aspect-video rounded-xl sm:rounded-2xl bg-black overflow-hidden mb-3">
                                    <video
                                        key={vid.video_url}
                                        controls
                                        className="w-full h-full object-contain"
                                        preload="metadata"
                                        poster={vid.thumbnail_url ? (vid.thumbnail_url.startsWith('http') ? vid.thumbnail_url : `/s3/public/${vid.thumbnail_url}`) : undefined}
                                    >
                                        <source src={vid.video_url.startsWith('https') ? vid.video_url : (vid.video_url.includes('s3') ? vid.video_url : `/s3/public/${vid.video_url}`)} type="video/mp4" />
                                    </video>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteVideo(vid.id)}
                                            className="h-7 w-7 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="px-1 sm:px-2 pb-1 sm:pb-2">
                                    <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate mb-1">{vid.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Section {module.order_index + 1} • Video {idx + 1}</span>
                                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function CourseBuilder({ course, onBack }: CourseBuilderProps) {
    const { data: modulesData, isLoading: modulesLoading, isError, refetch: refetchModules } = useCourseModules(course.id);
    const modules = useMemo(() => (modulesData || []) as CourseModule[], [modulesData]);
    
    const getStatusBadge = (status?: string) => {
        const s = status?.toLowerCase();
        if (s === 'approved' || s === 'published') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 uppercase font-black tracking-tighter h-5 text-[9px]"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
        if (s === 'pending') return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 uppercase font-black tracking-tighter h-5 text-[9px]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        if (s === 'rejected') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 uppercase font-black tracking-tighter h-5 text-[9px]"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
        return <Badge variant="outline" className="uppercase font-black tracking-tighter h-5 text-[9px]">{status || 'Draft'}</Badge>;
    };

    const updateStatus = useUpdateCourseStatus();
    const createModule = useCreateCourseModule();
    const { toast } = useToast();

    const [copiedCourse, setCopiedCourse] = useState(false);
    const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newModuleBatches, setNewModuleBatches] = useState<string[]>([]);
    const [newModuleType, setNewModuleType] = useState('all');
    const [courseBatches, setCourseBatches] = useState<{ id: string, batch_name: string, batch_type: string }[]>([]);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'syllabus' | 'batches'>('syllabus');

    useEffect(() => {
        if (isAddModuleDialogOpen) {
            const loadBatches = async () => {
                try {
                    const data = await fetchWithAuth(`/batches?course_id=${course.id}`) as { id: string, batch_name: string, batch_type: string }[];
                    setCourseBatches(data || []);
                } catch (e) {
                    console.error("Failed to load course batches", e);
                }
            };
            loadBatches();
        }
    }, [isAddModuleDialogOpen, course.id]);

    useEffect(() => {
        if (!modulesLoading && modules && modules.length === 0) {
            setIsUploaderOpen(true);
        }
    }, [modules, modulesLoading]);

    const handleCopyCourseId = () => {
        try {
            navigator.clipboard.writeText(course.id);
            setCopiedCourse(true);
            toast({ title: "Course ID Copied", description: course.id });
            setTimeout(() => setCopiedCourse(false), 2000);
        } catch (err) {
            toast({ title: "Copy Failed", description: "Could not copy to clipboard", variant: "destructive" });
        }
    };

    const handlePublish = async () => {
        try {
            await updateStatus.mutateAsync({ courseId: course.id, status: 'pending' });
            toast({ title: "Submitted for Review", description: "Admin will review your course shortly." });
        } catch (error) {
            toast({ title: "Submission Failed", description: "Please try again later.", variant: 'destructive' });
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            await createModule.mutateAsync({
                course_id: course.id,
                title: newModuleTitle.trim(),
                order_index: modules?.length || 0,
                allowed_batches: newModuleBatches,
                batch_type: newModuleType
            });
            setNewModuleTitle('');
            setNewModuleBatches([]);
            setIsAddModuleDialogOpen(false);
            toast({ title: "Module Created", description: `"${newModuleTitle}" has been added to the syllabus.` });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            toast({ title: "Failed to Add Module", description: errorMessage, variant: "destructive" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white/50 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-xl bg-white shadow-sm shrink-0 border border-slate-100">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{course.title}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-primary transition-colors shrink-0"
                            onClick={handleCopyCourseId}
                        >
                            {copiedCourse ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <div className="flex sm:hidden">
                           {getStatusBadge(course.status)}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="hidden sm:flex">
                           {getStatusBadge(course.status)}
                        </div>
                        <p className="text-slate-500 text-[11px] sm:text-xs flex items-center gap-2 font-bold uppercase tracking-wider">
                            <span className={`flex h-2 w-2 rounded-full ${(course.status === 'approved' || course.status === 'published') ? 'bg-emerald-500' : 'bg-primary'}`}></span>
                            {(course.status === 'approved' || course.status === 'published') 
                                ? 'Live on Platform' 
                                : 'Draft Mode - Video Enabled'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                    {(course.status === 'draft' || course.status === 'rejected') && (
                        <Button
                            variant="default"
                            className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all"
                            onClick={handlePublish}
                            disabled={updateStatus.isPending || (modules?.length === 0)}
                        >
                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            <span className="hidden sm:inline">Submit Review</span>
                            <span className="sm:hidden text-[10px]">Submit</span>
                        </Button>
                    )}

                    <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none gap-2 rounded-xl sm:rounded-2xl h-11 px-5 border-slate-200 hover:bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-600 transition-all">
                                <Plus className="h-4 w-4" /> 
                                <span className="hidden sm:inline">Add Module</span>
                                <span className="sm:hidden text-[10px]">Module</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-base">Add Module</DialogTitle>
                                <DialogDescription className="text-xs">Add a new section to your course.</DialogDescription>
                            </DialogHeader>
                            <div className="py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="module-title" className="text-xs">Title</Label>
                                    <Input
                                        id="module-title"
                                        placeholder="Module name"
                                        value={newModuleTitle}
                                        onChange={(e) => setNewModuleTitle(e.target.value)}
                                        className="h-8 text-sm rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2 mt-3">
                                    <Label className="text-xs font-bold uppercase">Batch Restrictions</Label>
                                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
                                        {courseBatches.length === 0 ? (
                                            <p className="text-[9px] text-slate-400 italic">No batches found.</p>
                                        ) : (
                                            courseBatches.map(batch => (
                                                <div key={batch.id} className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox"
                                                        id={`new-batch-${batch.id}`}
                                                        checked={newModuleBatches.includes(batch.id)}
                                                        onChange={(e) => {
                                                            let nextBatches = [...newModuleBatches];
                                                            if (e.target.checked) {
                                                                nextBatches.push(batch.id);
                                                            } else {
                                                                nextBatches = nextBatches.filter(id => id !== batch.id);
                                                            }
                                                            setNewModuleBatches(nextBatches);
                                                            setNewModuleType(deriveBatchType(nextBatches, courseBatches));
                                                        }}
                                                        className="h-3.5 w-3.5 rounded border-slate-300 text-primary"
                                                    />
                                                    <label htmlFor={`new-batch-${batch.id}`} className="text-[11px] font-medium cursor-pointer">
                                                        {batch.batch_name} ({batch.batch_type})
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-[8px] text-slate-400 mt-1 italic leading-tight">Leave empty to show to all enrolled batches.</p>
                                </div>
                            </div>
                            <DialogFooter className="flex-row gap-2 justify-end">
                                <Button variant="ghost" className="h-8 text-xs px-3" onClick={() => setIsAddModuleDialogOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleAddModule} 
                                    className="pro-button-primary rounded-lg h-8 text-xs px-4"
                                    disabled={!newModuleTitle.trim() || createModule.isPending}
                                >
                                    {createModule.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                <Button 
                    variant={activeTab === 'syllabus' ? 'default' : 'ghost'} 
                    onClick={() => setActiveTab('syllabus')}
                    className={cn("rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest transition-all", activeTab === 'syllabus' ? 'bg-white text-primary shadow-sm' : 'text-slate-400')}
                >
                    <Layers className="h-4 w-4 mr-2" />
                    Syllabus
                </Button>
                <Button 
                    variant={activeTab === 'batches' ? 'default' : 'ghost'} 
                    onClick={() => setActiveTab('batches')}
                    className={cn("rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest transition-all", activeTab === 'batches' ? 'bg-white text-primary shadow-sm' : 'text-slate-400')}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Batches
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'batches' ? (
                    <motion.div key="batches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <BatchManager 
                            courseId={course.id} 
                            courseTitle={course.title} 
                            assignedSession={course.assigned_session}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="syllabus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6 flex-1 min-w-0">
                                <Collapsible open={isUploaderOpen} onOpenChange={setIsUploaderOpen} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Course Syllabus</h3>
                                            {modules && modules.length > 0 && (
                                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-tighter px-2 h-5 bg-slate-100 text-slate-400 rounded-md">
                                                    {modules.length} Modules
                                                </Badge>
                                            )}
                                        </div>
                                        {modules && modules.length > 0 && (
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-9 px-4 gap-2 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary/5 w-fit rounded-xl">
                                                    {isUploaderOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                    {isUploaderOpen ? "Hide Uploader" : "Add Content"}
                                                </Button>
                                            </CollapsibleTrigger>
                                        )}
                                    </div>

                                    <CollapsibleContent>
                                        <div className="mb-8">
                                            <VideoUploader
                                                courseId={course.id}
                                                courseStatus={course.status || 'draft'}
                                                hideVideoList={true}
                                            />
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {modulesLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />)}
                                    </div>
                                ) : isError ? (
                                    <div className="text-center p-20 bg-red-50 rounded-[2.5rem] flex flex-col items-center">
                                        <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
                                        <h3 className="text-lg font-bold text-red-900">Failed to Load Modules</h3>
                                        <Button variant="outline" className="mt-6 border-red-200 text-red-600" onClick={() => refetchModules()}>Retry</Button>
                                    </div>
                                ) : (!modules || modules.length === 0) ? (
                                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Layers className="h-8 w-8" /></div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="text-lg font-bold text-slate-900">Quick Start</h3>
                                            <p className="text-sm text-slate-500 mt-1">Add your first module or use the uploader to get started.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {modules.map((mod: CourseModule) => (
                                            <ModuleItem key={mod.id} module={mod} course={course} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                <Card className="overflow-hidden rounded-[2rem] border-slate-200/60 shadow-xl bg-white/70 backdrop-blur-xl group sidebar-details-card">
                                    <div className="p-1">
                                        {course.thumbnail_url ? (
                                            <div className="aspect-[16/10] w-full rounded-[1.75rem] overflow-hidden bg-slate-100 shadow-inner group-hover:shadow-2xl transition-all duration-700">
                                                <img 
                                                    src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                                                    alt="Course Thumbnail" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[16/10] w-full rounded-[1.75rem] bg-slate-50 flex items-center justify-center text-slate-200 border border-dashed border-slate-200">
                                                <Layers className="h-10 w-10 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="p-6 pb-2">
                                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            Course Details
                                        </CardTitle>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Overview</p>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-between group-hover:bg-white group-hover:shadow-md group-hover:border-transparent transition-all duration-500">
                                                    <span className="text-sm font-bold text-slate-700">{course.category || 'Uncategorized'}</span>
                                                    <Badge variant="outline" className="h-5 text-[9px] font-black border-slate-200">AOTMS</Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curriculum Level</span>
                                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-between group-hover:bg-white group-hover:shadow-md group-hover:border-transparent transition-all duration-500">
                                                    <span className="text-sm font-bold text-slate-700">{course.level || 'Standard'}</span>
                                                    <TrendingUp className="h-3.5 w-3.5 text-primary/40" />
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Status</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Live Update</span>
                                                </div>
                                                <div className="p-4 rounded-3xl bg-slate-900 shadow-xl shadow-slate-900/10 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${ (course.status === 'approved' || course.status === 'published') ? 'bg-emerald-400' : 'bg-primary' }`} />
                                                        <span className="text-xs font-black text-white uppercase tracking-widest">
                                                            {course.status === 'approved' || course.status === 'published' ? 'Active Live' : (course.status || 'Draft Stage')}
                                                        </span>
                                                    </div>
                                                    <Badge className={`border-none h-6 px-3 rounded-full text-[9px] font-black uppercase tracking-tighter ${ (course.status === 'approved' || course.status === 'published') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white' }`}>
                                                        { (course.status === 'approved' || course.status === 'published') ? 'Verified' : 'Local' }
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-dashed border-slate-200 mt-2">
                                             <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 text-blue-600">
                                                <Activity className="h-5 w-5 shrink-0" />
                                                <p className="text-[10px] font-bold leading-relaxed">
                                                    System synchronized. All changes are being monitored for platform integrity.
                                                </p>
                                             </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
