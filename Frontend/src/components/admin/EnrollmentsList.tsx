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
  Check
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name, email, course or UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
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
            <Select value={filterTerm} onValueChange={setFilterTerm}>
              <SelectTrigger className="h-11 rounded-xl bg-background border-slate-200">
                 <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Terms" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="full">Full Term</SelectItem>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
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

          <div className="w-full sm:w-40">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="h-11 rounded-xl bg-background border-slate-200">
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Time" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Student Enrollments
          </CardTitle>
          <CardDescription>
            {filteredEnrollments.length} of {enrollments.length} enrollments
          </CardDescription>
        </CardHeader>        <CardContent className="p-0 sm:p-6">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No enrollments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Card View (shown only on mobile/tablet) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 p-4">
                 {filteredEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5 relative group hover:shadow-md transition-all">
                       {/* Floating Status Badge */}
                       <div className="absolute top-4 right-4 h-fit">
                          {getStatusBadge(enrollment.status || 'pending')}
                       </div>

                       <div className="flex gap-3 pr-16">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                             <span className="text-lg font-bold text-primary">{enrollment.user_name?.charAt(0) || 'U'}</span>
                          </div>
                          <div className="overflow-hidden">
                             <h4 className="font-bold text-slate-900 text-base leading-tight truncate">{enrollment.user_name}</h4>
                             <p className="text-xs text-muted-foreground truncate">{enrollment.user_email}</p>
                          </div>
                       </div>

                       {/* UUID Display with Copy - Mobile */}
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Fingerprint className="h-3 w-3" /> Student UUID
                             </span>
                             <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  copiedId === enrollment.id + '-mobile'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-white text-slate-500 hover:text-primary hover:bg-primary/5 border border-slate-200'
                                }`}
                                onClick={() => copyToClipboard(enrollment.user_id || '', enrollment.id + '-mobile')}
                             >
                               {copiedId === enrollment.id + '-mobile' ? (
                                 <><Check className="h-3 w-3 mr-1" /> Copied!</>
                               ) : (
                                 <><Copy className="h-3 w-3 mr-1" /> Copy</>
                               )}
                             </Button>
                          </div>
                          <p className="font-mono font-bold text-sm text-slate-700 break-all leading-relaxed select-all">
                             {enrollment.user_id || 'N/A'}
                          </p>
                       </div>

                       <div className="space-y-2.5 pt-2">
                          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Course</span>
                             <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary text-[10px]">
                                {enrollment.course_name}
                             </Badge>
                          </div>
                          
                           <div className="grid grid-cols-1 gap-2">
                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Fee</span>
                                  <span className="text-xs font-bold text-slate-400">₹{parseInt(enrollment.price || '0').toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-y border-slate-200/50">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] text-slate-400 font-bold uppercase">Paid Amount</span>
                                      <span className="font-black text-emerald-600 text-lg">₹{enrollment.final_price?.toLocaleString('en-IN') || enrollment.price}</span>
                                   </div>
                                   <div className="text-right">
                                      {enrollment.payment_term === 'term1' ? (
                                          <Badge className="text-[9px] h-5 px-2 font-black uppercase bg-blue-100 text-blue-700 border-blue-200">1st Term</Badge>
                                      ) : enrollment.payment_term === 'term2' ? (
                                          <Badge className="text-[9px] h-5 px-2 font-black uppercase bg-purple-100 text-purple-700 border-purple-200">2nd Term</Badge>
                                      ) : (
                                          <Badge className="text-[9px] h-5 px-2 font-black uppercase bg-emerald-100 text-emerald-700 border-emerald-200">Paid Full</Badge>
                                      )}
                                   </div>
                                </div>
                                {enrollment.remaining_balance ? (
                                  <div className="flex justify-between items-center bg-amber-50 p-2 rounded-xl border border-amber-100 mt-1">
                                    <span className="text-[10px] text-amber-700 font-black uppercase">Balance Money</span>
                                    <span className="text-lg font-black text-amber-600">₹{enrollment.remaining_balance?.toLocaleString('en-IN')}</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center opacity-40">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Balance Money</span>
                                    <span className="text-xs font-bold text-slate-400">₹0</span>
                                  </div>
                                )}
                             </div>
                           </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-1">
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">UTR Reference</span>
                             <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-600 text-xs truncate max-w-[150px]">{enrollment.utr_number || "PENDING"}</span>
                                <div className="text-[9px] font-bold text-slate-400">{formatDate(enrollment.enrollment_date).split(',')[0]}</div>
                             </div>
                          </div>
                       </div>

                       <div className="pt-2 flex flex-col gap-2">
                          <Button
                            variant="secondary"
                            className="w-full h-10 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none group/btn"
                            onClick={() => setSelectedEnrollment(enrollment)}
                          >
                            <Eye className="h-4 w-4 mr-2 group-hover/btn:text-primary transition-colors" /> View Payment Proof
                          </Button>
                          
                          {(enrollment.status === 'pending' || !enrollment.status) && onUpdateStatus && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm shadow-emerald-500/20"
                                onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="outline"
                                className="h-10 rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 font-bold text-sm"
                                onClick={() => handleUpdateStatus(enrollment.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="hidden lg:block overflow-x-auto custom-scrollbar-horizontal rounded-xl border border-slate-200/60 shadow-sm">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-primary/[0.02] transition-colors group border-b border-slate-100 last:border-0 italic-none">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-primary/40 group-hover:bg-white shadow-sm transition-all font-black text-lg text-primary shrink-0">
                               {enrollment.user_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-black text-slate-900 truncate">
                                {enrollment.user_name || 'Unknown'}
                              </p>
                              <p className="text-[11px] font-bold text-slate-500 group-hover:text-slate-600 transition-colors tracking-tight truncate">
                                {enrollment.user_email}
                              </p>
                              {/* UUID with Copy Button */}
                              <div className="flex items-center gap-2 mt-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 group-hover:border-primary/20 transition-all w-fit max-w-full">
                                <Fingerprint className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                                <span className="font-mono text-[13px] font-bold text-slate-700 tracking-wide select-all truncate" title={enrollment.user_id}>
                                  {enrollment.user_id || 'N/A'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 rounded-md shrink-0 transition-all ${
                                    copiedId === enrollment.id
                                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                      : 'text-slate-400 hover:text-primary hover:bg-primary/10'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(enrollment.user_id || '', enrollment.id);
                                  }}
                                  title="Copy UUID"
                                >
                                  {copiedId === enrollment.id ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1.5 w-[200px]">
                            <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">{enrollment.course_name || "Unknown Program"}</p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-primary" style={{ width: '40%' }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 min-w-[180px]">
                            <div className="flex items-center justify-between gap-3">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Paid Amount</span>
                                  <span className="text-lg font-black text-slate-900 leading-none">₹{enrollment.final_price?.toLocaleString('en-IN') || enrollment.price}</span>
                               </div>
                               {enrollment.payment_term === 'full' ? (
                                 <Badge className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 h-5 px-2 border-emerald-200 border shadow-sm shrink-0">Paid Full</Badge>
                               ) : (
                                 <Badge className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 h-5 px-2 border-indigo-200 border shadow-sm shrink-0">
                                   {enrollment.payment_term === 'term1' ? '1st Term' : '2nd Term'}
                                 </Badge>
                               )}
                            </div>
                            
                            <div className="space-y-1.5 pt-1 border-t border-slate-200/50">
                               {enrollment.remaining_balance ? (
                                 <div className="flex justify-between items-center bg-amber-50/50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                                   <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Balance Money:</span>
                                   <span className="text-base font-black text-amber-600">₹{enrollment.remaining_balance?.toLocaleString('en-IN')}</span>
                                 </div>
                               ) : null}
                               <div className="flex justify-between items-center text-[10px] text-slate-400">
                                 <span className="font-bold uppercase tracking-tighter">Full Fee:</span>
                                 <span className="font-bold">₹{parseInt(enrollment.price || '0').toLocaleString('en-IN')}</span>
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ref: {enrollment.utr_number || "---"}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 p-0 justify-start"
                                  onClick={() => setSelectedEnrollment(enrollment)}
                                >
                                  Open Receipt
                                </Button>
                             </div>
                             {enrollment.payment_proof_url && (
                                <div 
                                   className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:border-primary transition-all shrink-0"
                                   onClick={() => setSelectedEnrollment(enrollment)}
                                >
                                   <img src={enrollment.payment_proof_url} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col items-center gap-2">
                              {getStatusBadge(enrollment.status || 'pending')}
                              <div className="flex items-center gap-1.5">
                                <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${enrollment.progress_percentage && enrollment.progress_percentage >= 95 ? 'bg-green-500' : 'bg-primary'} transition-all`} 
                                     style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                   />
                                </div>
                                <span className="text-[9px] font-black text-slate-400">
                                  {enrollment.progress_percentage || 0}%
                                </span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col text-[10px] font-bold text-slate-500 whitespace-nowrap">
                             <span className="text-slate-900">{new Date(enrollment.enrollment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                             <span className="text-slate-400 font-medium uppercase tracking-tighter">{new Date(enrollment.enrollment_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1.5">
                            {(enrollment.status === 'pending' || !enrollment.status) ? (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  disabled={processingId === enrollment.id}
                                  className="h-8 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg px-3"
                                  onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                                >
                                  {processingId === enrollment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  disabled={processingId === enrollment.id}
                                  className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest rounded-lg px-2"
                                  onClick={() => handleUpdateStatus(enrollment.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="h-8 w-8 p-0 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                 onClick={() => setSelectedEnrollment(enrollment)}
                               >
                                 <Eye className="h-4 w-4" />
                               </Button>
                            )}
                            
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                                     <MoreVertical className="h-4 w-4" />
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => copyToClipboard(enrollment.user_id || '', enrollment.id + '-menu')}
                                    className="gap-2"
                                  >
                                    {copiedId === enrollment.id + '-menu' ? (
                                      <><Check className="h-4 w-4 text-emerald-600" /> <span className="text-emerald-600 font-medium">Copied!</span></>
                                    ) : (
                                      <><Copy className="h-4 w-4" /> Copy Student UUID</>
                                    )}
                                  </DropdownMenuItem>
                                  {onDelete && (
                                    <DropdownMenuItem className="text-rose-600 focus:text-rose-700" onClick={() => handleDelete(enrollment.id)}>
                                       <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                                    </DropdownMenuItem>
                                  )}
                               </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="w-[95vw] sm:max-w-4xl h-[92vh] p-0 overflow-hidden bg-[#0f172a] border-slate-800 rounded-[2rem] shadow-2xl flex flex-col">
          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="flex flex-col md:flex-row min-h-full">
              {/* Left: Metadata */}
              <div className="w-full md:w-80 bg-slate-900/40 p-6 sm:p-8 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
                  <div className="space-y-8">
                    <div>
                        <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider mb-3">
                           Verification Terminal
                        </Badge>
                        <h3 className="text-2xl font-black text-white leading-tight">Enrollment <br/><span className="text-primary font-light">Verification</span></h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                               <RefreshCw className="h-3 w-3" /> Transaction Identifier
                            </label>
                            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 group hover:border-primary transition-all shadow-inner">
                                <span className="text-sm font-mono font-bold text-white tracking-widest break-all">
                                    {selectedEnrollment?.utr_number || "NOT PROVIDED"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                   <Users className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Student</p>
                                    <p className="text-sm font-bold text-white leading-tight">{selectedEnrollment?.user_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                   <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Course</p>
                                    <p className="text-sm font-bold text-white leading-tight">{selectedEnrollment?.course_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                   <CreditCard className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Payment Structure</p>
                                    <p className="text-sm font-bold text-emerald-500 leading-tight">
                                       {selectedEnrollment?.payment_term === 'term1' ? '1st Installment' : selectedEnrollment?.payment_term === 'term2' ? '2nd Installment' : 'Full Payment'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                   <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Submitted On</p>
                                    <p className="text-sm font-bold text-white leading-tight">
                                       {selectedEnrollment?.enrollment_date ? formatDate(selectedEnrollment.enrollment_date).split(',')[0] : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-800">
                    <div className="flex items-start gap-3 bg-primary/10 p-3 rounded-xl border border-primary/20">
                       <Fingerprint className="h-4 w-4 text-primary shrink-0" />
                       <p className="text-[10px] text-slate-300 leading-relaxed font-bold uppercase tracking-tight">
                        Verify Transaction against Statements <br/> 
                        <span className="text-slate-500 font-medium">Internal Ref: {selectedEnrollment?.id?.substring(0,10)}</span>
                       </p>
                    </div>
                </div>
            </div>
            {/* Right: Payment Proof Image */}
            <div className="flex-1 flex flex-col min-h-[450px] bg-black/60 relative">
                <div className="flex-1 p-4 sm:p-8 flex items-center justify-center">
                    {selectedEnrollment?.payment_proof_url ? (
                        <div className="relative p-2 sm:p-4 bg-white rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.15)] group/img max-w-full">
                            <img 
                                src={selectedEnrollment.payment_proof_url} 
                                alt="Payment Proof" 
                                className="max-w-full max-h-[55vh] rounded-lg object-contain"
                            />
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/img:opacity-100 transition-opacity">
                               <Eye className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-20 grayscale opacity-40">
                             <div className="h-24 w-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-700 rotate-12">
                                <CreditCard className="h-10 w-10 text-slate-500" />
                             </div>
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Digital Receipt Missing</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
          <div className="p-4 sm:p-6 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 shrink-0 z-10">
              <Button variant="ghost" onClick={() => setSelectedEnrollment(null)} className="flex-1 sm:flex-none text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-11 px-6">
                  Close
              </Button>
              <Button 
                  className="flex-1 sm:flex-none bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl h-11 px-6 font-bold"
                  onClick={() => {
                      if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'rejected');
                      setSelectedEnrollment(null);
                  }}
              >
                  Reject
              </Button>
              <Button 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-11 px-8 font-bold"
                  onClick={() => {
                      if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'active');
                      setSelectedEnrollment(null);
                  }}
              >
                  Approve Enrollment
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
