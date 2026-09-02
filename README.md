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

`redirect.json` lists every redirect. Each entry is the current key, with the
name, badge text, description and params shown to users. The `redirect` key is
what `/redirect/<key>/` and `/create-link/?redirect=<key>` accept, and what the
instance receives at `/_my_redirect/<key>`.

### Renaming a redirect

Rename the entry to the new key and move the old key into its `legacy` object.
Everything users see, the picker, the FAQ, the badge text and the generated URL,
shows the new key. Old links, old badges and `/create-link` calls with the old
key keep working.

```json
{
  "redirect": "supervisor_app",
  "introduced": "2026.2",
  "params": { "app": "string" },
  "legacy": {
    "supervisor_addon": {
      "introduced": "supervisor-2021.02.10",
      "params_rename": { "addon": "app" }
    }
  },
  "legacy_redirect": "supervisor_addon"
}
```

- `legacy`: the old keys of the entry, one block per old key.
- `introduced`: the Home Assistant version that first understood the key, on the
  entry and in each legacy block.
- `params_rename`: in a legacy block, old param name to new param name, when a
  param changed name. Params not listed keep their name.
- `redirect_params`: in a legacy block, the params the old key implied.
  `supervisor_logs` opens `logs` with `provider` set to `supervisor`. Such a key
  cannot be the `legacy_redirect`.
- `legacy_redirect`: the old key the instance receives while the field is there.
  Set it on rename: every Home Assistant version understands the old key, only
  recent ones understand the new one.

### What the site does with a legacy key

- `/redirect/<old key>/` is generated like the page of the new key, with a
  canonical link to it. Old params are renamed before validation.
- `/badges/<old key>.svg` is generated with the new badge text.
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
