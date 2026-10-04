import path from "path";
import fs from "fs";
import redirects from "../redirect.json" with { type: "json" };
import legacies from "../legacy.json" with { type: "json" };

const compare = (a, b) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

redirects.sort((a, b) => compare(a.name.toLowerCase(), b.name.toLowerCase()));
legacies.sort((a, b) => compare(a.redirect, b.redirect));

fs.writeFileSync(
  path.resolve(import.meta.dirname, "../redirect.json"),
  JSON.stringify(redirects, undefined, 2),
);
fs.writeFileSync(
  path.resolve(import.meta.dirname, "../legacy.json"),
  JSON.stringify(legacies, undefined, 2),
);
