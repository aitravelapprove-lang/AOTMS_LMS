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
import { cn } from "@/lib/utils";

const deriveBatchType = (selectedIds: string[], allBatches: {id: string, batch_type: string}[]) => {
    if (selectedIds.length === 0) return 'all';
    const selectedBatchTypes = allBatches
        .filter(b => selectedIds.includes(b.id))
        .map(b => b.batch_type);
    const uniqueTypes = [...new Set(selectedBatchTypes)];
    if (uniqueTypes.length === 1) return uniqueTypes[0];
    return 'all';
};

import { Trash2, Lock, PlayCircle, MoreVertical, CheckCircle, Loader2, Plus, X, Video, Layers, Image as ImageIcon, Camera, Clock, ExternalLink } from "lucide-react";
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
    drive_link: "",
    is_published: true,
    batch_type: 'all',
    allowed_batches: [] as string[]
  });

  const [batches, setBatches] = useState<{ id: string, batch_name: string, batch_type: string }[]>([]);

  useEffect(() => {
    const loadBatches = async () => {
        try {
            const data = await fetchWithAuth(`/batches?course_id=${courseId}`) as any[];
            setBatches(data || []);
        } catch (e) {
            console.error("Failed to load batches", e);
        }
    };
    if (courseId) loadBatches();
  }, [courseId]);

  const toggleBatch = (batchId: string) => {
      const isSelected = newVideo.allowed_batches.includes(batchId);
      const updatedIds = isSelected 
          ? newVideo.allowed_batches.filter(id => id !== batchId)
          : [...newVideo.allowed_batches, batchId];
      
      setNewVideo(prev => ({
          ...prev,
          allowed_batches: updatedIds,
          batch_type: deriveBatchType(updatedIds, batches)
      }));
  };


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
    if ((!selectedFile && !newVideo.drive_link.trim()) || !newVideo.title.trim()) {
      toast({ title: "Missing Information", description: "Please provide a video file or Google Drive link, and a title.", variant: "destructive" });
      return;
    }
    
    if (!thumbnailFile) {
        toast({ title: "Thumbnail Required", description: "Please provide a thumbnail image.", variant: "destructive" });
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
              order_index: modules?.length || 0,
              batch_type: newVideo.batch_type,
              allowed_batches: newVideo.allowed_batches
          }) as CourseModule;
          targetModuleId = newModule.id;
         console.log('Step 0 complete: Created module', targetModuleId);
      }

      let videoUrl = "";
      if (selectedFile) {
          console.log('Step 1: Uploading video to S3...');
          videoUrl = await uploadS3.mutateAsync({
            file: selectedFile,
            customTitle: newVideo.title,
            folder: 'LMS VIDEOS',
            onProgress: setUploadProgress,
            courseId
          });
          console.log('Step 1 complete: Video S3 URL:', videoUrl);
      } else {
          console.log('Step 1 skipped: Using Drive Link instead of S3 output.');
          // Use a dummy or empty video_url if backend requires it, but we made it optional.
      }

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
        video_type: selectedFile ? 's3' : 'external',
        video_url: videoUrl,
        drive_link: newVideo.drive_link,
        thumbnail_url: thumbnailUrl,
        order_index: videos.length,
        allowed_batches: newVideo.allowed_batches,
        batch_type: newVideo.batch_type
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
        drive_link: "",
        // Keep module ID selected (if we just created one, keep it selected for next upload)
        module_id: targetModuleId, 
        is_published: true,
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
      <div className="pro-card bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 lg:p-10 shadow-xl shadow-slate-200/50 w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Upload Course Video</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
              Add high-quality instructional assets to your learning library. Choose a target module and define accessibility parameters.
            </p>
          </div>
          <div className="hidden lg:flex h-16 w-16 bg-primary/10 rounded-2xl items-center justify-center border border-primary/10">
            <Video className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="flex flex-col space-y-10 lg:space-y-12 w-full max-w-4xl mx-auto">
            {/* 1. Video Title Input Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Video Title <span className="text-rose-500 font-black">*</span></Label>
              </div>
              <div className="relative">
                <Input
                  placeholder="Enter the title for this lesson..."
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="h-14 rounded-2xl border-slate-300 border-2 bg-white focus:ring-4 focus:ring-primary/5 pl-12 text-base font-semibold transition-all shadow-sm w-full"
                />
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* 2. Module Mapping Group */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Select Module <span className="text-rose-500 font-black">*</span></Label>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-primary font-bold text-[10px] uppercase hover:bg-transparent"
                  onClick={() => setIsCreatingModule(!isCreatingModule)}
                >
                  {isCreatingModule ? "Cancel" : "+ Create New Module"}
                </Button>
              </div>
              
              <AnimatePresence mode="wait">
                {isCreatingModule ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    key="create-input"
                    className="flex gap-3"
                  >
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center border-2 border-blue-200 shrink-0">
                      <Layers className="h-6 w-6 text-blue-600" />
                    </div>
                    <Input
                      placeholder="Name your new category or module..."
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      className="h-14 rounded-2xl border-blue-300 border-2 bg-blue-50/20 focus:ring-4 focus:ring-blue-500/5 text-base font-semibold w-full"
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    key="select-input"
                  >
                    <Select
                      value={newVideo.module_id}
                      onValueChange={(value) => setNewVideo({ ...newVideo, module_id: value })}
                      disabled={modulesLoading}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-slate-300 border-2 bg-white transition-all hover:bg-slate-50 font-semibold overflow-hidden w-full">
                        <SelectValue placeholder={modulesLoading ? "Loading modules..." : "Choose where this video belongs"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                        {(modules as CourseModule[])?.map((module) => (
                          <SelectItem key={module.id} value={module.id} className="text-sm font-medium p-3">
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Resource Access (Google Drive) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1 mr-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Access Control (Google Drive Link) <span className="text-rose-500 font-black">*</span></Label>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Required if no video</span>
              </div>
              <div className="relative group">
                <Input
                  placeholder="Paste Google Drive shared link here..."
                  value={newVideo.drive_link}
                  onChange={(e) => setNewVideo({ ...newVideo, drive_link: e.target.value })}
                  className="h-14 rounded-2xl border-slate-300 border-2 bg-white focus:ring-4 focus:ring-amber-500/10 pl-12 text-base font-medium transition-all shadow-sm w-full"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-amber-500">
                        <path fill="currentColor" d="M20.21 12l-3.3 5.72h-6.6L13.61 12l-3.3-5.71h6.61l3.29 5.71zm-9.91-5.71L7 6.29L3.71 12l3.3 5.71h6.6L10.31 12zM2.87 13.71L6.16 19.43l3.3-5.72z" />
                    </svg>
                </div>
              </div>
            </div>

            {/* Batch Selection for Video Visibility */}
            {batches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Restrict Visibility (Optional)</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={newVideo.allowed_batches.length === 0 ? "default" : "outline"}
                      onClick={() => setNewVideo(prev => ({ ...prev, allowed_batches: [], batch_type: 'all' }))}
                      className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider"
                    >
                      All Students
                    </Button>
                    {batches.map(batch => (
                      <Button
                        key={batch.id}
                        type="button"
                        variant={newVideo.allowed_batches.includes(batch.id) ? "default" : "outline"}
                        onClick={() => toggleBatch(batch.id)}
                        className={`rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider ${
                            newVideo.allowed_batches.includes(batch.id) 
                            ? (batch.batch_type === 'morning' ? 'bg-orange-500 hover:bg-orange-600' : 
                               batch.batch_type === 'afternoon' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-violet-500 hover:bg-violet-600')
                            : ''
                        }`}
                      >
                        {batch.batch_name} ({batch.batch_type})
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em] ml-1">
                     Selection restricted to chosen batches. Leave blank for "All Enrolled".
                  </p>
                </div>
            )}

            {/* 4. Asset Selection Side (Media) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full border-t-2 border-slate-100 pt-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1 mr-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Video File <span className="text-rose-500 font-black">*</span></Label>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Required if no link</span>
                </div>
                <div 
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] lg:min-h-[260px]
                    ${selectedFile ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:border-primary'}`}
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
                    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
                      <div className="relative mx-auto w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white max-w-[280px]">
                        <video src={videoPreviewUrl} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                         <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border-2 border-slate-200">
                            <Video className="h-5 w-5 text-primary" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{selectedFile?.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors shrink-0" 
                              onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                         </div>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">File ready</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-6 group-hover:scale-105 transition-transform duration-500">
                      <div className="h-16 w-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-primary transition-all border border-slate-200">
                        <Plus className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 tracking-tight">Select Video</h4>
                        <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-wider max-w-[180px] mx-auto leading-relaxed">Click or drag to upload (Max 500MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Thumbnail Image <span className="text-rose-500 font-black">*</span></Label>
                </div>
                <div 
                  className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer group min-h-[220px] lg:min-h-[260px] flex flex-col items-center justify-center
                    ${thumbnailFile ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:border-primary'}`}
                  onClick={(e) => {
                    if (thumbnailFile) {
                      e.stopPropagation();
                      return;
                    }
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
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl ring-2 ring-white group mx-auto max-w-[280px] animate-in fade-in zoom-in-95">
                      <img src={thumbnailPreviewUrl} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Camera className="h-6 w-6 text-white" />
                      </div>
                      <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 rounded-xl scale-0 group-hover:scale-100 transition-all shadow-lg" 
                          onClick={(e) => { e.stopPropagation(); clearThumbnail(); }}
                        >
                          <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-14 w-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-400 group-hover:text-primary transition-all border border-slate-200">
                         <ImageIcon className="h-7 w-7" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary">Add thumbnail</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Progress & Action Group */}
            <div className="space-y-6 pt-4">
              <AnimatePresence>
                  {uploading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4 p-6 bg-primary/5 backdrop-blur-md rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 w-full"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading Video...
                        </span>
                        <span className="text-[10px] font-bold text-primary">{uploadProgress}% Complete</span>
                      </div>
                      <Progress value={uploadProgress} className="h-3 rounded-full bg-slate-200/50 [&>div]:bg-primary shadow-inner" />
                      <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-tight">Uploading file, please do not close this window.</p>
                    </motion.div>
                  )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearFile();
                    setNewVideo({ 
                      title: "", 
                      description: "", 
                      module_id: "", 
                      is_published: true, 
                      allowed_batches: [], 
                      drive_link: "", 
                      batch_type: "all" 
                    });
                    setNewModuleName("");
                  }} 
                  disabled={uploading}
                  className="w-full sm:w-1/3 h-14 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={() => handleUpload()}
                  disabled={
                    uploading || 
                    (!selectedFile && !newVideo.drive_link.trim()) || 
                    !newVideo.title.trim() || 
                    !thumbnailFile ||
                    (!isCreatingModule && !newVideo.module_id) || 
                    (isCreatingModule && !newModuleName.trim())
                  }
                  className={`w-full sm:w-2/3 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] ${uploadSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-primary hover:bg-primary/90 shadow-primary/30'}`}
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Video className="h-5 w-5 mr-3" />}
                  {uploadSuccess ? (
                    <span className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Video Saved!</span>
                  ) : (isCreatingModule ? 'Create & Upload' : 'Upload Video')}
                </Button>
              </div>
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
                        ) : video.drive_link ? (
                          <div className="h-full w-full relative">
                            <img 
                              src={video.thumbnail_url?.startsWith('http') ? video.thumbnail_url : `/s3/public/${video.thumbnail_url}`} 
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              alt=""
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="h-12 w-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <ExternalLink className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                          </div>
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
                            {video.video_url ? (
                                <PlayCircle className="h-8 w-8 text-primary ml-1" />
                            ) : (
                                <ExternalLink className="h-8 w-8 text-indigo-600" />
                            )}
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
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                {playingVideo?.video_url ? (
                  <video
                    src={playingVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-10 text-center space-y-6">
                    <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                        <ExternalLink className="h-10 w-10 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">{playingVideo?.title}</h3>
                        <p className="text-slate-400 text-sm">This resource is hosted on Google Drive.</p>
                    </div>
                    <Button 
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                        onClick={() => window.open(playingVideo?.drive_link, '_blank')}
                    >
                        Go to Google Drive
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
