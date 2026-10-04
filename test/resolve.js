import { deepStrictEqual, strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };
import legacies from "../legacy.json" with { type: "json" };
import { toCanonical, toInstance } from "../src/data/redirect.ts";
import { findRedirect, visibleRedirects } from "../src/data/redirects.ts";

strictEqual(
  findRedirect("supervisor_addon").redirect.redirect,
  "supervisor_app",
);
strictEqual(
  findRedirect("supervisor_addon").legacy.redirect,
  "supervisor_addon",
);
strictEqual(findRedirect("supervisor_app").redirect.redirect, "supervisor_app");
strictEqual(findRedirect("supervisor_app").legacy, undefined);
strictEqual(findRedirect("developer_states").redirect.redirect, "tools_states");
strictEqual(findRedirect("nope"), undefined);
strictEqual(
  visibleRedirects.find((redirect) => redirect.hidden),
  undefined,
);

const addon = {
  redirect: "supervisor_addon",
  new_redirect: "supervisor_app",
  params_rename: { addon: "app" },
};
const app = {
  redirect: "supervisor_app",
  name: "App: dashboard",
  description: "show the dashboard of an app",
  params: { app: "string", repository_url: "url?" },
  legacy_redirect: "supervisor_addon",
};

deepStrictEqual(
  toCanonical(addon, { addon: "core_samba", repository_url: "https://x" }),
  { app: "core_samba", repository_url: "https://x" },
);
deepStrictEqual(toCanonical(undefined, { app: "core_samba" }), {
  app: "core_samba",
});
deepStrictEqual(
  toInstance(app, [addon], { app: "core_samba", repository_url: "https://x" }),
  {
    key: "supervisor_addon",
    params: { addon: "core_samba", repository_url: "https://x" },
  },
);

const { legacy_redirect, ...appAfterCleanup } = app;
deepStrictEqual(toInstance(appAfterCleanup, [addon], { app: "core_samba" }), {
  key: "supervisor_app",
  params: { app: "core_samba" },
});

const supervisorLogs = {
  redirect: "supervisor_logs",
  new_redirect: "logs",
  new_redirect_params: { provider: "supervisor" },
};
const logs = {
  redirect: "logs",
  name: "Logs",
  description: "show your Home Assistant logs",
  params: { provider: "string?" },
};

deepStrictEqual(toCanonical(supervisorLogs, {}), { provider: "supervisor" });
deepStrictEqual(
  toInstance(logs, [supervisorLogs], { provider: "supervisor" }),
  {
    key: "logs",
    params: { provider: "supervisor" },
  },
);

const areas = { redirect: "areas", name: "Areas", description: "" };

deepStrictEqual(toInstance(areas, [], { foo: "bar" }), {
  key: "areas",
  params: { foo: "bar" },
});

for (const legacy of legacies) {
  const target = redirects.find(
    (redirect) => redirect.redirect === legacy.new_redirect,
  );
  const params = { ...target.example };
  if (legacy.new_redirect_params) {
    deepStrictEqual(toCanonical(legacy, params), {
      ...params,
      ...legacy.new_redirect_params,
    });
    continue;
  }
  const instance = toInstance(
    { ...target, legacy_redirect: legacy.redirect },
    [legacy],
    params,
  );
  strictEqual(instance.key, legacy.redirect);
  deepStrictEqual(
    toCanonical(legacy, instance.params),
    params,
    `${legacy.redirect} does not round-trip to ${target.redirect}`,
  );
}
