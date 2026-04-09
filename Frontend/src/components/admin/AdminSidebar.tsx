import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
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
  LogOut,
  FileQuestion,
  GraduationCap,
  ShieldCheck,
  Award,
  Video,
  Calendar,
  Database,
  TrendingUp,
  Ticket,
  Zap,
  User,
  Search,
  X,
  UserCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Admin Home", url: "/admin", icon: LayoutDashboard },
      { title: "My Profile", url: "/admin/profile", icon: User },
    ],
  },
  {
    label: "User Administration",
    items: [
      { title: "User Directory", url: "/admin/users", icon: Users },
      { title: "Instructor Access", url: "/admin/instructor-access", icon: ShieldCheck },
      { title: "Instructor List", url: "/admin/instructors", icon: Award },
    ],
  },
  {
    label: "Course Materials",
    items: [
      { title: "All Courses", url: "/admin/all-courses", icon: GraduationCap },
      { title: "Video Lessons", url: "/admin/videos", icon: Video },
      { title: "Question Bank", url: "/admin/questions", icon: FileQuestion },
      { title: "Question Database", url: "/admin/question-repository", icon: Database },
      { title: "Question Access", url: "/admin/question-access", icon: UserCheck },
    ],
  },
  {
    label: "Academic Management",
    items: [
      { title: "Exam Schedule", url: "/admin/exam-scheduling", icon: Calendar },
      { title: "Live Activity", url: "/admin/live-monitoring", icon: TrendingUp },
    ],
  },
  {
    label: "Marketing & Growth",
    items: [
      { title: "Coupon Manager", url: "/admin/coupons", icon: Ticket },
      { title: "Student Inquiries", url: "/admin/leads", icon: Zap },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-4 border-white bg-white font-sans"
    >
      <SidebarHeader className="h-auto flex flex-col items-center justify-center px-4 py-4 group-data-[collapsible=icon]:px-0 border-b border-slate-200/60 gap-4">
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

        {!collapsed && (
          <div className="relative w-full px-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-[11px] bg-slate-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 space-y-4 admin-scrollbar">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-0">
              <SidebarGroupLabel className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="h-11 px-4 rounded-xl transition-all duration-200 group relative data-[active=true]:bg-primary/10 data-[active=true]:text-primary group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!justify-center"
                      >
                        <Link to={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                          <item.icon
                            className={`h-5 w-5 transition-colors shrink-0 ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                          />
                          {!collapsed && <span className="text-[11px] font-black uppercase tracking-[0.05em]">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[10px] text-slate-400 font-medium">No results found</p>
          </div>
        )}
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

