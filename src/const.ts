export const HASS_URL = "hassUrl";
export const DEFAULT_HASS_URL = "http://homeassistant.local:8123";

export type ParamType = "url" | "string";

export interface Redirect {
  redirect: string;
  name: string;
  badge?: string;
  description: string;
  introduced: string;
  component?: string;
  params?: {
    [key: string]: ParamType;
  };
}
