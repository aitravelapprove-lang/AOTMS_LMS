import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  History, 
  FileSearch, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Layout
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
  const { data: scans = [], isLoading } = useQuery<ScanResult[]>({
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Resume Scan History
          </h2>
          <p className="text-slate-500">View all student ATS resume analysis results</p>
        </div>
        <Badge variant="outline" className="bg-slate-50 px-3 py-1">
          {scans.length} Scans Performed
        </Badge>
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
              <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={scan.user_id?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {scan.user_id?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <CardTitle className="text-base font-bold text-slate-800">
                        {scan.user_id?.full_name || 'Unknown Student'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs">
                        <User className="h-3 w-3" /> {scan.user_id?.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-xs text-slate-500 font-medium mb-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(scan.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <Badge variant={scan.score >= 80 ? 'default' : scan.score >= 60 ? 'secondary' : 'destructive'} className="font-bold">
                       ATS Score: {scan.score}/100
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
