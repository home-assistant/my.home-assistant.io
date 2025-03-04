import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import redirects from "../redirect.json" with { type: "json" };;

const __dirname = fileURLToPath(new URL('.', import.meta.url));

redirects.sort((a, b) => {
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();

  if (aName < bName) {
    return -1;
  }
  if (aName > bName) {
    return 1;
  }

  return 0;
});

fs.writeFileSync(
  path.resolve(__dirname, "../redirect.json"),
  JSON.stringify(redirects, undefined, 2)
);
