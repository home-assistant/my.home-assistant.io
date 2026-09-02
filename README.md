# My Home Assistant

Powers https://my.home-assistant.io/

## Development

Start a hot-reloading development build server with:

```bash
./script/develop
```

Open http://localhost:3000 to view your changes as you make them.

Or, perform a production build with:

```bash
./script/build
```

And then serve it up with:

```bash
yard serve dist
```

Open http://localhost:3000 to view your production build.

## Redirects

`redirect.json` lists every redirect. One entry looks like this:

```json
{
  "redirect": "blueprint_import",
  "name": "Blueprints: start import",
  "badge": "Import blueprint to",
  "description": "show the blueprint import dialog with a specific blueprint pre-filled",
  "introduced": "2021.3",
  "params": {
    "blueprint_url": "url"
  },
  "example": {
    "blueprint_url": "https://github.com/home-assistant/core/blob/master/homeassistant/components/automation/blueprints/motion_light.yaml"
  }
}
```

- `redirect`: the key. It names the page `/redirect/blueprint_import/`, the
  badge `/badges/blueprint_import.svg`, the
  `/create-link/?redirect=blueprint_import` preselection, and what the instance
  receives at `/_my_redirect/blueprint_import`.
- `name`: shown in the `/create-link` picker and in the FAQ.
- `badge`: the badge text, followed by "My Home Assistant". Falls back to
  `name`.
- `description`: completes "Open your Home Assistant instance and ..." on the
  redirect page and in the badge alt text.
- `introduced`: the Home Assistant version that first understood the key, shown
  in the FAQ. Supervisor-era keys use `supervisor-2021.02.10`.
- `params`: the query params and their type, `string` or `url`, with `?` for
  optional ones. Params are validated on the redirect page and in
  `/create-link`.
- `example`: param values for the FAQ link.
- `component`: the integration the page needs, for information.
- `custom`: shows a warning that the link goes to a custom integration.
- `deprecated`: hides the entry from the picker and the FAQ. The page and the
  badge are still built.

Entries are sorted by name and every entry needs a badge. The pre-commit hook
runs `build-scripts/sort-redirects.js` and `build-scripts/create-badges.js` for
you.

## Migrating a redirect

When the frontend renames a page or a param, the entry gets the new key and the
old key moves into its `legacy` object. Everything users see, the picker, the
FAQ, the badge text and the generated URL, shows the new key. Old links, old
badges and `/create-link` calls with the old key keep working.

### Renaming a key

```json
{
  "redirect": "tools_states",
  "name": "Tools: states",
  "introduced": "2026.8",
  "legacy": {
    "developer_states": {
      "introduced": "2021.3"
    }
  },
  "legacy_redirect": "developer_states"
}
```

`/redirect/developer_states/` resolves to `tools_states`, and
`/create-link/?redirect=developer_states` preselects "Tools: states" and
generates `/redirect/tools_states/`. Because of `legacy_redirect`, the instance
still receives `developer_states`, which every version understands, while
`tools_states` only exists since 2026.8.

### Renaming a param

```json
{
  "redirect": "supervisor_app",
  "name": "App: dashboard",
  "introduced": "2026.2",
  "params": {
    "app": "string",
    "repository_url": "url?"
  },
  "legacy": {
    "supervisor_addon": {
      "introduced": "supervisor-2021.02.10",
      "params_rename": {
        "addon": "app"
      }
    }
  },
  "legacy_redirect": "supervisor_addon"
}
```

`params_rename` maps the old name to the new one.
`/redirect/supervisor_addon/?addon=core_samba` resolves to `supervisor_app` with
`app=core_samba`, and the instance receives `supervisor_addon?addon=core_samba`.
Params not listed, like `repository_url`, keep their name.

### Merging into another redirect

```json
{
  "redirect": "logs",
  "name": "Logs",
  "introduced": "2021.3",
  "params": {
    "provider": "string?"
  },
  "legacy": {
    "supervisor_logs": {
      "introduced": "supervisor-2021.02.12",
      "redirect_params": {
        "provider": "supervisor"
      }
    }
  }
}
```

`redirect_params` gives the params the old key implied.
`/redirect/supervisor_logs/` resolves to `logs` with `provider=supervisor`, and
the instance receives `logs?provider=supervisor`. Such an old key only stands
for part of the entry, so it cannot be the `legacy_redirect`.

### The fields

- `legacy`: the old keys of the entry, one block per old key.
- `introduced`: in a legacy block, the version that first understood the old
  key.
- `params_rename`: old param name to new param name.
- `redirect_params`: params the old key implied.
- `legacy_redirect`: the old key the instance receives while the field is there.
  Set it on rename, remove it when cleaning up.

### What the site does with a legacy key

- `/redirect/<old key>/` is built like the page of the new key, with a canonical
  link to it. Old params are renamed before validation.
- `/badges/<old key>.svg` is built with the new badge text.
- `/create-link/?redirect=<old key>&<old params>` preselects the new entry with
  the params filled in and generates the URL with the new key.
- The instance receives the `legacy_redirect` key with the params renamed back,
  or the new key when the entry has no `legacy_redirect`.
- The FAQ shows the version of the key the instance receives.

`npm test` checks that a key appears once across entries and legacy blocks, that
`legacy_redirect` names a legacy key of the entry without `redirect_params`,
that `params_rename` and `redirect_params` only name params of the entry, that
versions are well formed, and that every key has a badge.

### Cleaning up

About six months after the release that introduced the new key, remove
`legacy_redirect` here and the old key in the frontend. The old key then keeps
working through this site only. Never remove a legacy block: links and badges
using its key are embedded in years of posts and documentation.
