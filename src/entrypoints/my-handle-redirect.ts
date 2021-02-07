import "@material/mwc-button";
import "@material/mwc-checkbox";
import "@material/mwc-formfield";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
  property,
} from "lit-element";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import "../components/my-url-input";
import { sanitizeUrl } from "@braintree/sanitize-url";

type ParamType = "url" | "string";

interface Redirect {
  redirect: string;
  description: string;
  params: {
    [key: string]: ParamType;
  };
}

const css = html`
  <style>
    my-handle-redirect mwc-formfield {
      display: block;
    }
    my-handle-redirect a.no_underline {
      text-decoration: none;
    }
  </style>
`;

const HASS_URL = "hassUrl";
const ALWAYS_REDIRECT = "alwaysRedirect";
@customElement("my-handle-redirect")
export class MyHandleRedirect extends LitElement {
  @property({ type: Object }) public redirect?: Redirect;

  @internalProperty() private _error?: string | TemplateResult;

  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  @internalProperty() private _alwaysRedirect?: boolean = Boolean(
    localStorage.getItem(ALWAYS_REDIRECT)
  );

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    if (!this.redirect) {
      return;
    }
    if (this._url && this._alwaysRedirect) {
      this._handleRedirect();
    }
  }

  protected render(): TemplateResult {
    if (!this.redirect) {
      return html``;
    }

    if (!this._url) {
      return html`
        ${css}
        <div class="card-content">
          <p>
            We don't know the URL of you Home Assistant instance yet, please
            enter it below so we can forward you.
          </p>
          <my-url-input
            .value=${this._url}
            button="Forward"
            @value-changed=${this._handleUrlChanged}
          ></my-url-input>
          ${this._error
            ? html`
                <p class="error">${this._error}</p>
              `
            : ""}
        </div>
      `;
    }

    return html`
      ${css}
      <div class="card-content">
        You will be forwarded to your Home Assistant url:
        <a href=${this._url} rel="noreferrer noopener"> ${this._url}</a>

        ${this._error
          ? html`
              <p class="error">${this._error}</p>
            `
          : ""}
      </div>
      <div class="card-actions">
        <mwc-formfield
          label="Don't ask again"
          @change=${this._handleAlwaysRedirectChange}
        >
          <mwc-checkbox .checked=${this._alwaysRedirect}></mwc-checkbox>
        </mwc-formfield>
        <div>
          <a class="no_underline" href="/dont-redirect.html">
            <mwc-button>
              No
            </mwc-button>
          </a>
          <mwc-button @click=${this._handleRedirect}>
            Yes
          </mwc-button>
        </div>
      </div>
    `;
  }

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
    this._handleRedirect();
  }

  private _handleRedirect() {
    if (!this.redirect) {
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
    if (!this.redirect) {
      return "";
    }
    const params = this._createRedirectParams();
    return `${this.redirect.redirect}${params}`;
  }

  private _createRedirectParams(): string {
    if (!this.redirect) {
      return "";
    }
    const params = extractSearchParamsObject();
    if (!this.redirect.params && !Object.keys(params).length) {
      return "";
    }
    if (
      Object.keys(this.redirect.params).length !== Object.keys(params).length
    ) {
      throw Error("Wrong parameters");
    }
    Object.entries(this.redirect.params).forEach(([key, type]) => {
      if (!params[key] || !this._checkParamType(type, params[key])) {
        throw Error("Wrong parameters");
      }
    });
    return `?${createSearchParam(params)}`;
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
}

declare global {
  interface HTMLElementTagNameMap {
    "my-handle-redirect": MyHandleRedirect;
  }
}
