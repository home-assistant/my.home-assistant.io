import "@material/web/button/filled-button"
import "@material/web/textfield/filled-text-field"
import type { MdFilledTextField } from "@material/web/textfield/filled-text-field";
import { css, CSSResult, html, LitElement, TemplateResult } from "lit";
import { customElement, state, query, property } from "lit/decorators.js";
import { DEFAULT_HASS_URL } from "../const";
import { fireEvent } from "../util/fire_event";

const HASS_URL = "hassUrl";

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property() public value?: string;

  @state() private _error?: string | TemplateResult;

  @query("md-filled-text-field", true) private _textfield!: MdFilledTextField;

  public focus(): void {
    this.updateComplete.then(() => this._textfield.focus());
  }

  protected render(): TemplateResult {
    return html`
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
      <div>
        <md-filled-text-field
          label="Home Assistant URL"
          .value=${this.value || DEFAULT_HASS_URL}
          @keydown=${this._handleInputKeyDown}
        ></md-filled-text-field>
        <md-filled-button
          @click=${this._handleSave}
        >${this.value ? "Update" : "Save"}</md-filled-button>
      </div>
    `;
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    // Handle pressing enter.
    if (ev.key === "Enter") {
      this._handleSave();
    }
  }

  private _handleSave() {
    const inputEl = this._textfield!;
    let value = inputEl.value || "";
    this._error = undefined;

    if (value === "") {
      value = DEFAULT_HASS_URL;
    }

    if (value.indexOf("://") === -1) {
      this._textfield.setCustomValidity(
        "Please enter your full URL, including the protocol part (https://)."
      );
      this._textfield.reportValidity();
      return;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(value);
    } catch (err) {
      this._textfield.setCustomValidity("Invalid URL");
      this._textfield.reportValidity();
      return;
    }
    const url = `${urlObj.protocol}//${urlObj.host}`;
    try {
      window.localStorage.setItem(HASS_URL, url);
    } catch (err) {
      this._error = "Failed to store your URL!";
      return;
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
        color: #db4437;
        font-weight: bold;
      }
      md-filled-text-field {
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
