import { deepStrictEqual, ok, strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };
import legacies from "../legacy.json" with { type: "json" };

const VERSION = /^(supervisor-|core-)?\d{4}\.\d{1,2}(\.\d+)?$/;
const LEGACY_FIELDS = [
  "redirect",
  "new_redirect",
  "params",
  "params_rename",
  "new_redirect_params",
];

const compare = (a, b) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

const byName = [...redirects].sort((a, b) =>
  compare(a.name.toLowerCase(), b.name.toLowerCase()),
);
strictEqual(
  redirects.find((info, idx) => info.redirect !== byName[idx].redirect),
  undefined,
  "Redirects need to be sorted by name! Run 'node build-scripts/sort-redirects.js'",
);

const byKey = [...legacies].sort((a, b) => compare(a.redirect, b.redirect));
strictEqual(
  legacies.find((info, idx) => info.redirect !== byKey[idx].redirect),
  undefined,
  "Legacy redirects need to be sorted by key! Run 'node build-scripts/sort-redirects.js'",
);

const seen = new Set();
const claim = (key, where) => {
  ok(!seen.has(key), `Redirect key "${key}" is used more than once (${where})`);
  seen.add(key);
};

for (const redirect of redirects) {
  claim(redirect.redirect, "redirect.json");
  ok(
    !redirect.introduced || VERSION.test(redirect.introduced),
    `${redirect.redirect} has an invalid introduced version`,
  );
  if (redirect.legacy_redirect) {
    const legacy = legacies.find(
      (entry) => entry.redirect === redirect.legacy_redirect,
    );
    ok(
      legacy && legacy.new_redirect === redirect.redirect,
      `legacy_redirect of ${redirect.redirect} must be a legacy key that redirects to it`,
    );
    ok(
      !legacy?.new_redirect_params,
      `legacy_redirect of ${redirect.redirect} cannot name a legacy key with new_redirect_params`,
    );
  }
}

for (const legacy of legacies) {
  claim(legacy.redirect, "legacy.json");
  for (const field of Object.keys(legacy)) {
    ok(
      LEGACY_FIELDS.includes(field),
      `Legacy "${legacy.redirect}" has an unknown field "${field}"`,
    );
  }
  const target = redirects.find(
    (entry) => entry.redirect === legacy.new_redirect,
  );
  ok(
    target,
    `Legacy "${legacy.redirect}" redirects to "${legacy.new_redirect}", which is not in redirect.json`,
  );
  if (!target) {
    continue;
  }

  const paramNames = Object.keys(target.params || {});
  const renamed = new Set();
  for (const [oldName, newName] of Object.entries(legacy.params_rename || {})) {
    ok(
      paramNames.includes(newName),
      `params_rename of "${legacy.redirect}" targets "${newName}", which is not a param of ${target.redirect}`,
    );
    ok(
      !paramNames.includes(oldName),
      `params_rename of "${legacy.redirect}" renames "${oldName}", which is still a param of ${target.redirect}`,
    );
    ok(
      !renamed.has(newName),
      `params_rename of "${legacy.redirect}" targets "${newName}" twice`,
    );
    renamed.add(newName);
  }
  for (const name of Object.keys(legacy.new_redirect_params || {})) {
    ok(
      paramNames.includes(name),
      `new_redirect_params of "${legacy.redirect}" sets "${name}", which is not a param of ${target.redirect}`,
    );
  }
}

for (const legacy of legacies) {
  if (!legacy.params) {
    continue;
  }
  const target = redirects.find(
    (entry) => entry.redirect === legacy.new_redirect,
  );
  const renamed = {};
  for (const [name, type] of Object.entries(legacy.params)) {
    renamed[legacy.params_rename?.[name] || name] = type;
  }
  for (const name of Object.keys(legacy.new_redirect_params || {})) {
    renamed[name] = target.params[name];
  }
  deepStrictEqual(
    renamed,
    target.params || {},
    `params of "${legacy.redirect}" do not match the params of ${target.redirect} once renamed`,
  );
}
