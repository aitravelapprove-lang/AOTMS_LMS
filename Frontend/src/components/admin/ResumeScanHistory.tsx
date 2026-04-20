import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SyncDataButton } from "./data/SyncDataButton";
import { 
  History, 
  FileSearch, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Layout,
  Mail
} from "lucide-react";
import { format } from "date-fns";

interface ScanResult {
  id: string;
  user_id: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
  score: number;
  analysis: {
    missing_keywords: string[];
    formatting_issues: string[];
    suggestions: string[];
  };
  file_name: string;
  created_at: string;
}

export function ResumeScanHistory() {
  const { data: scans = [], isLoading, refetch } = useQuery<ScanResult[]>({
    queryKey: ['admin-resume-scans'],
    queryFn: async () => {
      return await fetchWithAuth('/admin/resume-scans');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="h-7 w-7 text-primary" />
            Resume Scan History
          </h2>
          <p className="text-slate-500 text-sm font-medium">View all student ATS resume analysis results</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-white border-slate-200 px-4 py-1.5 rounded-full shadow-sm text-[10px] uppercase font-black tracking-widest text-slate-400 shrink-0">
            {scans.length} Scans Performed
          </Badge>
          <SyncDataButton 
            onSync={async () => { await refetch(); }} 
            isLoading={isLoading} 
            className="h-10 px-4"
          />
        </div>
      </div>

      {scans.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileSearch className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium text-lg">No scans performed yet</p>
            <p className="text-sm">When students use the ATS feature, their history will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan) => (
            <Card key={scan.id} className="overflow-hidden border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-md shrink-0">
                      <AvatarImage src={scan.user_id?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                        {scan.user_id?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 overflow-hidden">
                      <CardTitle className="text-lg font-black text-slate-900 leading-none truncate">
                        {scan.user_id?.full_name || 'Scholar'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {scan.user_id?.email || 'N/A'}
                      </CardDescription>
                      <div className="lg:hidden flex items-center gap-2 mt-2">
                         <Badge variant={scan.score >= 80 ? 'default' : scan.score >= 60 ? 'secondary' : 'destructive'} className="font-black text-[10px] h-6 uppercase tracking-tighter">
                            ATS Score: {scan.score}/100
                         </Badge>
                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 border-l pl-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(scan.created_at), 'MMM dd, HH:mm')}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(scan.created_at), 'MMMM dd, yyyy HH:mm')}
                    </div>
                    <Badge variant={scan.score >= 80 ? 'default' : scan.score >= 60 ? 'secondary' : 'destructive'} className="px-4 py-1.5 rounded-xl shadow-lg shadow-primary/20 text-sm font-black whitespace-nowrap">
                       ATS SCORE: {scan.score}/100
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 grid md:grid-cols-3 gap-6">
                 {/* Analysis Sections */}
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b pb-2">
                     <BrainCircuit className="h-4 w-4 text-primary" />
                     Missing Keywords
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                     {scan.analysis.missing_keywords?.map((kw, i) => (
                       <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                         {kw}
                       </Badge>
                     )) || <span className="text-xs text-slate-400 italic">None identified</span>}
                   </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b pb-2">
                     <Layout className="h-4 w-4 text-primary" />
                     Formatting Issues
                   </div>
                   <ul className="space-y-1.5">
                     {scan.analysis.formatting_issues?.map((issue, i) => (
                       <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                         <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                         {issue}
                       </li>
                     )) || <li className="text-xs text-slate-400 italic">No major issues</li>}
                   </ul>
                 </div>

                 <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b pb-2">
                     <TrendingUp className="h-4 w-4 text-primary" />
                     Key Suggestions
                   </div>
                   <ul className="space-y-1.5">
                     {scan.analysis.suggestions?.map((sug, i) => (
                       <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                         <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                         {sug}
                       </li>
                     )) || <li className="text-xs text-slate-400 italic">Everything looks great!</li>}
                   </ul>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
