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
  college_name?: string;
  institute_name?: string;
  role: string;
}

interface CouponResponse {
  success: boolean;
  code: string;
}

interface Coupon {
  id: string;
  code: string;
  user_id: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  discounted_price: number;
  is_used: boolean;
  created_at: string;
}

export function CouponManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "college" | "institute">("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBulkUserIds, setSelectedBulkUserIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await fetchWithAuth<Coupon[]>("/data/coupons?sort=created_at&order=desc&limit=50");
      setCoupons(data || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    }
  };

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
        fetchCoupons();
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

  const bulkGenerateCoupons = async () => {
    if (selectedBulkUserIds.length === 0) {
      toast.error("No students selected for reward");
      return;
    }

    if (!discountAmount || isNaN(Number(discountAmount))) {
      toast.error("Please enter a valid discounted price");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetchWithAuth<CouponResponse>(
        "/admin/coupons/bulk-generate",
        {
          method: "POST",
          body: JSON.stringify({
            userIds: selectedBulkUserIds,
            amount: Number(discountAmount),
          }),
        },
      );

      if (response && response.success) {
        setGeneratedCode(response.code);
        toast.success(
          `Bulk Success! Coupon ${response.code} generated for ${selectedBulkUserIds.length} students`,
        );
        fetchCoupons();
        setFilterType("all");
        setFilterValue("");
        setSelectedBulkUserIds([]);
        setTimeout(() => {
          setGeneratedCode(null);
          setDiscountAmount("");
        }, 8000);
      }
    } catch (err) {
      toast.error("Bulk generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBulkUserIds.length === filteredStudents.length) {
      setSelectedBulkUserIds([]);
    } else {
      setSelectedBulkUserIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedBulkUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "college") return matchesSearch && s.college_name === filterValue;
    if (filterType === "institute") return matchesSearch && s.institute_name === filterValue;
    return matchesSearch;
  });

  const uniqueColleges = Array.from(new Set(students.map(s => s.college_name).filter(Boolean))) as string[];
  const uniqueInstitutes = Array.from(new Set(students.map(s => s.institute_name).filter(Boolean))) as string[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
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
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
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
                className="bg-primary text-white border-transparent px-4 py-1.5 rounded-lg font-black text-[10px] tracking-widest uppercase"
            >
                {students.length} Active Students
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-md min-h-[600px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                Target Matrix
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Filter students by College or Institute for bulk rewards
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                             <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-100">Filter Type</Badge>
                             <select 
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value as any);
                                    setFilterValue("");
                                    setSelectedStudent(null);
                                    setSelectedBulkUserIds([]);
                                }}
                                className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-700 focus:ring-0 outline-none uppercase tracking-wider cursor-pointer"
                             >
                                <option value="all">View All (Manual)</option>
                                <option value="college">College Wise</option>
                                <option value="institute">Institute Wise</option>
                             </select>
                        </div>

                        {filterType !== "all" && (
                            <div className="md:col-span-2 bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2 animate-in slide-in-from-right-4">
                                <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20 bg-primary/5">Select {filterType === "college" ? "College" : "Institute"}</Badge>
                                <select 
                                    value={filterValue}
                                    onChange={(e) => {
                                        setFilterValue(e.target.value);
                                        setSelectedStudent(null);
                                        // Auto-select all when a filter is applied
                                        if (e.target.value) {
                                            const newFiltered = students.filter(s => 
                                                filterType === 'college' ? s.college_name === e.target.value : s.institute_name === e.target.value
                                            );
                                            setSelectedBulkUserIds(newFiltered.map(s => s.id));
                                        } else {
                                            setSelectedBulkUserIds([]);
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-900 focus:ring-0 outline-none tracking-tight cursor-pointer"
                                >
                                    <option value="">{filterType === "college" ? "-- Choose College --" : "-- Choose Institute --"}</option>
                                    {(filterType === "college" ? uniqueColleges : uniqueInstitutes).map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterValue && filteredStudents.length > 0 && (
                            <div className="flex items-center justify-between bg-slate-100/50 p-3 rounded-2xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${selectedBulkUserIds.length === filteredStudents.length ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                                        <CheckCircle2 className={`h-4 w-4 ${selectedBulkUserIds.length === filteredStudents.length ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                        Selection: {selectedBulkUserIds.length} / {filteredStudents.length} Students
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={toggleSelectAll}
                                    className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-slate-200"
                                >
                                    {selectedBulkUserIds.length === filteredStudents.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                        )}
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
                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {filteredStudents.map((student) => (
                                <motion.div
                                    key={student.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                        selectedStudent?.id === student.id 
                                        ? "bg-primary/5 border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                                        : selectedBulkUserIds.includes(student.id)
                                        ? "bg-indigo-50/50 border-indigo-200 shadow-lg shadow-indigo-100"
                                        : "bg-white border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/50"
                                    }`}
                                    onClick={() => {
                                        if (filterType === 'all') {
                                            setSelectedStudent(student);
                                        } else {
                                            toggleUserSelection(student.id);
                                        }
                                    }}
                                >
                                    { (selectedStudent?.id === student.id || selectedBulkUserIds.includes(student.id)) && (
                                        <div className={`absolute top-0 right-0 h-10 w-10 rounded-bl-[2rem] flex items-center justify-center ${selectedBulkUserIds.includes(student.id) ? 'bg-indigo-500' : 'bg-primary/10'}`}>
                                            <CheckCircle2 className={`h-4 w-4 ${selectedBulkUserIds.includes(student.id) ? 'text-white' : 'text-primary'}`} />
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
                                        
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className={`text-sm font-black transition-colors truncate tracking-tight mb-1 ${selectedStudent?.id === student.id ? "text-primary" : "text-slate-900 group-hover:text-primary"}`}>
                                                {student.full_name}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge className="text-[7px] h-3.5 px-1.5 rounded-md uppercase font-black bg-blue-50 text-blue-600 border-none shadow-none flex-shrink-0">
                                                    {student.college_name || student.institute_name || "Self Registered"}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-400 truncate opacity-70 tracking-tight">
                                                    {student.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center justify-end">
                                        <Button 
                                            size="sm"
                                            variant={selectedStudent?.id === student.id || selectedBulkUserIds.includes(student.id) ? "default" : "secondary"}
                                            className={`h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                                                selectedStudent?.id === student.id 
                                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                                : selectedBulkUserIds.includes(student.id)
                                                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100"
                                                : "bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (filterType === 'all') {
                                                    setSelectedStudent(student);
                                                } else {
                                                    toggleUserSelection(student.id);
                                                }
                                            }}
                                        >
                                            {selectedBulkUserIds.includes(student.id) ? (
                                                <>
                                                    <Plus className="h-3.5 w-3.5 rotate-45" />
                                                    <span className="hidden xl:inline">Deselect</span>
                                                    <span className="xl:hidden">-</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span className="hidden xl:inline">Add Propel</span>
                                                    <span className="xl:hidden">Add</span>
                                                </>
                                            )}
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

            <CardContent className="p-8 flex-1 flex flex-col relative overflow-hidden">
              <div className="space-y-8 flex-1 flex flex-col">
                {selectedStudent || selectedBulkUserIds.length > 0 ? (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-6 flex-1 flex flex-col"
                  >
                    {filterType === 'all' && selectedStudent ? (
                      <div className="space-y-4 text-center">
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
                    ) : (
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Cohort ({selectedBulkUserIds.length})</p>
                            <Badge className="bg-indigo-100 text-indigo-600 border-none text-[8px] font-black uppercase">{filterValue}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar space-y-2">
                           {students.filter(s => selectedBulkUserIds.includes(s.id)).map(student => (
                              <div key={student.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-right-2">
                                 <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={student.avatar_url || ""} />
                                    <AvatarFallback className="text-[10px] font-black bg-white">{student.full_name?.[0]}</AvatarFallback>
                                 </Avatar>
                                 <div className="flex-1 min-w-0 text-left">
                                    <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{student.full_name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{student.email}</p>
                                 </div>
                                 <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                              </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 text-left bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner mt-auto">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">
                        Allocation Per Student (₹)
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
                  <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-40 flex-1">
                    <div className="h-24 w-24 rounded-[3rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                        <Zap className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-[180px] leading-relaxed text-center">
                        Initializing Secure Handshake... Select Student
                    </p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                    {generatedCode ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-10 px-6 bg-white text-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center relative shadow-2xl shadow-primary/10 border border-slate-100"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-[0.2em] shadow-xl">
                            Active Reward
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-wider mb-2 text-center">
                        {generatedCode}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Credentials Dispatched
                        </div>
                    </motion.div>
                    ) : (
                    <div className="space-y-4">
                       {filterValue && filterType !== "all" ? (
                          <Button
                              size="lg"
                              disabled={isGenerating || !discountAmount}
                              onClick={bulkGenerateCoupons}
                              className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest text-xs uppercase shadow-2xl shadow-indigo-200 disabled:opacity-20 transition-all border-0 active:scale-[0.98] group"
                          >
                              {isGenerating ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                              <div className="flex items-center gap-3">
                                  <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
                                  <span>Bulk Generate ({selectedBulkUserIds.length} Selected)</span>
                              </div>
                              )}
                          </Button>
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
                    </div>
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

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white/60 border-l-4 border-primary p-5">
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

        <div className="lg:col-span-3">
          <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] bg-white">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-primary rotate-45" />
                        Platform Rewards Ledger
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Real-time audit of all generated and redeemed coupons
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-6">
                      <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rewards</p>
                          <p className="text-xl font-black text-slate-900">{coupons.length}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Redeemed</p>
                          <p className="text-xl font-black text-emerald-500">{coupons.filter(c => c.is_used).length}</p>
                      </div>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-100 italic">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Code</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Assignee</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price Point</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created At</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-30">
                                  <Ticket className="h-10 w-10 text-slate-300" />
                                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No active rewards found</p>
                              </div>
                          </td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <motion.tr 
                            key={coupon.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                        <Zap className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="font-black text-slate-900 tracking-wider font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                        {coupon.code}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 rounded-full border border-white shadow-sm">
                                        <AvatarImage src={coupon.user_id?.avatar_url || ""} />
                                        <AvatarFallback className="text-[10px] font-black uppercase">{coupon.user_id?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-800 leading-none mb-0.5">{coupon.user_id?.full_name || "Unknown Student"}</p>
                                        <p className="text-[10px] font-bold text-slate-400 opacity-70 tracking-tight">{coupon.user_id?.email || "n/a"}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 font-black text-sm text-slate-900">
                                ₹{coupon.discounted_price}
                            </td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(coupon.created_at).toLocaleDateString()} at {new Date(coupon.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-8 py-5 text-right">
                                {coupon.is_used ? (
                                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 animate-pulse shadow-sm shadow-emerald-100">
                                      Redeemed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm shadow-amber-100">
                                      Pending
                                  </Badge>
                                )}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
