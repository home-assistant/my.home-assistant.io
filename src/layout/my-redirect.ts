import "@material/mwc-button";
import "@polymer/paper-input/paper-input";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  TemplateResult,
  internalProperty,
} from "lit-element";
import "./my-layout";

@customElement("my-main")
export class MyMain extends LitElement {

  @internalProperty() private error?: string | TemplateResult;

  protected render(): TemplateResult {
      return html`
        <my-layout>
          <div class="card-content">
            <p>
              My Home Assistant allows you to connect to your Home Assistant installation.
            </p>
            <p>
              To get started, enter your Home Assistant URL and click save.
            </p>
            <p>
              <paper-input
                label="Home Assistant URL"
                placeholder="https://abcdefghijklmnop.ui.nabu.casa"
                @keydown=${this._handleInputKeyDown}
              ></paper-input>
            </p>
            ${this.error ? html` <p class="error">${this.error}</p> ` : ""}
          </div>
        </my-layout>
      `;
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    // Handle pressing enter.
    if (ev.keyCode === 13) {
      this._handleConnect();
    }
  }

  private async _handleConnect() {
    const inputEl = this.shadowRoot!.querySelector("paper-input")!;
    const value = inputEl.value || "";
    this.error = undefined;

    if (value === "") {
      this.error = "Please enter a Home Assistant URL.";
      return;
    }
    if (value.indexOf("://") === -1) {
      this.error =
        "Please enter your full URL, including the protocol part (https://).";
      return;
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch (err) {
      this.error = "Invalid URL";
      return;
    }
    alert(`${url.protocol}//${url.host}`);
  }

  static get styles(): CSSResult {
    return css`
      .card-content a {
        color: var(--primary-color);
      }
      .card-actions a {
        text-decoration: none;
      }
      .error {
        color: red;
        font-weight: bold;
      }

      .error a {
        color: darkred;
      }

      .spacer {
        flex: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-main": MyMain;
  }
}
