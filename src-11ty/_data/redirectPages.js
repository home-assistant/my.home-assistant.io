import redirects from "../../redirect.json" with { type: "json" };

export default redirects.flatMap((redirect) => [
  { ...redirect, key: redirect.redirect },
  ...Object.keys(redirect.legacy || {}).map((key) => ({ ...redirect, key })),
]);
