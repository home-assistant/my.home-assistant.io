import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import assert from "assert";
import redirects from "../redirect.json" with { type: "json" };

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const OUTPUT_DIR = path.resolve(__dirname, "../public/badges");

assert(fs.existsSync(OUTPUT_DIR), `Output dir ${OUTPUT_DIR} doesn't exist`);

redirects.forEach((redirect) => {
  assert(
    fs.existsSync(path.resolve(OUTPUT_DIR, `${redirect.redirect}.svg`)),
    `Badge for ${redirect.redirect} not found. Run "node build-scripts/create-badges.js"`
  );
});
