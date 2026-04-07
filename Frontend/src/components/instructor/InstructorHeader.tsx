import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export function InstructorHeader() {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const initials =
    (user?.full_name || user?.user_metadata?.full_name)
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "IN";

  return (
    <header className="sticky top-0 z-50 flex h-14 sm:h-16 md:h-20 items-center justify-between glass-panel border-b border-black/5 bg-white/80 backdrop-blur-2xl px-3 sm:px-4 md:px-6 lg:px-10 transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6">
        <SidebarTrigger className="h-10 w-10 text-primary hover:bg-primary/5 rounded-xl transition-all" />

        {/* Search */}
        <div className="relative hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70 group-focus-within:text-primary transition-colors duration-500" />
          <Input
            placeholder="Search curricula, data, or students..."
            className="pl-12 w-[380px] h-11 bg-black/5 border-transparent focus-visible:ring-primary/20 focus-visible:bg-white focus-visible:border-primary/30 text-sm font-medium transition-all rounded-2xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/instructor/notifications")}
            className="h-11 w-11 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
          >
            <Bell className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent border-4 border-white text-[9px] font-black text-white flex items-center justify-center shadow-glow-orange animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="h-8 w-px bg-black/5 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto flex items-center gap-4 px-2 hover:bg-transparent group"
            >
              <div className="relative">
                <Avatar className="h-11 w-11 border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-500 shadow-sm">
                  <AvatarImage src={user?.avatar_url || user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-white font-black text-xs uppercase tracking-tighter">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center">
                  <Zap className="h-2 w-2 text-white fill-white" />
                </div>
              </div>
              <div className="hidden md:block text-left space-y-0.5">
                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase italic">
                  {(user?.full_name || user?.user_metadata?.full_name)?.toUpperCase() ||
                    "INSTRUCTOR"}
                </p>
                <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                    Verified Mentor
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-primary/30 group-hover:text-primary transition-all group-hover:translate-y-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 glass-panel border-black/5 p-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <DropdownMenuLabel className="px-4 py-3">
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                Instructor Neural Profile
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-black/5" />
            <DropdownMenuItem
              onClick={() => navigate("/instructor/profile")}
              className="h-11 rounded-xl px-4 text-xs font-black uppercase tracking-widest gap-4 text-slate-700 hover:bg-slate-100 transition-all font-sans"
            >
              <User className="h-4 w-4" />
              Manage Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-black/5" />
            <DropdownMenuItem
              onClick={signOut}
              className="h-11 rounded-xl px-4 text-xs font-black uppercase tracking-widest gap-4 text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
