import "@material/mwc-button";
import "@material/mwc-select";
import "@material/mwc-textfield";
import { sanitizeUrl } from "@braintree/sanitize-url";
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

const prettify = (key: string) => capitalizeFirst(key.replace("_", " "));

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

const createBadge = (redirect: string) =>
  `https://img.shields.io/badge/${redirect}-my?style=for-the-badge&label=MY&logo=home-assistant&color=41BDF5&logoColor=white`;

const createMarkdown = (redirect: string, url: string) =>
  `[![My Home Assistant](${createBadge(redirect)})](${url})`;

redirects.sort((a, b) => {
  const aDescription = a.description.toLowerCase();
  const bDescription = b.description.toLowerCase();

  if (aDescription < bDescription) {
    return -1;
  }
  if (aDescription > bDescription) {
    return 1;
  }

  return 0;
});

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @internalProperty() _redirect?;

  @internalProperty() _paramsValues = {};

  protected createRenderRoot() {
    return this;
  }

  protected firstUpdated(params) {
    super.firstUpdated(params);
    const redirect = extractSearchParam("redirect");
    let redirectIndex = 0;
    if (redirect) {
      const foundIndex = redirects.findIndex(
        (rdrct) => rdrct.redirect === redirect
      );
      if (foundIndex !== -1) {
        redirectIndex = foundIndex;
      }
    }
    const select = this.querySelector("mwc-select")!;
    select.updateComplete.then(() => select.select(redirectIndex));
  }

  protected render(): TemplateResult {
    return html`
      <div class="card-content">
        <mwc-select
          label="Redirect to"
          required
          validationMessage="This Field is Required"
          naturalMenuWidth
          @selected=${this._itemSelected}
        >
          ${redirects.map(
            (redirect) =>
              html`<mwc-list-item
                .selected=${this._redirect?.redirect === redirect.redirect}
                value=${redirect.redirect}
                >${capitalizeFirst(redirect.description)}</mwc-list-item
              >`
          )}
        </mwc-select>

        ${this._redirect?.params
          ? html`${Object.keys(this._redirect.params).map(
              (key) =>
                html`<mwc-textfield
                  required
                  validationMessage="This Field is Required"
                  .label=${prettify(key)}
                  .key=${key}
                  @input=${this._paramChanged}
                ></mwc-textfield>`
            )}`
          : ""}
        ${this.isValid
          ? html`
              <h1>Your URL</h1>
              <input value=${this._url} @focus=${this._select} />
              <mwc-button outlined @click=${this._copyURL}>
                Copy URL
              </mwc-button>
              <h1>Markdown</h1>
              <img src=${createBadge(this._redirect.redirect)} />
              <textarea rows="3" @focus=${this._select}>
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
    return `https://my.home-assistant.io/redirect/${this._redirect.redirect}${
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
    ev.target.select();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
