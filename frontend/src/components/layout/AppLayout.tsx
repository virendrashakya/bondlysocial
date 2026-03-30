import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";
import { api } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { usePresenceChannel } from "@/hooks/useActionCable";
import { AnnouncementBanner } from "@/components/shared/AnnouncementBanner";
import { SubscriptionModal } from "@/components/shared/SubscriptionModal";
import { ProfileCompletion } from "@/components/shared/ProfileCompletion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useMyProfile } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/discover",      label: "Discover",       faIcon: "fa-solid fa-compass"              },
  { to: "/nearby",        label: "Nearby",         faIcon: "fa-solid fa-location-crosshairs"  },
  { to: "/feed",          label: "Moments",        faIcon: "fa-solid fa-fire"                 },
  { to: "/connections",   label: "Connections",    faIcon: "fa-solid fa-user-group"           },
  { to: "/chat",          label: "Messages",       faIcon: "fa-solid fa-comments"             },
  { to: "/groups",        label: "Groups",         faIcon: "fa-solid fa-people-group"         },
  { to: "/notifications", label: "Notifications",  faIcon: "fa-solid fa-bell"                 },
  { to: "/settings",      label: "Settings",       faIcon: "fa-solid fa-sliders"              },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen]   = useState(false);
  const user              = useAuthStore((s) => s.user);
  const logout            = useAuthStore((s) => s.logout);
  const navigate          = useNavigate();
  const location          = useLocation();
  const appConfig         = useAppConfig();
  const { data: myProfile } = useMyProfile();
  const { setOnline, setOffline, updateLastActive } = usePresenceStore();

  // Subscribe to presence channel for online status
  usePresenceChannel((data) => {
    if (data.status === "online") {
      setOnline(data.user_id);
    } else {
      setOffline(data.user_id);
    }
    if (data.last_active_at) {
      updateLastActive(data.user_id, data.last_active_at);
    }
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => api.get("/notifications").then((r) => r.data.unread_count as number),
    refetchInterval: 30_000,
  });
  const unread = notifData ?? 0;

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <span className="text-lg font-bold text-brand tracking-tight">IntentConnect</span>
        {open && (
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="md:hidden h-8 w-8 text-zinc-500 hover:text-white">
            <X size={18} />
          </Button>
        )}
      </div>

      {/* User pill */}
      {user && (
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9 text-sm">
              {myProfile?.avatar_url && (
                <AvatarImage src={myProfile.avatar_url} alt={user.profile?.name ?? "Profile"} />
              )}
              <AvatarFallback>
                {user.profile?.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-dark-surface" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user.profile?.name ?? "Complete profile"}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">{user.profile?.intent ?? user.email}</p>
          </div>
          {user.selfie_verified && (
            <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
          )}
        </div>
      )}

      {/* Profile completion */}
      <ProfileCompletion profile={myProfile ?? user?.profile} verified={user?.selfie_verified} />

      {/* Upgrade to Premium Button */}
      {user?.profile?.gender === "male" && user?.subscription_tier !== "premium" && (
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("paywall:triggered"))}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-500 text-sm font-semibold py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <i className="fa-solid fa-crown" />
            Get Premium
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV.map(({ to, faIcon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-muted text-brand border border-brand-border"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
              )
            }
          >
            <div className="relative w-[17px] flex items-center justify-center">
              <i className={`${faIcon} text-base`} aria-hidden="true" />
              {label === "Notifications" && unread > 0 && (
                <Badge variant="brand" size="sm" className="absolute -top-2 -right-2.5 min-w-[1rem] h-4 px-1 flex items-center justify-center text-[9px] font-bold" aria-label={`${unread} unread`}>
                  {unread > 9 ? "9+" : unread}
                </Badge>
              )}
            </div>
            {label}
          </NavLink>
        ))}

      </nav>

      {/* Logout */}
      <div className="px-2.5 py-2.5 border-t border-white/[0.08]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-white justify-start"
        >
          <LogOut size={17} />
          Sign out
        </Button>
      </div>
    </>
  );

  // Hide generic mobile layout chrome when inside a chat or profile detail view
  const isImmersive = Boolean(location.pathname.match(/^\/(chat|profile)\/\d+$/));

  return (
    <div className="flex flex-col h-[100dvh] bg-dark-bg overflow-hidden">
      {/* Global announcement banner */}
      <AnnouncementBanner text={appConfig.announcement_banner} />
      
      {/* Global Subscription Paywall */}
      <SubscriptionModal />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.08]">
          <SidebarContent />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative z-10 flex flex-col w-[280px] h-full bg-[rgba(10,10,10,0.97)] backdrop-blur-2xl border-r border-white/[0.08] animate-slide-up">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <main
            id="main-content"
            key={location.pathname}
            className={cn(
              "flex-1 min-h-0 animate-page-enter",
              location.pathname.startsWith("/chat/")
                ? "overflow-hidden"
                : "overflow-y-auto overscroll-none pb-16 md:pb-0"
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {!isImmersive && <BottomNav unread={unread} />}
    </div>
  );
}
