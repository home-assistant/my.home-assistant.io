import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import manifest from "../../dist/js/manifest.json" with { type: "json" };

const source = {};

const __dirname = fileURLToPath(new URL('.', import.meta.url));

for (const key of Object.keys(manifest)) {
  source[key] = readFileSync(
    join(__dirname, "../../dist/js/", manifest[key]),
    "utf-8"
  );
}

export default source;
