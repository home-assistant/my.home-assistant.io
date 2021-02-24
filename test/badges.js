const path = require("path");
const fs = require("fs");
const assert = require("assert");
const redirects = require("../redirect.js");

const OUTPUT_DIR = path.resolve(__dirname, "../public/badges");

assert(fs.existsSync(OUTPUT_DIR), `Output dir ${OUTPUT_DIR} doesn't exist`);

redirects.forEach((redirect) => {
  assert(
    fs.existsSync(path.resolve(OUTPUT_DIR, `${redirect.redirect}.svg`)),
    `Badge for ${redirect.redirect} not found. Run "node build-scripts/create-badges.js"`
  );
});
