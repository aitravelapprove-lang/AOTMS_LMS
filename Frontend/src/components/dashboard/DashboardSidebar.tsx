import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Video,
  Calendar,
  FileText,
  ClipboardCheck,
  History,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  Folder,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navigationGroups = [
  {
    label: "General",
    items: [
      { title: "Dashboard", url: "/student-dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/student-dashboard/profile", icon: User },
      { title: "Messages", url: "/student-dashboard/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Learning Hub",
    items: [
      { title: "My Courses", url: "/student-dashboard/courses", icon: BookOpen },
      { title: "Video Lessons", url: "/student-dashboard/videos", icon: Video },
      { title: "Live Classes", url: "/student-dashboard/live-classes", icon: Calendar },
      { title: "Resources", url: "/student-dashboard/resources", icon: Folder },
    ],
  },
  {
    label: "Academic",
    items: [
      { title: "Resume ATS", url: "/student-dashboard/resume-ats", icon: Zap },
      { title: "Mock Papers", url: "/student-dashboard/mock-papers", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "History", url: "/student-dashboard/history", icon: History },
      { title: "Notifications", url: "/student-dashboard/notifications", icon: Bell },
      { title: "Settings", url: "/student-dashboard/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

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
            className="h-12 w-auto object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
          />
          {!collapsed && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Student Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 custom-scrollbar space-y-6">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`h-4.5 w-4.5 transition-colors ${
                            isActive(item.url)
                              ? "text-primary"
                              : "text-slate-500 group-hover:text-slate-700"
                          }`}
                        />
                        {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-50 mt-auto">
        <div className="space-y-2">
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
