import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  UserCog,
  Clock,
  AlertCircle,
  Send,
  CheckCircle,
  Copy,
  Eye,
  Loader2,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  Presentation,
  Shield,
  Mail,
  Fingerprint,
  Calendar,
  Activity,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profile } from "@/hooks/useAdminData";

interface UserManagementProps {
  users: Profile[];
  loading: boolean;
  roleCounts: Record<string, number>;
  onUpdateStatus: (
    userId: string,
    status: "approved" | "rejected" | "suspended" | "active",
    suspensionDays?: string
  ) => Promise<boolean>;
  onUpdateRole: (
    userId: string,
    role: "admin" | "manager" | "instructor" | "student",
  ) => Promise<boolean>;
  onSendEmail: (userId: string) => Promise<boolean>;
}

export function UserManagement({
  users,
  loading,
  roleCounts,
  onUpdateStatus,
  onUpdateRole,
  onSendEmail,
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionDays, setSuspensionDays] = useState("7");
  interface PerformanceData {
    enrollments: { course_name: string; progress: number; status: string }[];
    results: { title: string; score: number; total: number; percentage: number; date: string }[];
    github_url?: string;
    resume_url?: string;
  }
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    if (showProfileDialog && selectedUser?.id) {
       setLoadingPerformance(true);
       fetchWithAuth(`/admin/student-performance/${selectedUser.id}`)
          .then(data => setPerformanceData(data as PerformanceData))
          .catch(err => {
              console.error("Failed to fetch student performance:", err);
              setPerformanceData(null);
          })
          .finally(() => setLoadingPerformance(false));
    } else {
       setPerformanceData(null);
    }
  }, [showProfileDialog, selectedUser]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewProfile = (user: Profile) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      await onUpdateRole(
        selectedUser.id,
        newRole as "admin" | "manager" | "instructor" | "student",
      );
      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole("");
    }
  };

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getRoleBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "instructor":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Main Student Registry - Realigned with Grant Access Style */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-6 border-b border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500 max-w-md">
                Manage across {users.length} authenticated nodes and platform entities.
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search user registry..."
                  className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl bg-slate-50 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-tight">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all" className="text-xs font-bold py-2">ALL ENTITIES</SelectItem>
                  <SelectItem value="admin" className="text-xs font-bold py-2">ADMINS</SelectItem>
                  <SelectItem value="manager" className="text-xs font-bold py-2">MANAGERS</SelectItem>
                  <SelectItem value="instructor" className="text-xs font-bold py-2">INSTRUCTORS</SelectItem>
                  <SelectItem value="student" className="text-xs font-bold py-2">STUDENTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
               <Users className="h-10 w-10 opacity-20 mb-4" />
               <p className="font-bold text-slate-800">No users found</p>
               <p className="text-xs">Adjust your filters to see more results</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-none">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                        user.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-slate-900 leading-none truncate">{user.full_name || "Nexus User"}</p>
                        <Badge 
                            variant="outline" 
                            className={`text-[9px] h-4 px-1.5 rounded-md uppercase font-black tracking-tighter border-none shadow-none ${
                                user.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                                user.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                                user.role === 'instructor' ? 'bg-blue-50 text-blue-600' :
                                'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {user.role || "student"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate leading-none mb-2">{user.email}</p>
                      <div className="flex items-center gap-1.5 overflow-hidden opacity-100">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{formatLastActive(user.last_active_at)}</span>
                         {user.status === 'suspended' && (
                           <span className="text-[8px] font-black text-rose-500 uppercase px-1 bg-rose-50 rounded">Suspended</span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto sm:ml-auto shrink-0 flex items-center gap-2">
                    {user.approval_status === "pending" ? (
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowApprovalDialog(true);
                        }}
                        className="w-full sm:w-auto h-9 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs"
                      >
                        Review Node
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            className="w-full sm:w-auto h-9 px-4 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1 group/btn shadow-none border-none"
                          >
                            + Access
                            <ArrowRight className="h-3.5 w-3.5 ml-0.5 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-2 border-b mb-1">Node Operations</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewProfile(user)} className="rounded-xl font-bold text-[13px] py-2.5 cursor-pointer hover:bg-slate-50">
                            <Eye className="mr-3 h-4 w-4 text-primary" /> View Intelligence
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role || "student");
                            setShowRoleDialog(true);
                          }} className="rounded-xl font-bold text-[13px] py-2.5 cursor-pointer hover:bg-slate-50">
                            <UserCog className="mr-3 h-4 w-4 text-emerald-500" /> Reassign Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                          {user.status === 'suspended' ? (
                            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "approved")} className="rounded-xl font-bold text-[13px] py-2.5 text-emerald-600 bg-emerald-50/50 cursor-pointer">
                              <Unlock className="mr-3 h-4 w-4" /> Restore Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setShowSuspendDialog(true);
                            }} className="rounded-xl font-bold text-[13px] py-2.5 text-rose-600 bg-rose-50/50 cursor-pointer">
                              <Lock className="mr-3 h-4 w-4" /> Suspend Access
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Authorities Header - Separate Full Width */}
      <div className="flex flex-col gap-6">
        <div className="px-4">
          <div className="flex items-center gap-4 mb-2">
            <Shield className="h-7 w-7 text-primary" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Permission Hierarchy</h3>
          </div>
          <p className="text-[13px] font-medium text-slate-500 ml-11 uppercase tracking-[0.2em]">Node distribution across authority levels</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Public Students", count: roleCounts.student || 0, color: "bg-slate-900", icon: Users, desc: "Restricted knowledge nodes" },
            { label: "Academic Instructors", count: roleCounts.instructor || 0, color: "bg-blue-600", icon: Presentation, desc: "Curriculum publishers" },
            { label: "Operations Managers", count: roleCounts.manager || 0, color: "bg-amber-500", icon: UserCog, desc: "System orchestrators" },
            { label: "Core Administrators", count: roleCounts.admin || 0, color: "bg-rose-500", icon: Shield, desc: "Root authority cluster", isHigh: true },
          ].map((role) => (
            <Card key={role.label} className={`border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group transition-all duration-500 hover:-translate-y-2 ${role.isHigh ? 'bg-primary shadow-primary/30' : 'bg-white'}`}>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12 ${role.isHigh ? 'bg-white/20' : 'bg-slate-50'}`}>
                    <role.icon className={`h-6 w-6 ${role.isHigh ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div className={`h-2 w-2 rounded-full animate-ping ${role.isHigh ? 'bg-white/40' : 'bg-emerald-500/40'}`} />
                </div>
                
                <div className="space-y-1">
                  <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] ${role.isHigh ? 'text-white/60' : 'text-slate-400'}`}>
                    {role.label}
                  </h5>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black tracking-tighter ${role.isHigh ? 'text-white' : 'text-slate-900'}`}>
                      {role.count}
                    </span>
                    <span className={`text-[11px] font-bold ${role.isHigh ? 'text-white/40' : 'text-slate-300'}`}>Nodes</span>
                  </div>
                  <p className={`text-[11px] font-medium pt-3 border-t mt-4 border-white/10 ${role.isHigh ? 'text-white/60' : 'text-slate-400 border-slate-50'}`}>
                    {role.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent aria-describedby="role-dialog-description" className="max-w-md overflow-hidden bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-2xl rounded-2xl p-0">
          <DialogHeader className="px-4 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
                <UserCog className="h-5 w-5 text-accent" />
              </div>
              Modify User Role
            </DialogTitle>
            <DialogDescription id="role-dialog-description" className="text-sm text-slate-600 font-medium sm:ml-13">
              Change the system permissions for{" "}
              <span className="text-slate-700 font-semibold">
                {selectedUser?.full_name || selectedUser?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Select New Role
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 hover:border-accent hover:bg-white transition-all font-medium">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl overflow-hidden p-1">
                  <SelectItem
                    value="student"
                    className="rounded-lg h-10 font-medium hover:bg-slate-50"
                  >
                    Student
                  </SelectItem>
                  <SelectItem
                    value="instructor"
                    className="rounded-lg h-10 font-medium hover:bg-slate-50"
                  >
                    Instructor
                  </SelectItem>
                  <SelectItem
                    value="manager"
                    className="rounded-lg h-10 font-medium hover:bg-slate-50"
                  >
                    Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <Button
              variant="ghost"
              className="rounded-xl font-semibold text-slate-600 hover:text-slate-700 hover:bg-slate-200/50 h-11 px-6 active:scale-95 transition-all"
              onClick={() => setShowRoleDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-semibold bg-accent hover:bg-accent/90 text-white shadow-sm shadow-accent/20 h-11 px-6 active:scale-95 transition-all"
              onClick={handleRoleChange}
            >
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent aria-describedby="approval-dialog-description" className="w-[95vw] sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-2xl rounded-2xl p-0 scrollbar-none">
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Users className="h-5 w-5 text-primary" />
              </div>
              User Review & Approval
            </DialogTitle>
            <DialogDescription id="approval-dialog-description" className="text-sm text-slate-600 font-medium sm:ml-13">
              Review credential details before granting platform access.
            </DialogDescription>
          </DialogHeader>

          <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/50">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Full Name
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedUser?.full_name || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Role Status
                  </p>
                  <div>
                    <Badge
                      variant="secondary"
                      className="h-5 px-2 bg-white border text-slate-700 border-slate-200 shadow-sm font-bold uppercase tracking-tighter text-[9px]"
                    >
                      {selectedUser?.role || "student"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pb-4 border-b border-slate-200/50 space-y-1.5">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Email Address
                </p>
                <p
                  className="text-sm font-semibold text-slate-800 break-all leading-tight"
                  title={selectedUser?.email}
                >
                  {selectedUser?.email}
                </p>
              </div>

              <div className="pb-4 border-b border-slate-200/50 space-y-1.5">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  UUID
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-mono text-slate-600 break-all leading-tight flex-1">
                    {selectedUser?.id}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0 hover:bg-slate-200/50 rounded-lg transition-colors"
                    onClick={() => selectedUser?.id && copyToClipboard(selectedUser.id)}
                  >
                    {copiedId === selectedUser?.id ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Membership Date
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedUser?.created_at
                    ? new Date(selectedUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/40 flex gap-3 items-start shadow-sm">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">
                  Automated Workflow
                </p>
                <p className="text-[11px] font-medium text-amber-800/70 leading-normal">
                  Confirming approval will instantly trigger the onboarding
                  welcome sequence via our automated systems.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 sticky bottom-0 z-10 backdrop-blur-md">
            <Button
              variant="ghost"
              className="w-full sm:w-auto rounded-xl font-semibold text-slate-600 hover:text-slate-700 hover:bg-slate-200/50 h-11 px-6 active:scale-95 transition-all"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-xl font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-11 px-6 active:scale-95 transition-all shadow-sm"
                disabled={processingAction !== null}
                onClick={async () => {
                  if (selectedUser) {
                    setProcessingAction("reject");
                    try {
                      const success = await onUpdateStatus(selectedUser.id, "rejected");
                      if (success) setShowApprovalDialog(false);
                    } finally {
                      setProcessingAction(null);
                    }
                  }
                }}
              >
                {processingAction === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
              </Button>

              <Button
                className="w-full sm:w-auto rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 gap-2 h-11 px-6 active:scale-95 transition-all"
                disabled={processingAction !== null || selectedUser?.approval_status === "approved"}
                onClick={async () => {
                  if (selectedUser) {
                    setProcessingAction("approve");
                    try {
                      const success = await onUpdateStatus(selectedUser.id, "approved");
                      if (success) setShowApprovalDialog(false);
                    } finally {
                      setProcessingAction(null);
                    }
                  }
                }}
              >
                {processingAction === "approve" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {selectedUser?.approval_status === "approved" ? "Approved" : "Approve"}
                  </>
                )}
              </Button>

              <Button
                className="w-full sm:w-auto rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 gap-2 h-11 px-6 active:scale-95 transition-all"
                disabled={processingAction !== null}
                onClick={async () => {
                  if (selectedUser) {
                    setProcessingAction("email");
                    try {
                      await onSendEmail(selectedUser.id);
                      setShowApprovalDialog(false);
                    } finally {
                      setProcessingAction(null);
                    }
                  }
                }}
              >
                {processingAction === "email" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Email
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent aria-describedby="profile-dialog-description" className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              User Profile
            </DialogTitle>
            <DialogDescription id="profile-dialog-description" className="sr-only">
              View user profile details including name, email, UUID, and status.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedUser.full_name || 'Unknown'}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {selectedUser.role || 'student'}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{selectedUser.email || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Mobile Number</span>
                  <span className="text-sm font-medium">{selectedUser.mobile_number || 'Not provided'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">UUID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{selectedUser.id?.substring(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => selectedUser.id && copyToClipboard(selectedUser.id)}
                    >
                      {copiedId === selectedUser.id ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                    {selectedUser.status || 'active'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Approval</span>
                  <Badge variant={selectedUser.approval_status === 'approved' ? 'default' : 'secondary'}>
                    {selectedUser.approval_status || 'pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-medium">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Performance Section */}
              <div className="space-y-3 pt-2">
                 <h4 className="font-semibold flex items-center text-sm">
                   <Presentation className="h-4 w-4 mr-2 text-primary" /> Performance & Portfolio
                 </h4>
                 {loadingPerformance ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                 ) : performanceData ? (
                    <div className="grid gap-3">
                       {/* Github & Resume */}
                       {(performanceData.github_url || performanceData.resume_url) && (
                          <div className="flex flex-col gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                             {performanceData.github_url && (
                                <a href={performanceData.github_url} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-700 hover:underline">
                                  <Github className="h-4 w-4 mr-2" /> GitHub Repository
                                </a>
                             )}
                             {performanceData.resume_url && (
                                <a 
                                  href={performanceData.resume_url.startsWith('http') 
                                    ? performanceData.resume_url 
                                    : `${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')}${performanceData.resume_url.startsWith('/') ? '' : '/'}${performanceData.resume_url}`
                                  } 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex items-center text-sm text-blue-700 hover:underline"
                                >
                                  <Briefcase className="h-4 w-4 mr-2" /> View Resume
                                </a>
                             )}
                          </div>
                       )}

                       {/* Active Enrollments */}
                       {performanceData.enrollments.length > 0 && (
                          <div className="space-y-2">
                             <span className="text-xs font-semibold text-muted-foreground uppercase">Active Enrollments</span>
                             {performanceData.enrollments.map((env, i) => (
                                <div key={i} className="bg-muted p-2 rounded flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2 max-w-[70%]">
                                     <GraduationCap className="h-3 w-3 shrink-0" />
                                     <span className="truncate" title={env.course_name}>{env.course_name}</span>
                                  </div>
                                  <Badge variant={env.progress === 100 ? "default" : "secondary"} className="text-[10px]">
                                     {env.progress}%
                                  </Badge>
                                </div>
                             ))}
                          </div>
                       )}

                       {/* Exam Results */}
                       {performanceData.results.length > 0 && (
                          <div className="space-y-2">
                             <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Assessments</span>
                             {performanceData.results.map((res, i) => (
                                <div key={i} className="bg-muted p-2 rounded flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2 max-w-[65%]">
                                     <Award className="h-3 w-3 shrink-0" />
                                     <span className="truncate" title={res.title}>{res.title}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-[11px]">{res.percentage}%</div>
                                    <div className="text-[9px] text-muted-foreground">{res.score}/{res.total}</div>
                                  </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 ) : (
                    <div className="text-sm text-muted-foreground text-center p-3">No performance data found.</div>
                 )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setNewRole(selectedUser.role || 'student');
                    setShowProfileDialog(false);
                    setShowRoleDialog(true);
                  }}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Change Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend User Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <span className="font-bold">{selectedUser?.full_name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration (Days)</label>
                <Select value={suspensionDays} onValueChange={setSuspensionDays}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days (1 Week)</SelectItem>
                        <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                        <SelectItem value="30">30 Days (1 Month)</SelectItem>
                        <SelectItem value="90">90 Days (3 Months)</SelectItem>
                        <SelectItem value="365">365 Days (1 Year)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                This user will be blocked from all platform features until the suspension expires.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button 
                variant="destructive" 
                onClick={async () => {
                    if (selectedUser) {
                        setIsProcessing(true);
                        await onUpdateStatus(selectedUser.id, "suspended", suspensionDays);
                        setIsProcessing(false);
                        setShowSuspendDialog(false);
                    }
                }}
                disabled={isProcessing}
            >
                {isProcessing ? "Processing..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
