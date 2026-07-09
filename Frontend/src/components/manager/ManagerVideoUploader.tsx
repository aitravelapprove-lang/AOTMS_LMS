import { useState, useRef, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Video,
    Upload,
    Play,
    FileVideo,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    CloudUpload,
    Layers,
    ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInstructorS3Courses, useCourseModules, useCreateCourseVideo, useS3Upload } from "@/hooks/useCourseBuilder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function ManagerVideoUploader() {
    const { data: courses } = useInstructorS3Courses();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const { data: modules } = useCourseModules(selectedCourseId || null);
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");

    const createVideo = useCreateCourseVideo();
    const uploadS3 = useS3Upload();
    const { toast } = useToast();

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoDetails, setVideoDetails] = useState({
        title: "",
        description: "",
    });
    const [finalUrl, setFinalUrl] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith("video/")) {
            toast({ title: "Invalid File", description: "Please upload a valid video file.", variant: "destructive" });
            return;
        }
        setSelectedFile(file);
        setVideoDetails((prev) => ({
            ...prev,
            title: prev.title || file.name.split(".")[0],
        }));

        // Create object URL for instant preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setUploadStatus("idle");
    }, [toast, previewUrl]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !videoDetails.title.trim() || !selectedModuleId) {
            toast({ title: "Missing Information", description: "Please select a course/module and enter a title." });
            return;
        }

        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
            // 1. Upload to S3 via hook
            const bucketUrl = await uploadS3.mutateAsync({
                file: selectedFile,
                customTitle: videoDetails.title,
                folder: 'LMS VIDEOS',
                onProgress: setUploadProgress,
                courseId: selectedCourseId
            });

            // 2. Save metadata to Backend API
            await createVideo.mutateAsync({
                moduleId: selectedModuleId,
                title: videoDetails.title,
                video_type: 's3',
                video_url: bucketUrl,
                order_index: 0
            });

            setFinalUrl(bucketUrl);
            setUploadStatus("success");
            setUploadProgress(100);
            toast({ title: "Upload Success", description: "Video stored in S3 and linked to module." });

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus("error");
            if (error.message === 'COURSE_NOT_APPROVED') {
                toast({ title: "Course Not Approved", description: "This course must be approved before uploading videos.", variant: "destructive" });
            } else {
                toast({ title: "Upload Failed", description: "Something went wrong during the upload process.", variant: "destructive" });
            }
        }
    };

    const resetUploader = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        setVideoDetails({ title: "", description: "" });
        setFinalUrl("");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight">Cloud Media Manager</h2>
                <p className="text-muted-foreground text-sm">
                    Securely upload and manage high-quality video resources for your LMS.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Zone */}
                <Card className="lg:col-span-2 overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30">
                    <CardContent className="p-0">
                        {!selectedFile ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "flex flex-col items-center justify-center min-h-[400px] p-12 transition-all duration-300",
                                    isDragging ? "bg-primary/10 scale-[0.99] border-primary" : "hover:bg-primary/5"
                                )}
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100"></div>
                                    <CloudUpload className="h-20 w-20 text-primary relative z-10 animate-bounce" />
                                </div>
                                <h3 className="mt-8 text-xl font-semibold">Drop your video here</h3>
                                <p className="mt-2 text-muted-foreground text-center max-w-sm">
                                    Drag and drop your MP4, WebM or OGG files here. Supports files up to 1GB for high-speed delivery.
                                </p>
                                <div className="mt-8 flex items-center gap-2">
                                    <div className="h-px w-8 bg-border"></div>
                                    <span className="text-xs uppercase font-bold text-muted-foreground">Or</span>
                                    <div className="h-px w-8 bg-border"></div>
                                </div>
                                <Button
                                    size="lg"
                                    className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileVideo className="mr-2 h-4 w-4" />
                                    Select Local File
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    className="hidden"
                                    title="Select video file"
                                />
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm truncate max-w-[200px] md:max-w-md">
                                                {selectedFile.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Initialized
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={resetUploader} disabled={uploadStatus === "uploading"}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Video Preview */}
                                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl group border border-white/10">
                                    {previewUrl && (
                                        <video
                                            src={previewUrl}
                                            className="w-full h-full object-contain"
                                            controls
                                        />
                                    )}
                                    {uploadStatus === "idle" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" className="rounded-full">
                                                <Play className="mr-2 h-4 w-4 fill-current" /> Preview Mode
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {uploadStatus !== "idle" && (
                                    <div className="space-y-3 bg-card p-4 rounded-xl border">
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-medium flex items-center gap-2">
                                                {uploadStatus === "uploading" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                                {uploadStatus === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                {uploadStatus === "error" && <AlertCircle className="h-3 w-3 text-destructive" />}
                                                {uploadStatus === "uploading" ? "Broadcasting to Cloud..." : uploadStatus === "success" ? "Upload Completed Successfully" : "Connection Error"}
                                            </span>
                                            <span className="text-primary font-bold">{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-2" />
                                        {uploadStatus === "success" && (
                                            <div className="flex flex-col gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Object URL generated and ready for database sync.
                                                </div>
                                                <div className="bg-white p-2 rounded border border-emerald-200 text-[10px] font-mono break-all text-muted-foreground select-all">
                                                    {finalUrl}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Video Metadata</CardTitle>
                            <CardDescription className="text-xs">Required for indexing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Target Course</label>
                                <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses?.map((course: any) => (
                                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Target Module</label>
                                <Select onValueChange={setSelectedModuleId} value={selectedModuleId} disabled={!selectedCourseId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules?.map((module: any) => (
                                            <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Content Title</label>
                                <Input
                                    placeholder="e.g. Advanced Mathematics Lec 01"
                                    value={videoDetails.title}
                                    onChange={(e) => setVideoDetails({ ...videoDetails, title: e.target.value })}
                                    disabled={uploadStatus === "uploading" || !selectedFile}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Description</label>
                                <Textarea
                                    placeholder="Summary of the video content..."
                                    className="min-h-[100px] text-sm"
                                    value={videoDetails.description}
                                    onChange={(e) => setVideoDetails({ ...videoDetails, description: e.target.value })}
                                    disabled={uploadStatus === "uploading" || !selectedFile}
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    className="w-full justify-between h-11"
                                    disabled={!selectedFile || uploadStatus === "uploading" || uploadStatus === "success" || !selectedModuleId}
                                    onClick={handleUpload}
                                >
                                    <span className="flex items-center gap-2">
                                        <CloudUpload className="h-4 w-4" />
                                        {uploadStatus === "idle" ? "Start Secure Upload" : "Broadcasting..."}
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>

                                {uploadStatus === "success" && (
                                    <Button variant="outline" className="w-full h-11" onClick={resetUploader}>
                                        Upload New Video
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">System Node Status</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">AWS S3 Uplink</span>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">ACTIVE</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">CDN Purge Node</span>
                                    <Badge variant="outline">READY</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Security Token</span>
                                    <span className="font-mono text-[10px] opacity-60">X9-22-AUTH</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
