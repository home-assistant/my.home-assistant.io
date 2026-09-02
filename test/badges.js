import path from "path";
import fs from "fs";
import assert from "assert";
import redirects from "../redirect.json" with { type: "json" };

const OUTPUT_DIR = path.resolve(import.meta.dirname, "../public/badges");

const KNOWN_ORPHANS = [
  "homeassistant",
  "developer_mqtt",
  "supervisor_addon_store",
];

assert(fs.existsSync(OUTPUT_DIR), `Output dir ${OUTPUT_DIR} doesn't exist`);

const keys = redirects.flatMap((redirect) => [
  redirect.redirect,
  ...Object.keys(redirect.legacy || {}),
]);

keys.forEach((key) => {
  assert(
    fs.existsSync(path.resolve(OUTPUT_DIR, `${key}.svg`)),
    `Badge for ${key} not found. Run "node build-scripts/create-badges.js"`,
  );
});

fs.readdirSync(OUTPUT_DIR).forEach((file) => {
  const key = file.replace(/\.svg$/, "");
  assert(
    keys.includes(key) || KNOWN_ORPHANS.includes(key),
    `Badge ${file} has no redirect. Remove it or list it in KNOWN_ORPHANS.`,
  );
});
