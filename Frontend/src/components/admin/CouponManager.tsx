import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  UserPlus, 
  Search, 
  Gift, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Send,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  role: string;
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
      const studentUsers = await fetchWithAuth('/admin/students');
      setStudents(studentUsers || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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
      const response = await fetchWithAuth('/admin/coupons/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: selectedStudent.id,
          amount: Number(discountAmount)
        })
      });

      if (response.success) {
        setGeneratedCode(response.code);
        toast.success(`Coupon ${response.code} (₹${discountAmount}) assigned to ${selectedStudent.full_name}`);
        // Clear selection after 5 seconds
        setTimeout(() => {
          setGeneratedCode(null);
          setSelectedStudent(null);
          setDiscountAmount("");
        }, 5000);
      }
    } catch (err) {
      console.error('Failed to generate coupon:', err);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 sm:gap-3">
            <Ticket className="h-5 w-5 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
            Coupon Rewards Engine
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-base">Assign dynamic discount codes to students for rewards.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-transparent px-4 py-1.5 rounded-lg font-bold">
                {students.length} Active Students
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Student */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-slate-400" />
                Step 1: Select Target Student
              </CardTitle>
              <CardDescription>Search and select the student who will receive the reward.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
               </div>

               <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="py-20 text-center space-y-4">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                      <p className="text-sm text-slate-500 font-medium">Synchronizing student database...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-20 text-center space-y-2 opacity-50">
                      <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-400">No students found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {filteredStudents.map((student) => (
                        <div 
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-primary/5 ${selectedStudent?.id === student.id ? 'bg-primary/10 border-l-4 border-primary' : 'bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${selectedStudent?.id === student.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {student.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                               <p className={`text-sm font-bold ${selectedStudent?.id === student.id ? 'text-primary' : 'text-slate-900'}`}>{student.full_name}</p>
                               <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>
                          {selectedStudent?.id === student.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Generation */}
        <div className="space-y-6">
           <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary text" />
                  Reward Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 space-y-8 text-center">
                 <div className="space-y-4">
                    <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                      <Ticket className={`h-12 w-12 text-primary ${isGenerating ? 'animate-bounce' : ''}`} />
                    </div>
                    {selectedStudent ? (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white uppercase tracking-widest">Assigning to</p>
                          <p className="text-xl font-black text-primary">{selectedStudent.full_name}</p>
                        </div>
                        
                        <div className="space-y-2 text-left">
                           <label className="text-[11px] font-black uppercase tracking-widest text-white/90">Target Discounted Price (₹)</label>
                           <Input 
                              type="number"
                              placeholder="e.g. 28000"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(e.target.value)}
                              className="bg-white/5 border-white/10 h-12 text-lg font-black !text-white placeholder:text-white/30 focus:border-primary rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                           />
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic py-4">
                        Select a student from the list to enable generation.
                      </div>
                    )}
                 </div>

                 <AnimatePresence mode="wait">
                    {generatedCode ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3"
                      >
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Coupon Created Successfully</p>
                         <h2 className="text-3xl font-black text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{generatedCode}</h2>
                         <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-400">
                            <Send className="h-3 w-3" />
                            Notification Dispatched
                         </div>
                      </motion.div>
                    ) : (
                      <Button
                        size="lg"
                        disabled={!selectedStudent || isGenerating}
                        onClick={generateCoupon}
                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] disabled:opacity-20 transition-all border-none"
                      >
                        {isGenerating ? (
                           <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                           <>
                            <Gift className="h-5 w-5 mr-3" />
                            Generate & Send
                           </>
                        )}
                      </Button>
                    )}
                 </AnimatePresence>

                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                      Assigning a coupon will automatically notify the student and persist the code in their rewards history.
                    </p>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-slate-200 shadow-sm rounded-3xl bg-slate-50 border-dashed">
              <CardContent className="p-6 text-center space-y-2">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generation Rule</p>
                 <p className="text-sm font-medium text-slate-600">
                    Codes are prefixed with <span className="font-bold text-primary">AOTMS</span> followed by 5 high-entropy numeric digits for uniqueness.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
