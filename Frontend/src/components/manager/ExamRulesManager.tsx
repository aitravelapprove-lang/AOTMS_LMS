import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamRules, useCreateExamRule, useUpdateExamRule, useDeleteExamRule, useExams, type ExamRule } from '@/hooks/useManagerData';
import {
    Plus, Settings, Trash2, Clock, AlertTriangle, RotateCcw,
    Shuffle, Eye, Shield, BookCheck, Pencil, Gavel
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ExamRulesManagerProps {
    onRuleCreated?: (rule: ExamRule) => void;
    hideList?: boolean;
}

export function ExamRulesManager({ onRuleCreated, hideList = false }: ExamRulesManagerProps) {
    const { data: rules = [], isLoading } = useExamRules();
    const { data: exams = [] } = useExams();
    const createRule = useCreateExamRule();
    const updateRule = useUpdateExamRule();
    const deleteRule = useDeleteExamRule();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<string | null>(null);
    const [ruleForm, setRuleForm] = useState({
        exam_id: '' as string | null,
        duration_minutes: 60,
        max_attempts: 1,
        negative_marking_value: 0,
        passing_percentage: 40,
        shuffle_questions: true,
        shuffle_options: false,
        show_results_immediately: true,
        allow_review: true,
        proctoring_enabled: false,
    });

    const resetForm = () => {
        setRuleForm({
            exam_id: null,
            duration_minutes: 60,
            max_attempts: 1,
            negative_marking_value: 0,
            passing_percentage: 40,
            shuffle_questions: true,
            shuffle_options: false,
            show_results_immediately: true,
            allow_review: true,
            proctoring_enabled: false,
        });
    };

    const handleCreate = async () => {
        const result = await createRule.mutateAsync({
            exam_id: ruleForm.exam_id || null,
            exam_schedule_id: null,
            duration_minutes: ruleForm.duration_minutes,
            max_attempts: ruleForm.max_attempts,
            negative_marking_value: ruleForm.negative_marking_value,
            passing_percentage: ruleForm.passing_percentage,
            shuffle_questions: ruleForm.shuffle_questions,
            shuffle_options: ruleForm.shuffle_options,
            show_results_immediately: ruleForm.show_results_immediately,
            allow_review: ruleForm.allow_review,
            proctoring_enabled: ruleForm.proctoring_enabled,
        });
        resetForm();
        setIsAddOpen(false);
        if (onRuleCreated) onRuleCreated(result);
    };

    const handleUpdate = async () => {
        if (!editingRule) return;
        await updateRule.mutateAsync({
            id: editingRule,
            exam_id: ruleForm.exam_id || null,
            duration_minutes: ruleForm.duration_minutes,
            max_attempts: ruleForm.max_attempts,
            negative_marking_value: ruleForm.negative_marking_value,
            passing_percentage: ruleForm.passing_percentage,
            shuffle_questions: ruleForm.shuffle_questions,
            shuffle_options: ruleForm.shuffle_options,
            show_results_immediately: ruleForm.show_results_immediately,
            allow_review: ruleForm.allow_review,
            proctoring_enabled: ruleForm.proctoring_enabled,
        });
        setEditingRule(null);
        resetForm();
    };

    const openEdit = (rule: typeof rules[0]) => {
        setEditingRule(rule.id);
        setRuleForm({
            exam_id: rule.exam_id,
            duration_minutes: rule.duration_minutes,
            max_attempts: rule.max_attempts,
            negative_marking_value: rule.negative_marking_value,
            passing_percentage: rule.passing_percentage,
            shuffle_questions: rule.shuffle_questions,
            shuffle_options: rule.shuffle_options,
            show_results_immediately: rule.show_results_immediately,
            allow_review: rule.allow_review,
            proctoring_enabled: rule.proctoring_enabled,
        });
    };

    const getExamTitle = (examId: string | null) => {
        if (!examId) return 'Global (All Exams)';
        const exam = exams.find(e => e.id === examId);
        return exam?.title || `Exam #${examId.slice(0, 8)}`;
    };

    // Stats
    const globalRules = rules.filter(r => !r.exam_id);
    const examSpecificRules = rules.filter(r => r.exam_id);
    const proctoringEnabled = rules.filter(r => r.proctoring_enabled);

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading exam rules...</div>;
    }

    const RuleFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
            {/* Exam Selection */}
            <div className="space-y-2">
                <Label>Apply To</Label>
                <Select
                    value={ruleForm.exam_id || 'global'}
                    onValueChange={(value) => setRuleForm({ ...ruleForm, exam_id: value === 'global' ? null : value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select exam or global" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="global">🌐 Global (All Exams)</SelectItem>
                        {exams.map((exam) => (
                            <SelectItem key={exam.id} value={exam.id}>
                                📝 {exam.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Global rules apply to all exams unless overridden by exam-specific rules
                </p>
            </div>

            {/* Duration & Attempts */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Duration (minutes)
                    </Label>
                    <Input
                        type="number"
                        min={5}
                        max={360}
                        value={ruleForm.duration_minutes}
                        onChange={(e) => setRuleForm({ ...ruleForm, duration_minutes: parseInt(e.target.value) || 60 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        Max Attempts
                    </Label>
                    <Input
                        type="number"
                        min={1}
                        max={10}
                        value={ruleForm.max_attempts}
                        onChange={(e) => setRuleForm({ ...ruleForm, max_attempts: parseInt(e.target.value) || 1 })}
                    />
                </div>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Negative Marking
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        max={5}
                        step={0.25}
                        value={ruleForm.negative_marking_value}
                        onChange={(e) => setRuleForm({ ...ruleForm, negative_marking_value: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Points deducted per wrong answer (0 = no penalty)
                    </p>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <BookCheck className="h-4 w-4 text-green-500" />
                        Passing Percentage
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={ruleForm.passing_percentage}
                        onChange={(e) => setRuleForm({ ...ruleForm, passing_percentage: parseInt(e.target.value) || 40 })}
                    />
                </div>
            </div>

            {/* Toggle Settings */}
            <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium text-sm">Exam Behavior</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <Shuffle className="h-4 w-4 text-muted-foreground" />
                            Shuffle Questions
                        </Label>
                        <Switch
                            checked={ruleForm.shuffle_questions}
                            onCheckedChange={(checked) => setRuleForm({ ...ruleForm, shuffle_questions: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <Shuffle className="h-4 w-4 text-muted-foreground" />
                            Shuffle Options
                        </Label>
                        <Switch
                            checked={ruleForm.shuffle_options}
                            onCheckedChange={(checked) => setRuleForm({ ...ruleForm, shuffle_options: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Show Results Immediately
                        </Label>
                        <Switch
                            checked={ruleForm.show_results_immediately}
                            onCheckedChange={(checked) => setRuleForm({ ...ruleForm, show_results_immediately: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <BookCheck className="h-4 w-4 text-muted-foreground" />
                            Allow Review After Submission
                        </Label>
                        <Switch
                            checked={ruleForm.allow_review}
                            onCheckedChange={(checked) => setRuleForm({ ...ruleForm, allow_review: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4 text-red-500" />
                            Enable Proctoring
                        </Label>
                        <Switch
                            checked={ruleForm.proctoring_enabled}
                            onCheckedChange={(checked) => setRuleForm({ ...ruleForm, proctoring_enabled: checked })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Exam Rules Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure duration, negative marking, attempts & behavior</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => resetForm()}>
                            <Plus className="h-4 w-4" />
                            Create Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Exam Rule</DialogTitle>
                            <DialogDescription>Define rules for a specific exam or all exams globally</DialogDescription>
                        </DialogHeader>
                        <RuleFormContent />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createRule.isPending}>
                                {createRule.isPending ? 'Creating...' : 'Create Rule'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rules.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Global Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{globalRules.length}</div>
                        <p className="text-xs text-muted-foreground">apply to all exams</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Exam-Specific</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{examSpecificRules.length}</div>
                        <p className="text-xs text-muted-foreground">override global</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Proctoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{proctoringEnabled.length}</div>
                        <p className="text-xs text-muted-foreground">proctoring enabled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rules List */}
            {!hideList && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-primary" />
                        Configured Rules
                    </CardTitle>
                    <CardDescription>Each rule defines behavior settings for exam(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    {rules.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No exam rules configured</p>
                            <p className="text-sm">Create global or exam-specific rules to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rules.map((rule) => (
                                <div key={rule.id} className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${rule.exam_id ? 'bg-green-100 dark:bg-green-950/40' : 'bg-blue-100 dark:bg-blue-950/40'
                                                }`}>
                                                {rule.exam_id ? (
                                                    <Gavel className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Settings className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{getExamTitle(rule.exam_id)}</h4>
                                                <Badge variant={rule.exam_id ? 'default' : 'secondary'} className="text-xs">
                                                    {rule.exam_id ? 'Exam-Specific' : 'Global'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(rule)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteRule.mutate(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">{rule.duration_minutes}m</p>
                                                <p className="text-xs text-muted-foreground">Duration</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">{rule.max_attempts}</p>
                                                <p className="text-xs text-muted-foreground">Attempts</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${rule.negative_marking_value > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                            <div>
                                                <p className="font-medium">{rule.negative_marking_value > 0 ? `-${rule.negative_marking_value}` : 'None'}</p>
                                                <p className="text-xs text-muted-foreground">Neg. Mark</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <BookCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">{rule.passing_percentage}%</p>
                                                <p className="text-xs text-muted-foreground">Pass %</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <Shield className={`h-4 w-4 flex-shrink-0 ${rule.proctoring_enabled ? 'text-red-500' : 'text-muted-foreground'}`} />
                                            <div>
                                                <p className="font-medium">{rule.proctoring_enabled ? 'On' : 'Off'}</p>
                                                <p className="text-xs text-muted-foreground">Proctor</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {rule.shuffle_questions && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Shuffle className="h-3 w-3" /> Shuffle Q
                                            </Badge>
                                        )}
                                        {rule.shuffle_options && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Shuffle className="h-3 w-3" /> Shuffle Opt
                                            </Badge>
                                        )}
                                        {rule.show_results_immediately && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Eye className="h-3 w-3" /> Instant Results
                                            </Badge>
                                        )}
                                        {rule.allow_review && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <BookCheck className="h-3 w-3" /> Review
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Exam Rule</DialogTitle>
                        <DialogDescription>Update the rule configuration</DialogDescription>
                    </DialogHeader>
                    <RuleFormContent isEdit />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingRule(null)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updateRule.isPending}>
                            {updateRule.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
