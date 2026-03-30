import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMyProfile } from "@/hooks/queries";

const NAV = [
  { to: "/discover",    faIcon: "fa-solid fa-compass",    label: "Discover"  },
  { to: "/feed",        faIcon: "fa-solid fa-fire",       label: "Moments"   },
  { to: "/chat",        faIcon: "fa-solid fa-comments",   label: "Messages"  },
  { to: "/connections", faIcon: "fa-solid fa-user-group",  label: "Connect"   },
];

interface Props { unread?: number }

export function BottomNav({ unread = 0 }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: myProfile } = useMyProfile();
  const avatarUrl = myProfile?.avatar_url;
  const initial = user?.profile?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30" aria-label="Mobile navigation">
      <div className="flex bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)]">
        {NAV.map(({ to, faIcon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-all relative",
                isActive ? "text-brand" : "text-zinc-600 active:text-zinc-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <i className={`${faIcon} text-[16px]`} aria-hidden="true" />
                  {label === "Messages" && unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-brand text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <span className="leading-none">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-4 h-[2px] bg-brand rounded-t-full" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Profile / Me tab — avatar-based */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-all relative",
              isActive ? "text-brand" : "text-zinc-600 active:text-zinc-300"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-[1.5px] transition-colors",
                isActive ? "border-brand" : "border-zinc-700"
              )}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-zinc-400">{initial}</span>
                )}
              </div>
              <span className="leading-none">Me</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-[2px] bg-brand rounded-t-full" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
