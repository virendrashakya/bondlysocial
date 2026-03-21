import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!user?.profile) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(tabs)/discover" />;
}
