const redirects = require("../../redirect.json");

module.exports = Object.keys(redirects).map((key) => {
  const info = redirects[key];
  info.redirect = key;
  return info;
});
