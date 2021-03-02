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
              <input value=${this._url} readonly @focus=${this._select} />
              <mwc-button outlined @click=${this._copyURL}>
                Copy URL
              </mwc-button>
              <h1>Markdown</h1>
              <img src=${createBadge(this._redirect.redirect)} />
              <textarea rows="3" readonly @focus=${this._select}>
${createMarkdown(this._redirect.redirect, this._url)}</textarea
              >
              <mwc-button outlined @click=${this._copyMarkdown}>
                Copy Markdown
              </mwc-button>
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

  private _copyURL() {
    copy(this._url);
  }

  private _copyMarkdown() {
    copy(createMarkdown(this._redirect.redirect, this._url));
  }

  private _select(ev) {
    const input = ev.target;
    // Safari fires focus too soon
    setTimeout(() => {
      input.select();
    }, 1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
