import redirects from "../../redirect.json" with { type: "json" };
import legacies from "../../legacy.json" with { type: "json" };
import type { LegacyRedirect, Redirect } from "../const";

const allRedirects = redirects as Redirect[];
const allLegacies = legacies as LegacyRedirect[];

export const visibleRedirects = allRedirects.filter(
  (redirect) => !redirect.hidden,
);

export const findRedirect = (
  key: string,
): { redirect: Redirect; legacy?: LegacyRedirect } | undefined => {
  const redirect = allRedirects.find((entry) => entry.redirect === key);
  if (redirect) {
    return { redirect };
  }
  const legacy = allLegacies.find((entry) => entry.redirect === key);
  const target =
    legacy &&
    allRedirects.find((entry) => entry.redirect === legacy.new_redirect);
  return target && { redirect: target, legacy };
};
