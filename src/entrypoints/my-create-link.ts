import "@material/mwc-button";
import "@material/mwc-select";
import "@material/mwc-textfield";
import { sanitizeUrl } from "@braintree/sanitize-url";
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
          padding: 16px;
        }
      </style>

      <div class="container">
        ${this._url
          ? html`Your My Home Assistant URL:<br />${this._url}<mwc-button
                @click=${this._reload}
                >Start over</mwc-button
              >`
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
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
