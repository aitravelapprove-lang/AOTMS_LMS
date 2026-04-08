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
  Users,
  Shield,
  BookOpen,
  Settings,
  LogOut,
  FileQuestion,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  Award,
  Video,
  Calendar,
  Database,
  TrendingUp,
  Ticket,
  Zap,
  User
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "My Profile", url: "/admin/profile", icon: User },
  { title: "Users Management", url: "/admin/users", icon: Users },
  { title: "Instructor Access", url: "/admin/instructor-access", icon: ShieldCheck },
  { title: "All Courses", url: "/admin/all-courses", icon: GraduationCap },
  { title: "Assign Courses", url: "/admin/assign-courses", icon: ClipboardList },
  { title: "Instructors", url: "/admin/instructors", icon: Award },
  { title: "Video Library", url: "/admin/videos", icon: Video },
  { title: "Question Bank", url: "/admin/questions", icon: FileQuestion },
  { title: "Exam Approvals", url: "/admin/exams", icon: ShieldCheck },
  { title: "Exam Scheduling", url: "/admin/exam-scheduling", icon: Calendar },
  { title: "Question Repository", url: "/admin/question-repository", icon: Database },
  { title: "Live Monitoring", url: "/admin/live-monitoring", icon: TrendingUp },
  { title: "Rewards & Coupons", url: "/admin/coupons", icon: Ticket },
  { title: "Landing Leads", url: "/admin/leads", icon: Zap },
];



export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-4 border-white bg-white font-sans"
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
              Admin Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 space-y-6 admin-scrollbar">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group relative data-[active=true]:bg-primary/10 data-[active=true]:text-primary group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!justify-center"
                  >
                    <Link to={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                      <item.icon
                        className={`h-5 w-5 transition-colors shrink-0 ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span className="text-[11px] font-black uppercase tracking-[0.05em]">{item.title}</span>}
                      {isActive(item.url) && !collapsed && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                      )}
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
