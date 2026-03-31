import { useEffect, useState, useRef, useCallback } from 'react';
import { useCourses, Course } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Clock, BookOpen, ArrowRight, ArrowLeft, User, ChevronDown, CheckCircle2, Upload, Mail, X, Phone, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/api';

export default function CoursesPage() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCourse, setPaymentCourse] = useState<Course | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Check if user is logged in via token
  const isLoggedIn = !!localStorage.getItem('access_token');
  
  const {
    courses,
    loading,
    error,
    hasMore,
    categories,
    fetchCourses,
    fetchCategories,
    enrollCourse,
    chooseCourse
  } = useCourses();

  const observerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchCategories();
      fetchCourses(1, selectedCategory, true);
      initialLoadDone.current = true;
    }
  }, [fetchCategories, fetchCourses, selectedCategory]);

  // Load more when category changes
  useEffect(() => {
    fetchCourses(1, selectedCategory, true);
  }, [fetchCourses, selectedCategory]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      fetchCourses(courses.length > 0 ? Math.floor(courses.length / 9) + 1 : 2, selectedCategory);
    }
  }, [hasMore, loading, courses.length, selectedCategory, fetchCourses]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleEnroll = async (course: Course) => {
    if (!isLoggedIn) {
      navigate('/auth');
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in courses',
        variant: 'destructive'
      });
      return;
    }

    if (user?.role === 'instructor') {
      setEnrolling(course.id);
      try {
        await chooseCourse(course.id);
        toast({
          title: 'Course Claimed',
          description: 'You have successfully requested to teach this course. An admin will review your request.',
          className: 'bg-green-50 border-green-200'
        });
      } catch (err) {
        toast({
          title: 'Claim Failed',
          description: err instanceof Error ? err.message : 'Please try again',
          variant: 'destructive'
        });
      } finally {
        setEnrolling(null);
      }
    } else {
      // For students, show the payment modal
      setPaymentCourse(course);
      setShowPaymentModal(true);
    }
  };

  const handleEnrollmentSubmit = async () => {
    if (!paymentCourse) return;
    
    setIsUploading(true);
    try {
      let paymentProofUrl = null;
      
      // 1. Upload payment proof if provided
      if (paymentProof) {
        const formData = new FormData();
        formData.append('file', paymentProof);
        
        const uploadRes = await fetchWithAuth('/upload', {
          method: 'POST',
          body: formData,
          headers: {} // File transfers shouldn't have content-type set manually generally, fetch handles it
        });
        
        paymentProofUrl = uploadRes?.url;
      }

      // 2. Submit Enrollment Request
      setEnrolling(paymentCourse.id);
      await enrollCourse(paymentCourse.id, paymentCourse.title, paymentCourse.price, paymentProofUrl);
      
      toast({
        title: 'Enrollment Pending Approval',
        description: 'Payment proof submitted. Admin will approve your access shortly.',
        className: 'bg-green-50 border-green-200'
      });
      
      setShowPaymentModal(false);
      setPaymentProof(null);
    } catch (err) {
      toast({
        title: 'Enrollment Failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Taller */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 py-20 md:py-32">
        {/* Back to Home Button */}
        <div className="container mx-auto px-4 absolute top-8 left-0 right-0 z-20">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="group gap-2 text-slate-600 hover:text-primary hover:bg-primary/5 transition-all rounded-full px-4"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-xs uppercase tracking-widest">Back to Home</span>
          </Button>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Explore Our <span className="text-primary">Courses</span>
            </h1>
            <p className="text-lg text-slate-600">
              Master in-demand skills with our expert-led training programs
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 rounded-3xl shadow-2xl bg-white">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Column: Course Summary */}
            <div className="md:w-[400px] bg-slate-900 p-8 text-white flex flex-col justify-between selection:bg-primary/30">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/40 hover:text-white hover:bg-white/10 rounded-full md:hidden"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tight leading-tight">
                    Review Your <span className="text-primary italic">Enrollment</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    You're one step away from mastering new skills. Complete the secure payment below to unlock full course access.
                  </p>
                </div>

                {paymentCourse && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/20">
                        <img src={paymentCourse.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Target Course</div>
                        <h3 className="font-bold text-sm leading-snug line-clamp-2">{paymentCourse.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>Lifetime Access</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Total Investment</span>
                      <span className="text-2xl font-black text-white">
                        {paymentCourse.price?.toString().includes('$') 
                          ? paymentCourse.price.replace('$', '₹') 
                          : `₹${paymentCourse.price}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-12 space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Payment Verified</div>
                    <div className="text-sm font-bold text-white">Manual Admin Approval</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-[0.1em]">
                  Secure transactions protected by standard SSL protocols and human verification systems.
                </p>
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="flex-1 p-8 md:p-12 space-y-8 bg-white selection:bg-slate-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Payment Details</h3>
                  <p className="text-slate-500 text-sm font-medium">Scan the QR code below or use the payment credentials.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="rounded-full px-6 font-bold h-10 hidden md:flex shadow-lg shadow-primary/20"
                        disabled={isUploading || !paymentProof}
                        onClick={handleEnrollmentSubmit}
                    >
                         {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Course'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full hidden md:flex"
                        onClick={() => setShowPaymentModal(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                </div>
              </div>

              {/* QR Section */}
              <div className="relative group max-w-[280px] mx-auto">
                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col items-center">
                  <div className="mb-4 text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Secure UPI Gateway</div>
                    <div className="flex items-center justify-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200">
                      <QrCode className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold text-slate-600">Scan to Pay</span>
                    </div>
                  </div>
                  
                  <div className="relative h-44 w-44 bg-white rounded-2xl p-2 shadow-inner border border-slate-200/50 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                    {/* The QR Image */}
                    <img 
                      src="/scanner.jpeg" 
                      alt="Payment QR Code" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/400x400?text=QR+CODE+HERE";
                      }}
                    />
                  </div>

                  <div className="mt-6 w-full space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-between group/code cursor-pointer hover:border-primary transition-colors">
                      <span className="text-[10px] font-mono font-bold text-slate-500 truncate max-w-[140px]">vyapar.17432781471@hdfcbank</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-6 saturate-0 opacity-50">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs font-bold">+91 80199 42233</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirmation Proof</label>
                    {paymentProof && (
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> File Selected
                        </span>
                    )}
                </div>
                <div 
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-3 ${paymentProof ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:bg-slate-50'}`}
                    onClick={() => document.getElementById('payment-proof')?.click()}
                >
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        <Upload className={`h-5 w-5 ${paymentProof ? 'text-primary' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-900">{paymentProof ? paymentProof.name : 'Upload Payment Screenshot'}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">JPEG, PNG only (Max 5MB)</p>
                    </div>
                    <input 
                        id="payment-proof" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                    variant="ghost"
                    size="lg"
                    className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 gap-3"
                    onClick={() => {
                        window.location.href = `mailto:Info@aotms.in?subject=Enrollment Inquiry: ${paymentCourse?.title}&body=Hello, I have a question about the course enrollment process.`;
                    }}
                >
                    <Mail className="h-5 w-5 text-primary" />
                    Get in Touch
                </Button>
                <Button
                    size="lg"
                    className="h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] active:scale-95 transition-all"
                    disabled={isUploading || !paymentProof}
                    onClick={handleEnrollmentSubmit}
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Enroll Course'
                    )}
                </Button>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-medium">
                After payment, please upload the screenshot to confirm your order details via manual verification.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section - Taller */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full whitespace-nowrap"
            >
              All Courses
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className="rounded-full whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => fetchCourses(1, selectedCategory, true)} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handleEnroll(course)}
              isEnrolling={enrolling === course.id}
              isLoggedIn={isLoggedIn}
              userRole={userRole || undefined}
            />
          ))}
        </div>

        {/* Loading / Infinite Scroll Trigger */}
        <div ref={observerRef} className="py-8">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {!loading && !hasMore && courses.length > 0 && (
            <p className="text-center text-slate-500">
              You've reached the end! Browse more categories above.
            </p>
          )}

          {!loading && courses.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 font-medium">No courses found in this category.</p>
              <p className="text-slate-500 mt-2">Try selecting a different category or check back later.</p>
              <Button variant="outline" onClick={() => setSelectedCategory('all')} className="mt-6">
                View All Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ 
  course, 
  onEnroll, 
  isEnrolling,
  isLoggedIn,
  userRole
}: { 
  course: Course;
  onEnroll: () => void;
  isEnrolling: boolean;
  isLoggedIn: boolean;
  userRole?: string;
}) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl h-full">
      {/* Image - Taller */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Category Badge */}
        <Badge 
          className="absolute top-4 left-4 text-xs font-semibold px-3 py-1"
          style={{ backgroundColor: course.theme_color }}
        >
          {course.category}
        </Badge>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-slate-800">{course.rating}</span>
        </div>
      </div>

      {/* Content - More padding */}
      <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
        <div>
          <h3 className="font-bold text-xl text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 line-clamp-3">{course.level}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{course.duration}</span>
          </div>
          {course.trainer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{course.trainer}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-3xl font-bold text-primary">
            {course.price?.toString().includes('$') 
              ? course.price.replace('$', '₹') 
              : `₹${course.price}`}
          </span>
          {course.original_price && (
            <>
              <span className="text-base text-slate-400 line-through">
                {course.original_price?.toString().includes('$') 
                  ? course.original_price.replace('$', '₹') 
                  : `₹${course.original_price}`}
              </span>
              <Badge variant="destructive" className="text-xs font-semibold">
                {Math.round((1 - parsePrice(course.price) / parsePrice(course.original_price)) * 100)}% OFF
              </Badge>
            </>
          )}
        </div>

        {/* Enroll Button */}
        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="w-full group-hover:bg-primary/90 transition-all rounded-xl h-11 font-semibold"
        >
          {isEnrolling ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <>
              {userRole === 'instructor' ? 'Teach this Course' : 'Purchase Course'}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper to parse price
function parsePrice(price: string | number | undefined | null): number {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return price;
  return parseInt(price.replace(/[^0-9]/g, '')) || 0;
}
