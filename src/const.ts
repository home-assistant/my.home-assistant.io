export const HASS_URL = "hassUrl";
export const DEFAULT_HASS_URL = "http://homeassistant.local:8123";
export const MOBILE_URL = "homeassistant://navigate";

export type ParamType = "url" | "string" | "string?" | "url?";

export interface Redirect {
  redirect: string;
  hidden?: boolean;
  custom?: boolean;
  name: string;
  badge?: string;
  description: string;
  introduced?: string;
  component?: string;
  params?: {
    [key: string]: ParamType;
  };
  example?: {
    [key: string]: string;
  };
  legacy_redirect?: string;
}

export interface LegacyRedirect {
  redirect: string;
  new_redirect: string;
  introduced: string;
  params?: {
    [key: string]: ParamType;
  };
  params_rename?: {
    [oldName: string]: string;
  };
  new_redirect_params?: {
    [name: string]: string;
  };
}
