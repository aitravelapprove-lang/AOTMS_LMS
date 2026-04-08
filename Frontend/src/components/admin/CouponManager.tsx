import React, { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Gift,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  avatar_url?: string;
  role: string;
}

interface CouponResponse {
  success: boolean;
  code: string;
}

export function CouponManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentUsers = await fetchWithAuth<Student[]>("/admin/students");
      setStudents(studentUsers || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Failed to load student list");
    } finally {
      setLoading(false);
    }
  };

  const generateCoupon = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    if (!discountAmount || isNaN(Number(discountAmount))) {
      toast.error("Please enter a valid discounted price");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetchWithAuth<CouponResponse>(
        "/admin/coupons/generate",
        {
          method: "POST",
          body: JSON.stringify({
            userId: selectedStudent.id,
            amount: Number(discountAmount),
          }),
        },
      );

      if (response && response.success) {
        setGeneratedCode(response.code);
        toast.success(
          `Coupon ${response.code} (₹${discountAmount}) assigned to ${selectedStudent.full_name}`,
        );
        // Clear selection after 5 seconds
        setTimeout(() => {
          setGeneratedCode(null);
          setSelectedStudent(null);
          setDiscountAmount("");
        }, 8000);
      }
    } catch (err) {
      console.error("Failed to generate coupon:", err);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dynamic HeaderSection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                 <Ticket className="h-7 w-7 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
                    Coupon Rewards Engine
                </h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-60">
                    Assign dynamic discount codes for student achievement
                </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <div className="flex -space-x-3 px-2">
                {students.slice(0, 5).map((s, i) => (
                    <Avatar key={i} className="h-9 w-9 border-2 border-white ring-1 ring-slate-100 italic transition-transform hover:scale-110 cursor-help">
                        <AvatarImage src={s.avatar_url || ""} />
                        <AvatarFallback className="bg-slate-50 text-[10px] font-black">{s.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                ))}
            </div>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <Badge
                variant="secondary"
                className="bg-primary text-white border-transparent px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase"
            >
                {students.length} Active Students
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Student - High Density Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-md min-h-[600px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Target Matrix
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Step 1: Select candidate from the platform roster
                        </CardDescription>
                    </div>
                    
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search Student Repository..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-white border-slate-200 rounded-[1.2rem] font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-24 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                <Search className="h-10 w-10 text-slate-200" />
                            </div>
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No candidates found in this scope</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {filteredStudents.map((student) => (
                                <motion.div
                                    key={student.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                        selectedStudent?.id === student.id 
                                        ? "bg-primary/5 border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                                        : "bg-white border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/50"
                                    }`}
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    {selectedStudent?.id === student.id && (
                                        <div className="absolute top-0 right-0 h-10 w-10 bg-primary/10 rounded-bl-[2rem] flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="relative shrink-0">
                                            <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-sm rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                                <AvatarImage src={student.avatar_url || ""} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-black">{student.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-emerald-500">
                                                <div className="h-1 w-1 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`text-[14px] font-black transition-colors truncate tracking-tight ${selectedStudent?.id === student.id ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
                                                    {student.full_name}
                                                </h4>
                                                <Badge className="text-[8px] h-4 px-1.5 rounded-md uppercase font-black bg-blue-50 text-blue-600 border-none shadow-none">
                                                    STUDENT
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-400 truncate opacity-80 leading-none">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-4 shrink-0">
                                        <Button 
                                            size="sm"
                                            variant={selectedStudent?.id === student.id ? "default" : "secondary"}
                                            className={`h-9 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                                                selectedStudent?.id === student.id 
                                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                                : "bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                            }`}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Reward</span>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Generation Controls - Modern Dashboard Side */}
        <div className="space-y-6">
          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden rounded-[2.5rem] bg-white text-slate-900 min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="h-24 w-24 text-slate-200" />
            </div>

            <CardHeader className="border-b border-slate-100 p-8 relative">
              <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol Generation</p>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Gift className="h-6 w-6 text-primary" />
                    Reward Pulse
                  </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col justify-center text-center relative">
              <div className="space-y-10">
                {selectedStudent ? (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <Avatar className="h-20 w-20 border-4 border-slate-100 shadow-2xl rounded-[1.5rem]">
                                <AvatarImage src={selectedStudent.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">{selectedStudent.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg ring-4 ring-white">
                                <Star className="h-4 w-4 text-white fill-white" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{selectedStudent.full_name}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">{selectedStudent.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-left bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                        Discount Value Allocation (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xl">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="bg-transparent border-slate-200 h-14 pl-12 text-2xl font-black text-slate-900 placeholder:text-slate-200 focus:ring-0 focus:border-primary transition-all rounded-2xl"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-20 flex flex-col items-center gap-6 opacity-40">
                    <div className="h-24 w-24 rounded-[3rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                        <Zap className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-[180px] leading-relaxed">
                        Initializing Secure Handshake... Select Student
                    </p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                    {generatedCode ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-8 bg-white text-slate-900 rounded-[2rem] space-y-4 relative shadow-2xl shadow-primary/20"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                            Active Reward
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-[0.2em] pt-4">
                        {generatedCode}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                        <CheckCircle2 className="h-4 w-4" />
                        Credentials Dispatched
                        </div>
                    </motion.div>
                    ) : (
                    <Button
                        size="lg"
                        disabled={!selectedStudent || isGenerating || !discountAmount}
                        onClick={generateCoupon}
                        className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-slate-900 hover:text-white text-white font-black tracking-widest text-xs uppercase shadow-2xl shadow-primary/30 disabled:opacity-20 transition-all border-0 active:scale-[0.98] group"
                    >
                        {isGenerating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                        <div className="flex items-center gap-3">
                            <Gift className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span>Dispatch Reward Node</span>
                        </div>
                        )}
                    </Button>
                    )}
                </AnimatePresence>
              </div>
            </CardContent>

            <div className="p-8 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-center gap-4 text-slate-300">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest">S3 Handshake</span>
                    </div>
                    <div className="h-3 w-px bg-slate-100" />
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Postmark Relay</span>
                    </div>
                </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white/60 border-l-4 border-primary p-5">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Generator Logic</p>
                   <p className="text-sm font-black text-slate-800 tracking-tight">Pattern: AOTMS-[RANDOM]</p>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
