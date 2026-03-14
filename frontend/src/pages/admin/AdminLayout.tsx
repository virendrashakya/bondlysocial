import { NavLink, useNavigate } from "react-router-dom";
import { Flag, Users, BarChart2, Settings2, ArrowLeft } from "lucide-react";
import clsx from "clsx";

const ADMIN_NAV = [
  { to: "/admin",         icon: BarChart2,  label: "Overview",   exact: true },
  { to: "/admin/reports", icon: Flag,       label: "Reports"               },
  { to: "/admin/users",   icon: Users,      label: "Users"                 },
  { to: "/admin/config",  icon: Settings2,  label: "App Config"            },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <div className="w-52 bg-dark-surface border-r border-dark-border flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-dark-border">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Admin Panel</span>
          <p className="text-sm font-semibold text-white mt-0.5">IntentConnect</p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {ADMIN_NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-rose-950/40 text-rose-400 border border-rose-800/30"
                    : "text-zinc-500 hover:bg-dark-hover hover:text-white"
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-3 border-t border-dark-border">
          <button
            onClick={() => navigate("/discover")}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm text-zinc-600 hover:text-white rounded-xl hover:bg-dark-hover transition-all"
          >
            <ArrowLeft size={14} /> Back to app
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
