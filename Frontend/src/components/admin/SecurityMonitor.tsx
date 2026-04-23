import { useState } from 'react';
import { SyncDataButton } from './data/SyncDataButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Info,
  AlertCircle,
  XCircle
} from 'lucide-react';
import type { SecurityEvent, SystemLog } from '@/hooks/useAdminData';

interface SecurityMonitorProps {
  securityEvents: SecurityEvent[];
  systemLogs: SystemLog[];
  loading: boolean;
  highPriorityCount: number;
  onResolveEvent: (eventId: string) => Promise<boolean>;
  onSync?: () => void;
}

export function SecurityMonitor({ 
  securityEvents, 
  systemLogs,
  loading,
  highPriorityCount,
  onResolveEvent,
  onSync
}: SecurityMonitorProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleResolve = async (eventId: string) => {
    setProcessing(eventId);
    await onResolveEvent(eventId);
    setProcessing(null);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-700"><AlertCircle className="h-3 w-3" /> Medium</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Info className="h-3 w-3" /> Low</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_failure':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'permission_denied':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'password_change':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'account_locked':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'audit':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'system':
        return <Shield className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const unresolvedEvents = securityEvents.filter(e => !e.resolved);
  const resolvedEvents = securityEvents.filter(e => e.resolved);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Events
              </CardTitle>
              <CardDescription>Monitor and resolve security incidents</CardDescription>
            </div>
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                    {highPriorityCount} high priority
              </Badge>
            )}
            {onSync && (
              <SyncDataButton 
                onSync={onSync} 
                isLoading={loading} 
                className="h-10 px-4"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" className="gap-2">
                <ShieldAlert className="h-4 w-4" />
                Active ({unresolvedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Resolved ({resolvedEvents.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {unresolvedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <ShieldCheck className="h-12 w-12 mb-4 text-green-500" />
                      <p>No active security events</p>
                    </div>
                  ) : (
                    unresolvedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="mt-1">
                          {getEventIcon(event.event_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{formatEventType(event.event_type)}</h4>
                            {getRiskBadge(event.risk_level)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {event.user_email || 'Unknown user'} • IP: {event.ip_address || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTime(event.created_at)}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={processing === event.id}
                          onClick={() => handleResolve(event.id)}
                        >
                          {processing === event.id ? 'Resolving...' : 'Resolve'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="resolved">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {resolvedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Info className="h-12 w-12 mb-4" />
                      <p>No resolved events yet</p>
                    </div>
                  ) : (
                    resolvedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 opacity-70"
                      >
                        <div className="mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{formatEventType(event.event_type)}</h4>
                            <Badge variant="outline" className="text-green-600">Resolved</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {event.user_email || 'Unknown user'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            System Logs
          </CardTitle>
          <CardDescription>Recent activity log</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {systemLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4" />
                  <p>No logs yet</p>
                </div>
              ) : (
                systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {getLogIcon(log.log_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.module} • {formatTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
