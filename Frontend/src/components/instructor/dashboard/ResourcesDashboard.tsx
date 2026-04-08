import React, { useState, useRef, useCallback } from 'react';
import { 
  Cloud, 
  Upload, 
  FileText, 
  File as FileIcon, 
  Trash2, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Presentation,
  BookOpen,
  Users
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardFooter,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { 
  useResources, 
  useCreateResource, 
  useDeleteResource,
  Course,
  CourseResource
} from '@/hooks/useInstructorData';
import { useAuth } from '@/hooks/useAuth';
import { CourseSelector } from '@/components/instructor/CourseSelector';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg',
  'image/gif'
];

interface Batch {
  id: string;
  batch_name: string;
}

export function ResourcesDashboard() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string | null>(null);

  // Form states for metadata confirmation
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [pendingResource, setPendingResource] = useState<{
    file: File;
    publicUrl: string;
    filePath: string;
  } | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    resource_type: 'Study Material' as CourseResource['resource_type'],
    allowed_batches: [] as string[]
  });

  const [batches, setBatches] = useState<Batch[]>([]);

  React.useEffect(() => {
    const loadBatches = async () => {
      if (!selectedCourse) return;
      try {
        const data = (await fetchWithAuth(`/batches?course_id=${selectedCourse.id}`)) as Batch[];
        setBatches(data || []);
      } catch (e) {
        console.error("Failed to load batches", e);
      }
    };
    loadBatches();
  }, [selectedCourse]);

  const { data: resources = [], isLoading: loadingResources, refetch } = useResources(selectedCourse?.id || null);
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 100MB limit.`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
      handleUpload(validFiles[0]); // Upload first file then ask for metadata
    }
  };

  const handleUpload = async (file: File) => {
    if (!selectedCourse || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setCurrentUploadingFile(file.name);
    try {
        const formData = new FormData();
        formData.append('file', file);

        // Call the new Backend API endpoint for storage upload
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/upload/course-resources`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Upload failed');
        }

        const { url: publicUrl } = await res.json();

        // Open Dialog to confirm metadata
        setPendingResource({ file, publicUrl, filePath: publicUrl });
        setResourceFormData({
            title: file.name,
            description: `Resource for course ${selectedCourse.title}`,
            resource_type: getResourceType(file.type || '', file.name) as CourseResource['resource_type'],
            allowed_batches: []
        });
        setMetadataDialogOpen(true);

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Upload error:', err);
        toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}. ${err.message}`,
            variant: 'destructive'
        });
    } finally {
        setUploading(false);
        setUploadFiles([]);
    }
  };

  const handleSaveMetadata = async () => {
    if (!pendingResource || !selectedCourse || !user) return;

    try {
        await createResource.mutateAsync({
            course_id: selectedCourse.id,
            asset_title: resourceFormData.title,
            file_url: pendingResource.publicUrl,
            resource_type: resourceFormData.resource_type,
            upload_format: pendingResource.file.name.split('.').pop() || 'unknown',
            instructor_avatar_url: (user as { photoURL?: string }).photoURL || '',
            instructor_name: (user as { displayName?: string, email?: string }).displayName || user.email || 'Instructor',
            short_description: resourceFormData.description,
            allowed_batches: resourceFormData.allowed_batches
        });

        toast({
            title: 'Resource Published',
            description: `${resourceFormData.title} is now available for students.`,
            className: "bg-green-500 text-white",
        });

        setMetadataDialogOpen(false);
        setPendingResource(null);
        refetch();
    } catch (error: unknown) {
        const err = error as Error;
        toast({
            title: 'Save failed',
            description: err.message,
            variant: 'destructive'
        });
    }
  };

  const getResourceType = (mimeType: string, fileName: string): string => {
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'Study Material';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return 'Presentation';
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'Assignment';
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) return 'Project';
    return 'Reading List';
  };

  const handleDelete = async (resource: CourseResource) => {
    if (!window.confirm(`Are you sure you want to delete "${resource.asset_title}"?`)) return;

    try {
        // Backend handles both Firestore entry and Storage deletion via its API
        await deleteResource.mutateAsync({ id: resource.id, courseId: resource.course_id });
        refetch();
    } catch (error: unknown) {
        const err = error as Error;
        toast({
            title: 'Delete failed',
            description: err.message,
            variant: 'destructive'
        });
    }
  };

  const filteredResources = resources.filter(res => {
    const title = res.asset_title || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || res.resource_type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'Study Material': return <FileText className="h-10 w-10 text-rose-500" />;
      case 'Presentation': return <Presentation className="h-10 w-10 text-amber-500" />;
      case 'Assignment': return <BookOpen className="h-10 w-10 text-indigo-500" />;
      case 'Exercise': return <RefreshCw className="h-10 w-10 text-emerald-500" />;
      case 'Project': return <Cloud className="h-10 w-10 text-blue-500" />;
      default: return <FileIcon className="h-10 w-10 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Course Resources
          </h1>
          <p className="text-muted-foreground">
            Central repository for your course materials and student resources.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={loadingResources || !selectedCourse}
            className="hover:bg-primary/10 rounded-full"
          >
            <RefreshCw className={`h-5 w-5 ${loadingResources ? 'animate-spin text-primary' : ''}`} />
          </Button>
          <div className="w-64">
            <CourseSelector 
              selectedCourse={selectedCourse} 
              onSelectCourse={setSelectedCourse} 
            />
          </div>
        </div>
      </div>

      {!selectedCourse ? (
        <Card className="border-dashed border-2 flex flex-col items-center justify-center py-32 text-center bg-muted/5 rounded-3xl">
          <div className="bg-muted p-6 rounded-full mb-6">
            <BookOpen className="h-16 w-16 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-xl font-bold mb-2">Select a Course</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Choose a course from the dropdown above to start managing resources and uploading files.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-b from-card to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  Quick Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8
                    flex flex-col items-center justify-center text-center cursor-pointer
                    transition-all duration-300 group
                    ${isDragging 
                      ? 'border-primary bg-primary/10 scale-[0.98] ring-4 ring-primary/5' 
                      : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5'}
                  `}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      validateAndAddFiles(files);
                    }}
                  />
                  <div className="bg-primary/10 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-base mb-1">Click to Upload</h4>
                  <p className="text-xs text-muted-foreground mb-4">or drag and drop files</p>
                  <div className="flex flex-wrap justify-center gap-1.5 px-4">
                    {['PDF', 'PPT', 'DOCX', 'ZIP'].map(type => (
                      <Badge key={type} variant="secondary" className="font-semibold text-[10px] py-0">{type}</Badge>
                    ))}
                  </div>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold">Selected Files ({uploadFiles.length})</h5>
                      <Button variant="ghost" size="sm" onClick={() => setUploadFiles([])} className="h-7 text-xs text-destructive hover:text-destructive">Clear All</Button>
                    </div>
                    <ScrollArea className="h-40 pr-4">
                      <div className="space-y-2">
                        {uploadFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                            </div>
                            <span className="text-muted-foreground ml-2 capitalize">{file.name.split('.').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button 
                      className="w-full shadow-lg h-11 text-sm font-bold transition-all hover:scale-[1.02]" 
                      onClick={() => handleUpload(uploadFiles[0])}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading {uploadProgress}%
                        </>
                      ) : (
                        'Process & Upload'
                      )}
                    </Button>
                  </div>
                )}
                
                {uploading && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        {currentUploadingFile}
                      </span>
                      <span className="font-mono">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-none shadow-inner">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl shadow-sm">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-primary">{resources?.length || 0}</div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global Assets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-2xl min-h-[600px] rounded-3xl overflow-hidden bg-card">
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-8 border-b bg-muted/5">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tight">Repository</CardTitle>
                  <CardDescription className="font-medium">Active materials for students</CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Find content..." 
                      className="pl-10 h-12 bg-muted/20 border-none rounded-xl focus-visible:ring-primary shadow-inner font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full" onValueChange={setFilterType}>
                  <div className="px-8 bg-muted/5 border-b">
                    <TabsList className="bg-transparent h-14 p-0 gap-4 flex-wrap">
                      {['all', 'Study Material', 'Presentation', 'Assignment', 'Exercise', 'Project'].map(tab => (
                        <TabsTrigger 
                          key={tab} 
                          value={tab}
                          className="data-[state=active]:bg-transparent data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 h-full capitalize text-xs font-bold tracking-tight transition-all opacity-60 data-[state=active]:opacity-100"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value={filterType} className="m-0 focus-visible:ring-0">
                    {loadingResources ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                         {[1, 2, 4, 5].map(i => (
                           <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
                         ))}
                      </div>
                    ) : (
                      <div className="p-8">
                        {filteredResources.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-40 text-center">
                            <div className="bg-muted p-6 rounded-full mb-6">
                              <FileIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                            <h4 className="text-xl font-bold">No assets found</h4>
                            <p className="text-muted-foreground mt-2 font-medium">Try clearing filters or uploading new files.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredResources.map((resource: CourseResource) => (
                              <motion.div
                                key={resource.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                  <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                      <div className="bg-card shadow-sm p-4 rounded-xl transform group-hover:-rotate-6 transition-transform">
                                        {getFileIcon(resource.resource_type)}
                                      </div>
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <h4 className="text-lg font-bold truncate group-hover:text-primary transition-colors pr-8 leading-tight">
                                          {resource.asset_title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                                          <span className="px-2 py-0.5 bg-muted rounded uppercase tracking-tighter shadow-sm">{resource.resource_type}</span>
                                          <span className="opacity-40">•</span>
                                          <span className="font-mono">{resource.upload_format}</span>
                                          <span className="opacity-40">•</span>
                                          <div className="flex items-center gap-1.5">
                                            {resource.instructor_avatar_url ? (
                                              <img src={resource.instructor_avatar_url} className="w-4 h-4 rounded-full object-cover border" alt="" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px]">{resource.instructor_name?.charAt(0)}</div>
                                            )}
                                            <span>{resource.instructor_name}</span>
                                          </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-30 mt-2">
                                          Published {new Date(resource.created_at || '').toLocaleDateString()}
                                        </p>
                                        {resource.allowed_batches && resource.allowed_batches.length > 0 && (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 w-fit mt-2 text-[10px]">
                                                <Users className="h-3 w-3" /> {resource.allowed_batches.length} Batches
                                            </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-muted/20">
                                      <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="h-10 px-6 rounded-xl font-bold flex-1 bg-primary/10 text-primary hover:bg-primary/20"
                                        onClick={() => window.open(resource.file_url, '_blank')}
                                      >
                                        View Content
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                                        onClick={() => handleDelete(resource)}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <MetadataDialog 
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
        formData={resourceFormData}
        setFormData={setResourceFormData}
        onSave={handleSaveMetadata}
        fileName={pendingResource?.file.name}
        batches={batches}
      />
    </div>
  );
}

// Metadata Confirmation Dialog Component
function MetadataDialog({ 
    open, 
    onOpenChange, 
    formData, 
    setFormData, 
    onSave,
    fileName,
    batches
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    formData: { title: string; description: string; resource_type: CourseResource['resource_type']; allowed_batches: string[] };
    setFormData: React.Dispatch<React.SetStateAction<{ title: string; description: string; resource_type: CourseResource['resource_type']; allowed_batches: string[] }>>;
    onSave: () => void;
    fileName?: string;
    batches: Batch[];
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/10 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-primary p-4 rounded-2xl shadow-lg">
                        <Upload className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black">Confirm Details</DialogTitle>
                        <DialogDescription className="font-bold text-primary/60">
                            The file "{fileName}" is uploaded. Now tag it for students.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Asset Title</Label>
                        <Input 
                            id="title" 
                            className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary font-bold"
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Resource Type</Label>
                        <Select 
                            value={formData.resource_type} 
                            onValueChange={(v) => setFormData({...formData, resource_type: v})}
                        >
                            <SelectTrigger className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary font-bold">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl font-bold">
                                <SelectItem value="Study Material">Study Material</SelectItem>
                                <SelectItem value="Presentation">Presentation (PPT)</SelectItem>
                                <SelectItem value="Assignment">Assignment</SelectItem>
                                <SelectItem value="Exercise">In-Class Exercise</SelectItem>
                                <SelectItem value="Reading List">Reading List</SelectItem>
                                <SelectItem value="Project">Project Assets</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Short Description</Label>
                        <Textarea 
                            id="desc" 
                            className="bg-muted/30 border-none rounded-xl focus-visible:ring-primary font-medium min-h-[100px]"
                            placeholder="What should students know about this?"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Batch Selection */}
                    {batches && batches.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Restricted Access (Optional)</Label>
                            <div className="flex flex-wrap gap-2">
                                {batches.map((batch) => {
                                    const isSelected = formData.allowed_batches.includes(batch.id);
                                    return (
                                        <Badge
                                            key={batch.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className={`cursor-pointer h-10 px-4 rounded-xl font-bold uppercase text-[10px] transition-all ${
                                                isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setFormData({ ...formData, allowed_batches: formData.allowed_batches.filter(id => id !== batch.id) });
                                                } else {
                                                    setFormData({ ...formData, allowed_batches: [...formData.allowed_batches, batch.id] });
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
                </div>

                <DialogFooter className="p-8 pt-0 bg-muted/5">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold h-12 px-6"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={onSave}
                        className="rounded-xl font-black h-12 px-10 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Publish Asset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Icons already imported or used local svg components if needed.
