import { HASS_URL, MOBILE_URL } from "../const";
import { isMobile } from "./is_mobile";

const LOCAL_STORAGE_KEY = "instances";

export interface Instance {
  url: string;
  name?: string;
}

export const getInstances = (): Instance[] | null => {
  if (isMobile) {
    return [{ url: MOBILE_URL }];
  }

  // Perform: One-time migration of legacy single URLs.
  if (localStorage.getItem(HASS_URL)) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([{ url: localStorage.getItem(HASS_URL) }]),
    );
    localStorage.removeItem(HASS_URL);
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("failed to parse stored urls", e);
    return [];
  }
};

export const saveInstances = (instances: Instance[] | null) => {
  if (!instances) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return;
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(instances));
};
