import { strictEqual } from "assert";
import appStores from "../src/data/app_stores.json" with { type: "json" };
import { storeUrl } from "../src/data/store_url.ts";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1";
const IPOD =
  "Mozilla/5.0 (iPod touch; CPU iPhone OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1";
// iPadOS and macOS Safari send the same user agent.
const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15";
const ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";
const ANDROID_FIREFOX =
  "Mozilla/5.0 (Android 15; Mobile; rv:139.0) Gecko/139.0 Firefox/139.0";
const WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";
const LINUX =
  "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0";

strictEqual(storeUrl(IPHONE, 5), appStores.app_store);
strictEqual(storeUrl(IPAD, 5), appStores.app_store);
strictEqual(storeUrl(IPOD, 5), appStores.app_store);
strictEqual(storeUrl(MAC, 5), appStores.app_store);
strictEqual(storeUrl(MAC, 0), null);
strictEqual(storeUrl(ANDROID_PHONE, 5), appStores.google_play);
strictEqual(storeUrl(ANDROID_TABLET, 10), appStores.google_play);
strictEqual(storeUrl(ANDROID_FIREFOX, 5), appStores.google_play);
strictEqual(storeUrl(WINDOWS, 0), null);
strictEqual(storeUrl(WINDOWS, 10), null);
strictEqual(storeUrl(LINUX, 0), null);
strictEqual(storeUrl("", 0), null);
