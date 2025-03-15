import path from "path";
import fs from "fs";
import redirects from "../redirect.json" with { type: "json" };;

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
  path.resolve(import.meta.dirname, "../redirect.json"),
  JSON.stringify(redirects, undefined, 2)
);
