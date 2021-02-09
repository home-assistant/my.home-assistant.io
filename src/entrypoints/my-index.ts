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
import { LoadingState, subscribeHassInfo } from "../util/get_hass_info";
import { extractSearchParamsObject } from "../util/search-params";

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _updatingUrl =
    extractSearchParamsObject().change === "1";

  @internalProperty() private _instanceInfo!: LoadingState;

  createRenderRoot() {
    return this;
  }

  public connectedCallback() {
    super.connectedCallback();
    this._updateInstanceInfo();
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

  private async _updateInstanceInfo() {
    subscribeHassInfo((state) => {
      this._instanceInfo = state;
    });
  }

  private _handleUrlChanged() {
    const params = extractSearchParamsObject();
    if (params.change === "1") {
      history.back();
    } else {
      this._updatingUrl = false;
      this._updateInstanceInfo();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
