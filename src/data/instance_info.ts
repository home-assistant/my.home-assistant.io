import { HASS_URL, MOBILE_URL, STORAGE_KEY } from "../const";
import { isMobile } from "./is_mobile";

export const getInstanceUrls = (): string[] | null => {
  if (isMobile) {
    return [MOBILE_URL];
  }
  const instances = localStorage.getItem(STORAGE_KEY)
  if (instances) {
    try {
      return JSON.parse(instances)
    } catch (_) {
      return null
    }
  }

  // Legacy handlerfor old values
  const hassUrl = localStorage.getItem(HASS_URL)
  return hassUrl ? [hassUrl] : null
};
