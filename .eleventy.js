module.exports = function(eleventyConfig) {
  eleventyConfig.addLiquidFilter("title", function(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  eleventyConfig.addLiquidFilter("redirectExamplePath", function(redirect) {
    const example = [`/redirect/${redirect.redirect}`];

    const params = Object.keys(redirect.example || []);

    if (params.length > 0) {
      example.push("?");
      params.forEach((param, idx) => {
        if (idx > 0) {
          example.push("&");
        }
        example.push(`${param}=${encodeURIComponent(redirect.example[param])}`);
      });
    }

    return example.join("");
  });

  return {
    dir: {
      input: "src-11ty",
      output: "dist",
    },
  };
};
