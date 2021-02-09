import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { svgPencil } from "./svg-pencil";
import { LoadingState } from "../util/get_hass_info";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) private instanceInfo!: LoadingState;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <div class="instance-header">HOME ASSISTANT INSTANCE</div>
      <div class="instance">
        <div>
          ${this.instanceInfo.isLoading
            ? html`
                <div>Finding instance…</div>
                <div>&nbsp;</div>
              `
            : this.instanceInfo.loadingFailed && this.instanceInfo.configuredUrl
            ? html`
                <div>
                  <a href=${this.instanceInfo.url} rel="noreferrer noopener"
                    >${this.instanceInfo.url}</a
                  >
                </div>
                <div class="error">
                  Unable to connect to instance.
                  <a href="faq.html#cannot-connect">Troubleshoot</a>
                </div>
              `
            : this.instanceInfo.loadingFailed
            ? html`
                <div>No instance configured</div>
                <div>&nbsp;</div>
              `
            : html`
                <div>
                  ${this.instanceInfo.discoveryInfo.location_name} @
                  <a href=${this.instanceInfo.url} rel="noreferrer noopener"
                    >${this.instanceInfo.url}</a
                  >
                </div>
                <div class="secondary">
                  core-${this.instanceInfo.discoveryInfo.version},
                  ${this.instanceInfo.discoveryInfo.installation_type}
                </div>
              `}
        </div>
        ${this.instanceInfo.isLoading
          ? html``
          : html`<button class="empty" @click=${this._handleEdit}>
              ${svgPencil}
            </button>`}
      </div>
    `;
  }

  _handleEdit() {
    this.dispatchEvent(new Event("edit"));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-instance-info": MyInstanceInfo;
  }
}
