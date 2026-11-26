import { deepStrictEqual, strictEqual } from "assert";
import {
  instanceLabels,
  parseInstanceUrl,
  parseInstanceUrls,
} from "../src/data/instance_urls.ts";

const a = "http://a.local:8123";
const b = "https://b.example";
const list = (...urls) => JSON.stringify(urls);

// A single instance is stored in the legacy key only.
deepStrictEqual(parseInstanceUrls(null, a), [a]);
deepStrictEqual(parseInstanceUrls(null, null), []);

// The legacy key is used as stored, whatever older versions accepted.
deepStrictEqual(parseInstanceUrls(null, ""), []);
deepStrictEqual(parseInstanceUrls(null, "homeassistant://navigate"), [
  "homeassistant://navigate",
]);
deepStrictEqual(parseInstanceUrls(list(a, b), "homeassistant://navigate"), [
  "homeassistant://navigate",
]);

// Multiple instances are stored as a list that starts with the legacy URL.
deepStrictEqual(parseInstanceUrls(list(a, b), a), [a, b]);
deepStrictEqual(parseInstanceUrls(list(a, b), null), [a, b]);

// A site version without multiple instances only updates the legacy key, which
// makes the list outdated.
deepStrictEqual(parseInstanceUrls(list(a, b), b), [b]);
deepStrictEqual(parseInstanceUrls(list(a, b), "http://c.local"), [
  "http://c.local",
]);

// Broken lists fall back to the legacy key.
deepStrictEqual(parseInstanceUrls("{", a), [a]);
deepStrictEqual(parseInstanceUrls("{}", a), [a]);
deepStrictEqual(parseInstanceUrls("null", a), [a]);
deepStrictEqual(parseInstanceUrls("[]", a), [a]);
deepStrictEqual(parseInstanceUrls("[]", null), []);

// Only entries the form could have stored are kept, once.
deepStrictEqual(
  parseInstanceUrls(
    list(
      a,
      1,
      "",
      null,
      a,
      "javascript:alert(1)",
      "not a url",
      "https://b.example/path",
      b,
    ),
    a,
  ),
  [a, b],
);
deepStrictEqual(parseInstanceUrls(list("javascript:alert(1)"), a), [a]);

deepStrictEqual(parseInstanceUrl("https://ha.example:8123/lovelace?x=1"), {
  url: "https://ha.example:8123",
});
deepStrictEqual(parseInstanceUrl("HTTP://HA.Example"), {
  url: "http://ha.example",
});
strictEqual("error" in parseInstanceUrl("ha.example"), true);
strictEqual("error" in parseInstanceUrl("ftp://ha.example"), true);
strictEqual("error" in parseInstanceUrl("javascript://ha.example"), true);
strictEqual("error" in parseInstanceUrl("http://"), true);

deepStrictEqual(instanceLabels([a, b]), ["a.local:8123", "b.example"]);
deepStrictEqual(
  instanceLabels(["http://a.local", "https://a.local", "https://b.local"]),
  ["http://a.local", "https://a.local", "b.local"],
);
