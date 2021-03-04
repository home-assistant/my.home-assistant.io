import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
  query,
  PropertyValues,
} from "lit-element";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstanceUrl } from "../data/instance_info";
import { extractSearchParamsObject } from "../util/search-params";
import { MyUrlInputMain } from "../components/my-url-input";
import { isMobile } from "../data/is_mobile";

const changeRequestedFromRedirect = extractSearchParamsObject().redirect;
@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _updatingUrl = Boolean(
    changeRequestedFromRedirect
  );

  @internalProperty() private _instanceUrl!: string | null;

  @internalProperty() private _error?: string;

  @query("my-url-input") private _urlInput?: MyUrlInputMain;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    if (isMobile && changeRequestedFromRedirect) {
      const parts = decodeURIComponent(changeRequestedFromRedirect).split("?");
      const params = new URLSearchParams(parts[1]);
      params.append("mobile", "1");
      const url = `/redirect/${parts[0]}?${params.toString()}`;
      setTimeout(() => document.location.assign(url), 100);
    }
    this._instanceUrl = getInstanceUrl();
    if (!this._updatingUrl && !this._instanceUrl) {
      this._updatingUrl = true;
    }
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has("_updatingUrl") && this._updatingUrl) {
      this.updateComplete.then(() => this._urlInput?.focus());
    }
  }

  protected shouldUpdate() {
    return this._instanceUrl !== undefined;
  }

  protected render(): TemplateResult {
    if (isMobile && !changeRequestedFromRedirect) {
      return html`<div class="card-content error">
        No valid redirect provided
      </div>`;
    }
    if (this._updatingUrl) {
      return html`
        ${changeRequestedFromRedirect && !this._instanceUrl
          ? html`
              <div class="highlight">
                You are seeing this page because you have been linked to a page
                in your Home&nbsp;Assistant instance but have not configured
                My&nbsp;Home&nbsp;Assistant. Enter the URL of your
                Home&nbsp;Assistant instance to continue.
              </div>
            `
          : ""}
        <div class="card-content">
          ${!this._instanceUrl && !changeRequestedFromRedirect
            ? html`
                <p>
                  Configure My&nbsp;Home&nbsp;Assistant by entering the URL of
                  your Home&nbsp;Assistant instance.
                </p>
              `
            : ""}

          <my-url-input
            .value=${this._instanceUrl}
            @value-changed=${this._handleUrlChanged}
          ></my-url-input>

          ${this._error ? html`<div class="error">${this._error}</div>` : ""}

          <p>Note: This URL is only stored in your browser.</p>
        </div>
      `;
    }

    return html`
      <my-instance-info
        .instanceUrl=${this._instanceUrl}
        @edit=${this._handleEdit}
      ></my-instance-info>
    `;
  }

  private _handleEdit() {
    this._updatingUrl = true;
  }

  private _handleUrlChanged(ev: CustomEvent) {
    const instanceUrl = ev.detail.value;

    if (!instanceUrl) {
      this._error = "You need to configure a URL to use My Home Assistant.";
      return;
    }

    this._error = undefined;

    if (changeRequestedFromRedirect) {
      window.location.replace(
        `/redirect/${decodeURIComponent(changeRequestedFromRedirect)}`
      );
    } else {
      this._updatingUrl = false;
      this._instanceUrl = instanceUrl;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
