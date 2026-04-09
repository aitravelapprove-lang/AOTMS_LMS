import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  LayoutGrid,
  Shield,
  Zap,
  BarChart3,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Course } from "@/hooks/useAdminData";

interface ManagerCourseGridProps {
  courses: Course[];
  loading: boolean;
  onDelete?: (id: string) => void;
  onView?: (course: Course) => void;
  onUpdatePrice?: (id: string, price: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

export function ExecutiveCatalog({
  courses,
  loading,
  onDelete,
  onView,
  onUpdatePrice,
  onToggleActive,
}: ManagerCourseGridProps) {
  const [editingPrice, setEditingPrice] = useState<{
    id: string;
    title: string;
    price: string;
  } | null>(null);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    if (editingPrice) {
      setNewPrice(editingPrice.price);
    }
  }, [editingPrice]);

  const handlePriceUpdate = async () => {
    if (editingPrice && onUpdatePrice) {
      onUpdatePrice(editingPrice.id, newPrice);
      setEditingPrice(null);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 h-[320px]">
            <Skeleton className="h-48 w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
          <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <LayoutGrid className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No intelligence nodes found</h3>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Awaiting tactical deployment from curriculum hub</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course, index) => {
            const CategoryIcon = course.title?.toLowerCase().includes("security") ? Shield
              : course.title?.toLowerCase().includes("ai") ? Zap
              : course.title?.toLowerCase().includes("data") ? BarChart3
              : course.title?.toLowerCase().includes("design") ? LayoutGrid
              : BookOpen;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col p-2"
              >
                {/* Visual Header */}
                <div className="aspect-[4/3] relative rounded-[1.8rem] overflow-hidden group-hover:shadow-2xl transition-all duration-700">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt=""
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200">
                       <BookOpen className="h-12 w-12" />
                       <span className="text-[9px] font-black uppercase tracking-widest mt-2">Core Component</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 left-4">
                    <Badge className={`border-none font-black text-[9px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl shadow-lg ${course.status === "published" || course.status === "approved" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                      {course.status || "DRAFT"}
                    </Badge>
                  </div>

                  {/* Floating Action Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
                    <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl">
                       <CategoryIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content Segment */}
                <div className="relative pt-8 pb-6 px-6 flex-1 flex flex-col">
                  {/* Join Icon */}
                  <div className="absolute -top-7 right-8 h-14 w-14 rounded-full bg-white shadow-xl flex items-center justify-center border-8 border-slate-50 group-hover:scale-110 transition-transform duration-500">
                    <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center">
                       <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <h3 className="text-xl font-black text-slate-900 leading-[1.1] group-hover:text-primary transition-colors line-clamp-2">
                       {course.title}
                    </h3>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
                       {course.category || "Strategic Intelligence"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 mb-6">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">
                       {course.duration || "3 Months"} • Online / Live
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="mt-auto pt-5 border-t border-slate-50 flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest pl-1">Special Rate</span>
                       <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tighter">
                             ₹{course.price ? Number(course.price).toLocaleString("en-IN") : "0"}
                          </span>
                          {course.price && (
                            <span className="text-[10px] font-bold text-slate-300 line-through">
                               ₹{(Number(course.price) * 1.25).toLocaleString("en-IN")}
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <Button variant="outline" className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50" onClick={() => onView?.(course)}>
                          Explore
                       </Button>
                       <Button className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => onView?.(course)}>
                          Manage
                       </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pricing Configuration Node */}
      <Dialog open={!!editingPrice} onOpenChange={() => setEditingPrice(null)}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-none shadow-2xl pro-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Configure Market Value</DialogTitle>
            <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Updating rate for: {editingPrice?.title}</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Strategic Price (₹)</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-black focus-visible:ring-primary/20"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
             <Button variant="outline" className="h-12 rounded-2xl px-8 font-bold" onClick={() => setEditingPrice(null)}>Cancel</Button>
             <Button className="h-12 rounded-2xl px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handlePriceUpdate}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
