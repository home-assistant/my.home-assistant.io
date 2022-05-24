export const HASS_URL = "hassUrl";
export const DEFAULT_HASS_URL = "http://homeassistant.local:8123";
export const MOBILE_URL = "homeassistant://navigate";

export type ParamType = "url" | "string" | "string?" | "url?";

export interface Redirect {
  redirect: string;
  deprecated?: boolean;
  name: string;
  badge?: string;
  description: string;
  introduced: string;
  component?: string;
  params?: {
    [key: string]: ParamType;
  };
}
