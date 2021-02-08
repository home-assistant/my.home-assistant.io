import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
} from "lit-element";
import "../components/my-url-input";
import { svgPencil } from "../components/svg-pencil";
import { DEFAULT_HASS_URL, HASS_URL } from "../const";
import { DiscoveryInfo, getHassInfo } from "../util/get_hass_info";
import { extractSearchParamsObject } from "../util/search-params";

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  @internalProperty() private _updatingUrl =
    extractSearchParamsObject().change === "1";

  @internalProperty() private _instanceInfo?: DiscoveryInfo | false;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    const url = this._url || DEFAULT_HASS_URL;

    if (!this._updatingUrl) {
      return html`
        <div class="instance-header">HOME ASSISTANT INSTANCE</div>
        <div class="instance">
          <div>
            <div>
              <a href=${url} rel="noreferrer noopener">${url}</a>
            </div>
            <div>
              ${this._instanceInfo === undefined
                ? html`&nbsp;`
                : this._instanceInfo === false
                ? html`<span class='error'>Failed to fetch info (<a href="faq.html#cannot-connect">troubleshoot</a>)</span>`
                : `Version core-${this._instanceInfo.version}`
              }
            </div>
            <div>
              ${this._instanceInfo === undefined || this._instanceInfo === false
                ? html`&nbsp;`
                : `Installation type ${this._instanceInfo.installation_type}`
              }
            </div>
          </div>
          <button class="empty" @click=${this._handleEdit}>${svgPencil}</button>
        </div>
      `;
    }

    return html`
      <div class="card-content">
        <p>
          <my-url-input
            .value=${url}
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

  private _handleEdit() {
    this._updatingUrl = true;
  }

  protected firstUpdated(props) {
    super.firstUpdated(props);
    this._updateInstanceInfo();
  }

  private async _updateInstanceInfo() {
    this._instanceInfo = undefined;
    if (!this._url) {
      return;
    }
    try {
      this._instanceInfo = await getHassInfo(this._url);
    } catch (err) {
      this._instanceInfo = false;
    }
  }

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
    const params = extractSearchParamsObject();
    if (params.change === "1") {
      console.log("CALLING HISTORY.back");
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
