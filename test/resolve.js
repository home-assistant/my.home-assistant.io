import { deepStrictEqual, strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };
import { toCanonical, toInstance } from "../src/data/redirect.ts";
import { findRedirect, visibleRedirects } from "../src/data/redirects.ts";

strictEqual(findRedirect("supervisor_addon").redirect, "supervisor_app");
strictEqual(findRedirect("supervisor_app").redirect, "supervisor_app");
strictEqual(findRedirect("developer_states").redirect, "tools_states");
strictEqual(findRedirect("nope"), undefined);
strictEqual(
  visibleRedirects.find((redirect) => redirect.hidden),
  undefined,
);

const app = {
  redirect: "supervisor_app",
  name: "App: dashboard",
  description: "show the dashboard of an app",
  params: { app: "string", repository_url: "url?" },
  legacy: {
    supervisor_addon: {
      introduced: "supervisor-2021.02.10",
      params_rename: { addon: "app" },
    },
  },
  legacy_redirect: "supervisor_addon",
};

deepStrictEqual(
  toCanonical(app, "supervisor_addon", {
    addon: "core_samba",
    repository_url: "https://example.com",
  }),
  { app: "core_samba", repository_url: "https://example.com" },
);
deepStrictEqual(toCanonical(app, "supervisor_app", { app: "core_samba" }), {
  app: "core_samba",
});
deepStrictEqual(
  toInstance(app, { app: "core_samba", repository_url: "https://example.com" }),
  {
    key: "supervisor_addon",
    params: { addon: "core_samba", repository_url: "https://example.com" },
  },
);

const { legacy_redirect, ...appAfterCleanup } = app;
deepStrictEqual(toInstance(appAfterCleanup, { app: "core_samba" }), {
  key: "supervisor_app",
  params: { app: "core_samba" },
});

const logs = {
  redirect: "logs",
  name: "Logs",
  description: "show your Home Assistant logs",
  params: { provider: "string?" },
  legacy: {
    supervisor_logs: {
      introduced: "supervisor-2021.02.12",
      redirect_params: { provider: "supervisor" },
    },
  },
};

deepStrictEqual(toCanonical(logs, "supervisor_logs", {}), {
  provider: "supervisor",
});
deepStrictEqual(toCanonical(logs, "logs", { provider: "core" }), {
  provider: "core",
});
deepStrictEqual(toInstance(logs, { provider: "supervisor" }), {
  key: "logs",
  params: { provider: "supervisor" },
});

const areas = { redirect: "areas", name: "Areas", description: "" };

deepStrictEqual(toInstance(areas, { foo: "bar" }), {
  key: "areas",
  params: { foo: "bar" },
});

for (const redirect of redirects) {
  for (const [key, legacy] of Object.entries(redirect.legacy || {})) {
    const params = { ...redirect.example };
    if (legacy.redirect_params) {
      deepStrictEqual(toCanonical(redirect, key, params), {
        ...params,
        ...legacy.redirect_params,
      });
      continue;
    }
    const instance = toInstance({ ...redirect, legacy_redirect: key }, params);
    strictEqual(instance.key, key);
    deepStrictEqual(
      toCanonical(redirect, key, instance.params),
      params,
      `${key} does not round-trip to ${redirect.redirect}`,
    );
  }
}
