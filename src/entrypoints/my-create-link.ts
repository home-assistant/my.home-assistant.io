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
import redirects from "../../redirect.js";
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

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @internalProperty() _redirect?;

  @internalProperty() _paramsValues = {};

  @internalProperty() _url?: string;

  protected createRenderRoot() {
    return this;
  }

  protected firstUpdated(params) {
    super.firstUpdated(params);
    const redirect = extractSearchParam("redirect");
    if (!redirect) {
      return;
    }
    this._redirect = redirects.find((rdrct) => rdrct.redirect === redirect);
  }

  protected render(): TemplateResult {
    const valid =
      this._redirect &&
      (!this._redirect.params ||
        Object.keys(this._redirect.params).length ===
          Object.keys(this._paramsValues).length);

    return html` <style>
        .container {
          display: flex;
          flex-direction: column;
          padding: 0 16px 16px;
        }
        .your-url {
          padding-bottom: 8px;
        }
        pre {
          white-space: break-spaces;
        }
      </style>

      <div class="container">
        ${this._url
          ? html`
              <div class="your-url">
                <h2>Your My Home Assistant URL:</h2>
                <pre>${this._url}</pre>
                <mwc-button outlined @click=${this._copyURL}>
                  Copy URL
                </mwc-button>
                <h2>Markdown</h2>
                <img src=${createBadge(this._redirect.redirect)} />
                <pre>${createMarkdown(this._redirect.redirect, this._url)}</pre>
                <mwc-button outlined @click=${this._copyMarkdown}>
                  Copy Markdown
                </mwc-button>
              </div>
              <mwc-button @click=${this._reload}>Start over</mwc-button>
            `
          : html`<mwc-select
                label="Redirect to"
                required
                validationMessage="This Field is Required"
                naturalMenuWidth
                @selected=${this._itemSelected}
              >
                <mwc-list-item></mwc-list-item>
                ${redirects.map(
                  (redirect) =>
                    html`<mwc-list-item
                      .selected=${this._redirect?.redirect ===
                      redirect.redirect}
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

              <mwc-button .disabled=${!valid} @click=${this._createURL}
                >Create redirect link</mwc-button
              >`}
      </div>`;
  }

  private _itemSelected(ev) {
    const index = ev.detail.index - 1;
    this._paramsValues = {};
    if (index < 0) {
      this._redirect = undefined;
      return;
    }
    this._redirect = redirects[index];
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

  private _createURL() {
    this._url = `https://my.home-assistant.io/redirect/${
      this._redirect.redirect
    }${
      this._redirect.params ? `?${createSearchParam(this._paramsValues)}` : ""
    }`;
  }

  private _reload() {
    document.location.reload();
  }

  private _copyURL() {
    if (!this._url) {
      return;
    }
    copy(this._url);
  }

  private _copyMarkdown() {
    if (!this._url) {
      return;
    }
    copy(createMarkdown(this._redirect.redirect, this._url));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
