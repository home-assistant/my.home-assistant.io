import { sanitizeUrl } from "@braintree/sanitize-url";
import "@material/mwc-button";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import { getInstanceUrl } from "../data/instance_info";
import { Redirect, ParamType } from "../const";
import { svgPencil } from "../components/svg-pencil";

declare global {
  interface Window {
    redirect: Redirect;
  }
}

const checkParamType = (type: ParamType, value: string) => {
  if (type === "string") {
    return true;
  }
  if (type === "url") {
    return value && value === sanitizeUrl(value);
  }
  return false;
};

const createRedirectParams = (): string => {
  const redirectParams = window.redirect.params;
  const userParams = extractSearchParamsObject();
  if (!redirectParams && !Object.keys(userParams).length) {
    return "";
  }
  if (
    Object.keys(redirectParams || {}).length !== Object.keys(userParams).length
  ) {
    throw Error("Wrong parameters");
  }
  Object.entries(redirectParams || {}).forEach(([key, type]) => {
    if (!userParams[key] || !checkParamType(type, userParams[key])) {
      throw Error("Wrong parameters");
    }
  });
  return `?${createSearchParam(userParams)}`;
};

(async function () {
  const instanceUrl = getInstanceUrl();

  if (instanceUrl === null) {
    setTimeout(() => document.location.assign("/?change=1"), 100);
    return;
  }

  let params;
  try {
    params = createRedirectParams();
  } catch (err) {
    alert("Invalid parameters given.");
    document.location.assign(
      `/create-link?redirect=${window.redirect.redirect}`
    );
    return;
  }
  const redirectUrl = `${instanceUrl}/_my_redirect/${window.redirect.redirect}${params}`;

  document.querySelector(".fake-button")!.outerHTML = `
    <a href="${redirectUrl}">
      <mwc-button>Open Link</mwc-button>
    </a>
  `;

  const layout = document.querySelector(".layout")!;
  const changeInstance = document.createElement("div");
  changeInstance.classList.add("instance-footer");
  changeInstance.innerHTML = `
    <b>Your instance URL:</b> ${instanceUrl}
    <a href="/?change=1">
      ${svgPencil}
    </a>
  `;
  layout.insertBefore(changeInstance, layout.querySelector(".spacer"));
})();
