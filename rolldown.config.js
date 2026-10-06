import { parse } from "path";
import { defineConfig } from "rolldown";
import manifest from "./build-scripts/rolldown-plugins/manifest.js";

const production = process.env.NODE_ENV === "production";

// Each entrypoint a different build to avoid code reuse across builds
export default defineConfig(
  [
    "./src/entrypoints/my-index.ts",
    "./src/entrypoints/my-invite.ts",
    "./src/entrypoints/my-redirect.ts",
    "./src/entrypoints/my-change-url.ts",
    "./src/entrypoints/my-create-link.ts",
  ].map((entrypoint) => ({
    input: {
      [parse(entrypoint).name]: entrypoint,
    },
    platform: "browser",
    tsconfig: "./tsconfig.json",
    transform: {
      target: "es2017",
    },
    output: {
      dir: "dist/js",
      format: "iife",
      entryFileNames: production ? "[name]-[hash].js" : "[name].js",
      minify: production,
      comments: false,
    },
    plugins: [manifest()],
  })),
);
