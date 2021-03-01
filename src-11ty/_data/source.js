const fs = require("fs");
const path = require("path");
const manifest = require("../../dist/js/manifest.json");

const source = {};

for (const key of Object.keys(manifest)) {
  source[key] = fs.readFileSync(
    path.join(__dirname, "../../dist/js/", manifest[key]),
    "utf-8"
  );
}

module.exports = source;
