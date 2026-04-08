import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard, useVerifyLeaderboardEntry } from '@/hooks/useManagerData';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Medal, CheckCircle, Shield, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function LeaderboardManager() {
  const { user } = useAuth();
  const { data: leaderboard = [], isLoading } = useLeaderboard();
  const verifyEntry = useVerifyLeaderboardEntry();

  const handleVerify = async (id: string) => {
    if (!user?.id) return;
    await verifyEntry.mutateAsync({ id, verified_by: user.id });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const verifiedCount = leaderboard.filter(e => e.is_verified).length;
  const unverifiedCount = leaderboard.filter(e => !e.is_verified).length;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Leaderboard Management</h3>
          <p className="text-sm text-muted-foreground">Verify and manage student rankings</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {verifiedCount} Verified
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            {unverifiedCount} Pending
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboard.length}</div>
            <p className="text-xs text-muted-foreground">on the leaderboard</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboard.length > 0 ? leaderboard[0]?.total_score || 0 : 0}
            </div>
            <p className="text-xs text-muted-foreground">points</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((acc, e) => acc + (e.average_percentage || 0), 0) / leaderboard.length) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">average score</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Student Rankings
          </CardTitle>
          <CardDescription>Click to verify student scores</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leaderboard entries yet</p>
              <p className="text-sm">Students will appear here after completing exams</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => {
                const userData = typeof entry.user_id === 'object' ? entry.user_id : (typeof entry.student_id === 'object' ? entry.student_id : null);
                const displayName = userData?.full_name || entry.student_name || 'Student';
                const avatarUrl = userData?.avatar_url 
                  ? (userData.avatar_url.startsWith('http') ? userData.avatar_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/s3/public/${userData.avatar_url}`)
                  : `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData?.id || entry.id}`;

                return (
                <div
                  key={entry.id}
                  className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 rounded-xl transition-all hover:bg-slate-50 ${
                    idx < 3 ? 'bg-amber-500/10 border border-amber-500/20 shadow-sm' : 'bg-slate-50/50 border border-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-[60%]">
                    <div className="w-6 sm:w-8 flex items-center justify-center shrink-0">
                      {getRankIcon(idx + 1)}
                    </div>
                    
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-white shadow-sm flex-shrink-0">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold font-mono">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">{displayName}</h4>
                        {entry.is_verified && (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        <span>{entry.exams_completed || 0} exams</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        <span>{entry.average_percentage || 0}% avg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-3 sm:mt-0 pl-11 sm:pl-0 w-full sm:w-auto flex-1 border-t sm:border-0 pt-3 sm:pt-0 border-slate-200/60">
                    <div className="text-left sm:text-right flex flex-row items-end gap-2 sm:flex-col sm:items-end sm:gap-0">
                      <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tighter leading-none">{entry.total_score || 0}</div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:mt-0.5">Points</p>
                    </div>
                    {!entry.is_verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 sm:gap-2 h-8 sm:h-9 rounded-full border-2 font-bold px-3 sm:px-4 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900 shadow-sm shrink-0"
                        onClick={() => handleVerify(entry.id)}
                        disabled={verifyEntry.isPending}
                      >
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
