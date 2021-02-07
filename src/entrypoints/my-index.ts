import "@material/mwc-button";
import "@material/mwc-checkbox";
import "@material/mwc-formfield";
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
import { extractSearchParamsObject } from "../util/search-params";

@customElement("my-index")
class MyIndex extends LitElement {
  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  @internalProperty() private _updatingUrl =
    extractSearchParamsObject().change === "1";

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    const url = this._url || DEFAULT_HASS_URL;

    if (!this._updatingUrl) {
      return html`
        <div class="card-content current-instance">
          Configured Home Assistant url:<br />
          <a href=${url} rel="noreferrer noopener">${url}</a>
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

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
    const params = extractSearchParamsObject();
    if (params.change === "1") {
      console.log("CALLING HISTORY.back");
      history.back();
    } else {
      this._updatingUrl = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
