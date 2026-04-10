import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Filter,
  CheckCheck,
  Check,
  Ban,
  MessageSquare,
  Layers,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Notification {
  id: string;
  _id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: {
    actor_avatar?: string;
    actor_name?: string;
    request_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export function InstructorNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth('/notifications') as Notification[];
            setNotifications(data || []);
        } catch (err: unknown) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "Failed to load notifications", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await fetchWithAuth(`/notifications/${id}/read`, { method: 'POST' });
            setNotifications(notifications.map(n => 
                (n._id === id || n.id === id) ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetchWithAuth('/notifications/mark-all-read', { method: 'POST' });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast({ title: "All Read", description: "All notifications marked as read." });
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetchWithAuth(`/notifications/${id}`, { method: 'DELETE' });
            setNotifications(notifications.filter(n => (n._id !== id && n.id !== id)));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };
    
    const handleQuickApprove = async (requestId: string, notificationId: string) => {
        if (processedIds.has(requestId)) return;
        
        try {
            await fetchWithAuth(`/batches/requests/${requestId}/approve`, { method: 'POST' });
            setProcessedIds(prev => new Set(prev).add(requestId));
            
            // Mark notification as read too
            markAsRead(notificationId);
            
            toast({
                title: "Accelerated Approval",
                description: "Student has been reassigned to requested batch.",
                className: "bg-emerald-500 text-white"
            });
        } catch (err: unknown) {
            const error = err as Error;
            toast({ 
                title: "Action Failed", 
                description: error.message || "Manual intervention required.", 
                variant: "destructive" 
            });
        }
    };

    const filtered = notifications.filter(n => filter === 'all' ? true : !n.is_read);

    const getIcon = (type: string) => {
        switch (type) {
            case 'batch_assignment': return <UserPlus className="h-4 w-4 text-emerald-500" />;
            case 'batch_request': return <Layers className="h-4 w-4 text-amber-500" />;
            case 'exam_submission': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
            case 'doubt': return <MessageSquare className="h-4 w-4 text-violet-500" />;
            default: return <Bell className="h-4 w-4 text-slate-400" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <Bell className="h-6 w-6" />
                        </div>
                        Notification Center
                    </h2>
                    <p className="text-slate-700 font-bold mt-2 text-sm sm:text-base opacity-90">Manage important updates across your learning ecosystems.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setFilter('all')}
                            className={`h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${filter === 'all' ? 'bg-white text-primary shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            All
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setFilter('unread')}
                            className={`h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${filter === 'unread' ? 'bg-white text-primary shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Unread
                        </Button>
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={markAllRead}
                        className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] gap-2.5 bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark All Read
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50/30">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-20 w-20 bg-white rounded-full shadow-inner flex items-center justify-center mb-6">
                            <Bell className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Clear Skies</h3>
                        <p className="text-slate-500 font-medium max-w-xs mt-2 text-sm leading-relaxed">
                            No notifications match your current filter. You're all caught up!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((notification, idx) => (
                            <motion.div
                                key={notification._id || notification.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className={`rounded-[2rem] border-slate-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden ${!notification.is_read ? 'bg-white border-l-4 border-l-primary' : 'bg-white/60 opacity-80'}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0">
                                                {notification.data?.actor_avatar ? (
                                                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-md">
                                                        <AvatarImage src={notification.data.actor_avatar} />
                                                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                                                            {notification.data.actor_name?.[0] || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${!notification.is_read ? 'bg-primary/5' : 'bg-slate-50'}`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-black tracking-tight truncate ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed max-w-2xl">
                                                    {notification.message}
                                                </p>
                                                
                                                {(notification.type === 'batch_request' && notification.data?.request_id) && (
                                                    <div className="mt-4 flex items-center gap-3">
                                                       <Button 
                                                         size="sm"
                                                         onClick={() => handleQuickApprove(notification.data!.request_id, notification._id || notification.id)}
                                                         disabled={processedIds.has(notification.data.request_id)}
                                                         className={`h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all ${
                                                            processedIds.has(notification.data.request_id) 
                                                            ? 'bg-slate-100 text-slate-400 shadow-none' 
                                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                                         }`}
                                                       >
                                                         {processedIds.has(notification.data.request_id) ? (
                                                            <><Ban className="h-3.5 w-3.5" /> Processed</>
                                                         ) : (
                                                            <><Check className="h-3.5 w-3.5" /> Quick Approve</>
                                                         )}
                                                       </Button>
                                                       <span className="text-[10px] font-bold text-slate-300 italic">One-click authorization enabled</span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-[10px] font-black text-slate-600 flex items-center gap-1.5 uppercase tracking-widest">
                                                        <Clock className="h-3 w-3 opacity-60" />
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.15em] border-slate-100 text-slate-500 bg-slate-100/50 px-2.5">
                                                        {notification.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all absolute top-6 right-6">
                                                {!notification.is_read && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => markAsRead(notification._id || notification.id)}
                                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => deleteNotification(notification._id || notification.id)}
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
