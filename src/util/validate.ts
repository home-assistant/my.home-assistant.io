import { sanitizeUrl } from "@braintree/sanitize-url";
import { ParamType } from "../const";

const validateUrl = (value: string) => {
  if (value.indexOf("://") === -1) {
    return "Please enter your full URL, including the protocol part (https://).";
  }
  try {
    if (!["http:", "https:"].includes(new URL(value).protocol)) {
      return "Invalid URL.";
    }
  } catch (err) {
    return "Invalid URL.";
  }
  // Reject characters that URL parsers strip or handle inconsistently
  // (surrounding whitespace, control characters, backslashes): the raw value
  // is what gets forwarded, so it must not differ from the URL that was
  // validated.
  if (value !== value.trim() || /[\t\n\r\\]/.test(value)) {
    return "Invalid URL.";
  }
  // sanitize-url returns "about:blank" for URLs it considers unsafe
  // (e.g. javascript:, data:, vbscript:). We can't compare its output to the
  // input directly, because sanitize-url also normalizes safe URLs (adds a
  // trailing slash, lowercases the host, punycodes IDNs, ...), which would
  // reject valid input.
  if (sanitizeUrl(value) === "about:blank") {
    return "Invalid URL.";
  }
  return undefined;
};

/**
 * Validate a param.
 * @returns string with validation error if value is invalid.
 */
export const validateParam = (
  paramType: ParamType,
  value: string,
): string | undefined => {
  if (paramType === "string" || paramType === "string?") {
    return undefined;
  }

  if (paramType === "url" || paramType === "url?") {
    return validateUrl(value);
  }

  return "Unknown param type";
};
