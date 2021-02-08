import { sanitizeUrl } from "@braintree/sanitize-url";
import "@material/mwc-button";
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
import { DEFAULT_HASS_URL, HASS_URL } from "../const";
import { svgPencil } from "../components/svg-pencil";

type ParamType = "url" | "string";

interface RedirectParams {
  [key: string]: ParamType;
}

@customElement("my-redirect")
class MyHandleRedirect extends LitElement {
  @property() public redirect!: string;

  @property({ type: Object }) public params?: RedirectParams;

  @internalProperty() private _error?: string | TemplateResult;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    if (!this.redirect) {
      return;
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
        <div></div>
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
    return `${this._url}/_my_redirect/${this.redirect}${params}`;
  }

  private _createRedirectParams(): string {
    const params = extractSearchParamsObject();
    if (!this.params && !Object.keys(params).length) {
      return "";
    }
    if (Object.keys(this.params || {}).length !== Object.keys(params).length) {
      throw Error("Wrong parameters");
    }
    Object.entries(this.params || {}).forEach(([key, type]) => {
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
}

declare global {
  interface HTMLElementTagNameMap {
    "my-redirect": MyHandleRedirect;
  }
}
