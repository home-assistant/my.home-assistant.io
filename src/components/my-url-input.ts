import { css, CSSResult, html, LitElement, TemplateResult } from "lit";
import { customElement, state, query, property } from "lit/decorators.js";
import { DEFAULT_HASS_URL } from "../const";
import { fireEvent } from "../util/fire_event";
import "./ha-button";
import "./input/ha-input";
import type { HaInput } from "./input/ha-input";

const HASS_URL = "hassUrl";

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property() public value?: string;

  @state() private _error?: string | TemplateResult;

  @query("ha-input", true) private _textfield!: HaInput;

  public focus(): void {
    this.updateComplete.then(() => this._textfield.focus());
  }

  protected render(): TemplateResult {
    return html`
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
      <div>
        <ha-input
          label="Home Assistant URL"
          type="url"
          .value=${this.value || DEFAULT_HASS_URL}
          @input=${this._handleInput}
          @keydown=${this._handleInputKeyDown}
        ></ha-input>
        <ha-button appearance="accent" @click=${this._handleSave}
          >${this.value ? "Update" : "Save"}</ha-button
        >
      </div>
    `;
  }

  private _handleInput() {
    this._textfield.setCustomValidity("");
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
    inputEl.setCustomValidity("");

    if (value === "") {
      value = DEFAULT_HASS_URL;
    }

    if (value.indexOf("://") === -1) {
      this._textfield.setCustomValidity(
        "Please enter your full URL, including the protocol part (https://).",
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

    inputEl.reportValidity();
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
      ha-input {
        flex-grow: 1;
        margin-right: 8px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-url-input": MyUrlInputMain;
  }
}
