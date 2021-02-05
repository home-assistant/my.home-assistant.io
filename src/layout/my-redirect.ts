import "@material/mwc-button";
import "@material/mwc-checkbox";
import "@material/mwc-formfield";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
} from "lit-element";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import "./my-layout";
import "../components/my-url-input";
import redirects from "../../redirect.json";
import { sanitizeUrl } from "@braintree/sanitize-url";

type ParamType = "url" | "string";

interface Redirect {
  key: string;
  description: string;
  params: {
    [key: string]: ParamType;
  };
}

const HASS_URL = "hassUrl";
const ALWAYS_REDIRECT = "alwaysRedirect";
@customElement("my-redirect")
export class MyRedirect extends LitElement {
  @internalProperty() private _error?: string | TemplateResult;

  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  @internalProperty() private _alwaysRedirect?: boolean = Boolean(
    localStorage.getItem(ALWAYS_REDIRECT)
  );

  @internalProperty() private _redirect?: Redirect;

  public connectedCallback() {
    super.connectedCallback();
    const path = window.location.pathname;
    if (!path.startsWith("/redirect")) {
      return;
    }
    const key = path.split("/")[2];
    this._redirect = redirects[key];
    if (!this._redirect) {
      return;
    }
    this._redirect.key = key;
    if (this._url && this._alwaysRedirect) {
      this._handleRedirect();
    }
  }

  protected render(): TemplateResult {
    if (!this._redirect) {
      return html``;
    }
    return html`
      <my-layout>
        <h1 class="card-header">
          You're being redirected to your Home Assistant instance
        </h1>
        <div class="card-content">
        <p>
                Do you want to continue to your Home Assistant instance?<br/>
                You will be redirected to ${this._redirect?.description}.
              </p>
          ${!this._url
            ?  html`
                <p>
                We don't know the URL of you Home Assistant instance yet, please enter it below so we can forward you.
              </p>
                <my-url-input .value=${this._url} button="Redirect" @value-changed=${this._handleUrlChanged}></my-url-input>
              ` :  html`
                <mwc-formfield
                  label="Don't ask again"
                  @change=${this._handleAlwaysRedirectChange}
                >
                  <mwc-checkbox .checked=${this._alwaysRedirect}></mwc-checkbox>
                </mwc-formfield>
              `}
          ${this._error
            ? html`
                <p class="error">${this._error}</p>
              `
            : ""}
        </div>
        ${this._url
          ? html`
              <div class="card-actions">
              <mwc-button @click=${this._handleNo}>
                        No
                      </mwc-button>
              <mwc-button @click=${this._handleRedirect}>
                        Yes
                      </mwc-button>
              </div>
            `
          : html``}
      </my-layout>
    `;
  }

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
    this._handleRedirect();
  }

  private _handleNo() {

  }

  private _handleRedirect() {
    if (!this._redirect) {
      return;
    }
    try {
      window.location.replace(
        `${this._url}/_my_redirect/${this._createRedirectUrl()}`
      );
    } catch (e) {
      console.error(e);
      this._error = "Something went wrong.";
    }
  }

  private _createRedirectUrl(): string {
    if (!this._redirect) {
      return "";
    }
      const params = this._createRedirectParams();
      return `${this._redirect.key}${params}`;
  }

  private _createRedirectParams(): string {
    if (!this._redirect) {
      return "";
    }
    const params = extractSearchParamsObject();
    if (!this._redirect.params && !Object.keys(params).length) {
      return "";
    }
    if (Object.keys(this._redirect.params).length !== Object.keys(params).length) {
      throw Error("Wrong parameters");
    }
    Object.entries(this._redirect.params).forEach(([key, type]) => {
      if (!params[key] || !this._checkParamType(type, params[key])) {
        throw Error("Wrong parameters");
      }
    });
    return `?${createSearchParam(params)}`
  }

  private _checkParamType(type: ParamType, value: string) {
    if (type === "string") {
      return true;
    }
    if (type === "url") {
      return value && value === sanitizeUrl(value);
    }
    return false;
  }

  private _handleAlwaysRedirectChange(ev) {
    const checked = ev.target.checked;
    try {
      if (checked) {
        window.localStorage.setItem(ALWAYS_REDIRECT, "true");
        this._alwaysRedirect = true;
      } else {
        window.localStorage.removeItem(ALWAYS_REDIRECT);
        this._alwaysRedirect = false;
      }
    } catch (err) {
      this._error = "Could not save your settings";
      ev.target.checked = !checked;
    }
  }

  static get styles(): CSSResult {
    return css`
      .card-content a {
        color: var(--primary-color);
      }
      .card-content p:last-child {
        margin-bottom: 0;
      }
      .card-actions {
        justify-content: flex-end;
      }
      .error {
        color: red;
        font-weight: bold;
      }
      mwc-formfield {
        display: block;
      }
      .error a {
        color: darkred;
      }

      .spacer {
        flex: 1;
      }

      button.link {
        background: none;
        color: var(--primary-color);
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        text-decoration: underline;
        cursor: pointer;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-redirect": MyRedirect;
  }
}
