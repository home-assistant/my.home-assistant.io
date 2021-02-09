import { sanitizeUrl } from "@braintree/sanitize-url";
import "@material/mwc-button";
import { ifDefined } from "lit-html/directives/if-defined";
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
import "../components/my-instance-info";
import { LoadingState, subscribeHassInfo } from "../util/get_hass_info";

type ParamType = "url" | "string";

interface RedirectParams {
  [key: string]: ParamType;
}

@customElement("my-redirect")
class MyHandleRedirect extends LitElement {
  @property() public redirect!: string;

  @property({ type: Object }) public params?: RedirectParams;

  @internalProperty() private _instanceInfo!: LoadingState;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    subscribeHassInfo((state) => {
      this._instanceInfo = state;
    });
  }

  protected shouldUpdate() {
    return this._instanceInfo !== undefined;
  }

  protected render(): TemplateResult {
    if (!this.redirect) {
      return html``;
    }

    return html`
      <my-instance-info
        .instanceInfo=${this._instanceInfo}
        @edit=${this._handleEdit}
      ></my-instance-info>

      <div class="card-actions">
        <div></div>
        <a href=${ifDefined(this._createRedirectUrl())}>
          <mwc-button .disabled=${!this._instanceQueried}>Open Link</mwc-button>
        </a>
      </div>
    `;
  }

  private get _instanceQueried() {
    return "discoveryInfo" in this._instanceInfo;
  }

  private _handleEdit() {
    document.location.assign("/?change=1");
  }

  private get _url() {
    return localStorage.getItem(HASS_URL) || DEFAULT_HASS_URL;
  }

  private _createRedirectUrl(): string | undefined {
    if (!this._instanceQueried) {
      return undefined;
    }
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
