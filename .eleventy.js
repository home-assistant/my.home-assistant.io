import { minify } from "html-minifier-terser";
import legacies from "./legacy.json" with { type: "json" };

const createSearchParam = (params) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    urlParams.append(key, value);
  });
  return urlParams.toString();
};

export default function (eleventyConfig) {
  eleventyConfig.addLiquidFilter("title", function (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  eleventyConfig.addLiquidFilter("stringify", function (value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addLiquidFilter("redirectExamplePath", function (redirect) {
    return `/redirect/${
      redirect.redirect
    }/${redirect.example ? `?${createSearchParam(redirect.example)}` : ""}`;
  });

  eleventyConfig.addLiquidFilter("instanceIntroduced", function (redirect) {
    const legacy = legacies.find(
      (entry) => entry.redirect === redirect.legacy_redirect,
    );
    return legacy ? legacy.introduced : redirect.introduced;
  });

  eleventyConfig.addLiquidFilter("version", function (value) {
    if (value.startsWith("supervisor-")) {
      return `Home Assistant Supervisor ${value.replace("supervisor-", "")}`;
    }
    if (value.startsWith("core-")) {
      return `Home Assistant Core ${value.replace("core-", "")}`;
    }
    return `Home Assistant Core ${value}`;
  });

  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
      if (outputPath.endsWith(".html")) {
        let minified = minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
        });
        return minified;
      }

      return content;
    });
  }

  return {
    dir: {
      input: "src-11ty",
      output: "dist",
    },
  };
}
