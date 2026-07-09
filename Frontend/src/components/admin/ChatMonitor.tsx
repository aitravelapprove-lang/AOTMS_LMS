import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SyncDataButton } from './data/SyncDataButton';

interface ChatConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar_url?: string;
    role?: string;
    status?: string;
    email?: string;
  }[];
  last_message?: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type?: 'text' | 'image';
}

import { Profile } from '@/hooks/useAdminData';

interface ChatMonitorProps {
  onSync?: () => void;
  loading?: boolean;
  profiles?: Profile[];
}

export function ChatMonitor({ onSync, loading: parentLoading = false, profiles = [] }: ChatMonitorProps) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chats' | 'profiles'>('chats');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchConversations();
    
    if (socket) {
      // Listen for global messages in admin mode if needed, 
      // but typically admins fetch on demand or join rooms explicitly.
    }
  }, [socket]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const fetchConversations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/chat-monitor/conversations') as ChatConversation[];
      setConversations(data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await fetchWithAuth(`/admin/chat-monitor/conversations/${convId}/messages`) as ChatMessage[];
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleToggleBlock = async (userId: string, userName: string, currentStatus?: string) => {
    const isBlocked = currentStatus === 'rejected';
    const action = isBlocked ? 'unblock' : 'block';
    
    if (confirm(`Are you sure you want to ${action} ${userName}?`)) {
      try {
        await fetchWithAuth(`/admin/update-user-status`, {
          method: 'PUT',
          body: JSON.stringify({ 
            userId, 
            status: isBlocked ? 'approved' : 'suspended' 
          })
        });
        fetchConversations(false);
      } catch (err) {
        console.error(`Failed to ${action} user`, err);
      }
    }
  };

  const filteredConvs = conversations.filter(conv => 
    conv.participants.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (conv.last_message && conv.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  // Helper to find or start a conversation with a profile
  const handleProfileClick = (profile: Profile) => {
    const existing = conversations.find(c => 
      c.participants.some(p => p.id === profile.user_id) && c.participants.length === 2
    );
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      console.log(`Starting new thread with ${profile.full_name}...`);
    }
  };

  const handleSync = async () => {
    if (onSync) await onSync();
    await fetchConversations(true);
  };

  return (
    <div className="flex h-full bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 font-sans">
      {/* Conversations List */}
      <div className={cn("w-full sm:w-1/3 border-r flex flex-col", selectedConvId ? 'hidden sm:flex' : 'flex')}>
        <div className="p-4 border-b bg-slate-50/50">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={activeSidebarTab === 'chats' ? "Search conversations..." : "Search profiles..."} 
              className="pl-9 h-11 bg-white border-none shadow-sm rounded-xl"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveSidebarTab('chats')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                activeSidebarTab === 'chats' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Recent Chats
            </button>
            <button
              onClick={() => setActiveSidebarTab('profiles')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                activeSidebarTab === 'profiles' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Profiles
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {activeSidebarTab === 'chats' ? 'Active Discussions' : 'Platform Users'}
            </span>
            <SyncDataButton 
              onSync={handleSync} 
              isLoading={parentLoading || loading} 
              className="h-8 px-3"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
           {activeSidebarTab === 'chats' ? (
             loading && conversations.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                        <div className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
             ) : filteredConvs.length === 0 ? (
               <div className="p-8 text-center text-slate-300">
                 <p className="text-[10px] font-black uppercase tracking-widest">No active chats found</p>
               </div>
             ) : (
               filteredConvs.map(conv => (
                 <div 
                   key={conv.id}
                   onClick={() => setSelectedConvId(conv.id)}
                   className={cn(
                     "flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors border-b",
                     selectedConvId === conv.id && "bg-slate-100"
                   )}
                 >
                   <div className="flex -space-x-2 overflow-hidden shrink-0">
                     {conv.participants.map(p => (
                       <Avatar key={p.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
                         <AvatarImage src={p.avatar_url} />
                         <AvatarFallback>{p.name?.[0]}</AvatarFallback>
                       </Avatar>
                     ))}
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <p className="text-sm font-bold truncate text-slate-900 leading-tight">
                       {conv.participants.map(p => p.name).join(', ')}
                     </p>
                     <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                       {conv.last_message || 'No messages'}
                     </p>
                   </div>
                   <span className="text-[9px] font-black text-slate-300 uppercase whitespace-nowrap">
                     {conv.updated_at && format(new Date(conv.updated_at), 'MMM d')}
                   </span>
                 </div>
               ))
             )
           ) : (
             filteredProfiles.length === 0 ? (
               <div className="p-8 text-center text-slate-300">
                 <p className="text-[10px] font-black uppercase tracking-widest">No profiles found</p>
               </div>
             ) : (
               filteredProfiles.map(p => (
                 <div 
                   key={p.user_id}
                   onClick={() => handleProfileClick(p)}
                   className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors border-b"
                 >
                   <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                     <AvatarImage src={p.avatar_url} />
                     <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">{p.full_name?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-900 truncate leading-tight">{p.full_name}</p>
                     <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-0.5">{p.role || 'student'}</p>
                   </div>
                   <Badge variant="outline" className="text-[8px] font-black uppercase">
                     View
                   </Badge>
                 </div>
               ))
             )
           )}
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className={cn("flex-1 sm:w-2/3 flex flex-col bg-slate-50", !selectedConvId ? 'hidden sm:flex' : 'flex')}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="h-14 sm:h-16 border-b bg-white px-3 sm:px-4 flex items-center justify-between">
               <div className="flex items-center gap-2 overflow-hidden">
                 <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8 flex-shrink-0" onClick={() => setSelectedConvId(null)}>
                   <X className="h-4 w-4" />
                 </Button>
                 {selectedConv.participants.map(p => (
                   <div key={p.id} className="flex items-center gap-2 mr-2 sm:mr-4 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback>{p.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none truncate max-w-[100px] sm:max-w-none">{p.name}</p>
                            {p.status === 'rejected' && <span className="text-[10px] text-red-600 bg-red-100 px-1 rounded">BLOCKED</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate hidden sm:block">{p.email}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                              className={p.status === 'rejected' ? "text-green-600" : "text-red-600"} 
                              onClick={() => handleToggleBlock(p.id, p.name, p.status)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {p.status === 'rejected' ? 'Unblock User' : 'Block User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                 ))}
               </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(msg => {
                   const sender = selectedConv.participants.find(p => p.id === msg.sender_id);
                   return (
                     <div key={msg.id} className={cn("flex gap-2 max-w-[80%]", msg.sender_id === 'system' ? 'mx-auto' : '')}>
                        {msg.sender_id !== 'system' && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={sender?.avatar_url} />
                            <AvatarFallback>{sender?.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "rounded-lg p-3 text-sm",
                          msg.sender_id === 'system' ? "bg-slate-200 text-slate-600 text-center text-xs" : "bg-white border shadow-sm"
                        )}>
                          {msg.type === 'image' ? (
                              <img src={msg.content} alt="Shared image" className="max-w-xs rounded-md" />
                          ) : (
                              <p>{msg.content}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">
                             {msg.created_at && format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                     </div>
                   );
                })}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to monitor
          </div>
        )}
      </div>
    </div>
  );
}
