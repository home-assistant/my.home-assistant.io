import { writeFileSync } from "fs";
import { join } from "path";
import { resolve } from "url";

const defaultOptions = {
  publicPath: "",
};

// Reuse the file across each build.
const manifest = {};

export default function (userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return {
    name: "manifest",
    writeBundle(outputOptions, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk" || !chunk.isEntry) {
          continue;
        }
        // Add js extension to mimic Webpack manifest.
        manifest[`${chunk.name}.js`] = resolve(
          options.publicPath,
          chunk.fileName,
        );
      }

      // Write the latest entries together after each parallel build finishes.
      writeFileSync(
        join(outputOptions.dir, "manifest.json"),
        JSON.stringify(manifest, undefined, 2),
      );
    },
  };
}
