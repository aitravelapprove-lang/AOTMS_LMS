import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, Loader2, Sparkles, BookOpen, User, X, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { useEnrolledCourses, StudentCourse } from '@/hooks/useStudentData';
import { useToast } from '@/hooks/use-toast';

export function RatingPulse() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: enrollments, isLoading: loadingEnrolled } = useEnrolledCourses();
  const activeEnrollments = enrollments?.filter(e => e.enrollmentStatus === 'active') || [];

  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [step, setStep] = useState<'selection' | 'rating' | 'success'>('selection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpen = () => {
    setIsOpen(true);
    setStep('selection');
    setSelectedCourse(null);
    setRating(0);
    setReview('');
  };

  const handleCourseSelect = (course: StudentCourse) => {
    setSelectedCourse(course);
    setStep('rating');
  };

  const handleSubmit = async () => {
    if (!selectedCourse || rating === 0) return;
    setIsSubmitting(true);
    try {
      // Find course to get instructor. Backend now provides instructor_id, name, and avatar directly.
      const instructorId = selectedCourse.instructor_id;
      const courseIdForRating = selectedCourse.id || 
        (typeof selectedCourse.course_id === 'string' ? selectedCourse.course_id : (selectedCourse.course_id?.id || selectedCourse.course_id?._id));

      await fetchWithAuth('/student/pulse-rating', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseIdForRating,
          instructor_id: instructorId,
          rating,
          review
        })
      });

      setStep('success');
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (error: unknown) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to pulse rating.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpen}
        className="relative overflow-hidden group h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-3">
          <Sparkles className="h-5 w-5 animate-pulse" />
          Pulse Your Rating
        </div>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Select Course</h2>
                  <p className="text-slate-500 font-bold text-sm">Choose the course you want to provide feedback for.</p>
                </div>

                {loadingEnrolled ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Enrolled Courses...</p>
                  </div>
                ) : activeEnrollments.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <BookOpen className="h-12 w-12 text-slate-200 mx-auto" />
                    <p className="text-slate-500 font-bold">No active enrollments found.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeEnrollments.map((enrollment) => {
                      // The backend /student/my-courses returns a flat structure where course info is directly on the enrollment object
                      const courseTitle = enrollment.title || (typeof enrollment.course_id === 'object' ? enrollment.course_id?.title : undefined);
                      const courseThumbnail = enrollment.thumbnail_url || (typeof enrollment.course_id === 'object' ? enrollment.course_id?.thumbnail_url : undefined);
                      
                      if (!courseTitle) return null;

                      return (
                        <button
                          key={enrollment.enrollmentId || enrollment.id}
                          onClick={() => handleCourseSelect(enrollment)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 shadow-sm">
                                <img 
                                    src={courseThumbnail?.startsWith('http') ? courseThumbnail : `${API_URL}/s3/public/${courseThumbnail}`} 
                                    className="h-full w-full object-cover" 
                                    alt="" 
                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                                />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-slate-900 line-clamp-1">{courseTitle}</h4>
                              <p className="text-[10px] font-black uppercase text-primary tracking-wider">Active Enrollment</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'rating' && selectedCourse && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setStep('selection')}
                    className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-black text-slate-900">Rate Instructor</h2>
                    <p className="text-xs text-slate-500 font-bold truncate max-w-[300px]">Feedback for: {selectedCourse.title || (typeof selectedCourse.course_id === 'object' ? selectedCourse.course_id?.title : undefined)}</p>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-center gap-5">
                   <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {selectedCourse.instructor_avatar ? (
                        <img 
                          src={selectedCourse.instructor_avatar.startsWith('http') ? selectedCourse.instructor_avatar : `${API_URL}/s3/public/${selectedCourse.instructor_avatar}`} 
                          className="h-full w-full object-cover" 
                          alt="" 
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedCourse.instructor_name || 'Instructor')}
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary">Your Instructor</div>
                      <h3 className="font-bold text-slate-900">
                        {selectedCourse.instructor_name || "Course Mentor"}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">Verified Academy Instructor</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                        className="transition-all duration-300 hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`h-12 w-12 transition-all duration-300 ${
                            (hover || rating) >= star 
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                            : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Feedback Message (Optional)</p>
                    <textarea
                      placeholder="Share your experience with the instructor..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full min-h-[100px] p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm outline-none resize-none placeholder:text-slate-400 font-bold leading-relaxed"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5" />
                      Pulse My Rating
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 text-center space-y-6 bg-gradient-to-b from-emerald-50/50 to-white"
              >
                <div className="h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="h-14 w-14" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pulsed Successfully!</h2>
                   <p className="text-slate-500 font-bold max-w-[200px] mx-auto">Your instructor has been notified of your feedback.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
