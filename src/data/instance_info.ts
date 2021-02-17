import { HASS_URL } from "../const";

export const getInstanceUrl = (): string | null => {
  return localStorage.getItem(HASS_URL);
};
