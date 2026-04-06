import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Edit, ArrowRight, Trash2, Layers, Clock, AlertCircle, CheckCircle, Send, FileEdit, MoreHorizontal, RefreshCw, Plus, Archive, ShieldAlert, BookOpen as BookOpenIcon, Calendar, Eye } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useInstructorS3Courses } from '@/hooks/useCourseBuilder';
import { API_URL } from '@/lib/api';
import { Course } from '@/hooks/useInstructorData';
import { CourseBuilder } from './CourseBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchWithAuth } from '@/lib/api';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface InstructorCoursesProps {
    limit?: number;
    hideHeader?: boolean;
    showAll?: boolean;
    title?: string;
}

export function InstructorCourses({ limit, hideHeader, showAll: initialShowAll, title }: InstructorCoursesProps = {}) {
    const [viewTab, setViewTab] = useState<'my' | 'catalog'>(initialShowAll ? 'catalog' : 'my');
    
    // If we're in 'my' tab, we want NOT all courses (only assigned).
    // If we're in 'catalog' tab, we want ALL courses.
    const { data: allCourses, isLoading, refetch } = useInstructorS3Courses(viewTab === 'catalog');
    
    const courses = limit ? allCourses?.slice(0, limit) : allCourses;
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<Course | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmitForReview = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(courseId);
        try {
            await fetchWithAuth('/instructor/submit-course', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            toast({ title: 'Success', description: 'Course submitted for review' });
            refetch();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to submit course', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };

    const handleSaveDraft = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(courseId);
        try {
            await fetchWithAuth('/instructor/save-draft', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            toast({ title: 'Success', description: 'Course saved as draft' });
            refetch();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this course? This cannot be undone.")) return;
        
        setProcessing(courseId);
        try {
            await fetchWithAuth(`/data/courses/${courseId}`, {
                method: 'DELETE'
            });
            toast({ title: 'Success', description: 'Course deleted successfully' });
            refetch();
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };
    const { user } = useAuth();
    const [assigning, setAssigning] = useState<string | null>(null);

    const handleAssignToMe = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setAssigning(courseId);
        try {
            await fetchWithAuth(`/instructor/choose-course`, {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            toast({ 
                title: 'Request Sent', 
                description: 'Your enrollment request has been submitted for admin approval.' 
            });
            refetch();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to request enrollment.', variant: 'destructive' });
        } finally {
            setAssigning(null);
        }
    };

    if (viewingCourse) {
        return <CourseBuilder course={viewingCourse} onBack={() => setViewingCourse(null)} />;
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-4 w-full sm:w-auto">
                        <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'my' | 'catalog')} className="w-full sm:w-auto">
                            <TabsList className="bg-slate-100/50 p-1 rounded-xl">
                                <TabsTrigger value="my" className="rounded-lg px-6 py-2">My Courses</TabsTrigger>
                                <TabsTrigger value="catalog" className="rounded-lg px-6 py-2">Courses Catalogue</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">
                            {viewTab === 'catalog' ? 'Explore the full course repository and choose curricula to teach.' : 'View and manage your assigned courses.'}
                        </p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2 shrink-0">
                        <RefreshCw className="h-4 w-4" />
                        Sync Data
                    </Button>
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-muted/50 h-[300px]" />
                    ))}
                </div>
            ) : courses?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Layers className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mb-2">No Courses Found</CardTitle>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        {viewTab === 'catalog' 
                            ? "No courses are currently available in the catalogue." 
                            : "You don't have any courses assigned to you yet. You can find courses in the Courses Catalogue."}
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {viewTab === 'catalog' ? "Refresh Catalogue" : "Check for Assignments"}
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                        {courses?.map((course: Course, index: number) => {
                            const isInstructorOwner = course.instructor_id === user?.id;
                            const isInstructorApproved = isInstructorOwner && (
                                course.status?.toLowerCase() === 'approved' || 
                                course.status?.toLowerCase() === 'published' || 
                                course.status?.toLowerCase() === 'active'
                            );
                            
                            return (
                                <motion.div
                                    key={course.id || course._id}
                                    className="relative group h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <Card 
                                        className={cn(
                                            "pro-card relative flex flex-col h-full overflow-hidden cursor-pointer",
                                            isInstructorApproved ? "" : "opacity-90 grayscale-[0.3]"
                                        )} 
                                        onClick={() => isInstructorApproved && setViewingCourse(course)}
                                    >
                                        <div className="aspect-[16/10] relative overflow-hidden bg-muted border-b">
                                            {course.thumbnail_url || course.image ? (
                                                <img
                                                    src={(course.thumbnail_url || course.image).startsWith('http') ? (course.thumbnail_url || course.image) : `${API_URL}/s3/public/${course.thumbnail_url}`}
                                                    alt={course.title}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                    <PlayCircle className="h-12 w-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            
                                            {/* Gradient overlay for badges */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                                        {course.category}
                                                    </Badge>
                                                    {isInstructorOwner && (
                                                        <Badge variant="secondary" className={cn(
                                                            "border-none backdrop-blur-md gap-1 text-[10px]",
                                                            (course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published') ? 'bg-green-500/80 hover:bg-green-500 text-white' :
                                                                course.status?.toLowerCase() === 'pending' ? 'bg-amber-500/80 hover:bg-amber-500 text-white' :
                                                                    course.status?.toLowerCase() === 'rejected' ? 'bg-red-500/80 hover:bg-red-500 text-white' : 'bg-slate-500/80 hover:bg-slate-500 text-white'
                                                        )}>
                                                            {course.status === 'published' ? 'Published' : course.status === 'pending' ? 'Pending Review' : course.status === 'rejected' ? 'Rejected' : course.status === 'draft' ? 'Draft' : course.status || 'Active'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {isInstructorOwner && (
                                                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white rounded-full">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {(course.status === 'draft' || !course.status) && (
                                                                <DropdownMenuItem onClick={(e) => handleSubmitForReview(course.id, e)} disabled={processing === course.id}>
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Submit for Review
                                                                </DropdownMenuItem>
                                                            )}
                                                            {course.status === 'pending' && (
                                                                <DropdownMenuItem onClick={(e) => handleSaveDraft(course.id, e)} disabled={processing === course.id}>
                                                                    <FileEdit className="h-4 w-4 mr-2" />
                                                                    Save as Draft
                                                                </DropdownMenuItem>
                                                            )}
                                                            {(course.status === 'draft' || course.status === 'rejected' || !course.status) && (
                                                                <DropdownMenuItem 
                                                                    onClick={(e) => handleDelete(course.id, e)} 
                                                                    disabled={processing === course.id}
                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Course
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-5 flex-1 flex flex-col">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-2">
                                                    {course.description || course.level || "No description provided."}
                                                </p>
                                            </div>
 
                                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {isInstructorOwner ? (
                                                        <div className="flex items-center gap-2">
                                                            {course.status?.toLowerCase() === 'pending' && <Clock className="h-3 w-3 text-yellow-600" />}
                                                            {course.status?.toLowerCase() === 'rejected' && <AlertCircle className="h-3 w-3 text-red-600" />}
                                                            {(course.status?.toLowerCase() === 'published' || course.status?.toLowerCase() === 'approved') && <CheckCircle className="h-3 w-3 text-green-600" />}
                                                            <span className="text-xs text-muted-foreground">My Course</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">{course.duration || 'Flexible'}</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProfile(course);
                                                            setShowProfile(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {isInstructorApproved ? (
                                                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                            Manage <ArrowRight className="ml-1 h-4 w-4" />
                                                        </Button>
                                                    ) : isInstructorOwner && course.status?.toLowerCase() === 'pending' ? (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1.5 px-3 py-1 animate-pulse">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting Approval</span>
                                                        </Badge>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                                                            onClick={(e) => handleAssignToMe(course.id || course._id, e)}
                                                            disabled={assigning === (course.id || course._id) || isInstructorOwner}
                                                        >
                                                            {assigning === (course.id || course._id) ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                            Enroll to Teach
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
 
             {/* Course Profile View Modal */}
             <Dialog open={showProfile} onOpenChange={setShowProfile}>
                 <DialogContent className="max-w-xl pro-modal">
                     <DialogHeader>
                         <DialogTitle className="flex items-center gap-2 text-xl">
                             <BookOpenIcon className="h-5 w-5 text-primary" />
                             Course Profile
                         </DialogTitle>
                         <DialogDescription>
                             Detailed information about this training curriculum
                         </DialogDescription>
                     </DialogHeader>
                    
                    {selectedProfile && (
                        <div className="space-y-6 py-4">
                            <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 border shadow-inner">
                                {selectedProfile.thumbnail_url || selectedProfile.image ? (
                                    <img 
                                        src={(selectedProfile.thumbnail_url || selectedProfile.image).startsWith('http') ? (selectedProfile.thumbnail_url || selectedProfile.image) : `${API_URL}/s3/public/${selectedProfile.thumbnail_url}`}
                                        alt={selectedProfile.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpenIcon className="h-12 w-12 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                                        {selectedProfile.category || 'Curriculum'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedProfile.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {selectedProfile.description || 'Professional aviation training curriculum designed for efficiency and safety.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Metadata</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <span>{selectedProfile.duration || 'Flexible'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Layers className="h-4 w-4 text-slate-400" />
                                            <span>Level: {selectedProfile.level || 'All Levels'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Your Access</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <ShieldAlert className="h-4 w-4 text-primary/40" />
                                            <span className="font-medium truncate">{selectedProfile.instructor_id === user?.id ? 'My Assigned Course' : 'Available for Selection'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Calendar className="h-4 w-4 text-primary/40" />
                                            <span>Added {selectedProfile.created_at ? format(new Date(selectedProfile.created_at), 'MMM d, yyyy') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" className="rounded-lg h-10 px-6 font-semibold" onClick={() => setShowProfile(false)}>
                            Close Profile
                        </Button>
                        {viewTab === 'my' && (
                            <Button className="pro-button-primary h-10 px-8 rounded-lg shadow-md" onClick={() => {
                                setShowProfile(false);
                                setViewingCourse(selectedProfile);
                            }}>
                                Manage Curriculum
                            </Button>
                        )}
                        {viewTab === 'catalog' && selectedProfile && selectedProfile.instructor_id !== user?.id && (
                             <Button 
                                className="pro-button-primary h-10 px-8 rounded-lg shadow-md" 
                                onClick={(e) => {
                                    setShowProfile(false);
                                    handleAssignToMe(selectedProfile.id || selectedProfile._id, e);
                                }}
                                disabled={assigning === (selectedProfile?.id || selectedProfile?._id) || selectedProfile.instructor_id === user?.id}
                             >
                                Enroll to Teach
                             </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
