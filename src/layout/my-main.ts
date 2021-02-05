import "@material/mwc-button";
import "@material/mwc-checkbox";
import "@material/mwc-formfield";
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
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import "./my-layout";

const HASS_URL = "hassUrl";
const ALWAYS_REDIRECT = "alwaysRedirect";
@customElement("my-main")
export class MyMain extends LitElement {
  @internalProperty() private _error?: string | TemplateResult;

  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  @internalProperty() private _alwaysRedirect?: boolean = Boolean(
    localStorage.getItem(ALWAYS_REDIRECT)
  );

  @internalProperty() private _redirect?: string;

  public connectedCallback() {
    super.connectedCallback();
    const path = window.location.pathname;
    if (path.startsWith("/redirect")) {
      this._redirect = path.split("/")[2];
      if (this._url && this._alwaysRedirect) {
        this._handleRedirect();
      }
    }
  }

  protected render(): TemplateResult {
    return html`
      <my-layout>
        <div class="card-content">
          <p>
            My Home Assistant is a portal to your Home Assistant instance. It
            allows the documentation to link to your instance. For a list of
            current supported links, see the
            <a href="faq.html">FAQ</a>.
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
                  You have currently set as your Home Assistant url:<br />
                  <a href=${this._url} rel="noreferrer noopener">
                    ${this._url}</a
                  >
                  &nbsp; (<button class="link" @click=${this._handleRemove}>
                    clear</button
                  >)
                </p>
              `
            : html`
                <p>
                  ${this._redirect
                    ? `To get redirected to ${this._redirect} we need your Home Assistant url`
                    : "To get started, enter your Home Assistant URL and click save."}
                </p>
                <p>
                  <paper-input
                    label="Home Assistant URL"
                    .value=${this._url}
                    placeholder="https://abcdefghijklmnop.ui.nabu.casa"
                    @keydown=${this._handleInputKeyDown}
                  ></paper-input>
                </p>
              `}
          ${this._url && this._redirect
            ? html`
                Do you want to follow this redirect to ${this._redirect}?
                <mwc-formfield
                  label="Don't ask again"
                  @change=${this._handleAlwaysRedirectChange}
                >
                  <mwc-checkbox .checked=${this._alwaysRedirect}></mwc-checkbox>
                </mwc-formfield>
              `
            : ""}
          ${this._error
            ? html`
                <p class="error">${this._error}</p>
              `
            : ""}
        </div>
        ${this._redirect || !this._url
          ? html`
              <div class="card-actions">
                ${!this._redirect && this._url
                  ? html``
                  : !this._url
                  ? html`
                      <mwc-button @click=${this._handleSave}
                        >${this._redirect ? "Go!" : "Save"}</mwc-button
                      >
                    `
                  : html`
                      <mwc-button @click=${this._handleRedirect}
                        >Yes</mwc-button
                      >
                    `}
              </div>
            `
          : html``}
      </my-layout>
    `;
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    // Handle pressing enter.
    if (ev.keyCode === 13) {
      this._handleSave();
    }
  }

  private _handleSave() {
    const inputEl = this.shadowRoot!.querySelector("paper-input")!;
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

    let url: URL;
    try {
      url = new URL(value);
    } catch (err) {
      this._error = "Invalid URL";
      return;
    }
    this._url = `${url.protocol}//${url.host}`;
    try {
      window.localStorage.setItem(HASS_URL, this._url);
    } catch (err) {
      // Safari in private mode doesn't allow localstorage
    }
    if (this._redirect) {
      this._handleRedirect();
    }
  }

  private _handleRemove() {
    try {
      window.localStorage.clear();
      this._url = undefined;
    } catch (err) {
      this._error = "Failed to remove your instance!";
    }
  }

  private _handleRedirect() {
    try {
      window.location.replace(
        `${this._url}/_my_redirect/${this._createRedirectUrl()}`
      );
    } catch (e) {
      this._error = "Something went wrong.";
    }
  }

  private _createRedirectUrl(): string {
    if (this._redirect === "info") {
      return "info";
    } else if (this._redirect === "logs") {
      return "logs";
    } else if (this._redirect === "import_blueprint") {
      const params = extractSearchParamsObject();
      if (Object.keys(params).length > 1 || !params.url) {
        throw "Wrong params";
      }
      return `import_blueprint?${createSearchParam({
        url: params.url,
      })}`;
    }
    throw "Unknown redirect";
  }

  private _handleAlwaysRedirectChange(ev) {
    const checked = ev.target.checked;
    try {
      if (checked) {
        window.localStorage.setItem(ALWAYS_REDIRECT, "true");
        this._alwaysRedirect = true;
      } else {
        window.localStorage.removeItem(ALWAYS_REDIRECT);
        this._alwaysRedirect = false;
      }
    } catch (err) {
      this._error = "Could not save your settings";
      ev.target.checked = !checked;
    }
  }

  static get styles(): CSSResult {
    return css`
      .card-content a {
        color: var(--primary-color);
      }
      .card-content p:last-child {
        margin-bottom: 0;
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

      button.link {
        background: none;
        color: var(--primary-color);
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        text-decoration: underline;
        cursor: pointer;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-main": MyMain;
  }
}
