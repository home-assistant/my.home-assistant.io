import { HASS_URL, HASS_URLS, MOBILE_URL } from "../const";
import { parseInstanceUrls } from "./instance_urls";
import { isMobile } from "./is_mobile";

export const getInstanceUrls = (): string[] => {
  if (isMobile) {
    return [MOBILE_URL];
  }
  try {
    return parseInstanceUrls(
      localStorage.getItem(HASS_URLS),
      localStorage.getItem(HASS_URL),
    );
  } catch (err) {
    return [];
  }
};

// A single URL is stored exactly like before multiple instances existed. The
// first URL is always kept in HASS_URL so older versions of the site still
// find an instance. HASS_URL is written last: if storing fails halfway, the
// list no longer starts with it and is ignored.
export const setInstanceUrls = (urls: string[]): void => {
  if (urls.length > 1) {
    localStorage.setItem(HASS_URLS, JSON.stringify(urls));
  }
  localStorage.setItem(HASS_URL, urls[0]);
  if (urls.length === 1) {
    localStorage.removeItem(HASS_URLS);
  }
};
