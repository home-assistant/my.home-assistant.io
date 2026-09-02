import redirects from "../../redirect.json";
import type { Redirect } from "../const";

export const allRedirects = redirects as unknown as Redirect[];

export const visibleRedirects = allRedirects.filter(
  (redirect) => !redirect.deprecated,
);

export const findRedirect = (key: string): Redirect | undefined =>
  allRedirects.find(
    (redirect) =>
      redirect.redirect === key ||
      Object.keys(redirect.legacy || {}).includes(key),
  );
