import { html, LitElement, TemplateResult, PropertyValues } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstanceUrls } from "../data/instance_info";
import { MyUrlInputMain } from "../components/my-url-input";
@customElement("my-index")
class MyIndex extends LitElement {
  @state() private _updatingUrl = false;

  @state() private _instanceUrls: string[] = [];

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
    this._instanceUrls = getInstanceUrls();
    if (!this._updatingUrl && !this._instanceUrls.length) {
      this._updatingUrl = true;
    }
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has("_updatingUrl") && this._updatingUrl) {
      this.updateComplete.then(() => this._urlInput?.focus());
    }
  }

  protected render(): TemplateResult {
    if (this._updatingUrl) {
      return html`
        <div class="card-content">
          ${
            !this._instanceUrls.length
              ? html`
                  <p>
                    Configure My Home Assistant by entering the URL of your Home
                    Assistant instance.
                  </p>
                `
              : ""
          }

          <my-url-input
            .value=${this._instanceUrls}
            @value-changed=${this._handleUrlChanged}
          ></my-url-input>

          ${this._error ? html`<div class="error">${this._error}</div>` : ""}
        </div>
      `;
    }

    return html`
      <my-instance-info
        .instanceUrls=${this._instanceUrls}
        @edit=${this._handleEdit}
      ></my-instance-info>
    `;
  }

  private _handleEdit() {
    this._updatingUrl = true;
  }

  private _handleUrlChanged(ev: CustomEvent) {
    const instanceUrls: string[] = ev.detail.value;

    if (!instanceUrls.length) {
      this._error = "You need to configure a URL to use My Home Assistant.";
      return;
    }

    this._error = undefined;
    this._updatingUrl = false;
    this._instanceUrls = instanceUrls;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
