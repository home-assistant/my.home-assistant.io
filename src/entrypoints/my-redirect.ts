import { sanitizeUrl } from "@braintree/sanitize-url";
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
import { ALWAYS_REDIRECT, DEFAULT_HASS_URL, HASS_URL } from "../const";
import { svgPencil } from "../components/svg-pencil";

type ParamType = "url" | "string";

interface Redirect {
  redirect: string;
  description: string;
  params: {
    [key: string]: ParamType;
  };
}

@customElement("my-redirect")
class MyHandleRedirect extends LitElement {
  @property({ type: Object }) public redirect!: Redirect;

  @internalProperty() private _error?: string | TemplateResult;

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
    if (this._alwaysRedirect) {
      window.location.assign(this._createRedirectUrl());
    }
  }

  protected render(): TemplateResult {
    if (!this.redirect) {
      return html``;
    }

    const url = this._url;

    return html`
      <div class="card-content current-instance">
        <div>
          Configured Home Assistant url:<br />
          <a href=${url} rel="noreferrer noopener">${url}</a>
          <a href="/?change=1" class="change">
            ${svgPencil}
          </a>
        </div>

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
        <a href=${this._createRedirectUrl()}>
          <mwc-button>
            Open Link
          </mwc-button>
        </a>
      </div>
    `;
  }

  private get _url() {
    return localStorage.getItem(HASS_URL) || DEFAULT_HASS_URL;
  }

  private _createRedirectUrl(): string {
    const params = this._createRedirectParams();
    return `${this._url}/_my_redirect/${this.redirect.redirect}${params}`;
  }

  private _createRedirectParams(): string {
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
    this._error = undefined;
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
    "my-redirect": MyHandleRedirect;
  }
}
