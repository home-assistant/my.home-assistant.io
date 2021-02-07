import { HASS_URL, MOBILE_URL } from "../const";
import { isMobile } from "./is_mobile";

export const getInstanceUrl = (): string | null => {
  if (isMobile) {
    return MOBILE_URL;
  }
  return localStorage.getItem(HASS_URL);
};
