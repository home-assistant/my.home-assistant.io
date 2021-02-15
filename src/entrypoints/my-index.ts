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
import { getInstanceInfo, InstanceInfo } from "../data/instance_info";
import { extractSearchParamsObject } from "../util/search-params";

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _updatingUrl =
    extractSearchParamsObject().change === "1";

  @internalProperty() private _instanceInfo!: InstanceInfo;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    this._instanceInfo = getInstanceInfo();
  }

  protected shouldUpdate() {
    return this._instanceInfo !== undefined;
  }

  protected render(): TemplateResult {
    if (this._updatingUrl) {
      return html`
        <div class="card-content">
          <p>
            <my-url-input
              .value=${this._instanceInfo.url}
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
        .instanceInfo=${this._instanceInfo}
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
      this._instanceInfo = getInstanceInfo();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
