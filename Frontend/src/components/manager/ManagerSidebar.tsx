import { Link } from "react-router-dom";
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
  Calendar,
  FileQuestion,
  Trophy,
  UserPlus,
  Settings,
  LogOut,
  ClipboardList,
  Shield,
  BarChart3,
  MonitorPlay,
  Video,
  KeyRound,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

interface ManagerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const examManagementItems = [
  { id: "overview", title: "Dashboard", icon: LayoutDashboard },
  { id: "exams", title: "Exam Scheduling", icon: Calendar },
  { id: "questions", title: "Question Bank", icon: FileQuestion },
];

const managementItems = [
  { id: "leaderboard", title: "Leaderboard", icon: Trophy },
  { id: "instructors", title: "Instructors", icon: UserPlus },
];

const monitoringItems = [
  { id: "monitoring", title: "Live Monitoring", icon: MonitorPlay },
  { id: "course-monitoring", title: "Course Progress", icon: BarChart3 },
  { id: "enrollments", title: "Enrollments", icon: BookOpen },
  { id: "course-assignment", title: "Assign Courses", icon: GraduationCap },
  { id: "courses", title: "All Courses", icon: GraduationCap },
  { id: "video-library", title: "Video Library", icon: Video },
];

export function ManagerSidebar({
  activeSection,
  onSectionChange,
}: ManagerSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  const renderNavSection = (items: typeof examManagementItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={activeSection === item.id}
          onClick={() => onSectionChange(item.id)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/60 !bg-white/70 backdrop-blur-xl font-sans"
    >
      <SidebarHeader className="h-20 flex items-center justify-center px-4 group-data-[collapsible=icon]:px-0 border-b border-slate-200/60">
        <Link
          to="/"
          className="flex flex-col gap-1 items-center active:scale-95 transition-transform text-center"
        >
          <img
            src={logo}
            alt="AOTMS Logo"
            className="h-12 w-auto object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
          />
          {!collapsed && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Manager Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 space-y-8 custom-scrollbar">
        {/* Exam Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Exam Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavSection(examManagementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavSection(managementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monitoring */}
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavSection(monitoringItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-200/60 !bg-white/70">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSectionChange("settings")}
              className="flex items-center gap-3 cursor-pointer justify-start group-data-[collapsible=icon]:justify-center"
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-destructive hover:text-destructive cursor-pointer justify-start group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
