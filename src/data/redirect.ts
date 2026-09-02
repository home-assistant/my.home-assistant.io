import type { Redirect } from "../const";

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
  redirect: Redirect,
  key: string,
  params: Params,
): Params => {
  const legacy = redirect.legacy?.[key];
  return {
    ...renameParams(params, legacy?.params_rename || {}),
    ...legacy?.redirect_params,
  };
};

export const toInstance = (
  redirect: Redirect,
  params: Params,
): { key: string; params: Params } => {
  const key = redirect.legacy_redirect;
  const legacy = key ? redirect.legacy?.[key] : undefined;
  if (!key || !legacy) {
    return { key: redirect.redirect, params };
  }
  return {
    key,
    params: renameParams(params, invert(legacy.params_rename || {})),
  };
};
