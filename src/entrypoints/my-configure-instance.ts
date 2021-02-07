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

const css = html`
  <style>
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
  </style>
`;

const HASS_URL = "hassUrl";
// const ALWAYS_REDIRECT = "alwaysRedirect";
@customElement("my-configure-instance")
export class MyConfigureInstance extends LitElement {
  @internalProperty() private _url?: string | null = localStorage.getItem(
    HASS_URL
  );

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    if (this._url) {
      return html`
        ${css}
        <div class="card-content">
          Your configured Home Assistant url is:
          <div class="current-instance">
            <a href=${this._url} rel="noreferrer noopener"> ${this._url}</a>
            <mwc-button @click=${this._handleRemove}>
              clear
            </mwc-button>
          </div>
        </div>
      `;
    }

    return html`
      ${css}
      <div class="card-content">
        To get started, enter your Home Assistant URL and click save.
        <p>
          <my-url-input
            .value=${this._url}
            @value-changed=${this._handleUrlChanged}
          ></my-url-input>
        </p>
      </div>
    `;
  }

  private _handleRemove() {
    window.localStorage.clear();
    this._url = undefined;
  }

  private _handleUrlChanged(ev: CustomEvent) {
    this._url = ev.detail.value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-configure-instance": MyConfigureInstance;
  }
}
