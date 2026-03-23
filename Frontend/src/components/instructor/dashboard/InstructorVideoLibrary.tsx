import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Video as VideoIcon, Search, RefreshCw, Play, Clock, BookOpen, X, UploadCloud } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VideoUploader } from "../VideoUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInstructorCourses } from "@/hooks/useInstructorData";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_minutes: number;
  course_id: string;
  module_id: string;
  order_index: number;
  created_at: string;
}

export function InstructorVideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const { data: courses = [], isLoading: coursesLoading } = useInstructorCourses();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCourseId, setUploadCourseId] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const loadVideos = async () => {
    if (courses.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const courseIds = courses.map(c => c.id).join(',');
      // Fetch videos only for the instructor's courses
      const videosRes = await fetchWithAuth(`/data/course_videos?course_id=in.(${courseIds})&sort=created_at&order=desc`);
      setVideos(videosRes || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!coursesLoading) {
        loadVideos();
    }
  }, [courses, coursesLoading]);

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === "all" || v.course_id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  if (coursesLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Video Library</h2>
        <p className="text-muted-foreground">Manage and organize your course video content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <VideoIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.length}</p>
                <p className="text-xs text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(videos.reduce((acc, v) => acc + (v.duration_minutes || 0), 0) / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">Total Content Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white"
          />
        </div>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-white text-sm focus:ring-2 focus:ring-ring"
        >
          <option value="all">All My Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        <Button variant="outline" onClick={loadVideos} className="bg-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="pro-button-primary shadow-lg shadow-primary/20 rounded-xl px-6 h-10">
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none glass-morphism shadow-2xl">
            <div className="p-8 space-y-8 bg-white/95 backdrop-blur-xl">
              <DialogHeader className="p-0 border-b border-indigo-50 pb-6 mb-4">
                <DialogDescription className="sr-only">Upload and deploy video assets to courses.</DialogDescription>
                <div className="flex items-center gap-3 mb-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                  <PlusCircle className="h-4 w-4" /> Instructor Studio
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                   Upload <span className="text-primary not-italic">Video Content</span>
                </DialogTitle>
                <p className="text-sm text-slate-500 font-medium">Add new video lectures to your courses.</p>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Course</Label>
                  <Select value={uploadCourseId} onValueChange={setUploadCourseId}>
                    <SelectTrigger className="h-14 rounded-2xl border-indigo-100 bg-indigo-50/30 font-bold focus:ring-primary/20 transition-all text-slate-900 shadow-sm">
                      <SelectValue placeholder="Which course is this video for?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id} className="rounded-xl py-3 cursor-pointer">
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {uploadCourseId ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <VideoUploader 
                      courseId={uploadCourseId} 
                      courseStatus="published" 
                      hideVideoList={true} 
                    />
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-indigo-100/50">
                    <VideoIcon className="h-12 w-12 text-indigo-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Select a course to start upload</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-indigo-50 flex justify-end">
                <Button variant="ghost" onClick={() => setIsUploadOpen(false)} className="rounded-xl font-bold text-slate-400 hover:text-slate-600">Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No videos found</p>
            <p className="text-sm">Upload your first video to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/60 group">
              {/* Thumbnail */}
              <div className="aspect-video relative bg-slate-100 overflow-hidden">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <VideoIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsPlayerOpen(true);
                  }}
                >
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="h-6 w-6 text-primary ml-1" />
                  </div>
                </div>
                {video.duration_minutes && (
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    {Math.floor(video.duration_minutes / 60)}:{String(video.duration_minutes % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
              
              <CardContent className="p-5">
                <div className="mb-3">
                    <Badge variant="outline" className="text-[10px] font-bold tracking-wide uppercase text-slate-500 border-slate-200">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {getCourseTitle(video.course_id)}
                    </Badge>
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                  {video.title || 'Untitled Video'}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {video.description || 'No description provided for this video.'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="text-[10px] font-bold text-slate-400">
                      ADDED {new Date(video.created_at).toLocaleDateString()}
                   </div>
                   {video.duration_minutes && (
                    <div className="flex items-center text-xs font-bold text-slate-600">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      {video.duration_minutes} min
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none shadow-2xl rounded-3xl">
          <DialogHeader className="sr-only">
             <DialogTitle>{selectedVideo?.title}</DialogTitle>
             <DialogDescription>Video player for {selectedVideo?.title}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video bg-black flex items-center justify-center group">
            {selectedVideo && (
              <video 
                src={selectedVideo.video_url.startsWith('http') ? selectedVideo.video_url : (selectedVideo.video_url.includes('s3') ? selectedVideo.video_url : `/s3/public/${selectedVideo.video_url}`)}
                controls 
                autoPlay 
                className="w-full h-full"
              />
            )}
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full z-50 lg:hidden"
                onClick={() => setIsPlayerOpen(false)}
            >
                <X className="h-6 w-6" />
            </Button>
          </div>
          {selectedVideo && (
            <div className="p-6 md:p-8 bg-slate-900 text-white border-t border-white/5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{selectedVideo.description}</p>
                    </div>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hidden md:flex" onClick={() => setIsPlayerOpen(false)}>Close</Button>
                </div>
                <div className="mt-6 flex items-center gap-3">
                   <Badge variant="outline" className="border-white/20 text-white/60 py-1.5 px-3">
                      <BookOpen className="h-3.5 w-3.5 mr-2 text-primary" />
                      {getCourseTitle(selectedVideo.course_id)}
                   </Badge>
                   <Badge variant="outline" className="border-white/20 text-white/60 py-1.5 px-3">
                      <Clock className="h-3.5 w-3.5 mr-2 text-blue-400" />
                      {selectedVideo.duration_minutes} min
                   </Badge>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
