import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Search, 
  BookOpen, 
  Calendar, 
  CreditCard,
  Globe,
  RefreshCw,
  Mail,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Fingerprint,
  Loader2,
  Trash2,
  Eye,
  Hash,
  GraduationCap,
  MoreVertical,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  DollarSign
} from "lucide-react";
import { CourseEnrollment } from "@/hooks/useCourses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnrollmentsListProps {
  enrollments: CourseEnrollment[];
  loading: boolean;
  onUpdateStatus?: (id: string, status: 'active' | 'rejected') => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EnrollmentsList({ enrollments, loading, onUpdateStatus, onDelete }: EnrollmentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTerm, setFilterTerm] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const EnrollmentAvatar = ({ enrollment }: { enrollment: CourseEnrollment }) => {
    // Priority: Real Profile Pic > Initials
    const hasProfilePic = !!enrollment.user_avatar;

    if (hasProfilePic) {
      return (
        <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200/50 shadow-sm shrink-0 bg-slate-100">
          <img 
            src={enrollment.user_avatar} 
            alt={enrollment.user_name} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    return (
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm border border-slate-200/50 ${
         ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600', 'bg-pink-100 text-pink-600'][enrollment.user_name?.length % 4]
      }`}>
         {enrollment.user_name?.charAt(0) || 'U'}
      </div>
    );
  };

  const copyToClipboard = async (text: string, enrollmentId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(enrollmentId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'rejected') => {
    if (!onUpdateStatus) return;
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setProcessingId(id);
    try {
      await onDelete(id);
    } finally {
      setProcessingId(null);
    }
  };

  // Get unique courses for filter
  const courses = [...new Set(enrollments.map(e => e.course_name).filter(Boolean))];

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === "all" || e.course_name === filterCourse;
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    const matchesTerm = filterTerm === "all" || e.payment_term === filterTerm;

    if (timeFilter !== "all" && e.enrollment_date) {
      const now = new Date();
      const enrollmentDate = new Date(e.enrollment_date);
      const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeFilter === "day" && diffDays > 1) return false;
      if (timeFilter === "weekly" && diffDays > 7) return false;
      if (timeFilter === "monthly" && diffDays > 30) return false;
      if (timeFilter === "yearly" && diffDays > 365) return false;
    }

    return matchesSearch && matchesCourse && matchesStatus && matchesTerm;
  });

  const totalValue = filteredEnrollments.reduce((acc, e) => acc + parseInt(e.price?.replace(/[^0-9]/g, '') || '0'), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{filteredEnrollments.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Filtered Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(filteredEnrollments.map(e => e.user_id)).size}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Unique Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{totalValue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Value ({timeFilter === 'all' ? 'Total' : timeFilter})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#6b21a8] transition-colors" />
          <Input
            placeholder="Search identities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 w-full md:w-80 bg-white border-2 border-slate-100 rounded-none focus:border-[#6b21a8] focus:ring-0 font-bold text-slate-900 transition-all shadow-sm"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
          <div className="w-full sm:w-48">
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="h-11 rounded-xl bg-background border-slate-200">
                 <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Courses" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-11 rounded-xl bg-background border-slate-200">
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Status" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-6">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <BookOpen className="h-5 w-5 text-primary" />
            </div>
            Student Enrollments
          </CardTitle>
          <CardDescription className="font-bold text-slate-400">
            Unified assessment and verification gateway: {filteredEnrollments.length} records detected
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-none border-2 border-dashed border-slate-200">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20 text-primary" />
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No verification records found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mobile/Tablet Card View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
                 {filteredEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white rounded-none p-6 border-2 border-slate-100 shadow-sm space-y-6 relative group hover:border-[#6b21a8]/20 transition-all duration-300">
                       <div className="absolute top-6 right-6">
                          {getStatusBadge(enrollment.status || 'pending')}
                       </div>

                       <div className="flex gap-4">
                          <EnrollmentAvatar enrollment={enrollment} />
                          <div className="overflow-hidden">
                             <h4 className="font-black text-slate-900 text-base leading-tight truncate">{enrollment.user_name}</h4>
                             <p className="text-[11px] font-bold text-slate-400 truncate mt-1">{enrollment.user_email}</p>
                          </div>
                       </div>

                       <div className="bg-slate-50 p-4 rounded-none border border-slate-100 space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                 <Fingerprint className="h-3 w-3" /> Student UUID
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-3 rounded-none bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-[#6b21a8] hover:text-white transition-all shadow-sm"
                                onClick={() => copyToClipboard(enrollment.user_id || '', enrollment.id + '-mobile')}
                              >
                                {copiedId === enrollment.id + '-mobile' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copiedId === enrollment.id + '-mobile' ? 'Copied' : 'Copy'}
                              </Button>
                           </div>
                           <p className="font-mono font-black text-[12px] text-slate-600 break-all bg-white p-3 rounded-none border border-slate-100/50">
                              {enrollment.user_id || 'N/A'}
                           </p>
                       </div>

                       <div className="pt-2">
                          <Button variant="secondary" className="w-full h-12 rounded-none text-[11px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-[#6b21a8] transition-all shadow-lg" onClick={() => setSelectedEnrollment(enrollment)}>
                            <Eye className="h-4 w-4 mr-2" /> Verify Enrollment
                          </Button>
                       </div>
                    </div>
                 ))}
              </div>

<<<<<<< HEAD
              {/* Desktop Professional Flexible Layout */}
              <div className="hidden lg:block overflow-x-auto bg-white rounded-none border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[320px]">Student / Identity</th>
                      <th className="px-8 py-6 text-[10px] font-black symbols text-[#6b21a8] uppercase tracking-[0.2em] min-w-[200px] bg-purple-50/30">Strategic Course</th>
                      <th className="px-8 py-6 text-[10px] font-black text-[#6b21a8] uppercase tracking-[0.2em] text-center bg-purple-50/[0.05] min-w-[150px]">Phase I Payment</th>
                      <th className="px-8 py-6 text-[10px] font-black text-[#a855f7] uppercase tracking-[0.2em] text-center bg-violet-50/10 min-w-[150px]">Phase II Payment</th>
                      <th className="px-8 py-6 text-[10px] font-black text-[#6b21a8] uppercase tracking-[0.2em] min-w-[220px] bg-purple-50/20">Accounting Flow</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right min-w-[150px]">Verification</th>
=======
              <div className="hidden lg:block overflow-x-auto admin-scrollbar-horizontal rounded-xl border border-slate-200/60 shadow-sm">
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[320px]">Student / UUID</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Course</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing & Term</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Proof</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Fulfillment</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
>>>>>>> 7c5c5c1328ab9196fa5dcf916d417a1d19c0e69a
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-50">
                    {filteredEnrollments.map((enrollment) => {
                       const fullFee = parseInt(enrollment.price || '0');
                       const halfFee = fullFee / 2;
                       const isPaidFull = enrollment.payment_term === 'full';
                       const isTerm1 = enrollment.payment_term === 'term1';
                       const isTerm2 = enrollment.payment_term === 'term2';
                       
                       return (
                        <tr key={enrollment.id} className="hover:bg-primary/[0.01] transition-all group duration-300">
                          <td className="px-8 py-5 align-middle">
                            <div className="flex items-center gap-4">
                              <EnrollmentAvatar enrollment={enrollment} />
                              <div className="min-w-0">
                                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{enrollment.user_name}</h3>
                                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-none w-fit transition-all hover:bg-white hover:border-primary/30">
                                   <Fingerprint className="h-3 w-3 text-slate-400" />
                                   <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{enrollment.user_id?.slice(0, 10)}...</span>
                                   <div className="h-3 w-px bg-slate-200 mx-1" />
                                   <button 
                                      className="text-[9px] font-black uppercase text-primary hover:text-primary/70 flex items-center gap-1"
                                      onClick={() => copyToClipboard(enrollment.user_id || '', enrollment.id + '-desktop')}
                                   >
                                      <Copy className="h-2.5 w-2.5" />
                                      {copiedId === enrollment.id + '-desktop' ? 'Saved' : 'Copy'}
                                   </button>
                                </div>
                              </div>
                            </div>
                          </td>
                           <td className="px-8 py-5 align-middle border-x border-slate-50">
                             <div className="max-w-[180px]">
                                <p className="text-[12px] font-black text-slate-800 leading-tight mb-1 uppercase tracking-tight">{enrollment.course_name}</p>
                                <div className="flex items-center gap-1.5 grayscale opacity-50">
                                   <Globe className="h-3 w-3" />
                                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">Strategic Asset</span>
                                </div>
                             </div>
                           </td>
                           <td className="px-8 py-5 text-center bg-purple-50/[0.02] border-r border-slate-50 align-middle">
                              {(isTerm1 || isTerm2 || isPaidFull) ? (
                                 <div className="space-y-1">
                                    <span className="text-sm font-black text-[#6b21a8] block tracking-tighter">₹{halfFee.toLocaleString('en-IN')}</span>
                                    <Badge className="bg-purple-50 text-[#6b21a8] border border-purple-100 text-[7px] font-black h-4 px-2 uppercase tracking-widest rounded-none">P1 Cleared</Badge>
                                 </div>
                              ) : (
                                 <div className="space-y-1 group-hover:scale-105 transition-transform">
                                    <span className="text-sm font-black text-[#a855f7] block tracking-tighter animate-pulse">₹{halfFee.toLocaleString('en-IN')}</span>
                                    <Badge className="bg-violet-50 text-[#a855f7] border border-violet-100 text-[7px] font-black h-4 px-2 uppercase tracking-widest rounded-none">P1 Pending</Badge>
                                 </div>
                              )}
                           </td>
                           <td className="px-8 py-5 text-center bg-purple-50/[0.01] border-r border-slate-50 align-middle">
                              {(isTerm2 || isPaidFull) ? (
                                 <div className="space-y-1">
                                    <span className="text-sm font-black text-[#a855f7] block tracking-tighter">₹{halfFee.toLocaleString('en-IN')}</span>
                                    <Badge className="bg-violet-50 text-[#a855f7] border border-violet-100 text-[7px] font-black h-4 px-2 uppercase tracking-widest rounded-none">P2 Cleared</Badge>
                                 </div>
                              ) : isTerm1 ? (
                                 <div className="space-y-1 group-hover:scale-105 transition-transform">
                                    <span className="text-sm font-black text-[#6b21a8] block tracking-tighter">₹{halfFee.toLocaleString('en-IN')}</span>
                                    <Badge className="bg-[#6b21a8] text-white border-none text-[7px] font-black h-4 px-2 uppercase tracking-widest animate-pulse shadow-sm shadow-purple-200 rounded-none">P2 Awaited</Badge>
                                 </div>
                              ) : (
                                 <div className="space-y-1">
                                    <span className="text-sm font-black text-slate-400 block tracking-tighter">₹{halfFee.toLocaleString('en-IN')}</span>
                                    <Badge variant="outline" className="text-[7px] font-black text-slate-300 border-slate-200 h-4 px-2 uppercase rounded-none">Scheduled</Badge>
                                 </div>
                              )}
                           </td>
                           <td className="px-8 py-5 align-middle bg-[#6b21a8]/5">
                              <div className="space-y-2.5">
                                 <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deposited</p>
                                       <p className="text-sm font-black text-emerald-600 tracking-tighter">₹{(enrollment.final_price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Asset</p>
                                       <p className="text-sm font-black text-slate-900 tracking-tighter">₹{(fullFee || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                 </div>
                                 <div className="h-1.5 w-full bg-slate-100 rounded-none overflow-hidden border border-slate-200/20">
                                    <div 
                                       className="h-full bg-[#6b21a8] transition-all duration-1000 shadow-[0_0_10px_rgba(107,33,168,0.4)]" 
                                       style={{ width: `${Math.min(100, ((enrollment.final_price || 0) / (fullFee || 1)) * 100)}%` }} 
                                    />
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right align-middle">
                              <div className="flex items-center justify-end gap-2.5">
                                 {(enrollment.status === 'pending' || !enrollment.status) ? (
                                   <Button size="sm" disabled={processingId === enrollment.id} className="h-10 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] px-5 rounded-none hover:bg-[#6b21a8] transition-all shadow-lg shadow-slate-200" onClick={() => handleUpdateStatus(enrollment.id, 'active')}>
                                     {processingId === enrollment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                     Verify Access
                                   </Button>
                                 ) : (
                                   <Button size="sm" variant="ghost" className="h-10 w-10 p-0 bg-slate-50 text-slate-400 hover:text-[#6b21a8] transition-all border border-slate-100 hover:bg-white rounded-none" onClick={() => setSelectedEnrollment(enrollment)}>
                                     <Eye className="h-5 w-5" />
                                   </Button>
                                 )}
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all">
                                          <MoreVertical className="h-5 w-5" />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-none p-1.5 border-slate-100 shadow-2xl">
                                       <DropdownMenuItem className="rounded-none px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600" onClick={() => copyToClipboard(enrollment.user_id || '', enrollment.id + '-menu')}>
                                          <Copy className="h-3.5 w-3.5 mr-2.5 text-primary" /> Sync ID
                                       </DropdownMenuItem>
                                       <DropdownMenuItem className="text-rose-600 rounded-none px-4 py-2.5 text-[10px] font-black uppercase tracking-widest" onClick={() => handleDelete(enrollment.id)}>
                                          <Trash2 className="h-3.5 w-3.5 mr-2.5" /> Terminate
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </div>
                           </td>
                        </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="w-[95vw] sm:max-w-4xl h-[92vh] p-0 overflow-hidden bg-white border-2 border-slate-100 rounded-none shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="flex flex-col md:flex-row min-h-full">
              <div className="w-full md:w-80 bg-slate-50 p-10 md:border-r-2 border-slate-100 flex flex-col justify-between shrink-0">
                  <div className="space-y-10">
                    <div>
                        <Badge className="bg-[#6b21a8]/20 text-[#6b21a8] border border-[#6b21a8]/30 rounded-none px-4 py-1.5 text-[9px] uppercase font-black tracking-widest mb-4">Verification Node</Badge>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Assessment <br/><span className="text-[#6b21a8] tracking-tighter">Terminal</span></h3>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                               <RefreshCw className="h-4 w-4 text-[#6b21a8] animate-spin-slow" /> UTR Serial Number
                            </label>
                            <div className="bg-white p-5 rounded-none border-2 border-slate-100 shadow-sm">
                                <span className="text-base font-mono font-black text-slate-900 tracking-wider break-all">{selectedEnrollment?.utr_number || "AWAITING TRANSMISSION"}</span>
                            </div>
                        </div>
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-none bg-[#6b21a8] flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Subject</p>
                                    <p className="text-base font-black text-slate-900 leading-tight">{selectedEnrollment?.user_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-none bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm"><GraduationCap className="h-6 w-6 text-[#6b21a8]" /></div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Course</p>
                                    <p className="text-base font-black text-slate-900 leading-tight">{selectedEnrollment?.course_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-[500px] bg-slate-100/50 relative p-10">
                <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-inner flex items-center justify-center border-2 border-slate-100 group">
                    {selectedEnrollment?.payment_proof_url ? (
                        <div className="relative group/proof cursor-zoom-in">
                            <img src={selectedEnrollment.payment_proof_url} alt="Payment Proof" className="max-w-full max-h-[35vh] rounded-none object-contain shadow-2xl transition-all duration-500 group-hover/proof:scale-[1.02]" />
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-20 opacity-30">
                             <CreditCard className="h-20 w-20 mx-auto text-slate-400" />
                             <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Credential Transmission Missing</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-white border-t-2 border-slate-100 flex flex-wrap justify-end gap-4 shrink-0 rounded-none">
            <Button variant="ghost" onClick={() => setSelectedEnrollment(null)} className="text-slate-400 font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-none hover:bg-slate-50 transition-all">Close Terminal</Button>
            <Button className="bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-none h-14 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white transition-all shadow-md" onClick={() => { if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'rejected'); setSelectedEnrollment(null); }}>Deny Access</Button>
            <Button className="bg-[#6b21a8] hover:bg-slate-900 text-white rounded-none h-14 px-12 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(107,33,168,0.3)] hover:translate-y-[-4px] active:translate-y-0" onClick={() => { if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'active'); setSelectedEnrollment(null); }}>Authorize Enrollment</Button>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
