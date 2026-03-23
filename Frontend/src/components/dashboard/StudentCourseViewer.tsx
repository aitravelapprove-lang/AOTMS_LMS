import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, CheckCircle2, Video, BookOpen, Lock, Sparkles, GraduationCap, MessageCircle } from 'lucide-react';
import { StudentCourse, useEnrollCourse } from '@/hooks/useStudentData';
import { useCourseModules, useModuleVideos, S3CourseVideo, CourseModule } from '@/hooks/useCourseBuilder';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentCourseViewerProps {
    course: StudentCourse;
    isEnrolled?: boolean;
    onBack: () => void;
}

export function StudentCourseViewer({ course, isEnrolled = true, onBack }: StudentCourseViewerProps) {
    const navigate = useNavigate();
    const { data: modules, isLoading: modulesLoading } = useCourseModules(course.id);
    const [selectedVideo, setSelectedVideo] = useState<S3CourseVideo | null>(null);
    const enrollMutation = useEnrollCourse();
    const [localIsEnrolled, setLocalIsEnrolled] = useState(isEnrolled);
    const [hasRequestedEnrollment, setHasRequestedEnrollment] = useState(false);

    // Sync with prop changes
    useEffect(() => {
        setLocalIsEnrolled(isEnrolled);
    }, [isEnrolled]);

    const isPending = hasRequestedEnrollment || course.enrollmentStatus === 'pending';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-full px-4 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Back to Library
                </Button>
                <div className="flex items-center gap-3">
                    {course.instructor_id && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/student-dashboard/chat?recipientId=${course.instructor_id}&showProfile=true`)}
                            className="gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary rounded-full"
                        >
                            <MessageCircle className="h-4 w-4" /> Message Instructor
                        </Button>
                    )}
                    {!localIsEnrolled && (
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20">
                            <Sparkles className="h-4 w-4" /> Preview Mode
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Video Player */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video bg-black/95 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                        {!localIsEnrolled ? (
                            <div className="absolute inset-0 w-full h-full">
                                {/* Blurred Background using the course thumbnail or black */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background backdrop-blur-3xl z-0"></div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-8 lg:p-16">
                                    <motion.div
                                        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                                        className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-2xl shadow-primary/20"
                                    >
                                        <GraduationCap className="h-12 w-12 text-primary" />
                                    </motion.div>

                                    <h3 className="text-3xl font-bold text-foreground mb-3 drop-shadow-sm">
                                        {isPending ? "Enrollment Pending" : "Unlock Full Access"}
                                    </h3>
                                    <p className="text-muted-foreground max-w-md mx-auto text-lg mb-8">
                                        {isPending 
                                            ? "Your enrollment request has been submitted and is awaiting admin approval. You will be notified once access is granted."
                                            : "Enroll now to stream premium video modules, track your progress, and earn a certificate of completion."
                                        }
                                    </p>

                                    <Button
                                        className={`h-14 px-10 text-lg font-semibold rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] transition-all ${
                                            isPending ? "bg-amber-500 hover:bg-amber-600 cursor-not-allowed opacity-80" : "bg-primary hover:bg-primary/90 hover:scale-105"
                                        }`}
                                        size="lg"
                                        onClick={() => {
                                            if (isPending) return;
                                            enrollMutation.mutate(course.id, {
                                                onSuccess: () => {
                                                    setHasRequestedEnrollment(true);
                                                }
                                            });
                                        }}
                                        disabled={enrollMutation.isPending || isPending}
                                    >
                                        {enrollMutation.isPending ? "Setting up..." : isPending ? "Waiting for Approval" : "Enroll for Free"}
                                    </Button>
                                </div>
                            </div>
                        ) : selectedVideo ? (
                            <video
                                key={selectedVideo.id} // Forces React to reload the video element when selectedVideo changes
                                controls
                                autoPlay
                                controlsList="nodownload"
                                className="w-full h-full"
                            >
                                <source src={selectedVideo.video_url.startsWith('http') ? selectedVideo.video_url : (selectedVideo.video_url.includes('s3') ? selectedVideo.video_url : `/s3/public/${selectedVideo.video_url}`)} type="video/mp4" />
                                Your browser does not support native video streaming.
                            </video>
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                                {course.thumbnail_url && (
                                    <>
                                        <img 
                                            src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`} 
                                            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" 
                                            alt="" 
                                        />
                                        <div className="absolute inset-0 bg-black/40" />
                                    </>
                                )}
                                <div className="relative z-10 flex flex-col items-center text-center p-6">
                                    <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-xl">
                                        <PlayCircle className="h-10 w-10 text-white/80" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Start?</h3>
                                    <p className="text-white/60 max-w-sm">Select a module from the list on the right to begin watching.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-2">
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">{selectedVideo?.title || course.title}</h2>
                        {selectedVideo ? (
                            <div className="flex items-center gap-3 text-sm">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">Now Playing</span>
                                <span className="text-muted-foreground">Module Video</span>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">{course.description}</p>
                        )}
                    </div>
                </div>

                {/* Right Side: Course Content Accordion/List */}
                <div className="lg:h-[800px]">
                    <Card className="h-full flex flex-col border-border/50 shadow-lg bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/40 border-b pb-4 pt-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" /> Course Modules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            {modulesLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading modules...</div>
                            ) : modules?.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No content uploaded yet.</div>
                            ) : (
                                <div className="divide-y">
                                    {modules?.map((mod: CourseModule) => (
                                        <ModuleVideoList
                                            key={mod.id}
                                            module={mod}
                                            selectedVideoId={selectedVideo?.id}
                                            onSelectVideo={setSelectedVideo}
                                            isEnrolled={localIsEnrolled}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}

function ModuleVideoList({ module, selectedVideoId, onSelectVideo, isEnrolled }: {
    module: CourseModule;
    selectedVideoId?: string;
    onSelectVideo: (vid: S3CourseVideo) => void;
    isEnrolled: boolean;
}) {
    const { data: videos, isLoading } = useModuleVideos(module.id);

    return (
        <div className="mb-1">
            <div className="px-5 py-4 bg-muted/30 font-semibold text-sm border-y border-border/50 sticky top-0 backdrop-blur-md z-10 flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs shrink-0">
                    {module.order_index}
                </span>
                <span className="truncate">{module.title}</span>
            </div>
            {isLoading ? (
                <div className="px-5 py-2 text-xs text-muted-foreground">Loading...</div>
            ) : videos?.length === 0 ? (
                <div className="px-5 py-2 text-xs text-muted-foreground">No videos</div>
            ) : (
                <div className="flex flex-col py-1">
                    {videos?.map((vid: S3CourseVideo) => (
                        <button
                            key={vid.id}
                            onClick={() => isEnrolled && onSelectVideo(vid)}
                            disabled={!isEnrolled}
                            className={`group flex items-start gap-4 px-6 py-4 text-left transition-all duration-200 ${!isEnrolled
                                ? 'opacity-60 cursor-not-allowed hover:bg-transparent'
                                : 'hover:bg-muted/50 cursor-pointer'
                                } ${selectedVideoId === vid.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="mt-1 shrink-0">
                                {selectedVideoId === vid.id ? (
                                    <div className="relative">
                                        <PlayCircle className="h-5 w-5 text-primary" />
                                        <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping"></span>
                                    </div>
                                ) : !isEnrolled ? (
                                    <Lock className="h-5 w-5 text-muted-foreground/60" />
                                ) : (
                                    <Video className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <span className={`text-sm ${selectedVideoId === vid.id ? 'font-bold text-foreground' : 'text-muted-foreground font-medium'} leading-relaxed`}>
                                {vid.title}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
