import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";
import { authService } from "../../services/auth.service";
import { AnnouncementBanner } from "../shared/AnnouncementBanner";
import { ProfileCompletion } from "../shared/ProfileCompletion";
import { BottomNav } from "./BottomNav";
import { useAppConfig } from "../../hooks/useAppConfig";

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
      <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
        <span className="text-lg font-bold text-brand tracking-tight">IntentConnect</span>
        {open && (
          <button onClick={() => setOpen(false)} className="md:hidden text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User pill */}
      {user && (
        <div className="px-4 py-3 border-b border-dark-border flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-brand-muted border border-brand-border flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
            {user.profile?.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
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
      <ProfileCompletion profile={user?.profile} verified={user?.selfie_verified} isAdmin={user?.role === "admin"} />

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV.map(({ to, faIcon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            aria-label={label}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-muted text-brand border border-brand-border"
                  : "text-zinc-500 hover:bg-dark-hover hover:text-white"
              )
            }
          >
            <div className="relative w-[17px] flex items-center justify-center">
              <i className={`${faIcon} text-base`} aria-hidden="true" />
              {label === "Notifications" && unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center" aria-label={`${unread} unread`}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1.5 border-t border-dark-border pt-3",
                isActive
                  ? "bg-rose-950/40 text-rose-400 border-rose-800/30"
                  : "text-rose-500/70 hover:bg-rose-950/30 hover:text-rose-400"
              )
            }
          >
            <ShieldCheck size={17} />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-2.5 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-dark-hover hover:text-white transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-dark-bg overflow-hidden">
      {/* Global announcement banner */}
      <AnnouncementBanner text={appConfig.announcement_banner} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-dark-surface border-r border-dark-border">
          <SidebarContent />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative z-10 flex flex-col w-[220px] bg-dark-surface border-r border-dark-border animate-slide-up">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Mobile topbar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-surface/80 backdrop-blur-sm border-b border-dark-border">
            <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <span className="font-bold text-brand text-base tracking-tight">IntentConnect</span>
            <NavLink to="/notifications" className="relative text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </NavLink>
          </div>

          <main
            id="main-content"
            key={location.pathname}
            className={clsx(
              "flex-1 min-h-0 animate-page-enter",
              location.pathname.startsWith("/chat/")
                ? "overflow-hidden"
                : "overflow-y-auto pb-16 md:pb-0"
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav unread={unread} />
    </div>
  );
}
