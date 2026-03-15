import axios from "axios";

export interface AppConfigValues {
  maintenance_mode:    boolean;
  signups_enabled:     boolean;
  announcement_banner: string;
  discover_enabled:    boolean;
  groups_enabled:      boolean;
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000/api/v1";

export const appConfigService = {
  getPublic: (): Promise<AppConfigValues> =>
    axios.get(`${BASE}/app_config`).then((r) => r.data.config),

};
