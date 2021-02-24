const path = require("path");
const fs = require("fs");
const redirects = require("../redirect.json");

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
