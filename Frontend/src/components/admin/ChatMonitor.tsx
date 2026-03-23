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

export function ChatMonitor() {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchConversations();
    
    if (socket) {
      // Listen for global messages in admin mode if needed, 
      // but typically admins fetch on demand or join rooms explicitly.
      // For now, we'll rely on polling or re-fetching on interaction.
    }
  }, [socket]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const fetchConversations = async () => {
    try {
      const data = await fetchWithAuth('/admin/conversations');
      setConversations(data);
    } catch (err) {
      console.error("Failed to load admin conversations", err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const data = await fetchWithAuth(`/admin/conversations/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleToggleBlock = async (userId, userName, currentStatus) => {
      const isBlocked = currentStatus === 'rejected';
      const newStatus = isBlocked ? 'approved' : 'rejected';
      const action = isBlocked ? 'Unblock' : 'Block';

      if(confirm(`Are you sure you want to ${action.toLowerCase()} ${userName}?`)) {
          try {
              await fetchWithAuth('/admin/update-user-status', {
                  method: 'PUT',
                  body: JSON.stringify({ userId, status: newStatus })
              });
              alert(`${userName} has been ${isBlocked ? 'unblocked' : 'blocked'}.`);
              fetchConversations();
          } catch (err) {
              console.error(`Failed to ${action.toLowerCase()} user`, err);
          }
      }
  };

  const filteredConvs = conversations.filter(c => 
    c.participants.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
           {filteredConvs.map(conv => (
             <div 
               key={conv.id}
               onClick={() => setSelectedConvId(conv.id)}
               className={cn(
                 "flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors border-b",
                 selectedConvId === conv.id && "bg-slate-100"
               )}
             >
               <div className="flex -space-x-2 overflow-hidden">
                 {conv.participants.map(p => (
                   <Avatar key={p.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
                     <AvatarImage src={p.avatar} />
                     <AvatarFallback>{p.name?.[0]}</AvatarFallback>
                   </Avatar>
                 ))}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">
                   {conv.participants.map(p => p.name).join(', ')}
                 </p>
                 <p className="text-xs text-muted-foreground truncate">
                   {conv.lastMessage?.content || 'No messages'}
                 </p>
               </div>
               <span className="text-xs text-muted-foreground whitespace-nowrap">
                 {conv.updatedAt && format(new Date(conv.updatedAt), 'MMM d')}
               </span>
             </div>
           ))}
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className="w-2/3 flex flex-col bg-slate-50">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="h-16 border-b bg-white px-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 {selectedConv.participants.map(p => (
                   <div key={p.id} className="flex items-center gap-2 mr-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback>{p.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">{p.name}</p>
                            {p.status === 'rejected' && <span className="text-[10px] text-red-600 bg-red-100 px-1 rounded">BLOCKED</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
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
                   const sender = selectedConv.participants.find(p => p.id === msg.sender);
                   return (
                     <div key={msg.id} className={cn("flex gap-2 max-w-[80%]", msg.sender === 'system' ? 'mx-auto' : '')}>
                        {msg.sender !== 'system' && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={sender?.avatar} />
                            <AvatarFallback>{sender?.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "rounded-lg p-3 text-sm",
                          msg.sender === 'system' ? "bg-slate-200 text-slate-600 text-center text-xs" : "bg-white border shadow-sm"
                        )}>
                          {msg.type === 'image' ? (
                              <img src={msg.content} alt="Shared image" className="max-w-xs rounded-md" />
                          ) : (
                              <p>{msg.content}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">
                            {format(new Date(msg.timestamp), 'h:mm a')}
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
