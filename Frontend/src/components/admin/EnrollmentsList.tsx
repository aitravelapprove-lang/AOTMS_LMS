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
  Hash
} from "lucide-react";
import { CourseEnrollment } from "@/hooks/useCourses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [timeFilter, setTimeFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);

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

    return matchesSearch && matchesCourse && matchesStatus;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, course or UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-40">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative w-full sm:w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
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
        </CardHeader>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No enrollments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">UUID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">UTR / Proof</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Progress</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {enrollment.user_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.user_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {enrollment.user_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                          <Fingerprint className="h-3.5 w-3.5 text-primary/60" />
                          {enrollment.user_id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                          {enrollment.course_name || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 w-fit">
                            <span className="text-[10px] font-mono font-black text-slate-600 uppercase">UTR:</span>
                            <span className="text-[10px] font-mono font-bold text-primary group-hover:text-primary transition-colors">
                              {enrollment.utr_number || "PENDING"}
                            </span>
                          </div>
                          {enrollment.payment_proof_url && (
                             <div 
                                className="h-8 w-14 rounded-md overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in hover:border-primary transition-all group"
                                onClick={() => setSelectedEnrollment(enrollment)}
                             >
                                <img src={enrollment.payment_proof_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-green-700">
                            ₹{(enrollment.final_price ?? enrollment.price)?.toLocaleString('en-IN')}
                          </span>
                          {enrollment.applied_coupon && (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] uppercase tracking-tighter w-fit">
                              Code: {enrollment.applied_coupon}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${enrollment.progress_percentage && enrollment.progress_percentage >= 95 ? 'bg-green-500' : 'bg-primary'}`} 
                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                              />
                           </div>
                           <span className="text-xs font-bold text-slate-600">
                             {enrollment.progress_percentage || 0}%
                           </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(enrollment.status || 'pending')}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(enrollment.enrollment_date).split(',')[0]}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(enrollment.enrollment_date).split(',')[1]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-primary/20 text-primary hover:bg-primary/5"
                            onClick={() => setSelectedEnrollment(enrollment)}
                            title="View Enrollment Details"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            Details
                          </Button>

                          {(enrollment.status === 'pending' || !enrollment.status) && onUpdateStatus && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                disabled={processingId === enrollment.id}
                                className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                              >
                                {processingId === enrollment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                disabled={processingId === enrollment.id}
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(enrollment.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {enrollment.status === 'active' && (
                            <Badge variant="outline" className="h-8 bg-green-50 text-green-600 border-green-200">
                              Approved
                            </Badge>
                          )}

                          {enrollment.status === 'rejected' && (
                            <Badge variant="outline" className="h-8 bg-red-50 text-red-600 border-red-200">
                              Rejected
                            </Badge>
                          )}

                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 ml-1"
                              onClick={() => handleDelete(enrollment.id)}
                              disabled={processingId === enrollment.id}
                              title="Delete Enrollment"
                            >
                              {processingId === enrollment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof & Details Viewer Dialog */}
      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-900 border-slate-800 rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Left: Metadata */}
            <div className="md:w-80 bg-slate-800/50 p-8 border-r border-slate-700 flex flex-col justify-between">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Enrollment Detail</h3>
                        <p className="text-xs text-slate-400 font-medium">Verification required for activation</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">UTR Number / TXN ID</label>
                            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700 group hover:border-primary transition-colors">
                                <Hash className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-mono font-bold text-white tracking-wider">
                                    {selectedEnrollment?.utr_number || "NOT PROVIDED"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</label>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">{selectedEnrollment?.user_name}</p>
                                <p className="text-xs text-slate-400 font-medium">{selectedEnrollment?.user_phone}</p>
                                <p className="text-xs text-slate-500 truncate">{selectedEnrollment?.user_email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Course</label>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-primary">{selectedEnrollment?.course_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Progress: {selectedEnrollment?.progress_percentage || 0}%</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Date</label>
                            <p className="text-sm font-bold text-white">
                                {selectedEnrollment?.enrollment_date ? formatDate(selectedEnrollment.enrollment_date) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tighter">
                        Please verify the UTR against your Vyapar/Bank statements before approving.
                    </p>
                </div>
            </div>

            {/* Right: Payment Proof Image */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 flex items-center justify-center bg-black/20">
                    {selectedEnrollment?.payment_proof_url ? (
                        <img 
                            src={selectedEnrollment.payment_proof_url} 
                            alt="Payment Proof" 
                            className="max-w-full max-h-[60dvh] object-contain rounded-lg shadow-2xl border border-white/5"
                        />
                    ) : (
                        <div className="text-center space-y-4 py-20 grayscale opacity-40">
                             <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                                <CreditCard className="h-10 w-10 text-slate-500" />
                             </div>
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Screenshot Uploaded</p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-800/30 border-t border-slate-700 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSelectedEnrollment(null)} className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl">
                        Close
                    </Button>
                    <Button 
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 rounded-xl"
                        onClick={() => {
                            if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'rejected');
                            setSelectedEnrollment(null);
                        }}
                    >
                        Reject
                    </Button>
                    <Button 
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => {
                            if(selectedEnrollment) handleUpdateStatus(selectedEnrollment.id, 'active');
                            setSelectedEnrollment(null);
                        }}
                    >
                        Approve Enrollment
                    </Button>
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
