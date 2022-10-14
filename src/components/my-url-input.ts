import "@material/mwc-button";
import "@material/mwc-textfield";
import { css, CSSResult, html, LitElement, TemplateResult } from "lit";
import type { TextField } from "@material/mwc-textfield";
import { customElement, state, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { DEFAULT_HASS_URL, STORAGE_KEY } from "../const";
import { fireEvent } from "../util/fire_event";
import { svgDelete } from "./svg";

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property() public values?: string[];

  @state() private _error?: string | TemplateResult;

  public focus(): void {
    this.updateComplete.then(() => this.shadowRoot!.querySelector("mwc-textfield")!.focus());
  }

  protected render(): TemplateResult {
    return html`
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
      ${(this.values || [DEFAULT_HASS_URL]).map(value => html`
          <div class="instance-input">
            <mwc-textfield
              label="Home Assistant URL"
              .value=${value}
              @keydown=${this._handleInputKeyDown}
            >
            </mwc-textfield>
            ${this.values?.length ? html`<mwc-button 
              .value=${value}
              @click=${this._handleRemove}>
              ${unsafeSVG(svgDelete)}
            </mwc-button>`
            : html`
            <mwc-button
              label="save"
              @click=${this._handleSave}
            >
            </mwc-button>`}
          </div>
        `)}

        ${this.values?.length ? html`<div class="buttons">
      <mwc-button
          .disabled=${!this.values}
          label="+ Additional URL"
          @click=${this._handleAdditional}
        >
        </mwc-button>
        <mwc-button
          class="right"
          label="save"
          @click=${this._handleSave}
        >
        </mwc-button>
      </div>`: "" }
    `;
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    // Handle pressing enter.
    if (ev.key === "Enter") {
      this._handleSave();
    }
  }

  private _handleAdditional() {
    this.values = [...this.values || [], ""]
  }

  private _handleRemove(event) {
    const remove = (event.currentTarget as TextField).value
    const filtered = this.values?.filter(value => value !== remove)
    this.values = filtered?.length ? filtered : undefined
  }

  private _handleSave() {
    const values = [...this.values || []]

    for (const inputEl of this.shadowRoot!.querySelectorAll("mwc-textfield")) {
      let value = inputEl.value || "";
      this._error = undefined;

      if (value === "") {
        value = DEFAULT_HASS_URL;
      }
  
      if (value.indexOf("://") === -1) {
        inputEl.setCustomValidity(
          "Please enter your full URL, including the protocol part (https://)."
        );
        inputEl.reportValidity();
        return;
      }
  
      let urlObj: URL;
      try {
        urlObj = new URL(value);
      } catch (err) {
        inputEl.setCustomValidity("Invalid URL");
        inputEl.reportValidity();
        return;
      }
      values.push(`${urlObj.protocol}//${urlObj.host}`);
    }

    this.values = Array.from(new Set(values)).filter(url => url != "");
    
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values));
    } catch (err) {
      this._error = "Failed to store your URLs!";
      return;
    }
    fireEvent(this, "value-changed", { value: this.values });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .error {
        color: #db4437;
        font-weight: bold;
      }
      .instance-input, .buttons {
        display: flex;
        justify-content: space-between;
      }
      .buttons {
        margin-right: 64px;
      }
      mwc-textfield {
        flex-grow: 1;
        margin-right: 8px;
      }

      .instance-input mwc-button {
        align-self: center;
      }

      svg {
        height: 24px;
        fill: red;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-url-inout": MyUrlInputMain;
  }
}
