import { HASS_URL, DEFAULT_HASS_URL } from "../const";

export interface InstanceInfo {
  url: string;
  configuredUrl: boolean;
}

export const getInstanceInfo = (): InstanceInfo => {
  const userUrl = localStorage.getItem(HASS_URL);

  const configuredUrl = Boolean(userUrl);
  const url = userUrl || DEFAULT_HASS_URL;

  return { url, configuredUrl };
};
