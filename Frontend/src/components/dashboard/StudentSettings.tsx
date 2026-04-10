import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Settings, 
    Bell, 
    Shield, 
    Smartphone, 
    Monitor, 
    Moon, 
    Sun, 
    Save, 
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Palette,
    Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export function StudentSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Information Updated",
                description: "Your preferences have been saved locally.",
                className: "bg-emerald-50 border-emerald-200"
            });
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Deployment Config</h3>
                    <p className="text-[10px] md:text-sm text-slate-500 font-bold italic">Adjust your interaction and security parameters below.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="w-full md:w-auto h-12 md:h-14 px-10 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/10 font-black italic tracking-tighter shrink-0 flex items-center gap-3"
                >
                    {loading ? <Save className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    SAVE PREFERENCES
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/5 overflow-hidden p-6 md:p-10">
                <div className="space-y-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between gap-4 md:gap-8 p-6 md:p-10 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-4 md:gap-6 min-w-0">
                            <div className="h-14 w-14 md:h-24 md:w-24 shrink-0 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-100 text-primary">
                                <Bell className="h-7 w-7 md:h-12 md:w-12 animate-[bounce_3s_infinite]" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-lg sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight truncate leading-none mb-1 md:mb-2">Alert Center</h4>
                                <p className="text-[10px] md:text-sm text-slate-500 font-black italic line-clamp-1 md:line-clamp-2 leading-tight">Master control for all academy communications and real-time learning updates.</p>
                            </div>
                        </div>
                        <div className="shrink-0 pl-2">
                           <Switch defaultChecked className="scale-110 sm:scale-125 md:scale-[2] data-[state=checked]:bg-primary shadow-xl shadow-primary/20 transition-transform" />
                        </div>
                    </div>

                    <div className="grid gap-8 pt-4">
                        {[
                            { title: "Exam Reminders", desc: "Get notified 15 minutes before scheduled exams and assessments.", icon: Clock },
                            { title: "Live Class Entry", desc: "Notification when an instructor starts a meeting or broadcast.", icon: CheckCircle2 },
                            { title: "Announcement Postings", desc: "Alerts when staff post news or critical updates in the academy.", icon: Save },
                            { title: "Badge Achievements", desc: "Alerts for new certifications, ranking awards, or milestones.", icon: Palette }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 group">
                                <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                                    <div className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2 truncate">
                                        {item.title}
                                    </div>
                                    <div className="text-[11px] sm:text-sm text-slate-500 font-medium line-clamp-2">{item.desc}</div>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary shadow-sm shrink-0" />
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-50">
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Notification Reliability</span>
                                <span className="text-xs font-bold text-primary">94% Stability</span>
                             </div>
                             <Progress value={94} className="h-2 bg-primary/10" />
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">Cloud Sync active • Latency: 24ms</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-6 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                 <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Session ID: 5b47-d0f7-5ddb-4d81-820c-4cc9de3d80e1-S900</p>
                 <Badge variant="outline" className="text-slate-400 font-bold border-slate-200">AOTMS CORE V.2.1</Badge>
            </div>
        </div>
    );
}
