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
import "../components/my-instance-info";
import { getInstanceUrl } from "../data/instance_info";

type ParamType = "url" | "string";

interface RedirectParams {
  [key: string]: ParamType;
}

@customElement("my-redirect")
class MyHandleRedirect extends LitElement {
  @property() public redirect!: string;

  @property({ type: Object }) public params?: RedirectParams;

  @internalProperty() private _instanceUrl!: string | null;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    this._instanceUrl = getInstanceUrl();
    if (this._instanceUrl === null) {
      setTimeout(() => this._handleEdit(), 100);
    }
  }

  protected shouldUpdate() {
    return this._instanceUrl !== undefined;
  }

  protected render(): TemplateResult {
    if (!this.redirect) {
      return html``;
    }

    return html`
      <my-instance-info
        .instanceUrl=${this._instanceUrl}
        @edit=${this._handleEdit}
      ></my-instance-info>

      <div class="card-actions">
        <div></div>
        <a href=${ifDefined(this._createRedirectUrl())}>
          <mwc-button .disabled=${!this._instanceUrl}>Open Link</mwc-button>
        </a>
      </div>
    `;
  }

  private _handleEdit() {
    document.location.assign("/?change=1");
  }

  private _createRedirectUrl(): string | undefined {
    if (!this._instanceUrl) {
      return undefined;
    }
    const params = this._createRedirectParams();
    return `${this._instanceUrl}/_my_redirect/${this.redirect}${params}`;
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
