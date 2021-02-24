import { unsafeSVG } from "lit-html/directives/unsafe-svg";
import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { svgPencil } from "./svg-pencil";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) public instanceUrl!: string | null;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    if (!this.instanceUrl) {
      return html``;
    }
    return html`
      <div class="instance-info">
        <div>
          <div class="instance-header">HOME ASSISTANT INSTANCE</div>
          <a href=${this.instanceUrl} rel="noreferrer noopener" target="_blank">
            ${this.instanceUrl}
          </a>
        </div>
        <button class="empty" @click=${this._handleEdit}>
          ${unsafeSVG(svgPencil)}
        </button>
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
