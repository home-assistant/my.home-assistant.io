import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import entrypointHashmanifest from "rollup-plugin-entrypoint-hashmanifest";

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  nodeResolve({}),
  commonjs(),
  json(),
  typescript(),
  production && terser(),
];

export default [
  {
    input: "./src/entrypoints/app.ts",
    output: {
      dir: "dist/",
      format: "es",
      entryFileNames: production ? "[name]-[hash].js" : "[name].js",
      chunkFileNames: "[name]-[hash].js",
    },
    plugins: [
      ...plugins,
      production && entrypointHashmanifest({ manifestName: "manifest.json" }),
    ],
  },
];
