import "@material/mwc-button";
import "@material/mwc-select";
import "@material/mwc-textfield";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { repeat } from "lit-html/directives/repeat.js";
import copy from "clipboard-copy";
import {
  customElement,
  html,
  internalProperty,
  LitElement,
  TemplateResult,
} from "lit-element";
import redirects from "../../redirect.json";
import { createSearchParam, extractSearchParam } from "../util/search-params";
import { Button } from "@material/mwc-button";

const prettify = (key: string) =>
  capitalizeFirst(key.replace("_", " ").replace("url", "URL"));

const capitalizeFirst = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

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

const createBadge = (redirect: string) => `/badges/${redirect}.svg`;

const createHTML = (redirect: string, url: string) =>
  `<a href="${url}" target="_blank"><img src="https://my.home-assistant.io${createBadge(
    redirect
  )}" alt="My Home Assistant" /></a>`;

const createMarkdown = (redirect: string, url: string) =>
  `[![My Home Assistant](https://my.home-assistant.io${createBadge(
    redirect
  )})](${url})`;

let initialRedirect;
{
  const redirect = extractSearchParam("redirect");
  if (redirect) {
    initialRedirect = redirects.find((info) => info.redirect === redirect);
  }
  if (!initialRedirect) {
    initialRedirect = redirects[0];
  }
}

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @internalProperty() _redirect = initialRedirect;

  @internalProperty() _paramsValues = {};

  protected createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <div class="card-content">
        <mwc-select
          label="Redirect to"
          required
          validationMessage="This field is required"
          naturalMenuWidth
          @selected=${this._itemSelected}
        >
          ${redirects.map(
            (redirect) =>
              html`<mwc-list-item
                .selected=${this._redirect?.redirect === redirect.redirect}
                .value=${redirect.redirect}
                >${redirect.name}</mwc-list-item
              >`
          )}
        </mwc-select>

        ${repeat(
          Object.keys(this._redirect?.params || []),
          (key) => `${this._redirect.redirect}-${key}`,
          (key) => html`<mwc-textfield
            required
            validationMessage="This field is required"
            .label=${prettify(key)}
            .key=${key}
            @input=${this._paramChanged}
          ></mwc-textfield>`
        )}
        ${this.isValid
          ? html`
              <h1>Your URL</h1>
                <p>A URL to share with others, for example, when chatting on
                our <a href="https://www.home-assistant.io/join-chat"
                target="_blank">Discord</a> chat server.</p>
                <input value=${this._url} readonly @focus=${this._select} />
                <mwc-button outlined @click=${this._copyURL}>
                  Copy URL
                </mwc-button>
                <h1>Markdown</h1>
                <p>A beautiful linked badge in Markdown, for example, when
                posting on our <a href="https://community.home-assistant.io"
                target="_blank">Community Forum</a>.</p>
                <a href=${this._url} target="_blank">
                  <img src=${createBadge(this._redirect.redirect)}
                /></a>
                <textarea rows="3" readonly @focus=${this._select}>
${createMarkdown(this._redirect.redirect, this._url)}</textarea
                >
                <mwc-button outlined @click=${this._copyMarkdown}>
                  Copy Markdown
                </mwc-button>
                <h1>HTML</h1>
                <p>Our beautiful badge in HTML format, which can be used on,
                for example, your website or blog.</p>
                <a href=${this._url} target="_blank">
                  <img src=${createBadge(this._redirect.redirect)}
                /></a>
                <textarea rows="3" readonly @focus=${this._select}>
${createHTML(this._redirect.redirect, this._url)}</textarea
                >
                <mwc-button outlined @click=${this._copyHTML}>
                  Copy HTML
                </mwc-button>
              </a>
            `
          : ""}
      </div>
    `;
  }

  private get isValid() {
    return (
      this._redirect &&
      (!this._redirect.params ||
        Object.keys(this._redirect.params).length ===
          Object.keys(this._paramsValues).length)
    );
  }

  private _itemSelected(ev) {
    this._redirect = redirects[ev.detail.index];
    this._paramsValues = {};
  }

  private _paramChanged(ev) {
    const key = ev.currentTarget.key;
    let value = ev.target.value;

    if (this._redirect.params[key] === "url") {
      const validationMessage = validateUrl(value);
      if (validationMessage) {
        ev.currentTarget.setCustomValidity(validationMessage);
        ev.currentTarget.reportValidity();
        value = undefined;
      }
    }

    if (value) {
      ev.currentTarget.setCustomValidity("");
      ev.currentTarget.reportValidity();
      this._paramsValues = { ...this._paramsValues, [key]: value };
    } else {
      this._paramsValues = { ...this._paramsValues };
      delete this._paramsValues[key];
    }
  }

  private get _url() {
    return `https://my.home-assistant.io/redirect/${this._redirect.redirect}/${
      this._redirect.params ? `?${createSearchParam(this._paramsValues)}` : ""
    }`;
  }

  private async _copyURL(ev: Event) {
    const target = ev.currentTarget as Button;
    try {
      await copy(this._url);
      this._copySuccess(target);
    } catch (err) {
      this._copyFailure(err);
    }
  }

  private async _copyHTML(ev: Event) {
    const target = ev.currentTarget as Button;
    try {
      await copy(createHTML(this._redirect.redirect, this._url));
      this._copySuccess(target);
    } catch (err) {
      this._copyFailure(err);
    }
  }

  private async _copyMarkdown(ev: Event) {
    const target = ev.currentTarget as Button;
    try {
      await copy(createMarkdown(this._redirect.redirect, this._url));
      this._copySuccess(target);
    } catch (err) {
      this._copyFailure(err);
    }
  }

  private _select(ev) {
    const input = ev.target;
    // Safari fires focus too soon
    setTimeout(() => {
      input.select();
    }, 1);
  }

  private _copySuccess(element: Button) {
    const prevText = element.innerText;
    element.classList.add("success");
    // @ts-ignore
    element.rippleHandlers.startPress();
    element.innerText = "Copied!";
    setTimeout(() => {
      // @ts-ignore
      element.rippleHandlers.endPress();
      element.classList.remove("success");
      element.innerText = prevText;
    }, 1000);
  }

  private _copyFailure(err: Error) {
    alert(`Copying failed! Error: ${err.message}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
