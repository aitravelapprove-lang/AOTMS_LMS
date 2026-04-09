import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Calendar,
  FileQuestion,
  CheckCircle,
  FileText,
  Trophy,
  Users,
  Ticket,
  KeyRound,
  ClipboardList,
  LogOut,
  Search,
  BookOpen as BookOpenIcon,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Zap,
  Video,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export function ManagerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const navGroups = [
    {
      label: "Exam Management",
      items: [
        { id: "dashboard", title: "Dashboard", url: "/manager", icon: LayoutDashboard },
        { id: "profile", title: "My Profile", url: "/manager/profile", icon: User },
        { id: "exams", title: "Exam Scheduling", url: "/manager/exams", icon: Calendar },
        { id: "questions", title: "Question Bank", url: "/manager/questions", icon: FileQuestion },
      ],
    },
    {
      label: "Management",
      items: [
        { id: "leaderboard", title: "Leaderboard", url: "/manager/leaderboard", icon: Trophy },
        { id: "instructors", title: "Instructors", url: "/manager/instructors", icon: Users },
        { id: "instructor-access", title: "Instructor Access", url: "/manager/instructor-access", icon: ShieldCheck },
        { id: "all-courses", title: "All Courses", url: "/manager/all-courses", icon: BookOpenIcon },
        { id: "coupons", title: "Rewards & Coupons", url: "/manager/coupons", icon: Ticket },
        { id: "grant-access", title: "Grant Access", url: "/manager/grant-access", icon: KeyRound },
        { id: "question-access", title: "Question Access", url: "/manager/question-access", icon: UserCheck },
        { id: "resume-scans", title: "Resume Scan Logs", url: "/manager/resume-scans", icon: ClipboardList },
        { id: "video-library", title: "Video Library", url: "/manager/video-library", icon: Video },
        { id: "monitoring", title: "Live Monitoring", url: "/manager/monitoring", icon: TrendingUp },
        { id: "leads", title: "Landing Leads", url: "/manager/leads", icon: Zap },
        { id: "enrollments", title: "Enrollments Hub", url: "/manager/enrollments", icon: Users },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "/manager" && location.pathname === "/manager") return true;
    if (path !== "/manager" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="h-20 flex items-center px-6 border-b border-slate-50">
        {!collapsed ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[12px] tracking-tight text-slate-900 leading-none">
                  ACADEMY OF TECH MASTERS
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Learn Today, Lead Tomorrow
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-3 pl-10">
                MANAGER PANEL
            </span>
          </div>
        ) : (
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-primary/20">
            A
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {!collapsed && (
          <div className="px-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 bg-slate-50 border-none rounded-xl text-[11px] font-medium placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        )}

        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="h-10 px-3 rounded-lg transition-all duration-200 group relative data-[active=true]:bg-slate-50 data-[active=true]:text-slate-900 group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!justify-center"
                    >
                      <Link to={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                        <item.icon
                          className={`h-4.5 w-4.5 transition-colors shrink-0 ${isActive(item.url) ? "text-primary fill-primary/10" : "text-slate-500 group-hover:text-slate-700"}`}
                        />
                        {!collapsed && (
                          <span className="text-[12px] font-medium tracking-tight">
                            {item.title}
                          </span>
                        )}
                        {isActive(item.url) && !collapsed && (
                           <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-slate-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="h-10 px-3 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="text-[12px] font-bold uppercase tracking-widest">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
