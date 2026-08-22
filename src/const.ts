export const HASS_URL = "hassUrl"; // Deprecated.
export const DEFAULT_INSTANCE_NAME = "home assistant instance";
export const DEFAULT_INSTANCE_URL = "http://homeassistant.local:8123";
export const DEFAULT_HASS_URL = DEFAULT_INSTANCE_URL; // Deprecated: use DEFAULT_INSTANCE_URL instead;
export const MOBILE_URL = "homeassistant://navigate";

export type ParamType = "url" | "string" | "string?" | "url?";

export interface Redirect {
  redirect: string;
  deprecated?: boolean;
  custom?: boolean;
  name: string;
  badge?: string;
  description: string;
  introduced?: string;
  component?: string;
  params?: {
    [key: string]: ParamType;
  };
}
