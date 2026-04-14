import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, Mail, Phone,
  GraduationCap, Building2, Fingerprint,
  CheckCircle2, Clock, MapPin, BarChart3, BookOpen,
  Award, ChevronDown, ChevronUp, Loader2, TrendingUp,
  Star, Eye, Filter, Video, FileText, CalendarCheck,
  Cpu, Globe, RefreshCw, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

// ── Leaflet (same pattern as UserManagement.tsx) ─────────────────────────────
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;         // profile._id — used for display + cache key
  user_id?: string;   // actual user_id (for API calls)
  full_name: string | null;
  email: string | null;
  mobile_number?: string | null;
  college_name?: string | null;
  institute_name?: string | null;
  full_address?: string | null;
  city?: string | null;
  district?: string | null;
  country?: string | null;
  role?: string;
  approval_status?: string;
  is_approved?: boolean;
  avatar_url?: string | null;
  created_at?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface CourseEntry {
  course_name?: string;
  progress?: number;
  status?: string;
}

interface ResultEntry {
  title?: string;
  exam_name?: string;
  score?: number;
  total?: number;
  percentage?: number;
  date?: string;
  passed?: boolean;
}

interface PerformanceData {
  enrollments: CourseEntry[];
  results: ResultEntry[];
  github_url?: string;
  resume_url?: string;
}

interface AttendanceRecord {
  id?: string;
  date?: string;
  day?: string;
  time?: string;
  timestamp?: string;
}

interface LiveSession {
  title?: string;
  topic?: string;
  start_time?: string;
  status?: string;
  duration?: number;
}

interface ResourceData {
  title?: string;
  type?: string;
  file_url?: string;
}

interface ResumeATS {
  ats_score?: number;
  score?: number;
  job_title?: string;
  skills?: string[];
  feedback?: string;
  created_at?: string;
}

interface StudentDetail {
  performance: PerformanceData | null;
  attendance: AttendanceRecord[];
  live_sessions: LiveSession[];
  resources: ResourceData[];
  resume_ats: ResumeATS | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sv = (v: string | null | undefined) => v || "—";
const sd = (s?: string) => (s ? new Date(s).toLocaleDateString("en-GB") : "—");
const safe = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
  try { return await fn(); } catch { return null; }
};

// ─── PDF builder — 4 clean pages ─────────────────────────────────────────────

function buildPDF(profile: StudentProfile, detail: StudentDetail): string {
  const name = sv(profile.full_name);
  const email = sv(profile.email);
  const mobile = sv(profile.mobile_number);
  const college = sv(profile.college_name);
  const institute = sv(profile.institute_name);
  const joined = sd(profile.created_at);
  const status = profile.is_approved ? "Approved" : "Pending";
  const lat = profile.latitude;
  const lng = profile.longitude;

  const enrollments = detail.performance?.enrollments || [];
  const results = detail.performance?.results || [];
  const attendance = detail.attendance || [];
  const live = detail.live_sessions || [];
  const resources = detail.resources || [];
  const ats = detail.resume_ats;

  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((a, r) => {
            const pct = r.percentage ?? (r.score && r.total ? Math.round((r.score / r.total) * 100) : 0);
            return a + pct;
          }, 0) / results.length
        )
      : null;

  const atsScore = ats?.ats_score ?? ats?.score ?? null;

  const css = `
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:11px;line-height:1.5;}
    .cover{min-height:100vh;background:linear-gradient(145deg,#1e1b4b,#312e81 40%,#4338ca);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;color:#fff;text-align:center;}
    .c-logo{width:80px;height:80px;background:rgba(255,255,255,0.15);border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;margin:0 auto 28px;border:2px solid rgba(255,255,255,0.3);}
    .c-title{font-size:40px;font-weight:900;letter-spacing:-1px;margin-bottom:8px;}
    .c-sub{font-size:13px;opacity:.6;letter-spacing:4px;text-transform:uppercase;margin-bottom:44px;}
    .c-divider{width:60px;height:3px;background:rgba(255,255,255,.35);margin:0 auto 36px;border-radius:2px;}
    .c-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:32px 44px;backdrop-filter:blur(12px);}
    .c-name{font-size:26px;font-weight:900;margin-bottom:6px;}
    .c-email{font-size:12px;opacity:.7;margin-bottom:24px;}
    .c-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
    .c-chip{background:rgba(255,255,255,.15);border-radius:12px;padding:12px 16px;}
    .c-chip .v{font-size:20px;font-weight:900;}
    .c-chip .l{font-size:8px;opacity:.6;text-transform:uppercase;letter-spacing:2px;margin-top:2px;}
    .c-foot{margin-top:36px;font-size:9px;opacity:.4;}
    .page{padding:40px 48px;page-break-before:always;}
    .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #e2e8f0;padding-bottom:14px;margin-bottom:24px;}
    .ph-title{font-size:20px;font-weight:900;color:#1e293b;}
    .ph-sub{font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:2px;}
    .ph-badge{background:#eef2ff;color:#4338ca;padding:4px 14px;border-radius:20px;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:2px;}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
    .stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;}
    .stat .v{font-size:22px;font-weight:900;color:#4338ca;}
    .stat .l{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-top:2px;}
    .sec{margin-bottom:22px;}
    .sec-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#6366f1;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
    .sec-title::before{content:'';display:inline-block;width:3px;height:11px;background:#6366f1;border-radius:2px;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .info-item{background:#f8fafc;border-radius:8px;padding:9px 12px;border:1px solid #e2e8f0;}
    .info-item .lbl{font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:2px;}
    .info-item .val{font-size:11px;font-weight:700;color:#1e293b;}
    .info-item .val.mono{font-family:'Courier New',monospace;font-size:9px;}
    table{width:100%;border-collapse:collapse;}
    thead th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;border-bottom:2px solid #e2e8f0;}
    tbody td{padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:10px;color:#374151;vertical-align:top;}
    tbody tr:nth-child(even) td{background:#fafafa;}
    .pb{height:5px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-top:3px;}
    .pf{height:100%;border-radius:4px;}
    .bj{display:inline-block;padding:2px 8px;border-radius:20px;font-size:7px;font-weight:900;text-transform:uppercase;}
    .bg{background:#f0fdf4;color:#16a34a;}
    .ba{background:#fffbeb;color:#d97706;}
    .br{background:#fff1f2;color:#e11d48;}
    .bb{background:#eff6ff;color:#2563eb;}
    .map-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;display:flex;align-items:center;gap:14px;}
    .map-pin{width:36px;height:36px;background:#3b82f6;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .empty{background:#f8fafc;border:1px dashed #e2e8f0;border-radius:10px;padding:18px;text-align:center;color:#94a3b8;font-size:10px;font-weight:700;}
    .ats-box{background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:2px solid #bbf7d0;border-radius:14px;padding:20px;display:flex;align-items:center;gap:20px;}
    .ats-score{width:72px;height:72px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;border:4px solid;flex-shrink:0;}
    .ats-score .sv{font-size:24px;}
    .ats-score .sl{font-size:8px;opacity:.7;}
    .foot{text-align:center;font-size:8px;color:#94a3b8;border-top:1px solid #f1f5f9;margin-top:28px;padding-top:12px;}
    @media print{.cover,.page{-webkit-print-color-adjust:exact;print-color-adjust:exact;}thead th{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.stat{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.ats-box{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  `;

  const enrollRows = enrollments
    .map(e => {
      const p = e.progress ?? 0;
      const pc = p >= 75 ? "#22c55e" : p >= 40 ? "#f59e0b" : "#6366f1";
      return `<tr><td><strong>${sv(e.course_name)}</strong></td><td><span class="bj ${e.status === "active" ? "bg" : "ba"}">${e.status || "—"}</span></td><td>${p}%<div class="pb"><div class="pf" style="width:${p}%;background:${pc};"></div></div></td></tr>`;
    })
    .join("");

  const examRows = results
    .map(r => {
      const pct = r.percentage ?? (r.score && r.total ? Math.round((r.score / r.total) * 100) : null);
      const pass = pct !== null && pct >= 60;
      return `<tr><td><strong>${sv(r.title || r.exam_name)}</strong></td><td>${r.score ?? "—"}/${r.total ?? "—"}</td><td>${pct !== null ? pct + "%" : "—"}${pct !== null ? `<div class="pb"><div class="pf" style="width:${pct}%;background:${pass ? "#22c55e" : "#f43f5e"};"></div></div>` : ""}</td><td><span class="bj ${pass ? "bg" : "br"}">${pass ? "Passed" : "Failed"}</span></td><td style="font-size:9px;color:#94a3b8;">${sd(r.date)}</td></tr>`;
    })
    .join("");

  const attRows = attendance
    .map(a => `<tr><td>${sd(a.date || a.timestamp)}</td><td>${a.day || "—"}</td><td>${a.time || "—"}</td><td><span class="bj bg">Present</span></td></tr>`)
    .join("");

  const liveRows = live
    .map(l => `<tr><td><strong>${sv(l.title || l.topic)}</strong></td><td><span class="bj ${l.status === "live" ? "br" : l.status === "ended" ? "bb" : "ba"}">${l.status || "scheduled"}</span></td><td style="color:#94a3b8;font-size:9px;">${sd(l.start_time)}</td><td>${l.duration ? l.duration + " min" : "—"}</td></tr>`)
    .join("");

  const resRows = resources
    .map(r => `<tr><td><strong>${sv(r.title)}</strong></td><td>${r.type ? `<span class="bj bb">${r.type}</span>` : "—"}</td></tr>`)
    .join("");

  const atsColor = atsScore !== null ? (atsScore >= 70 ? "#16a34a" : atsScore >= 50 ? "#d97706" : "#dc2626") : "#94a3b8";
  const atsBg = atsScore !== null ? (atsScore >= 70 ? "#dcfce7" : atsScore >= 50 ? "#fef3c7" : "#fee2e2") : "#f1f5f9";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Report — ${name}</title><style>${css}</style></head><body>

<!-- PAGE 1: COVER -->
<div class="cover">
  <div class="c-logo">${name[0] || "S"}</div>
  <div class="c-title">Student Report</div>
  <div class="c-sub">AOTMS — Academy of Tech Masters</div>
  <div class="c-divider"></div>
  <div class="c-card">
    <div class="c-name">${name}</div>
    <div class="c-email">${email} &nbsp;•&nbsp; ${mobile}</div>
    <div class="c-grid">
      <div class="c-chip"><div class="v">${status}</div><div class="l">Status</div></div>
      <div class="c-chip"><div class="v">${enrollments.length}</div><div class="l">Courses</div></div>
      <div class="c-chip"><div class="v">${avgScore !== null ? avgScore + "%" : "—"}</div><div class="l">Avg Score</div></div>
      <div class="c-chip"><div class="v">${results.length}</div><div class="l">Exams</div></div>
      <div class="c-chip"><div class="v">${attendance.length}</div><div class="l">Attendance</div></div>
      <div class="c-chip"><div class="v">${atsScore !== null ? atsScore + "/100" : "—"}</div><div class="l">ATS Score</div></div>
    </div>
  </div>
  <div class="c-foot">Confidential &nbsp;|&nbsp; ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; AOTMS Admin Panel</div>
</div>

<!-- PAGE 2: Identity + Location + Courses -->
<div class="page">
  <div class="ph">
    <div><div class="ph-title">Identity &amp; Courses</div><div class="ph-sub">Page 2 of 4 &nbsp;•&nbsp; Profile Details &amp; Enrollment</div></div>
    <div class="ph-badge">AOTMS</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="v">${enrollments.length}</div><div class="l">Enrolled</div></div>
    <div class="stat"><div class="v">${results.length}</div><div class="l">Exams Done</div></div>
    <div class="stat"><div class="v">${attendance.length}</div><div class="l">Attendance</div></div>
    <div class="stat"><div class="v">${atsScore ?? "—"}</div><div class="l">ATS Score</div></div>
  </div>
  <div class="sec">
    <div class="sec-title">Personal Information</div>
    <div class="info-grid">
      <div class="info-item"><div class="lbl">Full Name</div><div class="val">${name}</div></div>
      <div class="info-item"><div class="lbl">Email</div><div class="val">${email}</div></div>
      <div class="info-item"><div class="lbl">Mobile</div><div class="val">${mobile}</div></div>
      <div class="info-item"><div class="lbl">College</div><div class="val">${college}</div></div>
      <div class="info-item"><div class="lbl">Institute</div><div class="val">${institute}</div></div>
      <div class="info-item"><div class="lbl">Status</div><div class="val"><span class="bj ${status === "Approved" ? "bg" : "ba"}">${status}</span></div></div>
      <div class="info-item"><div class="lbl">Joined</div><div class="val">${joined}</div></div>
      <div class="info-item"><div class="lbl">UUID</div><div class="val mono">${profile.id}</div></div>
    </div>
  </div>
  <div class="sec">
    <div class="sec-title">Registration Location</div>
    ${lat && lng
      ? `<div class="map-box"><div class="map-pin"><svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div><div><div style="font-size:12px;font-weight:800;color:#1e40af;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div><div style="font-size:9px;color:#3b82f6;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:3px;">GPS Coordinates Captured</div></div></div>`
      : `<div class="empty">📍 No GPS location data recorded</div>`}
  </div>
  <div class="sec">
    <div class="sec-title">Enrolled Courses (${enrollments.length})</div>
    ${enrollments.length > 0
      ? `<table><thead><tr><th>Course</th><th>Status</th><th>Progress</th></tr></thead><tbody>${enrollRows}</tbody></table>`
      : `<div class="empty">📚 No courses enrolled yet</div>`}
  </div>
  <div class="foot">AOTMS — ${name} &nbsp;|&nbsp; Page 2</div>
</div>

<!-- PAGE 3: Exams + Attendance -->
<div class="page">
  <div class="ph">
    <div><div class="ph-title">Academics</div><div class="ph-sub">Page 3 of 4 &nbsp;•&nbsp; Exam Results &amp; Attendance</div></div>
    <div class="ph-badge">AOTMS</div>
  </div>
  <div class="sec">
    <div class="sec-title">Exam Results (${results.length})${avgScore !== null ? `  —  Avg ${avgScore}%` : ""}</div>
    ${results.length > 0
      ? `<table><thead><tr><th>Exam / Assessment</th><th>Score</th><th>Percentage</th><th>Result</th><th>Date</th></tr></thead><tbody>${examRows}</tbody></table>`
      : `<div class="empty">📝 No exam records found</div>`}
  </div>
  <div class="sec">
    <div class="sec-title">Attendance Log (${attendance.length} days present)</div>
    ${attendance.length > 0
      ? `<table><thead><tr><th>Date</th><th>Day</th><th>Time</th><th>Status</th></tr></thead><tbody>${attRows}</tbody></table>`
      : `<div class="empty">📅 No attendance records found</div>`}
  </div>
  <div class="foot">AOTMS — ${name} &nbsp;|&nbsp; Page 3</div>
</div>

<!-- PAGE 4: Live + Resources + ATS -->
<div class="page">
  <div class="ph">
    <div><div class="ph-title">Activity &amp; ATS</div><div class="ph-sub">Page 4 of 4 &nbsp;•&nbsp; Sessions, Resources &amp; Resume ATS</div></div>
    <div class="ph-badge">AOTMS</div>
  </div>
  <div class="sec">
    <div class="sec-title">Live Sessions (${live.length})</div>
    ${live.length > 0
      ? `<table><thead><tr><th>Session</th><th>Status</th><th>Date</th><th>Duration</th></tr></thead><tbody>${liveRows}</tbody></table>`
      : `<div class="empty">📹 No live session records</div>`}
  </div>
  <div class="sec">
    <div class="sec-title">Resources (${resources.length})</div>
    ${resources.length > 0
      ? `<table><thead><tr><th>Resource</th><th>Type</th></tr></thead><tbody>${resRows}</tbody></table>`
      : `<div class="empty">📁 No resources found</div>`}
  </div>
  <div class="sec">
    <div class="sec-title">Resume ATS Analysis</div>
    ${ats
      ? `<div class="ats-box">
          <div class="ats-score" style="background:${atsBg};border-color:${atsColor};color:${atsColor};">
            <div class="sv">${atsScore ?? "—"}</div><div class="sl">/100</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:900;color:${atsColor};margin-bottom:5px;">${atsScore !== null ? (atsScore >= 70 ? "Strong Profile" : atsScore >= 50 ? "Moderate" : "Needs Work") : "—"}</div>
            ${ats.job_title ? `<div style="font-size:10px;color:#64748b;margin-bottom:6px;">Target: <strong>${ats.job_title}</strong></div>` : ""}
            ${ats.skills?.length ? `<div style="font-size:9px;color:#64748b;">Skills: <strong>${ats.skills.slice(0,8).join(", ")}</strong></div>` : ""}
            ${ats.feedback ? `<div style="font-size:9px;color:#64748b;font-style:italic;margin-top:5px;">${ats.feedback}</div>` : ""}
          </div>
        </div>`
      : `<div class="empty">🤖 No resume ATS scan found</div>`}
  </div>
  <div class="foot"><strong>AOTMS — Academy of Tech Masters</strong><br/>Confidential Student Report &nbsp;|&nbsp; ${name} &nbsp;|&nbsp; ${new Date().toLocaleString("en-IN")}</div>
</div>

</body></html>`;
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function Sec({
  icon: I, title, color, count, children, empty,
}: {
  icon: React.ElementType; title: string;
  color: string; count?: number;
  children?: React.ReactNode; empty: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${color}`}>
          <I className="h-3 w-3" /> {title}
        </span>
        {count !== undefined && (
          <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-black px-2">{count}</Badge>
        )}
      </div>
      {count === 0
        ? <div className="py-5 text-center">
            <I className="h-7 w-7 text-slate-100 mx-auto mb-1" />
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{empty}</p>
          </div>
        : children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StudentPerformance() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fCollege, setFCollege] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, StudentDetail>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => { loadStudents(); }, []);

  // ── Load profiles + merge user_id ────────────────────────────────────────────
  const loadStudents = async () => {
    setLoading(true);
    try {
      const [profilesData, rolesData] = await Promise.all([
        fetchWithAuth<StudentProfile[]>("/data/profiles?sort=created_at&order=desc&limit=500"),
        fetchWithAuth<{ user_id: string; role: string }[]>("/data/user_roles?limit=1000"),
      ]);
      const rolesMap: Record<string, string> = {};
      (rolesData || []).forEach(r => { rolesMap[r.user_id] = r.role; });

      // profiles: id = profile._id, user_id = actual user ID stored in profile.user_id
      const merged = (profilesData || []).map(p => ({
        ...p,
        role: rolesMap[p.user_id || p.id] || "student",
        is_approved: p.approval_status === "approved",
      }));
      setStudents(merged);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch all detail — use user_id (not profile id) for backend calls ─────────
  const fetchDetail = async (profile: StudentProfile): Promise<StudentDetail> => {
    if (detailCache[profile.id]) return detailCache[profile.id];

    // The /admin/student-performance/:id uses profile.id (profile._id)
    // because in UserManagement.tsx they also pass selectedUser.id
    const uid = profile.id;

    const [perfRaw, attendanceRaw, liveRaw, resourcesRaw, atsRaw] = await Promise.all([
      safe(() => fetchWithAuth<PerformanceData>(`/admin/student-performance/${uid}`)),
      safe(() => fetchWithAuth<AttendanceRecord[]>(`/admin/attendance/${uid}`)),
      safe(() => fetchWithAuth<LiveSession[]>(`/data/live_classes?limit=50`)),
      safe(() => fetchWithAuth<ResourceData[]>(`/data/course_resources?limit=50`)),
      safe(() => fetchWithAuth<ResumeATS[]>(`/data/resumescans?user_id=${uid}&limit=1`)),
    ]);

    const detail: StudentDetail = {
      performance: perfRaw,
      attendance: attendanceRaw || [],
      live_sessions: liveRaw || [],
      resources: resourcesRaw || [],
      resume_ats: Array.isArray(atsRaw) && atsRaw.length > 0 ? atsRaw[0] : null,
    };
    setDetailCache(prev => ({ ...prev, [profile.id]: detail }));
    return detail;
  };

  const toggleExpand = async (p: StudentProfile) => {
    if (expandedId === p.id) { setExpandedId(null); return; }
    setExpandedId(p.id);
    if (!detailCache[p.id]) {
      setLoadingId(p.id);
      await fetchDetail(p).catch(() => {});
      setLoadingId(null);
    }
  };

  const downloadPdf = async (e: React.MouseEvent, profile: StudentProfile) => {
    e.stopPropagation();
    setDownloadingId(profile.id);
    try {
      const detail = await fetchDetail(profile);
      const html = buildPDF(profile, detail);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank");
      if (w) w.onload = () => setTimeout(() => w.print(), 700);
      toast.success(`Report ready — ${profile.full_name}`);
    } catch {
      toast.error("PDF failed");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────
  const uniqueColleges = Array.from(
    new Set(students.map(s => sv(s.college_name)).filter(v => v !== "—"))
  ).sort();

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.mobile_number || "").includes(q);
    const matchStatus =
      fStatus === "all" || (fStatus === "approved" ? s.is_approved : !s.is_approved);
    const matchCollege = fCollege === "all" || sv(s.college_name) === fCollege;
    return matchSearch && matchStatus && matchCollege;
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">Student Performance</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Map · Courses · Exams · Attendance · Live · Resources · ATS
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadStudents}
          className="h-10 rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: students.length, icon: Users, bg: "bg-indigo-50", c: "text-indigo-600" },
          { label: "Approved", value: students.filter(s => s.is_approved).length, icon: CheckCircle2, bg: "bg-emerald-50", c: "text-emerald-600" },
          { label: "Pending", value: students.filter(s => !s.is_approved).length, icon: Clock, bg: "bg-amber-50", c: "text-amber-600" },
          { label: "Filtered", value: filtered.length, icon: Filter, bg: "bg-violet-50", c: "text-violet-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-2xl bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.c}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{loading ? "…" : s.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search name, email, UUID, mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-11 bg-white border-none shadow-xl shadow-slate-200/30 rounded-2xl font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="h-11 w-40 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/20 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fCollege} onValueChange={setFCollege}>
          <SelectTrigger className="h-11 w-52 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/20 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl max-h-60">
            <SelectItem value="all">All Colleges</SelectItem>
            {uniqueColleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Student List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Student Directory
            <Badge className="ml-auto bg-indigo-100 text-indigo-700 border-none font-black text-[10px]">
              {filtered.length} records
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No students found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50/80">
              <AnimatePresence>
                {filtered.map((stu, idx) => {
                  const isExp = expandedId === stu.id;
                  const detail = detailCache[stu.id];
                  const isDown = downloadingId === stu.id;
                  const isLoadingThis = loadingId === stu.id;

                  const enrollments = detail?.performance?.enrollments || [];
                  const results = detail?.performance?.results || [];
                  const attendance = detail?.attendance || [];

                  return (
                    <motion.div
                      key={stu.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx, 15) * 0.02 }}
                    >
                      {/* ── Row ── */}
                      <div
                        className={`flex items-center gap-3 px-5 py-4 cursor-pointer group transition-colors ${isExp ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}
                        onClick={() => toggleExpand(stu)}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-11 w-11 rounded-xl border-2 border-white shadow-md">
                            <AvatarImage src={stu.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-black text-sm rounded-xl">
                              {stu.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${stu.is_approved ? "bg-emerald-500" : "bg-amber-400"}`} />
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors truncate">
                            {stu.full_name || "—"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 truncate">
                              <Mail className="h-2.5 w-2.5" />{stu.email}
                            </span>
                            {stu.mobile_number && (
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5" />{stu.mobile_number}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chips */}
                        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                          {stu.college_name && (
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg">
                              <GraduationCap className="h-2.5 w-2.5 text-blue-500" />
                              <span className="text-[8px] font-black text-blue-600 max-w-[100px] truncate">{stu.college_name}</span>
                            </div>
                          )}
                          <Badge className={`text-[8px] font-black border-none px-2 py-0.5 rounded-full ${stu.is_approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {stu.is_approved ? "Approved" : "Pending"}
                          </Badge>
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                            <Fingerprint className="h-2.5 w-2.5 text-slate-400" />
                            <span className="font-mono text-[8px] text-slate-500">{stu.id.slice(0, 8)}…</span>
                          </div>
                        </div>

                        {/* Download + Chevron */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={e => downloadPdf(e, stu)}
                            disabled={isDown}
                            className="h-9 w-9 p-0 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border-none shadow-sm transition-all"
                            title="Download PDF"
                          >
                            {isDown ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          </Button>
                          {isLoadingThis
                            ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                            : isExp
                              ? <ChevronUp className="h-5 w-5 text-indigo-500" />
                              : <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          }
                        </div>
                      </div>

                      {/* ── Expanded Panel ── */}
                      <AnimatePresence>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-7 pt-3 bg-gradient-to-br from-indigo-50/30 to-violet-50/20 border-t border-indigo-100/40">
                              {isLoadingThis ? (
                                <div className="flex items-center justify-center gap-3 py-10">
                                  <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching all data…</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">

                                  {/* 1. Personal Info */}
                                  <Sec icon={Eye} title="Personal Info" color="text-slate-500" empty="">
                                    <div className="space-y-1.5">
                                      {[
                                        { l: "Full Name", v: stu.full_name, icon: Users },
                                        { l: "Email", v: stu.email, icon: Mail },
                                        { l: "Mobile", v: stu.mobile_number, icon: Phone },
                                        { l: "College", v: stu.college_name, icon: GraduationCap },
                                        { l: "Institute", v: stu.institute_name, icon: Building2 },
                                        { l: "Joined", v: sd(stu.created_at), icon: Clock },
                                        { l: "UUID", v: stu.id, icon: Fingerprint, mono: true },
                                      ].map(item => (
                                        <div key={item.l} className="flex items-start gap-2">
                                          <item.icon className="h-3 w-3 text-slate-300 mt-0.5 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{item.l}</p>
                                            <p className={`text-[11px] font-bold text-slate-700 break-all ${(item as { mono?: boolean }).mono ? "font-mono text-[9px]" : ""}`}>
                                              {sv(item.v)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Sec>

                                  {/* 2. Leaflet Map */}
                                  <Sec icon={MapPin} title="Location Map" color="text-blue-500" count={stu.latitude && stu.longitude ? 1 : 0} empty="No GPS data recorded">
                                    {stu.latitude && stu.longitude && (
                                      <div className="space-y-2">
                                        {/* ──── LEAFLET MapContainer (same as UserManagement.tsx) ──── */}
                                        <div className="h-[150px] w-full rounded-xl overflow-hidden border-2 border-slate-100 shadow-inner relative z-0">
                                          <MapContainer
                                            center={[stu.latitude, stu.longitude]}
                                            zoom={13}
                                            scrollWheelZoom={false}
                                            className="h-full w-full"
                                          >
                                            <TileLayer
                                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[stu.latitude, stu.longitude]}>
                                              <Popup>
                                                <div className="text-xs font-bold">
                                                  {stu.full_name}'s Location<br />
                                                  <span className="text-[10px] font-normal text-slate-500">{stu.full_address}</span>
                                                </div>
                                              </Popup>
                                            </Marker>
                                          </MapContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Latitude</p>
                                            <p className="text-[11px] font-bold text-slate-700">{stu.latitude.toFixed(6)}</p>
                                          </div>
                                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Longitude</p>
                                            <p className="text-[11px] font-bold text-slate-700">{stu.longitude.toFixed(6)}</p>
                                          </div>
                                        </div>
                                        <a
                                          href={`https://maps.google.com/?q=${stu.latitude},${stu.longitude}`}
                                          target="_blank" rel="noreferrer"
                                          onClick={e => e.stopPropagation()}
                                          className="text-[9px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest flex items-center justify-center gap-1"
                                        >
                                          <Globe className="h-3 w-3" /> Open in Google Maps →
                                        </a>
                                      </div>
                                    )}
                                  </Sec>

                                  {/* 3. Enrolled Courses */}
                                  <Sec icon={BookOpen} title="Enrolled Courses" color="text-cyan-500" count={enrollments.length} empty="No courses enrolled">
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                      {enrollments.map((e, i) => {
                                        const prog = e.progress ?? 0;
                                        return (
                                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-1">
                                              <p className="text-[11px] font-black text-slate-800 truncate flex-1">{sv(e.course_name)}</p>
                                              <Badge className={`text-[7px] font-black border-none ml-1 ${e.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                {e.status || "—"}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${prog}%` }} />
                                              </div>
                                              <span className="text-[9px] font-black text-cyan-600 w-8 text-right">{prog}%</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </Sec>

                                  {/* 4. Exam Results */}
                                  <Sec icon={Award} title="Exam Results" color="text-violet-500" count={results.length} empty="No exam records">
                                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                                      {results.map((r, i) => {
                                        const pct = r.percentage ?? (r.score && r.total ? Math.round((r.score / r.total) * 100) : null);
                                        const pass = pct !== null && pct >= 60;
                                        return (
                                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-1">
                                              <p className="text-[11px] font-black text-slate-800 truncate flex-1">{sv(r.title || r.exam_name)}</p>
                                              {r.score !== undefined && r.total !== undefined && (
                                                <span className="text-[9px] font-bold text-slate-500 ml-2 flex-shrink-0">{r.score}/{r.total}</span>
                                              )}
                                            </div>
                                            {pct !== null && (
                                              <>
                                                <div className="flex items-center gap-2">
                                                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${pass ? "bg-emerald-500" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
                                                  </div>
                                                  <span className={`text-[10px] font-black w-8 text-right flex-shrink-0 ${pass ? "text-emerald-600" : "text-rose-500"}`}>{pct}%</span>
                                                </div>
                                              </>
                                            )}
                                            <div className="flex items-center justify-between mt-1">
                                              <span className="text-[8px] text-slate-400">{sd(r.date)}</span>
                                              <Badge className={`text-[7px] font-black border-none ${pass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                                {pass ? "✓ Passed" : "✗ Failed"}
                                              </Badge>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </Sec>

                                  {/* 5. Attendance */}
                                  <Sec icon={CalendarCheck} title="Attendance" color="text-emerald-500" count={attendance.length} empty="No attendance records">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center font-black text-sm text-emerald-700 shadow-sm flex-shrink-0">
                                          {attendance.length}
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-black text-emerald-800">Days Present</p>
                                          <p className="text-[9px] text-emerald-600">Total Attendance</p>
                                        </div>
                                      </div>
                                      <div className="space-y-1 max-h-[140px] overflow-y-auto">
                                        {attendance.slice(0, 20).map((a, i) => (
                                          <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-bold text-slate-600">{sd(a.date || a.timestamp)}</span>
                                              {a.day && <span className="text-[8px] text-slate-400">{a.day}</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              {a.time && <span className="text-[8px] text-slate-400">{a.time}</span>}
                                              <Badge className="text-[7px] font-black border-none bg-emerald-50 text-emerald-600">Present</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </Sec>

                                  {/* 6. Live Sessions */}
                                  <Sec icon={Video} title="Live Sessions" color="text-pink-500" count={detail?.live_sessions?.length ?? 0} empty="No live sessions">
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                      {detail?.live_sessions?.map((l, i) => (
                                        <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${l.status === "live" ? "bg-rose-100" : "bg-slate-100"}`}>
                                            <Video className={`h-3.5 w-3.5 ${l.status === "live" ? "text-rose-500" : "text-slate-400"}`} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-slate-800 truncate">{sv(l.title || l.topic)}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <Badge className={`text-[7px] font-black border-none ${l.status === "live" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>{l.status || "—"}</Badge>
                                              <span className="text-[8px] text-slate-400">{sd(l.start_time)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Sec>

                                  {/* 7. Resources */}
                                  <Sec icon={FileText} title="Resources" color="text-orange-500" count={detail?.resources?.length ?? 0} empty="No resources found">
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                      {detail?.resources?.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                          <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-3.5 w-3.5 text-orange-500" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-slate-800 truncate">{sv(r.title)}</p>
                                            {r.type && <Badge className="text-[7px] font-black border-none bg-orange-50 text-orange-600">{r.type}</Badge>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Sec>

                                  {/* 8. Resume ATS */}
                                  <Sec icon={Cpu} title="Resume ATS Score" color="text-teal-500" count={detail?.resume_ats ? 1 : 0} empty="No resume scan found">
                                    {detail?.resume_ats && (() => {
                                      const ats = detail.resume_ats;
                                      const score = ats.ats_score ?? ats.score ?? 0;
                                      const good = score >= 70;
                                      const mid = score >= 50;
                                      return (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 ${good ? "bg-emerald-100 text-emerald-700" : mid ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                              <span className="text-xl">{score}</span>
                                              <span className="text-[8px] opacity-70">/100</span>
                                            </div>
                                            <div className="flex-1">
                                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                                                <div className={`h-full rounded-full ${good ? "bg-emerald-500" : mid ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${score}%` }} />
                                              </div>
                                              {ats.job_title && <p className="text-[10px] font-bold text-slate-600 truncate">{ats.job_title}</p>}
                                            </div>
                                          </div>
                                          {ats.skills && ats.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {ats.skills.slice(0, 8).map((sk, si) => (
                                                <Badge key={si} className="text-[7px] font-black bg-teal-50 text-teal-700 border-none">{sk}</Badge>
                                              ))}
                                            </div>
                                          )}
                                          {ats.feedback && (
                                            <p className="text-[9px] text-slate-500 italic">{ats.feedback}</p>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </Sec>

                                  {/* 9. Performance Summary */}
                                  <Sec icon={TrendingUp} title="Performance Summary" color="text-indigo-500" empty="">
                                    <div className="space-y-2">
                                      {[
                                        { l: "Courses Enrolled", v: enrollments.length, ic: BookOpen, c: "text-cyan-600", bg: "bg-cyan-50" },
                                        { l: "Active Courses", v: enrollments.filter(e => e.status === "active").length, ic: Star, c: "text-emerald-600", bg: "bg-emerald-50" },
                                        { l: "Exams Attempted", v: results.length, ic: Award, c: "text-violet-600", bg: "bg-violet-50" },
                                        { l: "Exams Passed", v: results.filter(r => (r.percentage ?? 0) >= 60).length, ic: CheckCircle2, c: "text-emerald-600", bg: "bg-emerald-50" },
                                        { l: "Attendance Days", v: attendance.length, ic: CalendarCheck, c: "text-orange-500", bg: "bg-orange-50" },
                                        { l: "Live Sessions", v: detail?.live_sessions?.length ?? 0, ic: Video, c: "text-pink-600", bg: "bg-pink-50" },
                                        { l: "ATS Score", v: detail?.resume_ats ? `${detail.resume_ats.ats_score ?? detail.resume_ats.score ?? "—"}/100` : "—", ic: Cpu, c: "text-teal-600", bg: "bg-teal-50" },
                                      ].map(it => (
                                        <div key={it.l} className="flex items-center gap-2">
                                          <div className={`h-6 w-6 rounded-lg ${it.bg} flex items-center justify-center flex-shrink-0`}>
                                            <it.ic className={`h-3 w-3 ${it.c}`} />
                                          </div>
                                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex-1">{it.l}</span>
                                          <span className={`text-sm font-black ${it.c}`}>{it.v}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </Sec>

                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
