import { useState } from 'react';
import { useEnrolledCourses, useStudentResources, StudentCourse } from '@/hooks/useStudentData';
import { CourseResource } from '@/hooks/useInstructorData';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    FileText, 
    Download, 
    Search, 
    File as FileIcon, 
    Video, 
    Music, 
    Image, 
    Loader2, 
    Eye,
    BookOpen,
    Presentation,
    RefreshCw,
    Cloud,
    X,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
 
// ─── helpers ────────────────────────────────────────────────────────────────
 
type FileCategory = 'pdf' | 'ppt' | 'doc' | 'image' | 'video' | 'audio' | 'other';
 
function getFileCategory(url: string, format?: string): FileCategory {
    const lower = (url + (format || '')).toLowerCase();
    if (lower.includes('.pdf'))                        return 'pdf';
    if (lower.match(/\.(ppt|pptx)/)  )                return 'ppt';
    if (lower.match(/\.(doc|docx)/)  )                return 'doc';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) return 'image';
    if (lower.match(/\.(mp4|webm|ogg)/))              return 'video';
    if (lower.match(/\.(mp3|wav|aac)/))               return 'audio';
    return 'other';
}
 
/** Returns a URL that can be embedded in an <iframe> */
function getViewerUrl(fileUrl: string, category: FileCategory): string | null {
    switch (category) {
        case 'pdf':
            // Native browser PDF viewer
            return fileUrl;
        case 'ppt':
        case 'doc':
            // Google Docs viewer renders Office files
            return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        case 'image':
        case 'video':
        case 'audio':
            // Handled with native HTML elements, not an iframe
            return fileUrl;
        default:
            return null;
    }
}
 
// ─── File Viewer Modal ───────────────────────────────────────────────────────
 
interface ViewerModalProps {
    resource: CourseResource | null;
    onClose: () => void;
    onDownload: (url: string, id: string) => void;
    isDownloading: boolean;
}
 
function ViewerModal({ resource, onClose, onDownload, isDownloading }: ViewerModalProps) {
    if (!resource) return null;
 
    const category = getFileCategory(resource.file_url, resource.upload_format);
    const viewerUrl = getViewerUrl(resource.file_url, category);
 
    const renderContent = () => {
        if (category === 'image') {
            return (
                <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-lg overflow-auto p-4">
                    <img
                        src={resource.file_url}
                        alt={resource.asset_title}
                        className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            );
        }
 
        if (category === 'video') {
            return (
                <div className="flex items-center justify-center w-full bg-black rounded-lg">
                    <video
                        src={resource.file_url}
                        controls
                        className="w-full max-h-[65vh] rounded-lg"
                    />
                </div>
            );
        }
 
        if (category === 'audio') {
            return (
                <div className="flex flex-col items-center justify-center w-full py-16 gap-6">
                    <Music className="h-20 w-20 text-slate-300" />
                    <audio src={resource.file_url} controls className="w-full max-w-md" />
                </div>
            );
        }
 
        if (category === 'pdf' || category === 'ppt' || category === 'doc') {
            return (
                <iframe
                    src={viewerUrl!}
                    title={resource.asset_title}
                    className="w-full rounded-lg border-0"
                    style={{ height: '65vh' }}
                    allow="fullscreen"
                />
            );
        }
 
        // Unpreviewable file type
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <FileIcon className="h-20 w-20 text-slate-300" />
                <p className="text-slate-500 font-medium max-w-xs">
                    This file type cannot be previewed in the browser. Download it to open it on your device.
                </p>
            </div>
        );
    };
 
    return (
        <Dialog open={!!resource} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-5xl w-full p-0 gap-0 rounded-2xl overflow-hidden border-none shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <Badge variant="secondary" className="shrink-0 font-bold text-[10px] tracking-wider uppercase bg-slate-100 text-slate-600">
                                {resource.upload_format || category.toUpperCase()}
                            </Badge>
                            <DialogTitle className="text-base font-bold text-slate-900 truncate">
                                {resource.asset_title}
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Open in new tab */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-xl text-xs font-semibold"
                                onClick={() => window.open(resource.file_url, '_blank')}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open in Tab
                            </Button>
                            {/* Download */}
                            <Button
                                size="sm"
                                className="gap-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800"
                                onClick={() => onDownload(resource.file_url, resource.id)}
                                disabled={isDownloading}
                            >
                                {isDownloading
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Download className="h-3.5 w-3.5" />
                                }
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
 
                {/* Body */}
                <div className="p-4 bg-slate-50 min-h-[200px]">
                    {renderContent()}
                </div>
 
                {/* Google Docs viewer note for Office files */}
                {(category === 'ppt' || category === 'doc') && (
                    <div className="px-6 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 font-medium text-center">
                        Powered by Google Docs Viewer · If the preview doesn't load, use "Open in Tab" or "Download"
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
 
// ─── Main Component ──────────────────────────────────────────────────────────
 
export default function StudentResources() {
    const { data: enrolledCourses, isLoading: isLoadingCourses } = useEnrolledCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [viewingResource, setViewingResource] = useState<CourseResource | null>(null);
    const [viewedResources, setViewedResources] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('viewed_resources');
            return new Set(saved ? JSON.parse(saved) : []);
        } catch { return new Set(); }
    });
 
    const { data: resources, isLoading: isLoadingResources, refetch } =
        useStudentResources(selectedCourseId === 'all' ? null : selectedCourseId);
 
    const filteredResources = (resources as CourseResource[] | undefined)?.filter((resource: CourseResource) => {
        const matchesSearch =
            resource.asset_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.resource_type.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && resource.resource_type === activeTab;
    });
 
    const getIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType === 'study material' || lowerType.includes('pdf'))  return <FileText className="h-6 w-6 text-rose-500" />;
        if (lowerType === 'presentation'   || lowerType.includes('ppt'))  return <Presentation className="h-6 w-6 text-amber-500" />;
        if (lowerType === 'assignment')                                    return <BookOpen className="h-6 w-6 text-indigo-500" />;
        if (lowerType.includes('video')    || lowerType.includes('mp4'))  return <Video className="h-6 w-6 text-blue-500" />;
        if (lowerType.includes('image'))                                   return <Image className="h-6 w-6 text-purple-500" />;
        if (lowerType === 'project'        || lowerType.includes('zip'))  return <Cloud className="h-6 w-6 text-cyan-500" />;
        return <FileIcon className="h-6 w-6 text-slate-500" />;
    };
 
    const handleDownload = async (url: string, id: string) => {
        setDownloadingId(id);
 
        // Force a real download by fetching as blob (avoids browser "open-in-tab" behaviour)
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            // Derive filename from URL path
            link.download = url.split('/').pop()?.split('?')[0] || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch {
            // Fallback if CORS blocks fetch
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
 
        // Mark as viewed
        const newViewed = new Set(viewedResources);
        newViewed.add(id);
        setViewedResources(newViewed);
        localStorage.setItem('viewed_resources', JSON.stringify(Array.from(newViewed)));
 
        setTimeout(() => setDownloadingId(null), 2000);
    };
 
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Resources</h1>
                    <p className="text-slate-600 font-medium mt-1">
                        Access course materials, assignments, and reference documents.
                    </p>
                </div>
                {selectedCourseId && (
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start md:self-auto gap-2">
                        <RefreshCw className={`h-4 w-4 ${isLoadingResources ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                )}
            </div>
 
            {/* Controls */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
                <div className="p-1 bg-slate-50 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                        <div className="w-full md:w-1/3">
                            <Select value={selectedCourseId || ''} onValueChange={setSelectedCourseId}>
                                <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm rounded-xl font-medium">
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                    <SelectItem value="all" className="font-bold cursor-pointer py-3 text-primary">
                                        All Courses (Aggregate)
                                    </SelectItem>
                                    {isLoadingCourses ? (
                                        <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading courses...
                                        </div>
                                    ) : enrolledCourses?.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">No enrolled courses found</div>
                                    ) : (
                                        enrolledCourses?.map((course: StudentCourse) => (
                                            <SelectItem key={course.id} value={course.id} className="font-medium cursor-pointer py-3">
                                                {course.title}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-2/3 relative">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Search by filename or type..."
                                className="pl-10 h-11 bg-white border-slate-200 shadow-sm rounded-xl font-medium focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
 
                <div className="px-5 bg-white border-b border-slate-50">
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent h-12 p-0 gap-6 w-full justify-start overflow-x-auto no-scrollbar">
                            {['all', 'Study Material', 'Presentation', 'Assignment', 'Project'].map(tab => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-1 h-full capitalize text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
                                >
                                    {tab === 'all' ? 'All Resources' : tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </Card>
 
            {/* Resource Grid */}
            <div className="min-h-[400px]">
                {!selectedCourseId ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Select a Course</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium">
                            Choose one of your enrolled courses from the dropdown to access its resource library.
                        </p>
                    </div>
                ) : isLoadingResources ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : !filteredResources || filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                            <Search className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium">
                            {searchQuery ? "Try adjusting your search terms." : "The instructor hasn't uploaded any materials for this category yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredResources.map((resource: CourseResource, idx) => {
                                const category = getFileCategory(resource.file_url, resource.upload_format);
                                const isViewed = viewedResources.has(resource.id);
 
                                return (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    >
                                        <Card className="group h-full flex flex-col border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                                            <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between space-y-0">
                                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                                    {getIcon(resource.resource_type)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isViewed && (
                                                        <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                                                            Viewed
                                                        </Badge>
                                                    )}
                                                    <Badge variant="secondary" className="font-bold text-[10px] tracking-wider uppercase bg-slate-100 text-slate-600">
                                                        {resource.upload_format || category.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
 
                                            <CardContent className="p-5 flex-1 space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors" title={resource.asset_title}>
                                                        {resource.asset_title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <span>{resource.resource_type}{resource.category && ` • ${resource.category}`}</span>
                                                        <span>•</span>
                                                        <span>{new Date(resource.created_at || '').toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                    {resource.short_description || "No description provided."}
                                                </p>
                                            </CardContent>
 
                                            <CardFooter className="p-5 pt-0 mt-auto flex gap-2">
                                                {/* View button — opens the in-portal viewer */}
                                                <Button
                                                    className="flex-1 rounded-xl font-bold bg-slate-900 shadow-lg shadow-slate-200 hover:scale-[1.02] transition-all gap-2"
                                                    onClick={() => {
                                                        // Mark as viewed
                                                        const newViewed = new Set(viewedResources);
                                                        newViewed.add(resource.id);
                                                        setViewedResources(newViewed);
                                                        localStorage.setItem('viewed_resources', JSON.stringify(Array.from(newViewed)));
                                                        setViewingResource(resource);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
 
                                                {/* Download button — always visible */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-xl border-slate-200 hover:bg-slate-100 hover:scale-[1.02] transition-all shrink-0"
                                                    title="Download"
                                                    onClick={() => handleDownload(resource.file_url, resource.id)}
                                                    disabled={downloadingId === resource.id}
                                                >
                                                    {downloadingId === resource.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Download className="h-4 w-4 text-slate-600" />
                                                    }
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
 
            {/* Viewer Modal */}
            <ViewerModal
                resource={viewingResource}
                onClose={() => setViewingResource(null)}
                onDownload={handleDownload}
                isDownloading={downloadingId === viewingResource?.id}
            />
        </div>
    );
}