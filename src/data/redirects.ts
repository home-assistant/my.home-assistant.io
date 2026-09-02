import redirects from "../../redirect.json" with { type: "json" };
import type { Redirect } from "../const";

const allRedirects = redirects as Redirect[];

export const visibleRedirects = allRedirects.filter(
  (redirect) => !redirect.hidden,
);

export const findRedirect = (key: string): Redirect | undefined =>
  allRedirects.find(
    (redirect) =>
      redirect.redirect === key ||
      Object.keys(redirect.legacy || {}).includes(key),
  );
