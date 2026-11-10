import appStores from "./app_stores.json" with { type: "json" };

export const storeUrl = (
  userAgent: string,
  maxTouchPoints: number,
): string | null => {
  if (
    /iPhone|iPad|iPod/.test(userAgent) ||
    // iPadOS reports itself as a Mac, but Macs have no touch screen.
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  ) {
    return appStores.app_store;
  }
  if (/Android/.test(userAgent)) {
    return appStores.google_play;
  }
  return null;
};
