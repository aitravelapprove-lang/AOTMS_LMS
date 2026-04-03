import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Gift, 
  Clock, 
  CheckCircle2, 
  MailOpen, 
  Archive,
  Loader2,
  AlertCircle,
  Copy,
  ArrowRight,
  TrendingUp,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/hooks/useNotifications";

export function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAllAsRead, 
    markAsRead 
  } = useNotifications();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Coupon code copied!");
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
         <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center animate-pulse">
            <Bell className="h-8 w-8 text-primary animate-bounce" />
         </div>
         <div className="space-y-1">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Inboxing your data...</p>
            <p className="text-xs text-slate-400">Synchronizing with AOTMS Communications Network</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
         <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-transparent px-4 py-1.5 rounded-lg font-bold">
                {unreadCount} Unread
            </Badge>
         </div>
         
         {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-xl h-10 px-4 font-bold text-slate-500 hover:text-primary transition-all gap-2"
          >
            <MailOpen className="h-4 w-4" />
            Clear New Activity
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-24 text-center space-y-4 opacity-70">
            <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100/50">
               <Archive className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-slate-900 tracking-tight">Quiet for Now</h3>
               <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Updates about your rewards and course requests will appear here when available.</p>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${notification.is_read ? 'bg-white border-slate-100' : 'bg-gradient-to-r from-primary/[0.03] to-white border-primary/20 shadow-md shadow-primary/5'}`}
              >
                  {/* Status Indicator */}
                  {!notification.is_read && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  )}

                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                      {/* Icon Container */}
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${notification.type === 'coupon' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                          {notification.type === 'coupon' ? (
                            <Gift className="h-7 w-7 text-orange-500" />
                          ) : (
                            <Bell className="h-7 w-7 text-blue-500" />
                          )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className={`text-lg font-black tracking-tight ${notification.is_read ? 'text-slate-900' : 'text-slate-950'}`}>
                                    {notification.title}
                                  </h3>
                                  {notification.type === 'coupon' && (
                                    <Badge className="bg-orange-100 text-orange-600 border-orange-200 font-black text-[9px] uppercase tracking-widest rounded-lg">Reward</Badge>
                                  )}
                              </div>
                              <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">{notification.message}</p>
                          </div>

                          {/* Action Content (Coupon Code etc) */}
                          {notification.type === 'coupon' && notification.data?.code && (
                             <div className="p-1 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-between group/inner pr-2">
                                <div className="flex items-center gap-4 pl-4">
                                    <div className="h-10 w-10 flex items-center justify-center">
                                       <Ticket className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <span className="text-xl font-black text-slate-900 tracking-[0.2em] font-mono">{notification.data.code}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(notification.data?.code || '')}
                                  className="h-10 px-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-all gap-2"
                                >
                                   <Copy className="h-3.5 w-3.5" />
                                   Copy Code
                                </Button>
                             </div>
                          )}

                          {/* Footer Meta */}
                          <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                              <div className="h-1 w-1 rounded-full bg-slate-100" />
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <TrendingUp className="h-3 w-3" />
                                Priority Normal
                              </div>
                          </div>
                      </div>

                      {/* Side Action */}
                      {!notification.is_read && (
                        <div className="hidden md:flex flex-col items-center justify-center pl-6 border-l border-slate-100">
                           <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-500 delay-300" />
                        </div>
                      )}
                  </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
