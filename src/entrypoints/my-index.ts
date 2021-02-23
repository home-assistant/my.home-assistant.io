import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
} from "lit-element";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstanceUrl } from "../data/instance_info";
import { extractSearchParamsObject } from "../util/search-params";

const changeRequestedFromRedirect = extractSearchParamsObject().change === "1";

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _updatingUrl = changeRequestedFromRedirect;

  @internalProperty() private _instanceUrl!: string | null;

  @internalProperty() private _error?: string;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    this._instanceUrl = getInstanceUrl();
    if (!this._updatingUrl && !this._instanceUrl) {
      this._updatingUrl = true;
    }
  }

  protected shouldUpdate() {
    return this._instanceUrl !== undefined;
  }

  protected render(): TemplateResult {
    if (this._updatingUrl) {
      return html`
        <div class="card-content">
          ${changeRequestedFromRedirect
            ? html`
                <p>
                  You are seeing this page because you have been linked to a
                  page in your Home&nbsp;Assistant instance but have not
                  configured My&nbsp;Home&nbsp;Assistant. Enter the URL of your
                  Home&nbsp;Assistant instance to continue.
                </p>
              `
            : !this._instanceUrl
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

  private _handleUrlChanged() {
    const instanceUrl = getInstanceUrl();

    if (!instanceUrl) {
      this._error = "You need to configure a URL to use My Home Assistant.";
      return;
    }

    if (changeRequestedFromRedirect) {
      history.back();
    } else {
      this._updatingUrl = !instanceUrl;
      this._instanceUrl = instanceUrl;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
