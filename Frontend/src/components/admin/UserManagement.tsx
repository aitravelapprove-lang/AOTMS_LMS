import { useState } from "react";
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
} from "lucide-react";
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
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionDays, setSuspensionDays] = useState("7");

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
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  User Management
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 mt-0.5">
                  Manage all platform users ({users.length} total)
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-full sm:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[120px] sm:w-32">
                      <SelectValue placeholder="Filter role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
        <CardContent className="space-y-4 px-2 sm:px-6">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col xl:flex-row gap-4 p-3 sm:p-4 rounded-xl bg-muted/40 hover:bg-muted/80 transition-all border border-transparent hover:border-border/50"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-900 truncate max-w-full">
                        {user.full_name || "Unknown"}
                      </h4>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="h-5 px-1.5 py-0 text-[10px]"
                      >
                        {user.role || "student"}
                      </Badge>
                      {user.status === "suspended" ||
                      user.approval_status === "suspended" ? (
                        <div className="flex flex-col gap-1">
                            <Badge
                                variant="destructive"
                                className="h-5 px-1.5 py-0 text-[10px] w-fit bg-red-600 text-white animate-pulse font-black"
                            >
                                Suspended
                            </Badge>
                            {user.suspended_until && (
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">
                                    Ends {new Date(user.suspended_until).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                      ) : user.approval_status === "pending" ? (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 py-0 text-[10px] animate-pulse bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          Pending Approval
                        </Badge>
                      ) : user.approval_status === "rejected" ? (
                        <Badge
                          variant="destructive"
                          className="h-5 px-1.5 py-0 text-[10px]"
                        >
                          Rejected
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 py-0 text-[10px] bg-green-100 text-green-800 border-green-200"
                        >
                          Approved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 truncate max-w-full">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between xl:justify-end gap-2 sm:gap-4 w-full xl:w-auto mt-2 xl:mt-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-border/50">
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center shrink-0">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatLastActive(user.last_active_at)}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {user.approval_status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowApprovalDialog(true);
                        }}
                      >
                        Review
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      title="View Profile"
                      onClick={() => handleViewProfile(user)}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-slate-200"
                      title="Change Role"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role || "student");
                        setShowRoleDialog(true);
                      }}
                    >
                      <UserCog className="h-4 w-4 text-slate-600" />
                    </Button>

                    {user.approval_status === "suspended" ||
                    user.status === "suspended" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-green-100"
                        title="Activate"
                        onClick={() => onUpdateStatus(user.id, "approved")}
                      >
                        <Unlock className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100"
                        title="Suspend"
                        onClick={() => {
                            setSelectedUser(user);
                            setShowSuspendDialog(true);
                        }}
                      >
                        <Lock className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Role Management Sidebar */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center mt-0.5">
              <UserCog className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Role Management
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-0.5">
                User role distribution
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Students</span>
              <Badge>{roleCounts.student || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Instructors</span>
              <Badge>{roleCounts.instructor || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Managers</span>
              <Badge>{roleCounts.manager || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary">Admins</span>
              <Badge variant="default">{roleCounts.admin || 0}</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Manage Permissions
          </Button>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent aria-describedby="role-dialog-description" className="max-w-md overflow-hidden bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-2xl rounded-2xl p-0">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
                <UserCog className="h-5 w-5 text-accent" />
              </div>
              Modify User Role
            </DialogTitle>
            <DialogDescription id="role-dialog-description" className="text-sm text-slate-600 font-medium ml-13">
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
        <DialogContent aria-describedby="approval-dialog-description" className="max-w-md sm:max-w-lg overflow-hidden bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-2xl rounded-2xl p-0">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Users className="h-5 w-5 text-primary" />
              </div>
              User Review & Approval
            </DialogTitle>
            <DialogDescription id="approval-dialog-description" className="text-sm text-slate-600 font-medium ml-13">
              Review credential details before granting platform access.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  Full Name
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {selectedUser?.full_name || "Not provided"}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  Role Status
                </p>
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-white border text-slate-600 border-slate-200 hover:bg-slate-50 font-semibold uppercase tracking-wider text-[10px] px-2.5 shadow-sm"
                  >
                    {selectedUser?.role || "student"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  Email Address
                </p>
                <p
                  className="text-sm font-semibold text-slate-800 truncate"
                  title={selectedUser?.email}
                >
                  {selectedUser?.email}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  UUID
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-slate-600 truncate">
                    {selectedUser?.id}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={() => selectedUser?.id && copyToClipboard(selectedUser.id)}
                  >
                    {copiedId === selectedUser?.id ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  Join Date
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedUser?.created_at
                    ? new Date(selectedUser.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/50 flex gap-3 items-start shadow-inner">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-800">
                  Automated Email Trigger
                </p>
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                  Confirming approval will instantly trigger the onboarding
                  welcome sequence via our automated workflow systems.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
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
                disabled={isProcessing}
                onClick={async () => {
                  if (selectedUser) {
                    setIsProcessing(true);
                    try {
                      const success = await onUpdateStatus(selectedUser.id, "rejected");
                      if (success) setShowApprovalDialog(false);
                    } finally {
                      setIsProcessing(false);
                    }
                  }
                }}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
              </Button>

              <Button
                className="w-full sm:w-auto rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 gap-2 h-11 px-6 active:scale-95 transition-all"
                disabled={isProcessing || selectedUser?.approval_status === "approved"}
                onClick={async () => {
                  if (selectedUser) {
                    setIsProcessing(true);
                    try {
                      const success = await onUpdateStatus(selectedUser.id, "approved");
                      if (success) setShowApprovalDialog(false);
                    } finally {
                      setIsProcessing(false);
                    }
                  }
                }}
              >
                {isProcessing ? (
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
                disabled={isProcessing}
                onClick={async () => {
                  if (selectedUser) {
                    setIsProcessing(true);
                    try {
                      await onSendEmail(selectedUser.id);
                      setShowApprovalDialog(false);
                    } finally {
                      setIsProcessing(false);
                    }
                  }
                }}
              >
                {isProcessing ? (
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
        <DialogContent aria-describedby="profile-dialog-description" className="max-w-md">
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
