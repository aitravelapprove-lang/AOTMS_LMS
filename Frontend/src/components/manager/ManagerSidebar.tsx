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
import logo from "@/assets/logo.png";

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
          <div className="flex flex-col items-start gap-1.5">
            <img src={logo} alt="AOTMS Logo" className="h-10 w-auto" />
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-1">
                MANAGER PANEL
            </span>
          </div>
        ) : (
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm shadow-slate-200">
            <img src={logo} alt="AOTMS Logo" className="h-6 w-auto" />
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
                      className="h-11 px-4 rounded-xl transition-all duration-300 group relative data-[active=true]:bg-[#0075CF] data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-[#0075CF]/20 hover:bg-[#0075CF]/10 hover:text-[#0075CF] text-slate-500 group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!justify-center"
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                        <item.icon
                          className="h-5 w-5 transition-all duration-300 shrink-0 group-data-[active=true]:text-white group-hover:text-[#0075CF] text-slate-400 group-data-[active=true]:scale-110"
                        />
                        {!collapsed && (
                          <span className="font-black text-xs uppercase tracking-wider z-10 transition-colors group-data-[active=true]:text-white group-hover:text-[#0075CF] text-slate-600">
                            {item.title}
                          </span>
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
