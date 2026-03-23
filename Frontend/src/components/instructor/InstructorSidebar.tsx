import { useLocation, Link, useNavigate } from "react-router-dom";
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  FileQuestion,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  HelpCircle,
  LogOut,
  FolderOpen,
  Zap,
  Radio,
  Settings,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useInstructorStats } from "@/hooks/useInstructorData";
import { Badge } from "@/components/ui/badge";


const mainNavItems = [
  { title: "Dashboard", url: "/instructor", icon: LayoutDashboard },
  { title: "My Courses", url: "/instructor/my-courses", icon: BookOpen },
  { title: "Student Roster", url: "/instructor/students", icon: Users, isLive: true },
  { title: "Messages", url: "/instructor/chat", icon: MessageSquare },
  { title: "Live Broadcast", url: "/instructor/live-classes", icon: Radio },
];


const contentNavItems = [
  { title: "Video Library", url: "/instructor/videos", icon: Video },
  { title: "Question Bank", url: "/instructor/question-bank", icon: FolderOpen },
  { title: "Course Resources", url: "/instructor/resources", icon: FolderOpen },
];

const analyticNavItems = [
  { title: "Performance", url: "/instructor/performance", icon: BarChart3 },
  { title: "Inquiries", url: "/instructor/doubts", icon: MessageSquare },
  { title: "Class Schedule", url: "/instructor/schedule", icon: Calendar },
];

export function InstructorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: stats } = useInstructorStats();

  const isActive = (path: string) => {

    if (path === "/instructor") {
      return (
        location.pathname === "/instructor" ||
        location.pathname === "/instructor/"
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/60 !bg-white/70 backdrop-blur-xl font-sans"
    >
      <SidebarHeader className="h-20 flex items-center justify-center px-4 group-data-[collapsible=icon]:px-0 border-b border-slate-200/60">
        <Link
          to="/"
          className="flex flex-col gap-1 items-center active:scale-95 transition-transform"
        >
          <img
            src={logo}
            alt="AOTMS Logo"
            className="h-10 w-auto object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
          />
          {!collapsed && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Instructor Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 space-y-8 custom-scrollbar">
        {/* Hub */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                  >
                    <Link to={item.url} className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <item.icon
                          className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                        />
                        {item.isLive && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                        )}
                      </div>
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.title}</span>
                          {item.title === "Student Roster" && stats?.totalStudents !== undefined && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-primary/10 text-primary border-none">
                              {stats.totalStudents}
                            </Badge>
                          )}
                        </div>
                      )}

                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content */}
        <SidebarGroup>
          <SidebarGroupLabel>Curriculum</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-accent/5 data-[active=true]:text-accent"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-accent" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {analyticNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-50 bg-slate-50/50">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 h-11 px-4 group-data-[collapsible=icon]:px-0 rounded-lg text-primary hover:bg-primary/5 font-semibold transition-all"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Refresh Data</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 h-11 px-4 group-data-[collapsible=icon]:px-0 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            onClick={() => navigate("/instructor/settings")}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Account Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 h-11 px-4 group-data-[collapsible=icon]:px-0 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
