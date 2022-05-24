import { sanitizeUrl } from "@braintree/sanitize-url";
import { ParamType } from "../const";

const validateUrl = (value: string) => {
  if (value.indexOf("://") === -1) {
    return "Please enter your full URL, including the protocol part (https://).";
  }
  try {
    new URL(value);
  } catch (err) {
    return "Invalid URL.";
  }
  if (value !== sanitizeUrl(value)) {
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
  value: string
): string | undefined => {
  if (paramType === "string" || paramType === "string?") {
    return undefined;
  }

  if (paramType === "url" || paramType === "url?") {
    return validateUrl(value);
  }

  return "Unknown param type";
};
