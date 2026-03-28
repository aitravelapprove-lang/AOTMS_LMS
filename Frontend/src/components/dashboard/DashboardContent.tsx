import { useLocation, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/api';
import { 
  Sparkles, 
  Users, 
  ArrowUpRight,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Play,
  Calendar,
  FileText,
  Award,
  User,
  Video,
  ClipboardCheck,
  History,
  Bell,
  Settings,
  Target,
  Medal,
  ChevronRight,
  Copy,
  MessageSquare,
  Folder,
  MonitorPlay,
  Cpu,
  Activity,
  CheckCircle,
  CheckCircle2,
  Download,
  ArrowRight,
  Loader2,
  Upload,
  Mail,
  X,
  Phone,
  QrCode,
  Hash,
  Ticket
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { CourseList } from "./CourseList";
import { StudentCourseViewer } from "./StudentCourseViewer";
import { StudentHistory } from "./StudentHistory";
import StudentResources from "./StudentResources";
import StudentVideoLibrary from "./StudentVideoLibrary";
import { ExamModule } from "./ExamModule";
import { Notifications } from "./Notifications";
import { StudentSettings } from "./StudentSettings";
import { ChatInterface } from "../chat/ChatInterface";
import {
  StudentCourse,
  useStudentAnnouncements,
  useLeaderboard,
  useLiveClasses,
  useStudentStats,
  useEnrolledCourses,
  useEnrollCourse,
  useStudentDashboardData,
  Announcement,
  LeaderboardEntry,
  LiveClass,
} from "@/hooks/useStudentData";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/components/ui/use-toast";

// ─── Shared Components ────────────────────────────────────────────────────────

function CoursesTab() {
  const [viewingCourse, setViewingCourse] = useState<StudentCourse | null>(null);
  const [courseTab, setCourseTab] = useState<'enrolled' | 'available'>('enrolled');
  const { toast } = useToast();
  const enrollMutation = useEnrollCourse();

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCourse, setPaymentCourse] = useState<StudentCourse | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedPrice, setAppliedPrice] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (viewingCourse) {
    return (
      <StudentCourseViewer
        course={viewingCourse}
        isEnrolled={viewingCourse.enrollmentStatus === 'active'}
        onBack={() => setViewingCourse(null)}
      />
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const res = await fetchWithAuth('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode })
      });
      if (res.success) {
        setAppliedPrice(res.discounted_price);
        toast({
          title: "Coupon Applied! 🎁",
          description: `Price updated to ₹${res.discounted_price.toLocaleString('en-IN')}`,
          className: "bg-emerald-50 border-emerald-200"
        });
      }
    } catch (err) {
      toast({
        title: "Invalid Coupon",
        description: "This code is invalid or assigned to another user.",
        variant: "destructive"
      });
      setAppliedPrice(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleEnroll = async (course: StudentCourse) => {
    // Instead of direct enrollment, open the payment modal
    setPaymentCourse(course);
    setCouponCode("");
    setAppliedPrice(null);
    setShowPaymentModal(true);
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
          headers: {} // File transfers shouldn't have content-type set manually
        });
        
        paymentProofUrl = uploadRes?.url;
      }

      // 2. Submit Enrollment Request with the proof, UTR, and Coupon
      await enrollMutation.mutateAsync({ 
          courseId: paymentCourse.id, 
          payment_proof_url: paymentProofUrl,
          utr_number: utrNumber,
          coupon_code: appliedPrice ? couponCode : undefined
      });

      toast({
        title: "Enrollment Requested",
        description: `Enrollment for ${paymentCourse.title} submitted! Waiting for admin approval.`,
        className: "bg-amber-50 border-amber-200"
      });
      
      setShowPaymentModal(false);
      setPaymentProof(null);
      setUtrNumber('');
      setCourseTab('enrolled');
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Enrollment Failed",
        description: error.message || "An error occurred during enrollment.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-8 h-full">
      {/* Payment Modal JSX */}
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
                        <img 
                            src={paymentCourse.thumbnail_url?.startsWith('http') ? paymentCourse.thumbnail_url : `${API_URL}/s3/public/${paymentCourse.thumbnail_url}`} 
                            alt="" 
                            className="h-full w-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"; }}
                        />
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
                      <span className="text-sm font-medium text-slate-400">Course Value</span>
                      <span className="text-sm line-through text-slate-500">
                        {paymentCourse.original_price ? `₹${paymentCourse.original_price.toLocaleString('en-IN')}` : "₹00,000"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Total Investment</span>
                      <div className="text-right">
                        {appliedPrice !== null ? (
                          <div className="space-y-0.5">
                            <span className="text-sm line-through text-slate-500 block">
                              ₹{paymentCourse.price?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-2xl font-black text-emerald-400 block animate-in zoom-in duration-300">
                              ₹{appliedPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-white block">
                            {paymentCourse.price === 0 ? "Free Access" : (paymentCourse.price ? `₹${paymentCourse.price.toLocaleString('en-IN')}` : "Contact Us")}
                          </span>
                        )}
                      </div>
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
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirmation Proof <span className="text-primary">*</span></label>
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

                {/* Coupon Code Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Apply Coupon Code</label>
                      {appliedPrice !== null && (
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">SAVED ₹{(paymentCourse!.price as number) - appliedPrice}</Badge>
                      )}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <input 
                            placeholder="Enter Code (e.g. AOTMS12345)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={appliedPrice !== null}
                            className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 font-bold text-slate-900 focus:border-primary focus:outline-none focus:bg-white transition-all shadow-sm disabled:opacity-50"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                           <Ticket className={`h-4 w-4 ${appliedPrice ? 'text-emerald-500' : 'text-slate-300'}`} />
                        </div>
                    </div>
                    <Button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || isValidating || appliedPrice !== null}
                      className="h-12 px-6 rounded-xl font-bold transition-all"
                    >
                      {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                </div>

                {/* UTR Number Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Transaction ID (UTR) <span className="text-primary">*</span></label>
                  </div>
                  <div className="relative group">
                      <input 
                          placeholder="Enter 12-digit UTR Number"
                          value={utrNumber}
                          onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                              setUtrNumber(val);
                          }}
                          className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 font-bold text-slate-900 focus:border-primary focus:outline-none focus:bg-white transition-all shadow-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/50 border border-slate-200 flex items-center justify-center pointer-events-none">
                          <Hash className="h-4 w-4 text-slate-400" />
                      </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-1">
                      Please double-check your UTR number from your payment receipt.
                  </p>
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
                    disabled={isUploading || !paymentProof || utrNumber.length !== 12}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={courseTab} onValueChange={(v) => setCourseTab(v as 'enrolled' | 'available')} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="enrolled" className="rounded-lg px-6 py-2">My Courses</TabsTrigger>
            <TabsTrigger value="available" className="rounded-lg px-6 py-2">Course Catalog</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-full">
        {courseTab === 'enrolled' ? (
          <CourseList
            type="enrolled"
            onSelectCourse={(c) => {
              if (c.enrollmentStatus === 'pending') {
                toast({
                  title: "Enrollment Pending",
                  description: "Admin approval required for full access.",
                  variant: "default"
                });
                return;
              }
              if (c.enrollmentStatus === 'rejected') {
                toast({
                  title: "Enrollment Rejected",
                  description: "Your enrollment for this course was rejected.",
                  variant: "destructive"
                });
                return;
              }
              setViewingCourse(c);
            }}
          />
        ) : (
          <CourseList
            type="available"
            onSelectCourse={handleEnroll}
          />
        )}
      </div>
    </div>
  );
}

function AnnouncementsSection() {
  const { data: announcements, isLoading } = useStudentAnnouncements();

  return (
    <Card className="pro-card border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Bell className="h-5 w-5 text-accent animate-pulse" />
          Campus Announcements
        </CardTitle>
        {announcements && announcements.length > 0 && (
          <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-bold px-2 py-0.5 shadow-none">
            {announcements.length} New
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                 <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {announcements.map((item: Announcement) => (
                <div
                  key={item.id}
                  className="p-5 hover:bg-slate-50 transition-colors cursor-default border-l-2 border-transparent hover:border-accent"
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LeaderboardTab() {
  const { data: board, isLoading } = useLeaderboard();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
         <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none mb-4 tracking-widest uppercase font-bold text-[10px] px-3 py-1">Global Rankings</Badge>
         <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Top Scholars</h2>
         <p className="text-slate-600 font-medium">Inspiring excellence across the academy network.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          ) : !board || board.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-600 font-medium text-lg">Rankings are hidden until exams begin.</p>
            </div>
          ) : (
            board.map((user: LeaderboardEntry, idx: number) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={user.id}
                className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-md border ${
                  idx === 0 
                    ? "bg-gradient-to-r from-accent/10 to-transparent border-accent/20 shadow-sm" 
                    : idx === 1 
                      ? "bg-gradient-to-r from-slate-100 to-transparent border-slate-200"
                      : idx === 2
                        ? "bg-gradient-to-r from-orange-50 to-transparent border-orange-100"
                        : "bg-white border-slate-100 hover:border-primary/20"
                }`}
              >
                <div className="flex shrink-0 w-8 justify-center">
                  {idx === 0 ? <Trophy className="h-6 w-6 text-accent" /> : 
                   idx < 3 ? <Medal className={`h-6 w-6 ${idx === 1 ? 'text-slate-500' : 'text-orange-400'}`} /> :
                   <span className="font-bold text-slate-500 text-lg">#{idx + 1}</span>}
                </div>
                
                <Avatar className={`h-12 w-12 md:h-14 md:w-14 border-[3px] shadow-sm ${idx === 0 ? 'border-accent' : 'border-white'}`}>
                  <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.user_id}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-base md:text-lg truncate">
                    Scholar {user.user_id.slice(0, 6)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                     <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none font-semibold text-[10px]">
                        {user.exams_completed} Exams
                     </Badge>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className={`font-black tracking-tight text-xl md:text-3xl ${idx === 0 ? 'text-accent' : 'text-primary'}`}>
                    {user.total_score}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                    Credits
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LiveClassesTab() {
  const { data: classes, isLoading } = useLiveClasses();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyPassword = (e: React.MouseEvent, password?: string) => {
    e.stopPropagation();
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast({
      title: "Password Copied",
      description: "Meeting passcode copied to clipboard.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Virtual Classrooms</h2>
            <p className="text-slate-600 font-medium">Join scheduled interactive sessions with your instructors.</p>
          </div>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-[280px] rounded-2xl" />)
        ) : !classes || classes.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
               <Video className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Upcoming Sessions</h3>
            <p className="text-base font-medium text-slate-600 mt-2 max-w-sm">
              Your instructors haven't scheduled any new live broadcasts yet.
            </p>
          </div>
        ) : (
          classes.map((session: LiveClass) => (
            <Card
              key={session.id}
              className="pro-card group cursor-default hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-32 bg-primary p-6 flex flex-col justify-end text-white relative overflow-hidden rounded-t-xl">
                {/* Decorative Mesh */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/30">
                  {session.status}
                </div>
                <h3 className="font-bold text-xl line-clamp-1 relative z-10 drop-shadow-sm">
                  {session.title}
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-slate-900 font-semibold text-sm">
                        {new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                      <Clock className="h-4.5 w-4.5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time & Duration</p>
                      <p className="text-slate-900 font-semibold text-sm">
                        {new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        <span className="text-slate-500"> • {session.duration_minutes || 60} min</span>
                      </p>
                    </div>
                  </div>
                  
                  {session.meeting_password && (
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Users className="h-4.5 w-4.5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Meeting Passcode</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-900 font-mono font-bold text-sm tracking-widest border border-slate-200">
                            {session.meeting_password}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:bg-slate-200" 
                            onClick={(e) => handleCopyPassword(e, session.meeting_password)}
                            title="Copy Passcode"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => session.meeting_id && navigate(`/live/${session.meeting_id}?role=0&pwd=${session.meeting_password || ''}`)}
                  className="w-full pro-button-primary"
                  disabled={!session.meeting_id}
                >
                  Join Broadcast
                  <Video className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Home ──────────────────────────────────────────────────────

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const dummyActivityData = [
  { name: 'Mon', minutes: 120 },
  { name: 'Tue', minutes: 80 },
  { name: 'Wed', minutes: 210 },
  { name: 'Thu', minutes: 160 },
  { name: 'Fri', minutes: 190 },
  { name: 'Sat', minutes: 240 },
  { name: 'Sun', minutes: 150 },
];

function DashboardHome() {
  const { data: stats } = useStudentStats();
  const { data: enrolledCourses } = useEnrolledCourses();
  const { data: dashboardData } = useStudentDashboardData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const latestCourse = enrolledCourses?.[0];

  const activityData = dashboardData?.activity?.length ? dashboardData.activity : dummyActivityData;
  const recentResources = dashboardData?.resources || [];
  const realSkills = dashboardData?.skills || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-3 tracking-widest uppercase font-bold text-[10px] px-3 py-1">Student Portal</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-primary italic">{user?.user_metadata?.full_name?.split(" ")[0] || "Student"}</span>.
          </h1>
          <p className="text-slate-600 font-medium mt-2 text-base md:text-lg">
            Elevate your skills and track your learning journey.
          </p>
        </div>
        <div className="hidden md:flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 font-semibold shadow-sm hover:shadow-md transition-all" onClick={() => window.location.href='/student-dashboard/courses'}>
              Browse Library
           </Button>
        </div>
      </div>

      {/* KPI Cards - Modified per user request */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Active Enrollments", value: enrolledCourses?.length || 0, icon: BookOpen, color: "blue", desc: "Ongoing courses" },
          { title: "Training Progress", value: stats?.completed_courses || 0, icon: Target, color: "orange", desc: "Modules finished" },
          { title: "Platform Engagement", value: `${stats?.total_watch_minutes ? Math.floor(stats.total_watch_minutes / 60) : 0}h`, icon: Clock, color: "blue", desc: "Total learning time" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="pro-card group cursor-default p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 ${kpi.color === 'blue' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-slate-900">{kpi.value}</span>
                   <span className="text-[10px] font-bold text-slate-400">{kpi.desc}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning & Stats - Spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content: Continue Learning */}
          <Card className="pro-card border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Cpu className="h-32 w-32" />
               </div>
               
               {!latestCourse ? (
                <div className="relative z-10 py-4 flex flex-col items-center justify-center text-center">
                  <Badge className="bg-white/10 text-white border-white/20 mb-4 px-4 py-1">New Opportunity</Badge>
                  <h3 className="text-2xl font-bold mb-4">Start Your Learning Journey</h3>
                  <p className="text-slate-300 max-w-md mb-8">
                    Discover professional courses curated by industry experts.
                  </p>
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 font-bold rounded-full" asChild>
                    <a href="/student-dashboard/courses">View Catalog</a>
                  </Button>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-56 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border-2 border-white/10">
                    <img
                      src={latestCourse.thumbnail_url?.startsWith("http") ? latestCourse.thumbnail_url : `${API_URL}/s3/public/${latestCourse.thumbnail_url}`}
                      alt={latestCourse.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"; }}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                       <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Currently Playing</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight line-clamp-2">
                      {latestCourse.title}
                    </h2>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between items-end">
                         <span className="text-xs font-bold text-slate-400">COURSE OVERALL PROGRESS</span>
                         <span className="text-xl font-black text-white">{latestCourse.progress}%</span>
                       </div>
                       <Progress value={latestCourse.progress} className="h-2.5 bg-white/10 [&>div]:bg-white" />
                    </div>

                    <Button className="bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all h-12 px-8 font-bold rounded-full mt-4" asChild>
                      <a href={`/student-dashboard/courses?courseId=${latestCourse.id}`}>
                        Resume Lesson <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Learning Activity Chart - New Feature */}
          <Card className="pro-card border-none shadow-xl shadow-slate-200/20 overflow-hidden">
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900">Learning Intensity</CardTitle>
                    <CardDescription className="font-medium">Your weekly effort across all modules</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
               </div>
            </CardHeader>
            <CardContent>
               <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="minutes" stroke="#1e293b" strokeWidth={3} fillOpacity={1} fill="url(#colorMin)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          {/* Skill Blocks - Real Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {(realSkills.length > 0 ? realSkills : ['Core', 'Technical', 'Soft Skills', 'Labs']).map((skill: any, i) => (
               <div key={typeof skill === 'string' ? skill : skill.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tighter line-clamp-1">
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${typeof skill === 'string' ? (40 + (i * 15)) : (skill.progress || 0)}%` }}></div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Right Sidebar - Spans 1 col */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Access Documents - Real Data */}
          <Card className="pro-card border-none shadow-xl shadow-slate-200/20">
            <CardHeader className="pb-4">
               <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resource Library
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {recentResources.length === 0 ? (
                 <div className="py-8 text-center text-xs text-slate-400 font-medium italic">No recent materials</div>
               ) : (
                 recentResources.map((res: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => res.view_url && window.open(res.view_url, '_blank')}>
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-slate-900 group-hover:text-white transition-all uppercase">
                           {res.upload_format || res.file_url?.split('.').pop() || 'PDF'}
                         </div>
                         <span className="text-sm font-bold text-slate-700 line-clamp-1">{res.asset_title || 'Material'}</span>
                      </div>
                      <Download className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                   </div>
                 ))
               )}
               <Button variant="ghost" className="w-full text-primary font-bold text-xs" onClick={() => window.location.href='/student-dashboard/resources'}>
                 View All Materials
               </Button>
            </CardContent>
          </Card>

          {/* Recent Performance - New Feature */}
          <Card className="pro-card border-none shadow-xl shadow-slate-200/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.results?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium italic">No recent test attempts</div>
              ) : (
                dashboardData?.results?.map((res: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 line-clamp-1 uppercase tracking-tighter">{res.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic">Performed on {new Date(res.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={`h-6 text-[10px] font-black italic rounded-lg shadow-inner ${res.percentage >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {res.percentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                         <div className={`h-full ${res.percentage >= 70 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${res.percentage}%` }}></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-600 whitespace-nowrap">{res.score}/{res.total} PTS</span>
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" className="w-full text-slate-500 font-bold text-xs hover:text-primary" onClick={() => navigate('/student-dashboard/history')}>
                Review Exam History
              </Button>
            </CardContent>
          </Card>

          {/* Announcements - Existing component */}
          <div className="border-none shadow-none">
            <AnnouncementsSection />
          </div>

          {/* Student Support Section - New Feature */}
          <Card className="bg-primary text-white p-6 rounded-3xl relative overflow-hidden group">
             <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
             <h4 className="text-lg font-black mb-1">Need Help?</h4>
             <p className="text-white/80 text-xs font-medium mb-4">Chat with our senior instructors anytime</p>
             <Button className="w-full bg-white text-primary hover:bg-slate-100 font-bold rounded-xl h-10 shadow-lg" onClick={() => window.location.href='/student-dashboard/chat'}>
               Open Career Support
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Routing Map ──────────────────────────────────────────────────────────────

const routeConfig: Record<string, { title: string; description: string; icon: React.ElementType; component?: React.ReactNode; }> = {
  "/student-dashboard/profile": {
    title: "Student Profile",
    description: "Manage your credentials and portfolio",
    icon: User,
    component: <UserProfile />,
  },
  "/student-dashboard/courses": {
    title: "Learning Library",
    description: "Access your enrolled courses and training materials",
    icon: BookOpen,
    component: <CoursesTab />,
  },
  "/student-dashboard/live-classes": {
    title: "Virtual Campus",
    description: "Join scheduled interactive sessions with instructors",
    icon: Video,
    component: <LiveClassesTab />,
  },
  "/student-dashboard/videos": {
    title: "Video Library",
    description: "Browse and watch video lessons from your enrolled courses",
    icon: MonitorPlay,
    component: <StudentVideoLibrary />,
  },
  "/student-dashboard/resources": {
    title: "Course Resources",
    description: "Download study materials and reference documents",
    icon: Folder,
    component: <StudentResources />,
  },
  "/student-dashboard/mock-papers": {
    title: "Simulation Lab",
    description: "Practice with timed mock examinations",
    icon: FileText,
    component: <ExamModule type="mock" />,
  },
  "/student-dashboard/history": {
    title: "Academic Record",
    description: "Review your past performance and transcripts",
    icon: History,
    component: <StudentHistory />,
  },
  "/student-dashboard/leaderboard": {
    title: "Global Rankings",
    description: "See how you rank among top tech scholars",
    icon: Trophy,
    component: <LeaderboardTab />,
  },
  "/student-dashboard/notifications": {
    title: "Communications",
    description: "Important updates from the academy",
    icon: Bell,
    component: <Notifications />,
  },
  "/student-dashboard/chat": {
    title: "Messages",
    description: "Chat with your instructors and peers",
    icon: MessageSquare,
    component: <ChatInterface />,
  },
  "/student-dashboard/settings": {
    title: "Preferences",
    description: "Configure your digital learning environment",
    icon: Settings,
    component: <StudentSettings />,
  },
};

export function DashboardContent() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleProgressUpdate = () => {
      console.log('[Socket-Student] Progress changed, invalidating student queries...');
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
    };

    socket.on('progress_updated', handleProgressUpdate);
    
    return () => {
      socket.off('progress_updated', handleProgressUpdate);
    };
  }, [socket, queryClient]);

  if (currentPath === "/student-dashboard" || currentPath === "/student-dashboard/") {
    return <DashboardHome />;
  }

  const config = routeConfig[currentPath];

  if (config) {
    if (config.component) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-200 pb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
              <config.icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {config.title}
              </h1>
              <p className="text-base font-medium text-slate-600 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="w-full">
            {config.component}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
            <config.icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {config.title}
            </h1>
            <p className="text-base font-medium text-slate-600 mt-1">{config.description}</p>
          </div>
        </div>
        
        <Card className="pro-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <config.icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Feature in Development
            </h3>
            <p className="text-base font-medium text-slate-600 max-w-md">
              The engineering team is currently upgrading this section. It will be available shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardHome />;
}
