import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import manifest from "./build-scripts/rollup-plugins/manifest";

const production = !process.env.ROLLUP_WATCH;

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
    input: "./src/entrypoints/app.ts",
    output: {
      dir: "dist/",
      format: "es",
      entryFileNames: production ? "[name]-[hash].js" : "[name].js",
      chunkFileNames: "[name]-[hash].js",
    },
    plugins: plugins(true),
  },
];
