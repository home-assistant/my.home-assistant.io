import redirects from "../../redirect.json" with { type: "json" };
import legacies from "../../legacy.json" with { type: "json" };

export default redirects.flatMap((redirect) => {
  const family = legacies.filter(
    (legacy) => legacy.new_redirect === redirect.redirect,
  );
  return [redirect.redirect, ...family.map((legacy) => legacy.redirect)].map(
    (key) => ({ ...redirect, key, legacies: family }),
  );
});
