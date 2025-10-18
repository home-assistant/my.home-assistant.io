import "@material/web/button/filled-button";
import "@material/web/button/outlined-button";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import { getInstances } from "../data/instance_info";
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
    const userParam = userParams[key];

    if (!userParam && type.endsWith("?")) {
      continue;
    }
    if (!userParam || validateParam(type, userParam)) {
      throw Error("Wrong parameters");
    }
    params[key] = userParam;
  }
  return `?${createSearchParam(params)}`;
};

let changingInstance = false;

const render = (showTroubleshooting: boolean) => {
  const instances = getInstances();

  let params;
  try {
    params = createRedirectParams();
  } catch (err) {
    alert("Invalid parameters given.");
    if (!isMobile) {
      document.location.assign(
        `/create-link?redirect=${window.redirect.redirect}`,
      );
    }
    return;
  }

  const changeUrl = `/redirect/_change/?redirect=${encodeURIComponent(
    window.redirect.redirect + "/" + params,
  )}`;

  if (instances === null) {
    changingInstance = true;
    document.location.assign(changeUrl);
    return;
  }

  const redirectUrl =
    window.redirect.redirect === "oauth"
      ? `${instances[0]}/auth/external/callback${params}`
      : `${instances[0]}/_my_redirect/${window.redirect.redirect}${params}`;

  const openLink = document.querySelector(".open-link") as HTMLElement;
  openLink.outerHTML = `
    <a href="${redirectUrl}" class='open-link' rel="noopener">
      <md-filled-button>${openLink.innerText}</md-filled-button>
    </a>
  `;

  if (window.redirect.redirect === "oauth") {
    const params = extractSearchParamsObject();

    let buttonCaption = "Decline";

    // User already rejected, hide link button
    if ("error" in params) {
      document.querySelector(".card-header")!.innerHTML =
        "Account linking rejected";
      buttonCaption = "Notify Home Assistant of rejection";
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
          <md-outlined-button>${buttonCaption}</md-outlined-button>
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
