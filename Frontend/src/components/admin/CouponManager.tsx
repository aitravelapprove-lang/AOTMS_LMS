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
  User as UserIcon,
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
        }, 5000);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 sm:gap-3">
            <Ticket className="h-5 w-5 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
            Coupon Rewards Engine
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-base">
            Assign dynamic discount codes to students for rewards.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <Badge
            variant="secondary"
            className="bg-primary/5 text-primary border-transparent px-4 py-1.5 rounded-lg font-bold"
          >
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
              <CardDescription>
                Search and select the student who will receive the reward.
              </CardDescription>
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
                    <p className="text-sm text-slate-500 font-medium">
                      Synchronizing student database...
                    </p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-20 text-center space-y-2 opacity-50">
                    <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-400">
                      No students found
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-primary/5 ${selectedStudent?.id === student.id ? "bg-primary/10 border-l-4 border-primary" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${selectedStudent?.id === student.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}
                          >
                            {student.full_name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${selectedStudent?.id === student.id ? "text-primary" : "text-slate-900"}`}
                            >
                              {student.full_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.email}
                            </p>
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
          <Card className="border-slate-200 shadow-xl overflow-hidden rounded-3xl bg-slate-900 text-white">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary text" />
                Reward Controls
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] font-medium tracking-tight">
                Generate and assign student discount codes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8 text-center">
              <div className="space-y-4">
                <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                  <Ticket
                    className={`h-12 w-12 text-primary ${isGenerating ? "animate-bounce" : ""}`}
                  />
                </div>

                {selectedStudent ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Active Recipient
                      </p>
                      <div className="px-5 py-3 bg-white/5 rounded-xl border border-white/10 inline-block shadow-sm">
                        <p className="text-base font-bold text-white">
                          {selectedStudent.full_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium lowercase tracking-tight opacity-70">
                          {selectedStudent.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-400 ml-1">
                        Reward Value (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FD5A1A] font-bold text-base">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="bg-white/5 border-white/10 h-12 pl-10 text-base font-bold text-white placeholder:text-slate-600 focus:border-[#0075CF] focus:ring-1 focus:ring-[#0075CF]/20 rounded-xl transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-3 opacity-30">
                    <div className="h-0.5 w-8 bg-slate-700 rounded-full" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">
                      Select student to proceed
                    </p>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {generatedCode ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-6 bg-[#FD5A1A]/5 border border-[#FD5A1A]/10 rounded-2xl space-y-3 relative shadow-inner"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#FD5A1A]">
                      Assignment Secure
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-widest">
                      {generatedCode}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400">
                      <Send className="h-3 w-3 text-[#FD5A1A]" />
                      Notified successfully
                    </div>
                  </motion.div>
                ) : (
                  <Button
                    size="lg"
                    disabled={!selectedStudent || isGenerating}
                    onClick={generateCoupon}
                    className="w-full h-14 rounded-xl bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-bold tracking-tight text-sm shadow-lg disabled:opacity-30 transition-all border-0 active:scale-[0.98]"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span>Assign Reward Code</span>
                      </div>
                    )}
                  </Button>
                )}
              </AnimatePresence>

              <div className="pt-6 border-t border-white/5 opacity-40">
                <p className="text-[8px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider text-center">
                  Auto-notification and persistence protocols active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 shadow-sm rounded-2xl bg-white/5 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] font-medium text-slate-500">
                Pattern: <span className="font-bold text-[#FD5A1A]">AOTMS</span>{" "}
                + 5 Digit Entropy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
