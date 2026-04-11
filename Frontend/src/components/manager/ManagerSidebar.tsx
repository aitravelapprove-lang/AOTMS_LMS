import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { cn } from "@/lib/utils";

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
    <Sidebar collapsible="icon" className="border-r border-slate-200/40 !bg-white/80 backdrop-blur-2xl font-sans shadow-[20px_0_40px_rgba(0,0,0,0.01)]">
      <SidebarHeader className="h-24 flex items-center justify-center px-4 group-data-[collapsible=icon]:px-0 border-b border-slate-200/60">
        {!collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <img src={logo} alt="AOTMS Logo" className="h-10 w-auto" />
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                MANAGER PANEL
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <img src={logo} alt="AOTMS Logo" className="h-6 w-auto" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn(
        "px-3 group-data-[collapsible=icon]:px-2 space-y-8 scrollbar-hide",
        collapsed ? "py-6" : "py-4"
      )}>
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
          <SidebarGroup key={group.label} className="p-0">
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 p-0 h-auto mb-3">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className={cn(
                        "h-12 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        isActive(item.url) 
                          ? "bg-primary text-white shadow-[0_10px_20px_rgba(var(--primary),0.2)]" 
                          : "hover:bg-primary/5 text-slate-600 hover:text-primary"
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3.5 w-full">
                        <div className="relative z-10">
                          <item.icon
                            className={cn(
                              "h-[1.125rem] w-[1.125rem] transition-all duration-300",
                              isActive(item.url) ? "text-white scale-110" : "text-slate-400 group-hover:text-primary"
                            )}
                          />
                        </div>
                        
                        {!collapsed && (
                          <motion.span 
                            className={cn(
                              "font-black text-xs uppercase tracking-wider z-10",
                              isActive(item.url) ? "text-white" : "group-hover:text-primary"
                            )}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            {item.title}
                          </motion.span>
                        )}

                        {isActive(item.url) && (
                          <motion.div 
                            layoutId="active-pill-manager"
                            className="absolute inset-0 bg-primary z-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
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
              className="h-11 px-4 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-all flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}

