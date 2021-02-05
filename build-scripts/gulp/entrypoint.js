const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const redirects = require("../../redirect.json");

const { srcDir, buildDir, getManifest } = require("../paths");

const entrypointSrcDir = path.join(srcDir, "html");

const writeFile = (template, replaces, overrideName) => {
  let content = fs.readFileSync(
    path.join(entrypointSrcDir, `${template}.html.template`),
    "utf-8"
  );
  Object.entries(replaces).forEach(([search, replace]) => {
    content = content.replace(`{{ ${search} }}`, replace);
  });
  fs.writeFileSync(`${buildDir}/${overrideName || template}.html`, content);
};

const writeIndex = (entrypoint) => writeFile("index", { entrypoint });
const writeFaq = (entrypoint) => {
  const redirectList = ["<ul>"];
  for (const [redirect, info] of Object.entries(redirects)) {
    const example = [`/redirect/${redirect}`];

    const params = Object.keys(info.example || []);

    if (params.length > 0) {
      example.push("?");
      params.forEach((param, idx) => {
        if (idx > 0) {
          example.push("&");
        }
        example.push(`${param}=${encodeURIComponent(info.example[param])}`);
      });
    }

    const examplePath = example.join("");
    redirectList.push(`
      <li>
        <a href="${examplePath}">${info.description.charAt(0).toUpperCase() +
      info.description.slice(1)}</a><br>
        <i>Introduced in Home Assistant Core ${info.introduced}.</i>
      </li>
    `);
  }
  redirectList.push("</ul>");
  writeFile("faq", { entrypoint, redirectList: redirectList.join("\n") });
};
const writeDontRedirect = (entrypoint) =>
  writeFile("dont-redirect", { entrypoint });

const writeRedirect = (redirect, entrypoint) => {
  fs.mkdirSync(`${buildDir}/redirect/${redirect}/`, { recursive: true });
  writeFile("redirect", { entrypoint }, `redirect/${redirect}/index`);
};

gulp.task("gen-entrypoint-dev-write", (done) => {
  writeIndex("app.js");
  writeFaq("app.js");
  writeDontRedirect("app.js");
  for (const redirect of Object.keys(redirects)) {
    writeRedirect(redirect, "redirect.js");
  }
  done();
});

gulp.task("gen-entrypoint-dev", () =>
  gulp.watch(
    entrypointSrcDir,
    { ignoreInitial: false },
    gulp.series("gen-entrypoint-dev-write")
  )
);

gulp.task("gen-entrypoint-prod", (done) => {
  const manifest = getManifest();
  writeIndex(manifest["app.js"]);
  writeFaq(manifest["app.js"]);
  writeDontRedirect(manifest["app.js"]);
  for (const redirect of Object.keys(redirects)) {
    writeRedirect(redirect, manifest["redirect.js"]);
  }
  done();
});
