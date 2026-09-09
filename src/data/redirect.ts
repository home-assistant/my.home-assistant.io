import type { LegacyRedirect, Redirect } from "../const";

type Params = Record<string, string>;

const renameParams = (params: Params, renames: Params): Params => {
  const result: Params = {};
  for (const [name, value] of Object.entries(params)) {
    result[renames[name] || name] = value;
  }
  return result;
};

const invert = (renames: Params): Params => {
  const result: Params = {};
  for (const [oldName, newName] of Object.entries(renames)) {
    result[newName] = oldName;
  }
  return result;
};

export const toCanonical = (
  legacy: LegacyRedirect | undefined,
  params: Params,
): Params => ({
  ...renameParams(params, legacy?.params_rename || {}),
  ...legacy?.new_redirect_params,
});

export const toInstance = (
  redirect: Redirect,
  legacies: LegacyRedirect[],
  params: Params,
): { key: string; params: Params } => {
  const legacy = legacies.find(
    (entry) => entry.redirect === redirect.legacy_redirect,
  );
  if (!legacy) {
    return { key: redirect.redirect, params };
  }
  return {
    key: legacy.redirect,
    params: renameParams(params, invert(legacy.params_rename || {})),
  };
};
