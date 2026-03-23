import { useState, useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Search, Filter, CheckCircle2, Pin, Trash2, 
  Send, Clock, User, BookOpen, ChevronDown, ChevronUp,
  MoreVertical, Reply, ThumbsUp, AlertCircle, Loader2, RefreshCw,
  X, Info, Phone, Video, Smile, Paperclip, Mic, ArrowLeft, MoreHorizontal,
  Briefcase, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { fetchWithAuth } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  useInstructorPlaylists,
  useDoubts, 
  useReplyToDoubt, 
  useMarkDoubtSolved, 
  usePinDoubtAnswer,
  useDeleteDoubt,
  type Doubt, 
  type DoubtReply 
} from '@/hooks/useInstructorData';

// Reusing UserProfile interface from ChatInterface logic
interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  role: string;
  joined_at: string;
  details: {
    expertise?: string;
    experience?: string;
    bio?: string;
    courses_count?: number;
    enrolled_courses?: number;
    completed_courses?: number;
  };
}

export function DoubtManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { data: playlists } = useInstructorPlaylists();
  const { data: doubts, isLoading, refetch } = useDoubts();
  
  const replyToDoubt = useReplyToDoubt();
  const markSolved = useMarkDoubtSolved();
  const pinAnswer = usePinDoubtAnswer();
  const deleteDoubt = useDeleteDoubt();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showDoubtList, setShowDoubtList] = useState(true);

  // Profile Panel State
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [contactProfile, setContactProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewDoubt = (newDoubt: Doubt) => {
      queryClient.setQueryData(['instructor-doubts'], (oldData: Doubt[] | undefined) => {
        if (!oldData) return [newDoubt];
        return [newDoubt, ...oldData];
      });
      toast({ title: 'New doubt received', description: newDoubt.question.substring(0, 50) + '...' });
    };

    const handleDoubtUpdate = (updatedDoubt: Doubt) => {
      queryClient.setQueryData(['instructor-doubts'], (oldData: Doubt[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(d => d.id === updatedDoubt.id ? { ...d, ...updatedDoubt } : d);
      });
      
      // If currently selected, update view? (Handled by memo automatically)
    };

    const handleDoubtReply = (reply: DoubtReply) => {
      queryClient.setQueryData(['instructor-doubts'], (oldData: Doubt[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(d => {
           if (d.id === reply.doubt_id) {
               const existingReplies = d.replies || [];
               // Avoid duplicates
               if (existingReplies.find(r => r.id === reply.id)) return d;
               return { ...d, replies: [...existingReplies, reply] };
           }
           return d;
        });
      });
      
      // If this is the selected doubt, scroll to bottom
      if (selectedDoubtId === reply.doubt_id) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    socket.on('new_doubt', handleNewDoubt);
    socket.on('doubt_updated', handleDoubtUpdate);
    socket.on('doubt_reply', handleDoubtReply);

    return () => {
      socket.off('new_doubt', handleNewDoubt);
      socket.off('doubt_updated', handleDoubtUpdate);
      socket.off('doubt_reply', handleDoubtReply);
    };
  }, [socket, queryClient, selectedDoubtId, toast]);

  // Filter logic
  const filteredDoubts = useMemo(() => {
    if (!doubts) return [];
    
    return doubts.filter(doubt => {
      const matchesSearch = 
        doubt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doubt.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doubt.student_email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doubt.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || doubt.playlist_id === courseFilter;
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [doubts, searchQuery, statusFilter, courseFilter]);

  const selectedDoubt = useMemo(() => 
    doubts?.find(d => d.id === selectedDoubtId), 
  [doubts, selectedDoubtId]);

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowDoubtList(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Profile when doubt selected & pane open
  useEffect(() => {
    if (selectedDoubt?.user_id && showProfileInfo) {
      fetchProfile(selectedDoubt.user_id);
    }
  }, [selectedDoubtId, showProfileInfo]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedDoubt?.replies]);

  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const data = await fetchWithAuth(`/users/${userId}/public-profile`);
      setContactProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSelectDoubt = (doubt: Doubt) => {
    setSelectedDoubtId(doubt.id);
    if (isMobileView) setShowDoubtList(false);
    if (showProfileInfo && doubt.user_id) fetchProfile(doubt.user_id);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Doubts refreshed' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedDoubtId) return;
    try {
      await replyToDoubt.mutateAsync({
        doubt_id: selectedDoubtId,
        answer: replyText,
        is_instructor: true
      });
      setReplyText('');
    } catch (error) {
      // Toast handled by mutation
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-500';
      case 'answered': return 'text-blue-500';
      case 'solved': return 'text-green-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden bg-[#e9edef] border rounded-xl shadow-sm">
      
      {/* ─── LEFT PANEL: DOUBT LIST ──────────────────────────────────────── */}
      <div className={cn(
        "w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-[#d1d7db] bg-white transition-all duration-300 z-10",
        !showDoubtList && isMobileView ? "hidden" : "flex"
      )}>
        {/* Header */}
        <div className="h-16 px-4 bg-[#f0f2f5] flex items-center justify-between shrink-0 border-b border-[#d1d7db]">
          <h2 className="font-bold text-lg text-[#54656f]">Doubts & Q&A</h2>
          <div className="flex gap-2 text-[#54656f]">
             <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
             </Button>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
             </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-2 bg-white border-b border-[#f0f2f5] space-y-2">
           <div className="relative flex items-center bg-[#f0f2f5] rounded-lg h-9 px-4">
              <Search className="h-4 w-4 text-[#54656f] mr-4 shrink-0" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doubts or students" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-[#3b4a54]"
              />
           </div>
           <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Badge 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                className={cn("cursor-pointer whitespace-nowrap", statusFilter === 'pending' && "bg-amber-500 hover:bg-amber-600")}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Badge>
              <Badge 
                variant={statusFilter === 'answered' ? 'default' : 'outline'} 
                className={cn("cursor-pointer whitespace-nowrap", statusFilter === 'answered' && "bg-blue-500 hover:bg-blue-600")}
                onClick={() => setStatusFilter('answered')}
              >
                Answered
              </Badge>
              <Badge 
                variant={statusFilter === 'solved' ? 'default' : 'outline'} 
                className={cn("cursor-pointer whitespace-nowrap", statusFilter === 'solved' && "bg-green-500 hover:bg-green-600")}
                onClick={() => setStatusFilter('solved')}
              >
                Solved
              </Badge>
           </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 bg-white">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading doubts...</div>
            ) : filteredDoubts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No doubts found matching filters.</div>
            ) : (
              filteredDoubts.map(doubt => (
                <div 
                  key={doubt.id}
                  onClick={() => handleSelectDoubt(doubt)}
                  className={cn(
                    "flex items-start gap-3 p-3 pl-4 cursor-pointer hover:bg-[#f5f6f6] transition-colors border-b border-[#f0f2f5] group",
                    selectedDoubtId === doubt.id && "bg-[#f0f2f5]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border border-slate-100">
                      <AvatarFallback className="bg-slate-200 text-slate-500">
                        {doubt.student_name?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    {doubt.is_pinned && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                         <Pin className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[16px] text-[#111b21] font-medium truncate">
                        {doubt.student_name || 'Student'}
                      </h3>
                      <span className={cn(
                        "text-xs font-normal shrink-0 ml-2",
                        getStatusColor(doubt.status)
                      )}>
                        {formatTimeAgo(doubt.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-[14px] text-[#54656f] line-clamp-2 pr-2">
                         {doubt.question}
                      </p>
                      {doubt.status === 'pending' && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shrink-0">
                          1
                        </span>
                      )}
                    </div>
                    {doubt.video_title && (
                      <p className="text-[11px] text-[#667781] mt-1 flex items-center gap-1 truncate">
                        <Video className="h-3 w-3" /> {doubt.video_title}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ─── MIDDLE PANEL: CHAT AREA ────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#efeae2] relative transition-all duration-300 min-w-0",
        showDoubtList && isMobileView ? "hidden" : "flex"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.4]" 
             style={{ 
               backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
               backgroundRepeat: 'repeat'
             }} 
        />

        {selectedDoubt ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#d1d7db] flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileInfo(!showProfileInfo)}>
                {isMobileView && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowDoubtList(true); }} className="md:hidden mr-1 text-[#54656f]">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-slate-200 text-slate-600">
                    {selectedDoubt.student_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-[#111b21] leading-tight text-base">{selectedDoubt.student_name}</h3>
                  <p className="text-xs text-[#667781]">
                     {selectedDoubt.video_title ? `Watching: ${selectedDoubt.video_title}` : 'Course Question'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[#54656f]">
                {selectedDoubt.status !== 'solved' && (
                   <Button variant="ghost" size="sm" onClick={() => markSolved.mutate(selectedDoubt.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <CheckCircle2 className="h-5 w-5 mr-1" /> Solve
                   </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                       <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => deleteDoubt.mutate(selectedDoubt.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Doubt
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 relative z-10 custom-scrollbar">
              <div className="flex flex-col gap-2 pb-4">
                
                {/* The Question (Student) */}
                <div className="flex w-full justify-start mb-2">
                   <div className="max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-lg shadow-sm relative text-[15px] leading-relaxed bg-white text-[#111b21] rounded-tl-none">
                      <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                         {selectedDoubt.student_name} <span className="font-normal text-slate-400">• Student</span>
                      </div>
                      <p className="break-words whitespace-pre-wrap">{selectedDoubt.question}</p>
                      <div className="text-[11px] text-[#667781] mt-1 text-right select-none">
                         {format(new Date(selectedDoubt.created_at), 'HH:mm')}
                      </div>
                   </div>
                </div>

                {/* Replies */}
                {selectedDoubt.replies?.map((reply, idx) => {
                  const isMe = reply.is_instructor;
                  
                  return (
                    <div 
                      key={reply.id} 
                      className={cn(
                        "flex w-full mb-1",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-lg shadow-sm relative text-[15px] leading-relaxed",
                        isMe 
                          ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" 
                          : "bg-white text-[#111b21] rounded-tl-none"
                      )}>
                        <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                           {isMe ? 'You (Instructor)' : reply.user_name || 'Student'}
                           {reply.is_pinned && <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />}
                        </div>
                        <p className="break-words whitespace-pre-wrap">{reply.answer}</p>
                        <div className="flex items-center justify-between mt-1">
                           {isMe && !reply.is_pinned && (
                              <button onClick={() => pinAnswer.mutate({ doubt_id: selectedDoubt.id, reply_id: reply.id })} className="text-[10px] text-blue-500 hover:underline mr-4">
                                 Pin Answer
                              </button>
                           )}
                           <div className="text-[11px] text-[#667781] select-none ml-auto">
                              {format(new Date(reply.created_at), 'HH:mm')}
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="px-4 py-3 bg-[#f0f2f5] shrink-0 z-20 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 mx-2 border border-slate-200 focus-within:border-emerald-500 transition-colors">
                <Textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReplySubmit();
                     }
                  }}
                  placeholder="Type your answer..." 
                  className="w-full min-h-[40px] max-h-[100px] border-none outline-none shadow-none resize-none text-[15px] text-[#111b21] placeholder:text-[#667781] py-1" 
                />
              </div>

              <Button 
                onClick={handleReplySubmit} 
                disabled={!replyText.trim()}
                size="icon" 
                className={cn(
                   "h-10 w-10 rounded-full shadow-none transition-all",
                   replyText.trim() ? "bg-[#00a884] hover:bg-[#008f70] text-white" : "bg-slate-200 text-slate-400"
                )}
              >
                <Send className="h-5 w-5 ml-0.5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#41525d] z-10 border-b-[6px] border-[#25d366]">
             <div className="mb-8">
                <div className="w-64 h-64 bg-[#f0f2f5] rounded-full flex items-center justify-center shadow-inner">
                    <MessageCircle className="h-24 w-24 text-[#e9edef]" />
                </div>
             </div>
             <h3 className="text-[32px] font-light text-[#41525d] mb-4">Select a Doubt</h3>
             <p className="text-sm text-[#8696a0] max-w-[460px] text-center leading-6">
                Choose a question from the list to view details and reply to students.<br/>
                Pinned answers will be highlighted for other students.
             </p>
          </div>
        )}
      </div>

      {/* ─── RIGHT PANEL: STUDENT PROFILE ───────────────────────────────── */}
      <AnimatePresence>
        {showProfileInfo && selectedDoubt && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 350, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-[#d1d7db] bg-[#f0f2f5] flex flex-col z-20 overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#d1d7db] flex items-center shrink-0">
               <Button variant="ghost" size="icon" onClick={() => setShowProfileInfo(false)} className="text-[#54656f]">
                  <X className="h-5 w-5" />
               </Button>
               <span className="ml-4 font-semibold text-[#111b21]">Student Info</span>
            </div>

            <ScrollArea className="flex-1">
              <div className="pb-10">
                {/* Profile Picture Section */}
                <div className="bg-white p-8 flex flex-col items-center shadow-sm mb-3">
                   <Avatar className="h-40 w-40 cursor-pointer mb-4">
                      <AvatarImage src={contactProfile?.avatar_url} />
                      <AvatarFallback className="text-4xl bg-[#dfe3e5] text-[#8696a0]">
                        {selectedDoubt.student_name?.[0]}
                      </AvatarFallback>
                   </Avatar>
                   <h2 className="text-2xl text-[#111b21] font-normal mb-1">{contactProfile?.full_name || selectedDoubt.student_name}</h2>
                   <p className="text-[#667781] text-base">Student</p>
                </div>

                {/* About Section */}
                <div className="bg-white p-4 shadow-sm mb-3">
                   <h4 className="text-[#667781] text-sm font-medium mb-2">Details</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[#111b21]">
                         <User className="h-5 w-5 text-[#8696a0]" />
                         <span className="text-sm">{contactProfile?.email || selectedDoubt.student_email}</span>
                      </div>
                      {contactProfile?.joined_at && (
                        <div className="flex items-center gap-3 text-[#111b21]">
                           <Clock className="h-5 w-5 text-[#8696a0]" />
                           <span className="text-sm">Joined {new Date(contactProfile.joined_at).toLocaleDateString()}</span>
                        </div>
                      )}
                   </div>
                </div>

                {/* Stats */}
                <div className="bg-white p-4 shadow-sm mb-3 space-y-4">
                   <h4 className="text-[#667781] text-sm font-medium">Academic Progress</h4>
                   
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-[#54656f]">
                         <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="text-[#111b21] font-normal">{contactProfile?.details?.enrolled_courses || 0}</p>
                         <p className="text-[#667781] text-xs">Enrolled Courses</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-[#54656f]">
                         <Award className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="text-[#111b21] font-normal">{contactProfile?.details?.completed_courses || 0}</p>
                         <p className="text-[#667781] text-xs">Completed</p>
                      </div>
                   </div>
                </div>

              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper utility
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};
