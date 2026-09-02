import { deepStrictEqual, strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };
import { instanceKey, toCanonical, toInstance } from "../src/data/redirect.ts";

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
strictEqual(instanceKey(appAfterCleanup), "supervisor_app");
deepStrictEqual(toInstance(appAfterCleanup, { app: "core_samba" }), {
  key: "supervisor_app",
  params: { app: "core_samba" },
});

const backup = {
  redirect: "backup",
  name: "Backup",
  description: "show an overview of your backups",
  legacy: {
    supervisor_backups: { introduced: "supervisor-2021.08.1" },
    supervisor_snapshots: { introduced: "supervisor-2021.02.10" },
  },
};

strictEqual(instanceKey(backup), "backup");
deepStrictEqual(toCanonical(backup, "supervisor_snapshots", {}), {});
deepStrictEqual(toInstance(backup, {}), { key: "backup", params: {} });

const areas = { redirect: "areas", name: "Areas", description: "" };

deepStrictEqual(toInstance(areas, { foo: "bar" }), {
  key: "areas",
  params: { foo: "bar" },
});

for (const redirect of redirects) {
  const params = redirect.example || {};
  for (const key of Object.keys(redirect.legacy || {})) {
    const instance = toInstance({ ...redirect, legacy_redirect: key }, params);
    strictEqual(instance.key, key);
    deepStrictEqual(
      toCanonical(redirect, key, instance.params),
      params,
      `${key} does not round-trip to ${redirect.redirect}`,
    );
  }
  strictEqual(
    instanceKey(redirect),
    redirect.legacy_redirect || redirect.redirect,
  );
}
