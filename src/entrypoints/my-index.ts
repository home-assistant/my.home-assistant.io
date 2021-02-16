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

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _updatingUrl =
    extractSearchParamsObject().change === "1";

  @internalProperty() private _instanceUrl!: string | null;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    this._instanceUrl = getInstanceUrl();
  }

  protected shouldUpdate() {
    return this._instanceUrl !== undefined;
  }

  protected render(): TemplateResult {
    if (!this._instanceUrl || this._updatingUrl) {
      return html`
        <div class="card-content">
          ${!this._instanceUrl
            ? html` <h1>Setup My Home Assistant</h1>
                <p>
                  You have not setup My Home Assistant yet, to get started, copy
                  the URL of your Home Assistant instance in the input below and
                  press update.
                </p>`
            : ""}
          <p>
            <my-url-input
              .value=${this._instanceUrl}
              @value-changed=${this._handleUrlChanged}
            ></my-url-input>
          </p>
          <p>
            <b>Note:</b>
            This is only stored in your browser.
          </p>
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
    const params = extractSearchParamsObject();
    if (params.change === "1") {
      history.back();
    } else {
      this._updatingUrl = false;
      this._instanceUrl = getInstanceUrl();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
