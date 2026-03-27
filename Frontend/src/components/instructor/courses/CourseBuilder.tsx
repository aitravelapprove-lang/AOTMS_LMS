import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, ArrowLeft, Trash2, UploadCloud, GripVertical, Loader2, CheckCircle2, XCircle, Copy, Check, AlertTriangle, Clock, CheckCircle, FileVideo, X, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCourseModules, useCreateCourseModule, useModuleVideos, useCreateCourseVideo, useS3Upload, useUpdateCourseStatus, CourseModule, S3CourseVideo, useDeleteCourseVideo } from '@/hooks/useCourseBuilder';
import { Course } from '@/hooks/useInstructorData';
import { VideoUploader } from '../VideoUploader';

interface CourseBuilderProps {
    course: Course;
    onBack: () => void;
}

function ModuleItem({ module, course }: { module: CourseModule, course: Course }) {
    const { data: videos, refetch } = useModuleVideos(module.id, course.id);
    const createVideo = useCreateCourseVideo();
    const deleteVideo = useDeleteCourseVideo();
    const uploadS3 = useS3Upload();
    const { toast } = useToast();

    const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
    const [videoTitle, setVideoTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [copiedModule, setCopiedModule] = useState(false);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

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

    const handleFileChange = (file: File | null) => {
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setSelectedFile(file);
        if (file) {
            setVideoPreviewUrl(URL.createObjectURL(file));
            if (!videoTitle) setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
        } else {
            setVideoPreviewUrl(null);
        }
    };

    const clearForm = () => {
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setSelectedFile(null);
        setVideoPreviewUrl(null);
        setVideoTitle('');
        setUploadProgress(0);
    };

    const handleUploadVideo = async () => {
        if (!selectedFile || !videoTitle) return;
        try {
            const bucketUrl = await uploadS3.mutateAsync({
                file: selectedFile,
                customTitle: videoTitle,
                folder: 'LMS VIDEOS',
                onProgress: setUploadProgress,
                courseId: course.id
            });

            await createVideo.mutateAsync({
                moduleId: module.id,
                courseId: course.id,
                title: videoTitle,
                video_type: 's3',
                video_url: bucketUrl,
                order_index: (videos?.length || 0) + 1
            });

            clearForm();
            setIsVideoUploadOpen(false);
            toast({ title: "Success", description: "Video successfully integrated into this module." });
        } catch (err: unknown) {
            console.error('Video upload failed', err);
            toast({ title: "Upload Failed", description: "Cloud synchronization failed. Please try again.", variant: "destructive" });
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

    const isApproved = course.status === 'approved' || course.status === 'published';

    return (
        <Card className="mb-6 overflow-hidden rounded-[2rem] border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-500 bg-white group">
            <CardHeader className="py-6 px-8 bg-slate-50/50 flex flex-row items-center justify-between border-b border-dashed border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm cursor-grab group-active:cursor-grabbing border border-slate-100">
                        <GripVertical className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-black text-slate-900 leading-none">
                                {module.title}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-primary transition-colors"
                                onClick={handleCopyModuleId}
                            >
                                {copiedModule ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section {module.order_index + 1}</p>
                    </div>
                </div>

                <Dialog open={isVideoUploadOpen} onOpenChange={(open) => {
                    setIsVideoUploadOpen(open);
                    if (!open) clearForm();
                }}>
                    <DialogTrigger asChild>
                        <Button 
                            className="rounded-2xl h-11 px-6 gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm border font-bold text-sm"
                            disabled={!isApproved}
                        >
                            <Plus className="h-4 w-4 text-primary" /> 
                            Add Content Video
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border-slate-200 rounded-3xl p-0 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2 text-primary font-bold uppercase tracking-widest text-xs">
                                    <Layers className="h-4 w-4" /> Module Specific
                                </div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    Upload to "{module.title}"
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">Display Title</Label>
                                    <Input
                                        placeholder="e.g. Chapter 1: Foundations"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-5"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">Media Source</Label>
                                    <AnimatePresence mode="wait">
                                        {videoPreviewUrl ? (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative rounded-[2rem] overflow-hidden bg-black aspect-video border-4 border-white shadow-2xl"
                                            >
                                                <video src={videoPreviewUrl} className="w-full h-full object-contain" controls />
                                                <button
                                                    onClick={() => handleFileChange(null)}
                                                    className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-all group"
                                            >
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    id={`video-file-${module.id}`}
                                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                />
                                                <label htmlFor={`video-file-${module.id}`} className="cursor-pointer">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-primary/20 transition-all">
                                                            <UploadCloud className="h-7 w-7 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">Select Module Video</p>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">MP4 or MOV, up to 500MB</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence>
                                    {uploadS3.isPending && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-slate-900 rounded-3xl text-white space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing with AWS S3...</span>
                                                <span className="text-sm font-black">{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-1.5 bg-white/10" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                <Button variant="ghost" onClick={() => setIsVideoUploadOpen(false)} disabled={uploadS3.isPending} className="h-14 flex-1 rounded-2xl font-bold">Cancel</Button>
                                <Button
                                    onClick={handleUploadVideo}
                                    disabled={!selectedFile || !videoTitle || uploadS3.isPending}
                                    className="pro-button-primary h-14 flex-[2] rounded-2xl font-black gap-2"
                                >
                                    {uploadS3.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                    Deploy to Module
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-8">
                {!videos || videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <FileVideo className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Library Empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((vid: S3CourseVideo, idx: number) => (
                            <motion.div 
                                key={vid.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group/vid relative bg-slate-50/50 rounded-3xl border border-slate-100 p-3 hover:bg-white hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative aspect-video rounded-2xl bg-black overflow-hidden mb-4">
                                    <video
                                        key={vid.video_url}
                                        controls
                                        className="w-full h-full object-contain"
                                        preload="metadata"
                                        poster={vid.thumbnail_url ? (vid.thumbnail_url.startsWith('http') ? vid.thumbnail_url : `/s3/public/${vid.thumbnail_url}`) : undefined}
                                    >
                                        <source src={vid.video_url.startsWith('https') ? vid.video_url : (vid.video_url.includes('s3') ? vid.video_url : `/s3/public/${vid.video_url}`)} type="video/mp4" />
                                    </video>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteVideo(vid.id)}
                                            className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <h4 className="font-bold text-slate-800 truncate mb-1">{vid.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section {module.order_index + 1} • Video {idx + 1}</span>
                                        <div className="h-1 w-1 rounded-full bg-green-500" />
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
    const { data: modules, isLoading: modulesLoading, isError, refetch: refetchModules } = useCourseModules(course.id);
    const updateStatus = useUpdateCourseStatus();
    const createModule = useCreateCourseModule();
    const { toast } = useToast();

    const [copiedCourse, setCopiedCourse] = useState(false);
    const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);

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
                order_index: modules?.length || 0
            });
            setNewModuleTitle('');
            setIsAddModuleDialogOpen(false);
            toast({ title: "Module Created", description: `"${newModuleTitle}" has been added to the syllabus.` });
        } catch (err: any) {
            toast({ title: "Failed to Add Module", description: err?.message || 'Unknown error', variant: "destructive" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={handleCopyCourseId}
                        >
                            {copiedCourse ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Badge
                            variant={
                                (course.status === 'approved' || course.status === 'published') ? 'default' :
                                course.status === 'pending' ? 'secondary' :
                                course.status === 'rejected' ? 'destructive' : 'outline'
                            }
                            className="ml-2 py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider"
                        >
                            {(course.status === 'approved' || course.status === 'published') ? 'Approved' : (course.status || 'Draft')}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
                        <span className={`flex h-2 w-2 rounded-full ${(course.status === 'approved' || course.status === 'published') ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {(course.status === 'approved' || course.status === 'published') 
                            ? 'Live on Platform - Video upload enabled' 
                            : 'Build your course content here - Video upload enabled for Draft/Rejected'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(course.status === 'draft' || course.status === 'rejected') && (
                        <Button
                            variant="default"
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                            onClick={handlePublish}
                            disabled={updateStatus.isPending || (modules?.length === 0)}
                        >
                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            Submit for Approval
                        </Button>
                    )}

                    <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50">
                                <Plus className="h-4 w-4" /> Add Module
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm rounded-2xl">
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
                            </div>
                            <DialogFooter className="flex-row gap-2 justify-end">
                                <Button variant="ghost" className="h-8 text-xs" onClick={() => setIsAddModuleDialogOpen(false)}>Cancel</Button>
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

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Collapsible open={isUploaderOpen} onOpenChange={setIsUploaderOpen} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-900">Course Syllabus</h3>
                                {modules && modules.length > 0 && (
                                    <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 h-5 bg-slate-100 text-slate-500">
                                        {modules.length} Modules
                                    </Badge>
                                )}
                            </div>
                            {modules && modules.length > 0 && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
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
                    <Card>
                        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {course.thumbnail_url && (
                                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                                    <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`} className="w-full h-full object-cover" alt="Thumbnail" />
                                </div>
                            )}
                            <div><span className="font-semibold">Category:</span> {course.category || 'N/A'}</div>
                            <div><span className="font-semibold">Level:</span> {course.level || 'N/A'}</div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Status:</span>
                                <Badge variant={ (course.status === 'approved' || course.status === 'published') ? 'default' : 'outline' }>
                                    {course.status === 'approved' || course.status === 'published' ? 'Live' : (course.status || 'Draft')}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
