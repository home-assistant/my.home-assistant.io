import { html, LitElement, TemplateResult, PropertyValues } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstanceUrl } from "../data/instance_info";
import { MyUrlInputMain } from "../components/my-url-input";
@customElement("my-index")
class MyIndex extends LitElement {
  @state() private _updatingUrl = false;

  @state() private _instanceUrl!: string | null;

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
    if (this._updatingUrl) {
      return html`
        <div class="card-content">
          ${!this._instanceUrl
            ? html`
                <p>
                  Configure My Home Assistant by entering the URL of your Home
                  Assistant instance.
                </p>
              `
            : ""}

          <my-url-input
            .value=${this._instanceUrl || ""}
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
    this._updatingUrl = false;
    this._instanceUrl = instanceUrl;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
