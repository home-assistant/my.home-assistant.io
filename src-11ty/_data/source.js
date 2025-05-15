import { readFileSync } from "fs";
import { join } from "path";
import manifest from "../../dist/js/manifest.json" with { type: "json" };

const source = {};

for (const key of Object.keys(manifest)) {
  source[key] = readFileSync(
    join(import.meta.dirname, "../../dist/js/", manifest[key]),
    "utf-8",
  );
}

export default source;
