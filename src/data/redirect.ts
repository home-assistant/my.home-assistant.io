import type { Redirect } from "../const";

export type Params = Record<string, string>;

export const instanceKey = (redirect: Redirect): string =>
  redirect.legacy_redirect || redirect.redirect;

const renameParams = (params: Params, names: Params): Params => {
  const result: Params = {};
  for (const [name, value] of Object.entries(params)) {
    result[names[name] || name] = value;
  }
  return result;
};

const invert = (names: Params): Params => {
  const result: Params = {};
  for (const [oldName, newName] of Object.entries(names)) {
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
