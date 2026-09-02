import type { Redirect } from "../const";

type Params = Record<string, string>;

export const instanceKey = (redirect: Redirect): string =>
  redirect.legacy_redirect || redirect.redirect;

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
): Params => renameParams(params, redirect.legacy?.[key]?.params_rename || {});

export const toInstance = (
  redirect: Redirect,
  params: Params,
): { key: string; params: Params } => {
  const key = instanceKey(redirect);
  const legacy = redirect.legacy?.[key];
  return {
    key,
    params: legacy
      ? renameParams(params, invert(legacy.params_rename || {}))
      : params,
  };
};
