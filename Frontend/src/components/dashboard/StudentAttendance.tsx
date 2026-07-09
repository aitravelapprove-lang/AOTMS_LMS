import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Fingerprint,
    CalendarDays,
    CheckCircle2,
    Clock,
    Activity,
    TrendingUp,
    X,
    CalendarCheck,
    Wifi,
    History as HistoryIcon,
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
 
// Utility to format time to 12h format
const formatTime = (timeStr: string) => {
    if (!timeStr) return '—';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch {
        return timeStr;
    }
};

interface AttendanceRecord {
    id: string;
    user_id: string;
    timestamp: string;
    ip_address: string;
    day: string;
    time: string;
    date: string;
}

const MONTH_OPTIONS = [
    { label: 'All Months', value: 'all' },
    { label: 'January',    value: '01' },
    { label: 'February',   value: '02' },
    { label: 'March',      value: '03' },
    { label: 'April',      value: '04' },
    { label: 'May',        value: '05' },
    { label: 'June',       value: '06' },
    { label: 'July',       value: '07' },
    { label: 'August',     value: '08' },
    { label: 'September',  value: '09' },
    { label: 'October',    value: '10' },
    { label: 'November',   value: '11' },
    { label: 'December',   value: '12' },
];

const DAY_OPTIONS = [
    { label: 'All Days', value: 'all' },
    { label: 'Monday',    value: 'MON' },
    { label: 'Tuesday',   value: 'TUE' },
    { label: 'Wednesday', value: 'WED' },
    { label: 'Thursday',  value: 'THU' },
    { label: 'Friday',    value: 'FRI' },
    { label: 'Saturday',  value: 'SAT' },
    { label: 'Sunday',    value: 'SUN' },
];

export function StudentAttendance() {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
        queryKey: ['student-attendance', user?.id],
        queryFn: async () => {
            const data = await fetchWithAuth('/student/my-attendance') as AttendanceRecord[];
            return data;
        },
        enabled: !!user?.id,
    });

    // ── Filtered list ────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return records.filter(r => {
            // Calendar date filter
            if (calendarDate) {
                try {
                    return isSameDay(parseISO(r.date), calendarDate);
                } catch { return false; }
            }
            // Month filter
            if (selectedMonth !== 'all') {
                const month = r.date?.split('-')[1];
                if (month !== selectedMonth) return false;
            }
            // Day-of-week filter
            if (selectedDay !== 'all') {
                if (r.day !== selectedDay) return false;
            }
            return true;
        });
    }, [records, selectedMonth, selectedDay, calendarDate]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const totalDays       = records.length;
    const thisMonthCount  = records.filter(r => r.date?.startsWith(format(new Date(), 'yyyy-MM'))).length;
    const presentDaysSet  = new Set(records.map(r => r.date));
    const streak          = calcStreak(records);

    const clearFilters = () => {
        setSelectedMonth('all');
        setSelectedDay('all');
        setCalendarDate(undefined);
    };

    const hasFilters = selectedMonth !== 'all' || selectedDay !== 'all' || calendarDate !== undefined;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Check-ins',    value: totalDays,       icon: Fingerprint,   color: 'text-primary',   bg: 'bg-primary/5' },
                    { label: 'This Month',          value: thisMonthCount,  icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Current Streak',      value: `${streak}d`,    icon: TrendingUp,    color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Unique Days',          value: presentDaysSet.size, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
                    >
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Month Dropdown */}
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                        <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); setCalendarDate(undefined); }}>
                            <SelectTrigger className="h-9 w-[150px] rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {MONTH_OPTIONS.map(m => (
                                    <SelectItem key={m.value} value={m.value} className="text-xs font-bold">
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Day Dropdown */}
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        <Select value={selectedDay} onValueChange={(v) => { setSelectedDay(v); setCalendarDate(undefined); }}>
                            <SelectTrigger className="h-9 w-[140px] rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                                <SelectValue placeholder="Day of Week" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {DAY_OPTIONS.map(d => (
                                    <SelectItem key={d.value} value={d.value} className="text-xs font-bold">
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Calendar Picker */}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`h-9 px-3 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold gap-2 ${calendarDate ? 'border-primary text-primary bg-primary/5' : 'text-slate-500'}`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                {calendarDate ? format(calendarDate, 'dd MMM yyyy') : 'Pick a Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl" align="start">
                            <Calendar
                                mode="single"
                                selected={calendarDate}
                                onSelect={(d) => {
                                    setCalendarDate(d);
                                    setSelectedMonth('all');
                                    setSelectedDay('all');
                                    setCalendarOpen(false);
                                }}
                                initialFocus
                                modifiers={{
                                    present: records.map(r => {
                                        try { return parseISO(r.date); } catch { return new Date(0); }
                                    })
                                }}
                                modifiersClassNames={{
                                    present: 'bg-emerald-100 text-emerald-700 font-black rounded-lg'
                                }}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="h-9 px-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}

                    {/* Result count */}
                    <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── Attendance History Header ── */}
            <div className="pt-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Activity History</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed Log of your campus presence</p>
                </div>
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                    <HistoryIcon className="h-5 w-5" />
                </div>
            </div>

            {/* ── Attendance List ── */}
            <div className="space-y-3">
                {isLoading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="h-[70px] bg-slate-50 animate-pulse rounded-2xl" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <Fingerprint className="h-12 w-12 text-slate-100 mb-4" />
                        <p className="font-black text-slate-800 uppercase tracking-widest text-sm">No Records Found</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            {hasFilters ? 'Try adjusting your filters.' : 'Mark your attendance from the dashboard.'}
                        </p>
                        {hasFilters && (
                            <Button variant="ghost" onClick={clearFilters} className="mt-4 h-8 px-4 rounded-xl text-primary font-bold text-xs">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    filtered.map((record, i) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 group hover:border-emerald-200 hover:shadow-sm transition-all"
                        >
                            {/* Day tile */}
                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{record.day}</span>
                                <span className="text-lg font-black text-slate-900 leading-tight">
                                    {record.date?.split('-')[2]}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 leading-tight">
                                    {record.date ? format(parseISO(record.date), 'EEEE, dd MMMM yyyy') : '—'}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                        <Clock className="h-3 w-3" /> {formatTime(record.time)}
                                    </span>
                                    {record.ip_address && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                            <Wifi className="h-3 w-3" /> {record.ip_address}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase px-2 h-5 rounded-md">
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Present
                                </Badge>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-slate-300" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Verified Attendance Ledger · Real-Time Sync
                </p>
            </div>
        </div>
    );
}

// ── Helper: calculate current streak ────────────────────────────────────────
function calcStreak(records: AttendanceRecord[]): number {
    if (!records.length) return 0;
    const sorted = [...records]
        .filter(r => r.date)
        .sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const r of sorted) {
        const d = new Date(r.date);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
        if (diff === 0 || diff === 1) {
            streak++;
            cursor = d;
        } else {
            break;
        }
    }
    return streak;
}
