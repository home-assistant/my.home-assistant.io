const createSearchParam = (params) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    urlParams.append(key, value);
  });
  return urlParams.toString();
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addLiquidFilter("title", function (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  eleventyConfig.addLiquidFilter("stringify", function (value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addLiquidFilter("redirectExamplePath", function (redirect) {
    return `/redirect/${
      redirect.redirect
    }${redirect.example ? `?${createSearchParam(redirect.example)}` : ""}`;
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

  return {
    dir: {
      input: "src-11ty",
      output: "dist",
    },
  };
};
