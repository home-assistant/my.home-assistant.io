var path = require("path");

module.exports = {
  srcDir: path.resolve(__dirname, "../src"),
  buildDir: path.resolve(__dirname, "../dist"),
  getManifest() {
    return require(path.resolve(__dirname, "../dist/manifest.json"));
  },
};
