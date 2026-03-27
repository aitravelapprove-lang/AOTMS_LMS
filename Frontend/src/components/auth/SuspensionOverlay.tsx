import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Timer, AlertCircle } from "lucide-react";

export function SuspensionOverlay() {
    const { user, signOut } = useAuth();
    const [timeLeft, setTimeLeft] = useState<string>("");
    
    const isSuspended = user?.approval_status === "suspended";
    useEffect(() => {
        if (user?.approval_status !== "suspended" || !user?.suspended_until) return;

        const suspendedUntil = new Date(user.suspended_until as string);

        const calculateTimeLeft = () => {
            const now = new Date();
            const diff = suspendedUntil.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeft("Expired - Reconnecting...");
                window.location.reload();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [user?.approval_status, user?.suspended_until]);

    return (
        <AnimatePresence>
            {isSuspended && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col justify-center items-center overflow-hidden"
                >
                    {/* Background Visuals */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] bg-rose-600/20 blur-[120px] rounded-full animate-blob"></div>
                        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] bg-emerald-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
                        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[10px]"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl w-full px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-left space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                                <AlertCircle className="h-3 w-3" />
                                Account Status: Restricted
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                                HOLD UP,<br />
                                <span className="bg-gradient-to-r from-rose-500 to-rose-300 bg-clip-text text-transparent">YOU'RE ON PAUSE.</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md">
                                Your access to the platform has been temporarily suspended by the administration. Don't worry, your data is safe.
                            </p>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => signOut()}
                                    className="px-8 h-14 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 group shadow-xl shadow-white/5 active:scale-95"
                                >
                                    LOG OUT
                                </button>
                                <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-rose-500" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase tracking-wider">
                                        PLATFORM SAFETY<br/>PROTOCOLS ACTIVE
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500/20 to-emerald-500/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative bg-[#1e293b]/50 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <Timer className="h-32 w-32 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-rose-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Countdown to Restoration</div>
                                    <div className="text-5xl md:text-7xl font-mono font-black text-white tracking-tighter mb-8 drop-shadow-lg">
                                        {timeLeft || "INITIALIZING..."}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-gradient-to-r from-rose-500 to-rose-300"
                                                initial={{ width: "100%" }}
                                                animate={{ width: "0%" }}
                                                transition={{ duration: 1000000, repeat: Infinity }}
                                            ></motion.div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                                            Verified Administrative Suspension Plan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center z-10 opacity-30">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white">LMS QUALITY ASSURANCE</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white">SECURE NODE: 7331-SUSP</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
