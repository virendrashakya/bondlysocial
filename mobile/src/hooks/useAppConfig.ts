import { useQuery } from "@tanstack/react-query";
import { appConfigService, AppConfigValues } from "../services/appConfig.service";

const FALLBACK: AppConfigValues = {
  maintenance_mode: false,
  signups_enabled: true,
  announcement_banner: "",
  discover_enabled: true,
  groups_enabled: true,
};

function coerce(raw: AppConfigValues | undefined): AppConfigValues {
  if (!raw) return FALLBACK;
  const bool = (v: unknown) => v === true || v === "true";
  return {
    ...raw,
    maintenance_mode: bool(raw.maintenance_mode),
    signups_enabled: bool(raw.signups_enabled),
    discover_enabled: bool(raw.discover_enabled),
    groups_enabled: bool(raw.groups_enabled),
  };
}

export function useAppConfig(): AppConfigValues {
  const { data } = useQuery({
    queryKey: ["app-config"],
    queryFn: appConfigService.getPublic,
    staleTime: 1000 * 60 * 5,
    retry: false,
    gcTime: 1000 * 60 * 10,
  });
  return coerce(data);
}
