import { ok, strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };

const VERSION = /^(supervisor-|core-)?\d{4}\.\d{1,2}(\.\d+)?$/;

const sorted = [...redirects].sort((a, b) => {
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();

  if (aName < bName) {
    return -1;
  }
  if (aName > bName) {
    return 1;
  }

  return 0;
});

const firstNonEqual = redirects.find(
  (info, idx) => info.redirect !== sorted[idx].redirect,
);

strictEqual(
  firstNonEqual,
  undefined,
  "Redirects need to be sorted by name! Run 'node build-scripts/sort-redirects.js'",
);

const seen = new Set();
const claim = (key, where) => {
  ok(!seen.has(key), `Redirect key "${key}" is used more than once (${where})`);
  seen.add(key);
};

for (const redirect of redirects) {
  claim(redirect.redirect, redirect.redirect);
  ok(
    !redirect.introduced || VERSION.test(redirect.introduced),
    `${redirect.redirect} has an invalid introduced version`,
  );

  const legacy = redirect.legacy || {};
  ok(
    !redirect.legacy_redirect ||
      Object.keys(legacy).includes(redirect.legacy_redirect),
    `legacy_redirect of ${redirect.redirect} must be one of its legacy keys`,
  );

  const paramNames = Object.keys(redirect.params || {});
  for (const [key, block] of Object.entries(legacy)) {
    claim(key, `legacy of ${redirect.redirect}`);
    for (const field of Object.keys(block)) {
      ok(
        ["introduced", "params_rename", "redirect_params"].includes(field),
        `Legacy "${key}" of ${redirect.redirect} has an unknown field "${field}"`,
      );
    }
    ok(
      VERSION.test(block.introduced || ""),
      `Legacy "${key}" of ${redirect.redirect} needs a valid introduced version`,
    );

    const renamed = new Set();
    for (const [oldName, newName] of Object.entries(
      block.params_rename || {},
    )) {
      ok(
        paramNames.includes(newName),
        `params_rename of "${key}" targets "${newName}", which is not a param of ${redirect.redirect}`,
      );
      ok(
        !paramNames.includes(oldName),
        `params_rename of "${key}" renames "${oldName}", which is still a param of ${redirect.redirect}`,
      );
      ok(
        !renamed.has(newName),
        `params_rename of "${key}" targets "${newName}" twice`,
      );
      renamed.add(newName);
    }
    for (const name of Object.keys(block.redirect_params || {})) {
      ok(
        paramNames.includes(name),
        `redirect_params of "${key}" sets "${name}", which is not a param of ${redirect.redirect}`,
      );
    }
  }
}
