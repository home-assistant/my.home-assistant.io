// Pure helpers for the stored instance URLs. Kept free of browser globals so
// they can be tested in Node.

const isInstanceUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }
  const result = parseInstanceUrl(value);
  return "url" in result && result.url === value;
};

// `stored` is the list written when there is more than one instance, `legacy`
// the single URL that has always been stored and still holds the first one.
// The legacy URL is used as stored, like it always was. The list only keeps
// URLs the form could have stored.
export const parseInstanceUrls = (
  stored: string | null,
  legacy: string | null,
): string[] => {
  const single = legacy ? [legacy] : [];
  if (!stored) {
    return single;
  }
  let urls: unknown;
  try {
    urls = JSON.parse(stored);
  } catch (err) {
    return single;
  }
  if (!Array.isArray(urls)) {
    return single;
  }
  const valid = urls.filter(
    (url, index): url is string =>
      isInstanceUrl(url) && urls.indexOf(url) === index,
  );
  // A version of the site without multiple instances only updates the single
  // URL. The list is then outdated.
  if (!valid.length || (legacy && valid[0] !== legacy)) {
    return single;
  }
  return valid;
};

export const parseInstanceUrl = (
  value: string,
): { url: string } | { error: string } => {
  if (value.indexOf("://") === -1) {
    return {
      error:
        "Please enter your full URL, including the protocol part (https://).",
    };
  }
  let urlObj: URL;
  try {
    urlObj = new URL(value);
  } catch (err) {
    return { error: "Invalid URL" };
  }
  if (!["http:", "https:"].includes(urlObj.protocol)) {
    return { error: "Invalid URL" };
  }
  return { url: `${urlObj.protocol}//${urlObj.host}` };
};

// The host is short enough to tell instances apart, unless two URLs only
// differ in their protocol.
export const instanceLabels = (urls: string[]): string[] => {
  const hosts = urls.map((url) => new URL(url).host);
  return urls.map((url, index) =>
    hosts.indexOf(hosts[index]) === hosts.lastIndexOf(hosts[index])
      ? hosts[index]
      : url,
  );
};
