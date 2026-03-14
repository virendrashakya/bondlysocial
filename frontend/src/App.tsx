import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useAppConfig } from "./hooks/useAppConfig";

// Layout
import { AppLayout }     from "./components/layout/AppLayout";
import { AdminLayout }   from "./pages/admin/AdminLayout";

// Public pages
import { LoginPage }     from "./pages/Login";
import { SignupPage }    from "./pages/Signup";

// Onboarding
import { OnboardingPage } from "./pages/Onboarding";

// App pages
import { DiscoverPage }       from "./pages/Discover";
import { ProfileViewPage }    from "./pages/ProfileView";
import { ConnectionsPage }    from "./pages/Connections";
import { ChatPage }           from "./pages/Chat";
import { MessagesPage }      from "./pages/Messages";
import { GroupsPage }         from "./pages/Groups";
import { NotificationsPage }  from "./pages/Notifications";
import { SettingsPage }       from "./pages/Settings";
import { NearbyPage }         from "./pages/Nearby";
import { FeedPage }          from "./pages/Feed";
import { UserPostsPage }     from "./pages/UserPosts";

// Admin pages
import { AdminOverviewPage }  from "./pages/admin/AdminOverview";
import { AdminReportsPage }   from "./pages/admin/AdminReports";
import { AdminUsersPage }     from "./pages/admin/AdminUsers";
import { AdminConfigPage }    from "./pages/admin/AdminConfig";

// Error pages
import { NotFoundPage }    from "./pages/NotFound";
import { ServerErrorPage } from "./pages/ServerError";
import { MaintenancePage } from "./pages/Maintenance";

// PWA install
import { InstallBanner }   from "./components/ui/InstallBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
});

// ── Error Boundary ──────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean }
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) return <ServerErrorPage />;
    return this.props.children;
  }
}

// ── Auth guards ─────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/discover" replace />;
  return <>{children}</>;
}

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const appConfig = useAppConfig();
  if (appConfig.maintenance_mode) return <MaintenancePage />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <MaintenanceGuard>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── Onboarding ── */}
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

        {/* ── Main app ── */}
        <Route path="/discover"      element={<RequireAuth><AppLayout><DiscoverPage /></AppLayout></RequireAuth>} />
        <Route path="/nearby"        element={<RequireAuth><AppLayout><NearbyPage /></AppLayout></RequireAuth>} />
        <Route path="/feed"          element={<RequireAuth><AppLayout><FeedPage /></AppLayout></RequireAuth>} />
        <Route path="/profile/:id"       element={<RequireAuth><AppLayout><ProfileViewPage /></AppLayout></RequireAuth>} />
        <Route path="/profile/:id/posts" element={<RequireAuth><AppLayout><UserPostsPage /></AppLayout></RequireAuth>} />
        <Route path="/connections"   element={<RequireAuth><AppLayout><ConnectionsPage /></AppLayout></RequireAuth>} />
        <Route path="/chat/:id"      element={<RequireAuth><AppLayout><ChatPage /></AppLayout></RequireAuth>} />
        <Route path="/chat"          element={<RequireAuth><AppLayout><MessagesPage /></AppLayout></RequireAuth>} />
        <Route path="/groups"        element={<RequireAuth><AppLayout><GroupsPage /></AppLayout></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><AppLayout><NotificationsPage /></AppLayout></RequireAuth>} />
        <Route path="/settings"      element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />

        {/* ── Admin ── */}
        <Route path="/admin"         element={<RequireAdmin><AdminLayout><AdminOverviewPage /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><AdminLayout><AdminReportsPage /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/users"   element={<RequireAdmin><AdminLayout><AdminUsersPage /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/config"  element={<RequireAdmin><AdminLayout><AdminConfigPage /></AdminLayout></RequireAdmin>} />

        {/* ── Error / Default ── */}
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/"    element={<Navigate to="/discover" replace />} />
        <Route path="*"    element={<NotFoundPage />} />
      </Routes>
    </MaintenanceGuard>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          {/* Skip-to-main for keyboard / screen-reader users */}
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(15,15,15,0.96)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#FF3D6B", secondary: "#fff" } },
        }}
      />

      <InstallBanner />
    </QueryClientProvider>
  );
}
