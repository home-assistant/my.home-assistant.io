import "@material/mwc-button";
import "@material/mwc-textfield";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
  property,
} from "lit-element";
import { fireEvent } from "../util/fire_event";

const HASS_URL = "hassUrl";

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property() public value?: string;

  @property() public button?: string;

  @internalProperty() private _error?: string | TemplateResult;

  protected render(): TemplateResult {
    return html`
      ${this._error
        ? html`
            <p class="error">${this._error}</p>
          `
        : ""}
      <div>
        <mwc-textfield
          label="Home Assistant URL"
          .value=${this.value || ""}
          placeholder="http://homeassistant.local:8123"
          @keydown=${this._handleInputKeyDown}
        ></mwc-textfield>
        <mwc-button @click=${this._handleSave}
          >${this.button || "Save"}
        </mwc-button>
      </div>
    `;
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    // Handle pressing enter.
    if (ev.keyCode === 13) {
      this._handleSave();
    }
  }

  private _handleSave() {
    const inputEl = this.shadowRoot!.querySelector("mwc-textfield")!;
    const value = inputEl.value || "";
    this._error = undefined;

    if (value === "") {
      this._error = "Please enter a Home Assistant URL.";
      return;
    }
    if (value.indexOf("://") === -1) {
      this._error =
        "Please enter your full URL, including the protocol part (https://).";
      return;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(value);
    } catch (err) {
      this._error = "Invalid URL";
      return;
    }
    const url = `${urlObj.protocol}//${urlObj.host}`;
    try {
      window.localStorage.setItem(HASS_URL, url);
    } catch (err) {
      this._error = "Failed to store your url!";
    }
    fireEvent(this, "value-changed", { value: url });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      div {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .error {
        color: red;
        font-weight: bold;
      }
      mwc-textfield {
        flex-grow: 1;
        margin-right: 8px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-url-inout": MyUrlInputMain;
  }
}
