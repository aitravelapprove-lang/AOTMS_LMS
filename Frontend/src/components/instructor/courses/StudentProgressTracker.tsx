import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, PlayCircle, AlertTriangle, 
  ChevronRight, Search, Filter, Clock, Mail, MoreHorizontal, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface VideoDetail {
    videoId: string;
    watched: number;
    total: number;
    completed: boolean;
    last_watched: string;
}

export interface StudentProgress {
  id: string; // User ID
  studentId: string; // Same as ID, kept for compatibility
  studentName: string;
  studentEmail: string;
  avatarUrl?: string;
  enrolledAt: string;
  lastActiveAt: string;
  overallProgress: number;
  completedModules: number;
  totalModules: number; // Can be derived or passed
  currentModuleIndex: number;
  currentVideoTitle?: string;
  watchedPercentage: number;
  status: 'completed' | 'active' | 'stuck' | 'inactive';
  timeSpentMinutes: number;
  video_details?: VideoDetail[]; // Granular video progress
}

interface StudentProgressTrackerProps {
  students: StudentProgress[];
  isLoading?: boolean;
  onSendReminder?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
}

const getStatusConfig = (status: StudentProgress['status']) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        label: 'Completed',
        badgeColor: 'bg-green-500'
      };
    case 'active':
      return {
        icon: PlayCircle,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        label: 'Watching',
        badgeColor: 'bg-blue-500'
      };
    case 'stuck':
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        label: 'Stuck',
        badgeColor: 'bg-amber-500'
      };
    case 'inactive':
      return {
        icon: Clock,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        label: 'Inactive',
        badgeColor: 'bg-muted-foreground'
      };
  }
};

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const StudentCard = ({ 
  student, 
  onSendReminder,
  onViewProfile 
}: { 
  student: StudentProgress;
  onSendReminder?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
}) => {
  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border bg-card hover:bg-slate-50/50 transition-colors shadow-sm"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={student.avatarUrl} />
          <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
            {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
                 <p className="font-bold text-slate-900 truncate">{student.studentName}</p>
                 <p className="text-xs text-muted-foreground truncate">{student.studentEmail}</p>
            </div>
            <div className="flex items-center gap-2">
                <Badge 
                variant="secondary" 
                className={`${statusConfig.bgColor} ${statusConfig.color} gap-1 text-xs shrink-0 font-bold`}
                >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowDetails(true)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendReminder?.(student.id)}>Send Reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewProfile?.(student.id)}>View Profile</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600">Course Progress</span>
              <span className="text-slate-900">{student.overallProgress}%</span>
            </div>
            <Progress 
              value={student.overallProgress} 
              className="h-2 bg-slate-100"
              indicatorClassName={
                student.status === 'completed' ? 'bg-green-500' :
                student.status === 'stuck' ? 'bg-amber-500' : 'bg-primary'
              }
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>{student.video_details?.filter(v => v.completed).length || 0} Videos Watched</span>
              <span>Last active {formatTimeAgo(student.lastActiveAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback>{student.studentName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        {student.studentName}'s Activity
                        <p className="text-sm text-muted-foreground font-normal">Video Watch History</p>
                    </div>
                </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                    {!student.video_details || student.video_details.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No viewing history available.
                        </div>
                    ) : (
                        student.video_details.map((video, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border bg-slate-50/50">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${video.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {video.completed ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-sm font-medium text-slate-900">Video ID: {video.videoId.slice(-6)}...</p>
                                        <span className="text-xs text-muted-foreground">{formatTimeAgo(video.last_watched)}</span>
                                    </div>
                                    <Progress value={(video.watched / video.total) * 100} className="h-1.5" />
                                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                                        <span>{Math.floor(video.watched / 60)}m watched</span>
                                        <span>{Math.floor(video.total / 60)}m total</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export function StudentProgressTracker({
  students,
  isLoading = false,
  onSendReminder,
  onViewProfile
}: StudentProgressTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Completed', count: students.filter(s => s.status === 'completed').length, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Active', count: students.filter(s => s.status === 'active').length, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Stuck', count: students.filter(s => s.status === 'stuck').length, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Inactive', count: students.filter(s => s.status === 'inactive').length, color: 'text-slate-600', bgColor: 'bg-slate-100' }
  ];

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
                <CardTitle className="text-lg font-bold text-slate-900">Student Progress</CardTitle>
                <CardDescription>Monitor class performance and engagement</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="h-8 px-3">
            {students.length} Total Students
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className={`p-4 rounded-xl ${stat.bgColor} border border-transparent hover:border-black/5 cursor-pointer transition-all`}
              onClick={() => setStatusFilter(stat.label.toLowerCase())}
            >
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="stuck">At Risk (Stuck)</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student List */}
        <ScrollArea className="h-[500px] pr-2 -mr-2">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
                <p className="text-sm text-slate-500 font-medium">Loading class data...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onSendReminder={onSendReminder}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters to see results.' 
                    : 'Students will appear here once they enroll in your course.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                    <Button variant="link" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-2 text-primary">
                        Clear Filters
                    </Button>
                )}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
