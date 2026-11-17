import {
  createSearch,
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import { getInstanceUrls } from "../data/instance_info";
import { instanceLabels } from "../data/instance_urls";
import { LegacyRedirect, Redirect } from "../const";
import { toCanonical, toInstance } from "../data/redirect";
import { svgPencil } from "../components/svg-pencil";
import { mdiChevronRight } from "@mdi/js";
import { isMobile } from "../data/is_mobile";
import { validateParam } from "../util/validate";

const svgChevron = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${mdiChevronRight}" /></svg>`;

declare global {
  interface Window {
    redirect: Redirect & { key: string; legacies: LegacyRedirect[] };
  }
}

const createRedirectParams = (): Record<string, string> => {
  const params = {};
  const redirectParams = window.redirect.params;
  if (!redirectParams) {
    return params;
  }
  const userParams = toCanonical(
    window.redirect.legacies.find(
      (legacy) => legacy.redirect === window.redirect.key,
    ),
    extractSearchParamsObject(),
  );
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
  return params;
};

let changingInstance = false;

// Links are built with the DOM instead of HTML, so a stored instance URL is
// never parsed as markup.
const replaceWithButtonLink = (
  selector: string,
  href: string,
  appearance: "accent" | "outlined",
  caption: string,
): HTMLAnchorElement => {
  const placeholder = document.querySelector(selector)!;
  const link = document.createElement("a");
  link.setAttribute("href", href);
  link.className = `ha-button ${appearance} ${selector.substring(1)}`;
  link.rel = "noopener";
  link.textContent = caption;
  placeholder.replaceWith(link);
  return link;
};

const renderInstanceList = (
  items: { href: string; label: string; title: string }[],
) => {
  const list = document.querySelector(".instance-list")!;
  list.textContent = "";
  for (const item of items) {
    const link = document.createElement("a");
    link.setAttribute("href", item.href);
    link.rel = "noopener";
    link.title = item.title;
    link.innerHTML = svgChevron;
    link.prepend(item.label);
    const listItem = document.createElement("li");
    listItem.append(link);
    list.append(listItem);
  }
};

const render = (showTroubleshooting: boolean) => {
  const instanceUrls = getInstanceUrls();

  let params: Record<string, string>;
  try {
    params = createRedirectParams();
  } catch (err) {
    // The app and hidden redirects cannot use the create link page.
    if (isMobile || window.redirect.hidden) {
      document.querySelector(".card-content")!.textContent =
        "This link has invalid parameters.";
      (document.querySelector(".card-actions") as HTMLElement).style.display =
        "none";
      return;
    }
    alert("Invalid parameters given.");
    document.location.assign(
      `/create-link/?redirect=${window.redirect.redirect}`,
    );
    return;
  }

  const changeUrl = `/redirect/_change/?redirect=${encodeURIComponent(
    window.redirect.redirect + "/" + createSearch(params),
  )}`;

  if (!instanceUrls.length) {
    changingInstance = true;
    document.location.assign(changeUrl);
    return;
  }

  const instance = toInstance(
    window.redirect,
    window.redirect.legacies,
    params,
  );
  const isOauth = window.redirect.redirect === "oauth";
  const redirectUrl = (instanceUrl: string) =>
    isOauth
      ? `${instanceUrl}/auth/external/callback${createSearch(params)}`
      : `${instanceUrl}/_my_redirect/${instance.key}${createSearch(instance.params)}`;

  const searchParams = extractSearchParamsObject();
  // User already rejected
  const rejected = isOauth && "error" in searchParams;
  const declineUrl = (instanceUrl: string) =>
    `${instanceUrl}/_my_redirect/${window.redirect.redirect}?${createSearchParam(
      {
        error: searchParams.error || "access_denied",
        state: searchParams.state,
      },
    )}`;

  if (rejected) {
    document.querySelector(".card-header")!.innerHTML =
      "Account linking rejected";
  }

  // This can render again with another number of instances when the page is
  // restored from the back/forward cache, so every branch sets all elements.
  const multiple = instanceUrls.length > 1;
  const openLink = document.querySelector(".open-link") as HTMLElement;
  const instanceList = document.querySelector(".instance-list") as HTMLElement;
  const cardActions = document.querySelector(".card-actions") as HTMLElement;

  instanceList.hidden = !multiple;
  // With multiple instances only the OAuth decline button is left in here.
  cardActions.style.display = multiple && (!isOauth || rejected) ? "none" : "";

  if (!multiple) {
    const instanceUrl = instanceUrls[0];

    const link = replaceWithButtonLink(
      ".open-link",
      redirectUrl(instanceUrl),
      "accent",
      openLink.textContent!.trim(),
    );

    if (isOauth) {
      replaceWithButtonLink(
        ".decline-link",
        declineUrl(instanceUrl),
        "outlined",
        rejected ? "Notify Home Assistant of rejection" : "Decline",
      );
      // Hide link button
      if (rejected) {
        link.style.visibility = "hidden";
      }
    }
  } else {
    const labels = instanceLabels(instanceUrls);
    renderInstanceList(
      instanceUrls.map((instanceUrl, index) => ({
        href: rejected ? declineUrl(instanceUrl) : redirectUrl(instanceUrl),
        label: rejected
          ? `Notify ${labels[index]} of rejection`
          : `${isOauth ? "Link account in" : "Open in"} ${labels[index]}`,
        title: instanceUrl,
      })),
    );

    if (isOauth && !rejected) {
      // The instance list replaces the link button. Declining reloads this
      // page as rejected, which lets the user pick the instance to notify.
      openLink.style.display = "none";
      replaceWithButtonLink(
        ".decline-link",
        `?${createSearchParam({ ...searchParams, error: "access_denied" })}`,
        "outlined",
        "Decline",
      );
    }
  }

  if (isMobile) {
    (document.querySelector(".footer") as HTMLDivElement).style.display =
      "none";
    return;
  }

  const editLink = document.createElement("a");
  editLink.href = changeUrl;
  editLink.innerHTML = svgPencil;
  editLink.addEventListener("click", () => {
    changingInstance = true;
  });

  const changeInstanceEl = document.querySelector(".instance-footer")!;
  changeInstanceEl.textContent = "";
  if (multiple) {
    editLink.prepend("Edit your instances ");
  } else {
    editLink.title = "Edit instance";
    editLink.setAttribute("aria-label", "Edit instance");
    const label = document.createElement("b");
    label.textContent = "Your instance URL:";
    changeInstanceEl.append(label, ` ${instanceUrls[0]} `);
  }
  changeInstanceEl.append(editLink);

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
