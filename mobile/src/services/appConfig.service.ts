import axios from "axios";
import Constants from "expo-constants";

export interface AppConfigValues {
  maintenance_mode: boolean;
  signups_enabled: boolean;
  announcement_banner: string;
  discover_enabled: boolean;
  groups_enabled: boolean;
}

const BASE = Constants.expoConfig?.extra?.apiBaseUrl || "http://192.168.29.207:3000/api/v1";

export const appConfigService = {
  getPublic: (): Promise<AppConfigValues> =>
    axios.get(`${BASE}/app_config`).then((r) => r.data.config),
};
