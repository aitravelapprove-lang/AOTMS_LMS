import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { Loader2, Trash2, AlertTriangle, Database, Users, BookOpen, FileQuestion, GraduationCap, ShieldCheck, MessageSquare, Eye, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataSummary {
    users: number;
    courses: number;
    enrollments: number;
    questionBanks: number;
    exams: number;
    conversations: number;
    messages: number;
}

interface DeletionStats {
    users: number;
    courses: number;
    enrollments: number;
    questionBanks: number;
    exams: number;
    conversations: number;
    messages: number;
}

export function QualityAssurance() {
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [summary, setSummary] = useState<DataSummary>({
        users: 0,
        courses: 0,
        enrollments: 0,
        questionBanks: 0,
        exams: 0,
        conversations: 0,
        messages: 0
    });
    const { toast } = useToast();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState<string | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [viewingDataType, setViewingDataType] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState('users');

    interface QuestionBankItem {
        id?: string;
        _id?: string;
        topic: string;
        question_text: string;
        created_by?: string;
    }

    interface UserItem {
        id?: string;
        _id?: string;
        full_name?: string;
        email?: string;
        user_id?: { _id: string; full_name?: string; email?: string } | string;
    }

    const dataTypes = [
        { id: 'users', label: 'Users', icon: Users, description: 'All user accounts and profiles', color: 'bg-red-500' },
        { id: 'courses', label: 'Courses', icon: BookOpen, description: 'All courses and content', color: 'bg-orange-500' },
        { id: 'enrollments', label: 'Enrollments', icon: GraduationCap, description: 'Student enrollments and progress', color: 'bg-blue-500' },
        { id: 'questionBanks', label: 'Question Banks', icon: FileQuestion, description: 'All question banks and questions', color: 'bg-purple-500' },
        { id: 'exams', label: 'Exams', icon: ShieldCheck, description: 'Exams, schedules, and results', color: 'bg-indigo-500' },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare, description: 'Chat conversations and messages', color: 'bg-green-500' },
    ];

    const dataTypeLabels: Record<string, string> = {
        users: 'Users',
        courses: 'Courses',
        enrollments: 'Enrollments',
        questionBanks: 'Question Banks',
        exams: 'Exams',
        conversations: 'Conversations'
    };

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const counts = await fetchWithAuth('/admin/data-summary') as DataSummary;
            setSummary(counts);
        } catch (err) {
            console.error('Failed to fetch data summary', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        const interval = setInterval(() => fetchSummary(), 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleDeleteClick = (dataType: string) => {
        setSelectedDataType(dataType);
        setDeleteConfirmText('');
        setShowDeleteDialog(true);
    };

    const handleViewClick = async (dataType: string) => {
        setViewingDataType(dataType);
        setShowViewDialog(true);
        setLoadingData(true);
        
        try {
            let endpoint = '';
            switch (dataType) {
                case 'users':
                    endpoint = '/admin/users-list';
                    break;
                case 'courses':
                    endpoint = '/admin/courses-list';
                    break;
                case 'enrollments':
                    endpoint = '/admin/enrollments-list';
                    break;
                case 'questionBanks':
                    endpoint = '/data/question_bank';
                    break;
                case 'exams':
                    endpoint = '/data/exams';
                    break;
                case 'conversations':
                    endpoint = '/admin/conversations';
                    break;
                default:
                    endpoint = `/data/${dataType}`;
            }
            const data = await fetchWithAuth(endpoint);
            setDataList(Array.isArray(data) ? data.slice(0, 50) : []);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setDataList([]);
        } finally {
            setLoadingData(false);
        }
    };

    const [dataList, setDataList] = useState<(UserItem | QuestionBankItem | any)[]>([]);

    const handleIndividualDelete = async (item: UserItem | QuestionBankItem | any) => {
        const id = getItemId(item, viewingDataType || '');
        if (!id || id === 'N/A') return;
        
        if (!window.confirm(`Are you sure you want to permanently delete this ${viewingDataType} record?`)) return;

        try {
            setLoadingData(true);
            let endpoint = `/api/data/${viewingDataType === 'questionBanks' ? 'question_bank' : viewingDataType === 'enrollments' ? 'course_enrollments' : viewingDataType}/${id}`;
            
            // Map common types to generic backend tables if needed
            if (viewingDataType === 'users') endpoint = `/api/data/users/${id}`;
            
            await fetchWithAuth(endpoint, { method: 'DELETE' });
            
            toast({ title: "Record Deleted", description: "The item has been permanently removed." });
            
            // Optimistic update
            setDataList(prev => prev.filter(i => getItemId(i, viewingDataType || '') !== id));
            fetchSummary();
        } catch (err) {
            toast({
                title: 'Deletion Failed',
                description: err instanceof Error ? err.message : 'Failed to delete record',
                variant: 'destructive'
            });
        } finally {
            setLoadingData(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDataType || deleteConfirmText !== 'DELETE') return;

        try {
            setDeleting(true);
            await fetchWithAuth(`/admin/permanent-delete/${selectedDataType}`, {
                method: 'DELETE'
            });

            toast({
                title: "Data Permanently Deleted",
                description: `All ${dataTypeLabels[selectedDataType]} data has been permanently removed.`
            });

            setShowDeleteDialog(false);
            fetchSummary();
        } catch (err) {
            toast({
                title: 'Deletion Failed',
                description: err instanceof Error ? err.message : 'Failed to delete data',
                variant: 'destructive'
            });
        } finally {
            setDeleting(false);
        }
    };

    const getDisplayValue = (item: UserItem | QuestionBankItem | any, dataType: string): string => {
        switch (dataType) {
            case 'users': {
                const u = item as UserItem;
                return u.full_name || u.email || (typeof u.user_id === 'object' ? u.user_id?.full_name : u.user_id?.toString()) || 'Unknown';
            }
            case 'courses':
                return item.title || item.name || 'Untitled Course';
            case 'enrollments':
                return `${item.user_name || item.user_id?.full_name || 'Student'} - ${item.course_title || item.course_id?.title || 'Course'}`;
            case 'questionBanks':
            case 'question_bank':
                return (item as QuestionBankItem).topic || (item as QuestionBankItem).question_text?.substring(0, 50) || 'Question';
            case 'exams':
                return item.title || item.topic || 'Untitled Exam';
            case 'conversations':
                return item.id?.toString() || 'Conversation';
            default:
                return item.title || item.name || item.topic || 'Record';
        }
    };

    const getItemId = (item: UserItem | QuestionBankItem | any, dataType: string): string => {
        return item.id || item._id?.toString() || item.user_id?.toString() || item.course_id?.toString() || 'N/A';
    };

    if (loading && summary.users === 0 && summary.courses === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading data summary...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Quality Assurance
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        Permanently remove data from the database. This action cannot be undone.
                    </p>
                </div>
                <Badge variant="destructive" className="h-7 px-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Destructive Actions
                </Badge>
            </div>

            <Card className="border-2 border-red-200 bg-red-50/30">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-red-900 text-lg">Warning: Permanent Data Deletion</h3>
                            <p className="text-sm text-red-700 leading-relaxed">
                                This section contains irreversible operations. Deleted data cannot be recovered. 
                                Please ensure you have proper backups before proceeding. All deletions are logged for audit purposes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dataTypes.map((type) => {
                    const count = summary[type.id as keyof DataSummary] || 0;
                    const Icon = type.icon;
                    return (
                        <Card key={type.id} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                            <CardContent className="p-0">
                                <div className={`h-2 ${type.color}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`h-12 w-12 rounded-xl ${type.color}/10 flex items-center justify-center`}>
                                            <Icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold">
                                            {count} records
                                        </Badge>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">{type.label}</h3>
                                    <p className="text-xs text-slate-500 mb-4">{type.description}</p>
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewClick(type.id)}
                                            className="flex-1 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDeleteClick(type.id)}
                                            className="flex-1 h-10 rounded-xl font-semibold text-sm"
                                            disabled={count === 0}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Database className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900">Database Summary</p>
                        <p className="text-sm text-slate-500 max-w-md">
                            View all data types and their record counts. Use the delete button to permanently remove data.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {dataTypes.map((type) => (
                            <div key={type.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <type.icon className={`h-4 w-4 ${type.color.replace('bg-', 'text-')}`} />
                                <span className="text-sm font-semibold text-slate-700">
                                    {summary[type.id as keyof DataSummary] || 0}
                                </span>
                                <span className="text-xs text-slate-400">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-red-600 p-8 text-white relative">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <Trash2 className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">
                            Permanently Delete {dataTypeLabels[selectedDataType || '']}?
                        </DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">
                            This action will permanently remove all {dataTypeLabels[selectedDataType || '']} data from the database. 
                            <span className="block mt-2 font-bold text-yellow-200">THIS ACTION CANNOT BE UNDONE!</span>
                        </DialogDescription>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
                            <div className="flex items-center gap-2 text-red-800 font-bold">
                                <AlertTriangle className="h-5 w-5" />
                                <span>Records to be deleted:</span>
                            </div>
                            <p className="text-red-700 font-semibold text-lg">
                                {summary[selectedDataType as keyof DataSummary] || 0} {dataTypeLabels[selectedDataType || '']}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                Type "DELETE" to confirm
                            </Label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE here"
                                className="w-full h-12 px-4 rounded-xl border-2 border-red-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono text-lg tracking-wider"
                            />
                        </div>

                        <DialogFooter className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={deleteConfirmText !== 'DELETE' || deleting}
                                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg font-bold"
                            >
                                {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Permanently Delete
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl max-h-[80vh] flex flex-col">
                    <div className="bg-primary p-8 text-white relative flex-shrink-0">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl relative z-10">
                            <Eye className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight relative z-10">
                            {dataTypeLabels[viewingDataType || '']} Data
                        </DialogTitle>
                        <DialogDescription className="text-white/80 mt-2 font-medium relative z-10">
                            Showing first 50 records. Total: {summary[viewingDataType as keyof DataSummary] || 0}
                        </DialogDescription>
                    </div>

                    <div className="p-6 bg-white flex-1 overflow-hidden">
                        {loadingData ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : dataList.length === 0 ? (
                            <div className="text-center py-12 space-y-3">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-600 font-semibold">No data found</p>
                                <p className="text-slate-400 text-sm">This data type has no records.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                    {dataList.map((item, idx) => (
                                        <div key={item.id || item._id || idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-primary">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {getDisplayValue(item, viewingDataType || '')}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    ID: {getItemId(item, viewingDataType || '')}
                                                </p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={() => handleIndividualDelete(item)}
                                                title="Permanently Delete Record"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowViewDialog(false)}
                            className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
