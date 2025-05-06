import { parse } from "path";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import manifest from "./build-scripts/rollup-plugins/manifest.js";

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

// Each entrypoint a different build to avoid code reuse across builds
export default [
  "./src/entrypoints/my-index.ts",
  "./src/entrypoints/my-invite.ts",
  "./src/entrypoints/my-redirect.ts",
  "./src/entrypoints/my-change-url.ts",
  "./src/entrypoints/my-create-link.ts",
].map((entrypoint) => ({
  input: {
    [parse(entrypoint).name]: entrypoint,
  },
  output: {
    dir: "dist/js",
    format: "iife",
    entryFileNames: production ? "[name]-[hash].js" : "[name].js",
  },
  plugins: plugins(true),
}));
