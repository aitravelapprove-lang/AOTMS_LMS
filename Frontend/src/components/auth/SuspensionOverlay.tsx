import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Timer, AlertCircle, LogOut, ShieldAlert } from "lucide-react";

export function SuspensionOverlay() {
    const { user, signOut, checkSession } = useAuth();
    const { socket } = useSocket();
    const [timeLeft, setTimeLeft] = useState<string>("");
    
    // Check both status fields used in the system
    const isSuspended = user?.approval_status === "suspended" || user?.status === "suspended";

    useEffect(() => {
        if (!socket) return;

        socket.on('user_suspended', () => {
            console.log('[Suspension] Real-time suspension event received');
            checkSession();
        });

        socket.on('user_approved', () => {
            console.log('[Suspension] Real-time approval event received');
            checkSession();
        });

        return () => {
            socket.off('user_suspended');
            socket.off('user_approved');
        };
    }, [socket, checkSession]);

    useEffect(() => {
        if (!isSuspended || !user?.suspended_until) return;

        const suspendedUntil = new Date(user.suspended_until as string);

        const calculateTimeLeft = () => {
            const now = new Date();
            const diff = suspendedUntil.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeft("00:00:00");
                // Auto-relief after countdown
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Pad with zeros for military/timer look
            const h = String(hours).padStart(2, '0');
            const m = String(minutes).padStart(2, '0');
            const s = String(seconds).padStart(2, '0');

            setTimeLeft(`${h}:${m}:${s}`);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [isSuspended, user?.suspended_until]);

    return (
        <AnimatePresence>
            {isSuspended && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] bg-black flex flex-col justify-center items-center overflow-hidden"
                >
                    {/* Pulsing Red Aura */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-black to-black animate-pulse"></div>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center space-y-12">
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-sm font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                <ShieldAlert className="h-5 w-5 animate-bounce" />
                                Access Terminal Restricted
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic uppercase">
                                Account <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Suspended</span>
                            </h1>
                        </motion.div>

                        <div className="relative group">
                            <div className="absolute -inset-8 bg-red-600/20 rounded-[4rem] blur-3xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-zinc-900/80 backdrop-blur-3xl border-2 border-red-600/50 rounded-[3rem] p-12 md:p-16 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-center min-w-[320px] md:min-w-[500px]">
                                <div className="text-red-500 text-xs font-black uppercase tracking-[0.4em] mb-8 flex items-center justify-center gap-3">
                                    <Timer className="h-4 w-4" />
                                    Time Remaining Until Restoration
                                </div>
                                <div className="text-7xl md:text-9xl font-mono font-black text-white tracking-tight tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {timeLeft || "LOCKING..."}
                                </div>
                                
                                <div className="mt-12 space-y-6">
                                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                            initial={{ width: "100%" }}
                                            animate={{ width: "0%" }}
                                            transition={{ duration: 3600, repeat: Infinity }}
                                        ></motion.div>
                                    </div>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">
                                        Administrative Enforcement Protocol Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                             <p className="text-zinc-400 text-lg font-bold max-w-lg leading-relaxed italic">
                                "Platform integrity is our priority. Your account is currently undergoing a secondary security review. Please wait for the timer to expire."
                            </p>
                            
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => signOut()}
                                className="px-12 h-14 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all flex items-center gap-3 group shadow-[0_10px_30px_rgba(220,38,38,0.4)] tracking-widest uppercase text-sm"
                            >
                                <LogOut className="h-5 w-5" />
                                Emergency Logout
                            </motion.button>
                        </div>
                    </div>

                    {/* Bottom Status Ticker */}
                    <div className="absolute bottom-10 left-0 right-0 overflow-hidden opacity-20 whitespace-nowrap">
                        <div className="flex space-x-20 animate-[marquee_20s_linear_infinite] text-white font-black text-[10px] uppercase tracking-[1em]">
                            <span>SECURITY VIOLATION DETECTED</span>
                            <span>ACCESS SOURCE RESTRICTED</span>
                            <span>ACCOUNT UNDER AUDIT</span>
                            <span>ENFORCEMENT ACTION LOGGED</span>
                            <span>RESTORATION SEQUENCE INITIALIZED</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
