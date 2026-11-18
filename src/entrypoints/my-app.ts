import { storeUrl } from "../data/store_url";
import { extractSearchParam } from "../util/search-params";

// Open /app/?stay to show the page instead of going to the store.
if (extractSearchParam("stay") === null) {
  const url = storeUrl(navigator.userAgent, navigator.maxTouchPoints);
  if (url) {
    // Replace, so going back does not land on the redirect again.
    location.replace(url);
  }
}
