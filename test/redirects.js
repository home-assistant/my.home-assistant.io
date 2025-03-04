import { strictEqual } from "assert";
import redirects from "../redirect.json" with { type: "json" };

const sorted = [...redirects].sort((a, b) => {
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

const firstNonEqual = redirects.find(
  (info, idx) => info.redirect !== sorted[idx].redirect
);

strictEqual(
  firstNonEqual,
  undefined,
  "Redirects need to be sorted by name! Run 'node build-scripts/sort-redirects.js'"
);
