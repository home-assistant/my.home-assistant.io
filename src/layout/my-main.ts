import "@material/mwc-button";
import "@material/mwc-checkbox";
import "@material/mwc-formfield";
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
import "../components/my-url-input";

const HASS_URL = "hassUrl";
// const ALWAYS_REDIRECT = "alwaysRedirect";
@customElement("my-main")
export class MyMain extends LitElement {
  @internalProperty() private _error?: string | TemplateResult;

  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  protected render(): TemplateResult {
    return html`
      <my-layout>
        <img class="hero" src="/images/header.jpg" />
        <h1 class="card-header">
          My Home Assistant
        </h1>
        <div class="card-content">
          <p>
            My Home Assistant is a portal to your Home Assistant instance. It
            allows the documentation to link to your instance. For a list of
            current supported links, see the
            <a href="faq.html#supported-links">FAQ</a>.
          </p>
          <p>
            It works by entering the URL of your Home Assistant instance. By
            default this is <code>http://homeassistant.local:8123</code>. You do
            not have to provide us access to your instance and this information
            will only be stored in your browser.
          </p>
          ${this._url
            ? html`
                <p>
                  Your configured Home Assistant url is:
                </p>
                <div class="current-instance">
                  <a href=${this._url} rel="noreferrer noopener">
                    ${this._url}</a
                  >
                  <mwc-button @click=${this._handleRemove}>
                    clear
                  </mwc-button>
                </div>
              `
            : html`
                <p>
                  To get started, enter your Home Assistant URL and click save.
                </p>
                <p>
                  <my-url-input
                    .value=${this._url}
                    @value-changed=${this._handleUrlChanged}
                  ></my-url-input>
                </p>
              `}
          ${this._error
            ? html`
                <p class="error">${this._error}</p>
              `
            : ""}
        </div>
      </my-layout>
    `;
  }

  private _handleRemove() {
    try {
      window.localStorage.clear();
      this._url = undefined;
    } catch (err) {
      this._error = "Failed to remove your instance!";
    }
  }

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
  }

  static get styles(): CSSResult {
    return css`
      .card-content a {
        color: var(--mdc-theme-primary);
      }
      .error {
        color: #db4437;
        font-weight: bold;
      }
      mwc-formfield {
        display: block;
      }
      .error a {
        color: darkred;
      }
      .current-instance {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .current-instance mwc-button {
        --mdc-theme-primary: #db4437;
      }
      .current-instance a {
        word-break: break-all;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-main": MyMain;
  }
}
