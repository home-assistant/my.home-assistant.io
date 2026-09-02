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
name, badge text, description and params shown to users.

When a redirect is renamed, the old key moves into the `legacy` object of the
new entry, with the Home Assistant version it was introduced in. Legacy keys
keep their `/redirect/` page and their badge for good, the badge showing the new
text, and `/create-link` resolves them to the new entry. When a param was
renamed too, `params_rename` maps the old name to the new one.

```json
{
  "redirect": "supervisor_app",
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

While an entry has `legacy_redirect`, the instance receives that old key instead
of the new one, so links keep working on instances that predate the rename.
Remove it once people have had time to update, about six months after the
release that introduced the new key. Never remove a legacy key itself: links and
badges using it are embedded in years of posts and documentation.
