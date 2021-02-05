const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const redirects = require("../../redirect.json");

const { srcDir, buildDir, getManifest } = require("../paths");

const writeFile = (template, replaces, overrideName) => {
  let content = fs.readFileSync(
    path.join(srcDir, `html/${template}.html.template`),
    "utf-8"
  );
  Object.entries(replaces).forEach(([search, replace]) => {
    content = content.replace(`{{ ${search} }}`, replace);
  });
  fs.writeFileSync(`${buildDir}/${overrideName || template}.html`, content);
};

const writeIndex = (entrypoint) => writeFile("index", { entrypoint });

const writeRedirect = (redirect, entrypoint) => {
  fs.mkdirSync(`${buildDir}/redirect/${redirect}/`, { recursive: true });
  writeFile("redirect", { entrypoint }, `redirect/${redirect}/index`);
};

gulp.task("gen-entrypoint-dev", (done) => {
  writeIndex("app.js");
  for (const redirect of Object.keys(redirects)) {
    writeRedirect(redirect, "redirect.js");
  }
  done();
});

gulp.task("gen-entrypoint-prod", (done) => {
  const manifest = getManifest();
  writeIndex(manifest["app.js"]);
  for (const redirect of Object.keys(redirects)) {
    writeRedirect(redirect, manifest["redirect.js"]);
  }
  done();
});
