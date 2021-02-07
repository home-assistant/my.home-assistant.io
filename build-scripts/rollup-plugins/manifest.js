const url = require("url");

const defaultOptions = {
  publicPath: "",
};

// Reuse the file across each build.
const manifest = {};

export default function(userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return {
    name: "manifest",
    generateBundle(outputOptions, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (!chunk.isEntry) {
          continue;
        }
        // Add js extension to mimic Webpack manifest.
        manifest[`${chunk.name}.js`] = url.resolve(
          options.publicPath,
          chunk.fileName
        );
      }

      this.emitFile({
        type: "asset",
        source: JSON.stringify(manifest, undefined, 2),
        name: "manifest.json",
        fileName: "manifest.json",
      });
    },
  };
}
