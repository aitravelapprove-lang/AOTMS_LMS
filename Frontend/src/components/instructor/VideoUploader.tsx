import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCourseModules, useModuleVideos, useS3Upload, CourseModule, S3CourseVideo, useCreateCourseVideo, useDeleteCourseVideo, useCreateCourseModule } from "@/hooks/useCourseBuilder";
import { fetchWithAuth } from "@/lib/api";
import { Trash2, Lock, PlayCircle, MoreVertical, CheckCircle, Loader2, Plus, X, Video, Layers, Image as ImageIcon, Camera, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface VideoUploaderProps {
  courseId: string;
  courseStatus?: string;
  hideVideoList?: boolean;
  onSuccess?: () => void;
  initialModuleId?: string;
}

export function VideoUploader({ courseId, courseStatus, hideVideoList = false, onSuccess, initialModuleId }: VideoUploaderProps) {
  const { data: modulesData, isLoading: modulesLoading } = useCourseModules(courseId);
  const modules = useMemo(() => (modulesData || []) as CourseModule[], [modulesData]);
  const { data: videosData, isLoading: videosLoading } = useModuleVideos(null, courseId);
  const videos = useMemo(() => (videosData || []) as S3CourseVideo[], [videosData]);
  const uploadS3 = useS3Upload();
  const createVideo = useCreateCourseVideo();
  const deleteVideo = useDeleteCourseVideo();
  const createModule = useCreateCourseModule();
  const { toast } = useToast();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<S3CourseVideo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  
  // Inline Module Creation State
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    module_id: "",
    is_published: true,
    allowed_batches: [] as string[]
  });

  const [batches, setBatches] = useState<{ id: string, batch_name: string, batch_type: string }[]>([]);
  
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await fetchWithAuth(`/batches?course_id=${courseId}`);
        setBatches(data || []);
      } catch (e) {
        console.error("Failed to load batches", e);
      }
    };
    if (courseId) loadBatches();
  }, [courseId]);

  const isCourseApproved = courseStatus === 'approved' || courseStatus === 'published' || courseStatus === 'draft' || courseStatus === 'rejected' || !courseStatus;

  // Automatically set the destination module
  useEffect(() => {
    if (initialModuleId) {
      setNewVideo(prev => ({ ...prev, module_id: initialModuleId }));
    } else if (modules && modules.length > 0 && !newVideo.module_id && !isCreatingModule) {
      setNewVideo(prev => ({ ...prev, module_id: (modules[0] as CourseModule).id }));
    } else if (modules && modules.length === 0 && !modulesLoading) {
        // If no modules exist, default to create mode
        setIsCreatingModule(true);
    }
  }, [modules, newVideo.module_id, modulesLoading, isCreatingModule, initialModuleId]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setSelectedFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      if (!newVideo.title) {
        setNewVideo({ ...newVideo, title: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearThumbnail = () => {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
  };

  const handleUpload = async () => {
    console.log('Upload started:', { selectedFile, title: newVideo.title, module_id: newVideo.module_id, courseId });
    
    // Validation
    if (!selectedFile || !newVideo.title.trim()) {
      toast({ title: "Missing Information", description: "Please provide a video file and title.", variant: "destructive" });
      return;
    }

    if (!isCreatingModule && !newVideo.module_id) {
       toast({ title: "No Module Selected", description: "Please select a module or create a new one.", variant: "destructive" });
       return;
    }

    if (isCreatingModule && !newModuleName.trim()) {
       toast({ title: "Module Name Required", description: "Please enter a name for the new module.", variant: "destructive" });
       return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let targetModuleId = newVideo.module_id;

      // Step 0: Create Module if needed
      if (isCreatingModule) {
         console.log('Step 0: Creating new module inline...');
          const newModule = await createModule.mutateAsync({
              course_id: courseId,
              title: newModuleName,
              order_index: modules?.length || 0
          }) as CourseModule;
          targetModuleId = newModule.id;
         console.log('Step 0 complete: Created module', targetModuleId);
      }

      console.log('Step 1: Uploading video to S3...');
      const videoUrl = await uploadS3.mutateAsync({
        file: selectedFile,
        customTitle: newVideo.title,
        folder: 'LMS VIDEOS',
        onProgress: setUploadProgress,
        courseId
      });
      console.log('Step 1 complete: Video S3 URL:', videoUrl);

      let thumbnailUrl = "";
      if (thumbnailFile) {
        console.log('Step 1.5: Uploading thumbnail to S3...');
        thumbnailUrl = await uploadS3.mutateAsync({
          file: thumbnailFile,
          folder: 'VIDEO THUMBNAILS',
          courseId
        });
        console.log('Step 1.5 complete: Thumbnail S3 URL:', thumbnailUrl);
      }

      console.log('Step 2: Saving to database...');
      await createVideo.mutateAsync({
        courseId,
        moduleId: targetModuleId,
        title: newVideo.title,
        video_type: 's3',
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        order_index: videos.length,
        allowed_batches: newVideo.allowed_batches
      });
      console.log('Step 2 complete: Database saved');

      setUploadSuccess(true);
      
      // Notify parent of success (allows closing dialog)
      if (onSuccess) {
          onSuccess();
      }

      setTimeout(() => setUploadSuccess(false), 2000);

      // Reset Form
      setNewVideo(prev => ({
        ...prev,
        title: "",
        description: "",
        // Keep module ID selected (if we just created one, keep it selected for next upload)
        module_id: targetModuleId, 
        is_published: true,
        allowed_batches: []
      }));
      
      // If we created a module, switch back to select mode with the new module selected
      if (isCreatingModule) {
          setIsCreatingModule(false);
          setNewModuleName("");
      }

      clearFile();
      clearThumbnail();
      toast({ 
        title: "Upload Successful", 
        description: "Your video has been processed and added to the course." 
      });
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during the upload process.";
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo.mutateAsync(id);
      // refetch(); // Handled by mutation
      toast({ title: "Deleted", description: "Video removed from the course." });
    } catch (error) {
      toast({ title: "Error", description: "Could not remove the video.", variant: "destructive" });
    }
  };



  const getModuleTitle = (moduleId: string) => {
    const module = (modules as CourseModule[]).find((m) => m.id === moduleId);
    return module?.title || 'Unknown Module';
  };
  return (
    <div className="space-y-6">
      {/* Upload Form Section */}
      <div className="pro-card bg-white rounded-2xl sm:rounded-[2.5rem] border-slate-100 p-5 sm:p-8 shadow-sm">
        <div className="mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Upload Course Video</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium italic opacity-70">
            Choose a module and title to add a new video asset to your course library.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Video Title */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 ml-1">Video Title</Label>
              <Input
                placeholder="E.g., Introduction to the Course"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Module Selector / Creator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                 <Label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest">Target Module</Label>
                 <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-primary font-black text-[10px] sm:text-xs uppercase"
                    onClick={() => setIsCreatingModule(!isCreatingModule)}
                 >
                    {isCreatingModule ? "Existing" : "+ New Module"}
                 </Button>
              </div>
              
              <AnimatePresence mode="wait">
                  {isCreatingModule ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key="create-input"
                      >
                          <div className="flex gap-2">
                             <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                                <Layers className="h-5 w-5 text-blue-600" />
                             </div>
                             <Input
                                placeholder="Enter new module name..."
                                value={newModuleName}
                                onChange={(e) => setNewModuleName(e.target.value)}
                                className="h-12 rounded-xl border-blue-200 bg-blue-50/30 focus:ring-blue-500/20"
                                autoFocus
                            />
                          </div>
                      </motion.div>
                  ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        key="select-input"
                      >
                          <Select
                            value={newVideo.module_id}
                            onValueChange={(value) => setNewVideo({ ...newVideo, module_id: value })}
                            disabled={modulesLoading}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 cursor-pointer">
                              <SelectValue placeholder={modulesLoading ? "Loading modules..." : (modules?.length === 0 ? "No modules available" : "Choose a module")} />
                            </SelectTrigger>
                            <SelectContent>
                              {(modules as CourseModule[])?.map((module) => (
                                <SelectItem key={module.id} value={module.id}>
                                  {module.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Batch Selection */}
            {batches.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Restricted Access (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {batches.map((batch) => {
                    const isSelected = newVideo.allowed_batches.includes(batch.id);
                    return (
                      <Badge
                        key={batch.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer h-10 px-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs transition-all ${
                          isSelected ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setNewVideo({ ...newVideo, allowed_batches: newVideo.allowed_batches.filter(id => id !== batch.id) });
                          } else {
                            setNewVideo({ ...newVideo, allowed_batches: [...newVideo.allowed_batches, batch.id] });
                          }
                        }}
                      >
                        {batch.batch_name}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 italic">No batches selected = visible to all students.</p>
              </div>
            )}

            <div className="flex flex-row gap-3 pt-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  clearFile();
                  setNewVideo({ title: "", description: "", module_id: "", is_published: true });
                  setNewModuleName("");
                }} 
                disabled={uploading}
                className="flex-1 sm:flex-none rounded-xl h-11 sm:h-12 px-4 sm:px-6 border border-slate-100 hover:bg-slate-50 font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpload()}
                disabled={uploading || !selectedFile || !newVideo.title || (!isCreatingModule && !newVideo.module_id) || (isCreatingModule && !newModuleName)}
                className={`flex-[2] sm:flex-1 rounded-xl h-11 sm:h-12 font-black text-xs uppercase tracking-widest shadow-lg transition-all ${uploadSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'pro-button-primary shadow-primary/20'}`}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                {uploadSuccess ? (
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {isCreatingModule ? "Created!" : "Uploaded!"}</span>
                ) : (isCreatingModule ? 'Create & Upload' : 'Confirm Upload')}
              </Button>
            </div>
          </div>
          
          {/* Right Column (File Upload) remains unchanged */}
          <div className="space-y-6">
            {/* Video File Upload */}
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Video File</Label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center
                  ${selectedFile ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {videoPreviewUrl ? (
                  <div className="space-y-4 w-full">
                    <div className="relative mx-auto max-w-[240px] sm:max-w-[280px] aspect-video rounded-xl overflow-hidden shadow-md">
                      <video src={videoPreviewUrl} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] sm:text-xs tracking-widest uppercase">
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedFile?.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hover:bg-rose-50 hover:text-rose-500" 
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center mx-auto text-slate-400 group-hover:text-primary transition-all group-hover:scale-110">
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-black text-slate-700 tracking-tight">Drop video here</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">MP4, WebM (Max 500MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Thumbnail</Label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer group min-h-[110px] sm:min-h-[140px] flex flex-col items-center justify-center
                  ${thumbnailFile ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-50'}`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      const file = target.files[0];
                      if (thumbnailPreviewUrl) {
                        URL.revokeObjectURL(thumbnailPreviewUrl);
                      }
                      setThumbnailFile(file);
                      setThumbnailPreviewUrl(URL.createObjectURL(file));
                    }
                  };
                  input.click();
                }}
              >
                {thumbnailPreviewUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm group mx-auto max-w-[200px]">
                    <img src={thumbnailPreviewUrl} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera className="h-5 w-5 text-white" />
                    </div>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full scale-0 group-hover:scale-100 transition-transform" 
                        onClick={(e) => { e.stopPropagation(); clearThumbnail(); }}
                      >
                        <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                       <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-primary transition-colors">Select Image</p>
                  </div>
                )}
              </div>
            </div>

            {uploading && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>{isCreatingModule ? "Creating Module & Uploading..." : "Uploading Video..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 rounded-full bg-slate-200" />
                <p className="text-[10px] text-center text-slate-400 italic">Please do not close this window</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!hideVideoList && (
        <>
          {/* Search and Filters (Optional space for later) */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Your Video Library ({videos.length})</h3>
          </div>
          
          {/* Dynamic Content Grid */}
          <AnimatePresence mode="wait">
            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]" />
                ))}
              </div>
            ) : !isCourseApproved ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-16 bg-slate-50/50 rounded-[3rem] border border-slate-100 text-center"
              >
                <div className="h-20 w-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Upload Status Locked</h3>
                <p className="text-slate-500 max-w-sm mt-3 leading-relaxed">
                  Your course is currently in the review phase. Once an administrator approves the syllabus, 
                  you can begin deploying your video assets.
                </p>
                <Button variant="outline" className="mt-8 rounded-2xl h-12 px-8 border-slate-200 font-bold">
                  Check Review Progress
                </Button>
              </motion.div>
            ) : videos.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center"
              >
                <p className="text-slate-400 text-sm">No videos yet</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(videos as S3CourseVideo[]).map((video, index: number) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group relative cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                  >
                    <div className="pro-card h-full bg-white rounded-[2.5rem] border-slate-100 p-3 shadow-sm hover:shadow-2xl hover:border-primary/5 transition-all duration-500 overflow-hidden flex flex-col">
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video rounded-[2rem] bg-slate-100 overflow-hidden shadow-inner group-hover:shadow-2xl transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {video.video_url ? (
                          <video
                            src={video.video_url.startsWith('http') ? video.video_url : (video.video_url.includes('s3') ? video.video_url : `/s3/public/${video.video_url}`)}
                            poster={video.thumbnail_url ? (video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `/s3/public/${video.thumbnail_url}`) : undefined}
                            className="h-full w-full object-cover translate-z-0 transition-transform duration-1000 group-hover:scale-110"
                            preload="metadata"
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={(e) => {
                              const v = e.target as HTMLVideoElement;
                              v.pause();
                              v.currentTime = 0;
                            }}
                            muted
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <PlayCircle className="h-12 w-12 text-slate-200" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 z-20">
                           <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none font-bold text-[10px] uppercase shadow-sm">
                            {getModuleTitle(video.module_id)}
                           </Badge>
                        </div>
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20">
                          <div className="h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <PlayCircle className="h-8 w-8 text-primary ml-1" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                             <h4 className="font-black text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">{video.title}</h4>
                          </div>
                          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                            {video.description || "Educational content assets deployed to your module library."}
                          </p>
                        </div>

                        <div className="mt-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <div className="flex items-center gap-1.5">
                               <Clock className="h-3 w-3 text-slate-300" />
                               <span>Uploaded: {formatDate(video.created_at)}</span>
                             </div>
                           </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-5">
                           <div className="flex items-center gap-2">
                             <div className={`h-2 w-2 rounded-full ${video.is_published ? 'bg-green-500' : 'bg-slate-300'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                               {video.is_published ? "Live Access" : "Development"}
                             </span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-400" title="Settings">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                             <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(video.id)}
                              className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Purge Asset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Video Player Modal */}
          <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
            <DialogContent className="max-w-5xl w-full p-0 bg-black rounded-3xl overflow-hidden border-none">
              <DialogHeader className="sr-only">
                <DialogTitle>{playingVideo?.title}</DialogTitle>
              </DialogHeader>
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                {playingVideo?.video_url && (
                  <video
                    src={playingVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
