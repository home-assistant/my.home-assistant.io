import "@material/mwc-button";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import { getInstanceUrl } from "../data/instance_info";
import { Redirect } from "../const";
import { svgPencil } from "../components/svg-pencil";
import { isMobile } from "../data/is_mobile";
import { validateParam } from "../util/validate";

declare global {
  interface Window {
    redirect: Redirect;
  }
}

const createRedirectParams = (): string => {
  const redirectParams = window.redirect.params;
  const userParams = extractSearchParamsObject();
  if (!redirectParams) {
    return "";
  }
  const params = {};
  for (const [key, type] of Object.entries(redirectParams)) {
    if (!userParams[key] && type.endsWith("?")) {
      continue;
    }
    if (!userParams[key] || validateParam(type, userParams[key])) {
      throw Error("Wrong parameters");
    }
    params[key] = userParams[key];
  }
  return `?${createSearchParam(params)}`;
};

let changingInstance = false;

const render = (showTroubleshooting: boolean) => {
  const instanceUrl = getInstanceUrl();

  let params;
  try {
    params = createRedirectParams();
  } catch (err) {
    alert("Invalid parameters given.");
    if (!isMobile) {
      document.location.assign(
        `/create-link?redirect=${window.redirect.redirect}`
      );
    }
    return;
  }

  const changeUrl = `/redirect/_change/?redirect=${encodeURIComponent(
    window.redirect.redirect + "/" + params
  )}`;

  if (instanceUrl === null) {
    changingInstance = true;
    document.location.assign(changeUrl);
    return;
  }

  const redirectUrl = `${instanceUrl}/_my_redirect/${window.redirect.redirect}${params}`;

  const openLink = document.querySelector(".open-link") as HTMLElement;
  openLink.outerHTML = `
    <a href="${redirectUrl}" class='open-link' rel="noopener">
      <mwc-button>${openLink.innerText}</mwc-button>
    </a>
  `;

  if (window.redirect.redirect === "oauth") {
    const params = extractSearchParamsObject();

    let buttonCaption = "DECLINE";

    // User already rejected, hide link button
    if ("error" in params) {
      document.querySelector(".card-header")!.innerHTML =
        "Account linking rejected";
      buttonCaption = "NOTIFY HOME ASSISTANT OF REJECTION";
      (document.querySelector(".open-link") as HTMLElement).style.visibility =
        "hidden";
    }

    const declineLink = document.querySelector(".decline-link")!;
    const declineParams = createSearchParam({
      error: params.error || "access_denied",
      state: params.state,
    });
    declineLink.outerHTML = `
        <a href="${instanceUrl}/_my_redirect/${window.redirect.redirect}?${declineParams}" class='decline-link' rel="noopener">
          <mwc-button>${buttonCaption}</mwc-button>
        </a>
      `;
  }

  if (isMobile) {
    (document.querySelector(".footer") as HTMLDivElement).style.display =
      "none";
    return;
  }

  let changeInstanceEl = document.querySelector(".instance-footer")!;
  changeInstanceEl.innerHTML = `
    <b>Your instance URL:</b> ${instanceUrl}
    <a href="${changeUrl}">
      ${svgPencil}
    </a>
  `;
  changeInstanceEl.querySelector("a")!.addEventListener("click", () => {
    changingInstance = true;
  });

  // When we were changing the instance, we're not going to mess with troubleshooting.
  if (changingInstance) {
    changingInstance = false;
    return;
  }

  (document.querySelector(".highlight") as HTMLDivElement).style.display =
    showTroubleshooting ? "block" : "none";
};

render(false);

// For Safari/FF to handle history.back() after update instance URL
window.onpageshow = (event) => {
  if (event.persisted) {
    render(true);
  }
};
