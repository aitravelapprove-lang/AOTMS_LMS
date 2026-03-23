import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import {
    Search, UserPlus, CheckCircle2, XCircle, User, Mail,
    Key, Loader2, BookOpen, ChevronRight, Star, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionBankTopic {
    topic: string;
    count: number;
    created_by: string;
    created_at: string;
    difficulties: string[];
}

interface StudentProfile {
    user_id: string;
    full_name: string;
    email: string;
    approval_status: string;
}

const difficultyColor = (d: string) => {
    if (d === 'easy') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (d === 'medium') return 'bg-amber-100 text-amberald-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

export function QuestionBankStudentAccess() {
    const [approvedBanks, setApprovedBanks] = useState<QuestionBankTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<QuestionBankTopic | null>(null);
    const [uuidInput, setUuidInput] = useState('');
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [lookingUp, setLookingUp] = useState(false);
    const [granting, setGranting] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchApprovedBanks = async () => {
            try {
                setLoadingBanks(true);
                const data = await fetchWithAuth('/manager/approved-question-banks');
                setApprovedBanks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch approved question banks', err);
                toast({ title: 'Error', description: 'Could not load approved question banks.', variant: 'destructive' });
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchApprovedBanks();
    }, [toast]);

    const handleLookup = async () => {
        const uuid = uuidInput.trim();
        if (!uuid) {
            toast({ title: 'Enter UUID', description: 'Please paste a student UUID first.', variant: 'destructive' });
            return;
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            toast({ title: 'Invalid Format', description: 'The provided string is not a valid UUID.', variant: 'destructive' });
            return;
        }

        setLookingUp(true);
        setStudent(null);
        setLookupError('');
        try {
            const data = await fetchWithAuth(`/manager/lookup-student/${uuid}`);
            setStudent(data);
        } catch {
            setLookupError('No student found with that UUID. Please verify and try again.');
        } finally {
            setLookingUp(false);
        }
    };

    const handleGrantAccess = async () => {
        if (!student || !selectedTopic) return;
        setGranting(true);
        try {
            await fetchWithAuth('/manager/grant-question-bank-access', {
                method: 'POST',
                body: JSON.stringify({ studentId: student.user_id, topic: selectedTopic.topic })
            });
            toast({
                title: '✅ Access Granted',
                description: `${student.full_name || 'Student'} now has access to "${selectedTopic.topic}"`
            });
            setUuidInput('');
            setStudent(null);
        } catch (err) {
            toast({ title: 'Failed', description: 'Could not grant access. Please try again.', variant: 'destructive' });
        } finally {
            setGranting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Student Question Bank Access</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Grant approved students access to admin-approved question banks using their UUID.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Question Bank Selection */}
                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Approved Question Banks</CardTitle>
                                <CardDescription className="text-xs">Select a question bank to grant access to</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loadingBanks ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading approved banks...</span>
                            </div>
                        ) : approvedBanks.length === 0 ? (
                            <div className="py-10 text-center space-y-2 opacity-50">
                                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
                                <p className="text-sm font-medium">No approved question banks yet.</p>
                                <p className="text-xs text-muted-foreground">Ask the admin to approve a question bank first.</p>
                            </div>
                        ) : (
                            approvedBanks.map((bank) => (
                                <button
                                    key={bank.topic}
                                    onClick={() => setSelectedTopic(bank)}
                                    className={cn(
                                        'w-full text-left p-4 rounded-xl border transition-all',
                                        selectedTopic?.topic === bank.topic
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/40 hover:bg-muted/40'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{bank.topic}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Star className="h-3 w-3" /> {bank.count} questions
                                                </span>
                                                {bank.difficulties?.map(d => (
                                                    <span key={d} className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize', difficultyColor(d))}>
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn('h-4 w-4 flex-shrink-0 transition-colors', selectedTopic?.topic === bank.topic ? 'text-primary' : 'text-muted-foreground/30')} />
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Right: Student UUID Lookup + Confirm */}
                <Card className={cn('border-2 transition-all', selectedTopic ? 'border-primary/20' : 'border-border opacity-60 pointer-events-none')}>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Key className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Grant Student Access</CardTitle>
                                <CardDescription className="text-xs">
                                    {selectedTopic ? (
                                        <span>Granting access to: <strong className="text-foreground">{selectedTopic.topic}</strong></span>
                                    ) : 'Select a question bank first'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* UUID Input */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Paste Student UUID here..."
                                    className="pl-9 h-11"
                                    value={uuidInput}
                                    onChange={(e) => { setUuidInput(e.target.value); setStudent(null); setLookupError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                />
                            </div>
                            <Button onClick={handleLookup} disabled={lookingUp} className="h-11 px-5 gap-2">
                                {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Lookup
                            </Button>
                        </div>

                        {/* Error */}
                        {lookupError && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Lookup Failed</p>
                                    <p>{lookupError}</p>
                                </div>
                            </div>
                        )}

                        {/* Student Card */}
                        {student && (
                            <div className="p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent animate-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base leading-none">{student.full_name || 'Unnamed Student'}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <Mail className="h-3 w-3" /> {student.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-xs">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="font-medium">Status:</span>
                                        <Badge variant="outline" className={cn('h-5 px-1.5 capitalize', student.approval_status === 'approved' ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700')}>
                                            {student.approval_status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-[10px] truncate">
                                        <Key className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        <code className="text-muted-foreground truncate">{student.user_id.substring(0, 14)}...</code>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-4">
                                    <p className="font-semibold">Confirm access grant?</p>
                                    <p className="mt-0.5">This will allow <strong>{student.full_name}</strong> to access <strong>{selectedTopic?.topic}</strong>.</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleGrantAccess}
                                        disabled={granting}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20"
                                    >
                                        {granting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                        {granting ? 'Granting...' : 'Confirm Access'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setStudent(null); setUuidInput(''); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!student && !lookupError && (
                            <div className="py-8 flex flex-col items-center justify-center text-center opacity-40 space-y-2">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm font-medium">No student selected</p>
                                <p className="text-xs">Paste a UUID above and click Lookup.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
