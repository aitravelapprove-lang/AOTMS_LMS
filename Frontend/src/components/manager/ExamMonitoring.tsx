import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExams, useExamResults } from '@/hooks/useManagerData';
import { Eye, Users, Activity, Clock, CheckCircle, AlertTriangle, Monitor } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

export function ExamMonitoring() {
  const { data: exams = [], isLoading: examsLoading } = useExams();
  const { data: results = [], isLoading: resultsLoading } = useExamResults();

  const activeExams = exams.filter(e => e.status === 'active');
  const completedExams = exams.filter(e => e.status === 'completed');
  
  const inProgressResults = results.filter(r => r.status === 'in_progress');
  const completedResults = results.filter(r => r.status === 'completed');

  if (examsLoading || resultsLoading) {
    return <div className="flex items-center justify-center p-8">Loading monitoring data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Live Exam Monitoring</h3>
        <p className="text-sm text-muted-foreground">Real-time exam activity tracking</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeExams.length}</div>
            <p className="text-xs text-muted-foreground">currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students Taking Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inProgressResults.length}</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedResults.length}</div>
            <p className="text-xs text-muted-foreground">submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedResults.length > 0 
                ? Math.round(completedResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / completedResults.length) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">today</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-500" />
            Active Exams
          </CardTitle>
          <CardDescription>Currently running exams</CardDescription>
        </CardHeader>
        <CardContent>
          {activeExams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active exams right now</p>
              <p className="text-sm">Exams will appear here when they're started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeExams.map((exam) => {
                const examResults = results.filter(r => r.exam_id === exam.id);
                const inProgress = examResults.filter(r => r.status === 'in_progress').length;
                const completed = examResults.filter(r => r.status === 'completed').length;
                
                return (
                  <div key={exam.id} className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{exam.title}</h4>
                          <Badge variant="default" className="bg-green-500">LIVE</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Started at {format(new Date(exam.scheduled_date), 'h:mm a')} • {exam.duration_minutes} min
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{inProgress}</div>
                          <p className="text-xs text-muted-foreground">in progress</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{completed}</div>
                          <p className="text-xs text-muted-foreground">completed</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Progress</span>
                        <span>{inProgress + completed > 0 ? Math.round((completed / (inProgress + completed)) * 100) : 0}%</span>
                      </div>
                      <Progress value={inProgress + completed > 0 ? (completed / (inProgress + completed)) * 100 : 0} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedResults.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
          ) : (
            <div className="space-y-2">
              {completedResults.slice(0, 10).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {(result.percentage || 0) >= 40 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">Student #{result.student_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {result.completed_at && format(new Date(result.completed_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{result.score}/{result.total_marks}</div>
                    <Badge variant={result.percentage && result.percentage >= 40 ? 'default' : 'destructive'}>
                      {result.percentage || 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
