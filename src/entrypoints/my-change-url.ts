import "@material/mwc-button";
import { html, LitElement, TemplateResult, PropertyValues } from "lit";
import { state, query, customElement } from "lit/decorators.js";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstanceUrl } from "../data/instance_info";
import { extractSearchParamsObject } from "../util/search-params";
import { MyUrlInputMain } from "../components/my-url-input";
import { isMobile } from "../data/is_mobile";

const changeRequestedFromRedirect = extractSearchParamsObject().redirect;

@customElement("my-change-url")
class MyChangeUrl extends LitElement {
  @state() private _instanceUrl = getInstanceUrl();

  @state() private _error?: string;

  @query("my-url-input") private _urlInput?: MyUrlInputMain;

  createRenderRoot() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    if (isMobile && changeRequestedFromRedirect) {
      const parts = decodeURIComponent(changeRequestedFromRedirect).split("?");
      const params = new URLSearchParams(parts[1]);
      params.append("mobile", "1");
      const url = `/redirect/${parts[0]}/?${params.toString()}`;
      setTimeout(() => document.location.assign(url), 100);
    }
    if (isMobile) {
      (document.querySelector(".footer") as HTMLDivElement).style.display =
        "none";
    }
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this.updateComplete.then(() => this._urlInput?.focus());
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

    return html`
      ${changeRequestedFromRedirect && !this._instanceUrl
        ? html`
            <div class="highlight">
              You are seeing this page because you have been linked to a page in
              your Home Assistant instance but have not configured My Home
              Assistant. Enter the URL of your Home Assistant instance to
              continue.
            </div>
          `
        : ""}
      <div class="card-content">
        ${this._instanceUrl
          ? html`<p>
              Configure My Home Assistant by entering the URL of your Home
              Assistant instance.
            </p>`
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

  private _handleUrlChanged(ev: CustomEvent) {
    const instanceUrl = ev.detail.value;

    if (!instanceUrl) {
      this._error = "You need to configure a URL to use My Home Assistant.";
      return;
    }

    this._error = undefined;

    if (changeRequestedFromRedirect) {
      window.location.assign(
        `/redirect/${decodeURIComponent(changeRequestedFromRedirect)}`
      );
    } else {
      // Shouldn't happen, but keep it as fallback
      history.back();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-change-url": MyChangeUrl;
  }
}
