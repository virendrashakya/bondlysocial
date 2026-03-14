import { NavLink } from "react-router-dom";
import clsx from "clsx";

const NAV = [
  { to: "/discover",      faIcon: "fa-solid fa-compass",   label: "Discover"  },
  { to: "/feed",          faIcon: "fa-solid fa-fire",      label: "Moments"   },
  { to: "/chat",          faIcon: "fa-solid fa-comments",  label: "Messages"  },
  { to: "/connections",   faIcon: "fa-solid fa-user-group", label: "Connect"  },
  { to: "/notifications", faIcon: "fa-solid fa-bell",      label: "Alerts"    },
];

interface Props { unread?: number }

export function BottomNav({ unread = 0 }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex bg-[#0F0F0F]/90 backdrop-blur-xl border-t border-dark-border">
        {NAV.map(({ to, faIcon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-[3px] text-[10px] font-medium transition-all relative",
                isActive ? "text-brand" : "text-zinc-600 hover:text-zinc-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <i className={`${faIcon} text-[18px]`} aria-hidden="true" />
                  {label === "Alerts" && unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-4 h-[2px] bg-brand rounded-t-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
