import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import manifest from "./build-scripts/rollup-plugins/manifest";

const production = process.env.NODE_ENV === "production";

const terserOptions = (latestBuild) => ({
  safari10: !latestBuild,
  ecma: latestBuild ? undefined : 5,
  output: { comments: false },
});

const plugins = (latestBuild) =>
  [
    nodeResolve({}),
    commonjs(),
    json(),
    typescript(),
    production && terser(terserOptions(latestBuild)),
    manifest(),
  ].filter(Boolean);

export default [
  {
    input: {
      "my-index": "./src/entrypoints/my-index.ts",
      "my-redirect": "./src/entrypoints/my-redirect.ts",
    },
    output: {
      dir: "dist",
      format: "es",
      entryFileNames: production ? "[name]-[hash].js" : "[name].js",
      chunkFileNames: "[name]-[hash].js",
    },
    plugins: plugins(true),
  },
];
