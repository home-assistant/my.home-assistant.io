import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import "@material/mwc-button";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svgPencil } from "./svg";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) public instanceUrls!: string[] | null;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    if (!this.instanceUrls?.length) {
      return html``;
    }
    return html`
      <div class="instance-info">
          <div class="instance-header">HOME ASSISTANT INSTANCES</div>
          ${this.instanceUrls.map(url => html`
          
          <div class="instance">
            <a href=${url} rel="noreferrer noopener" target="_blank">
              ${url}
            </a>

          <button class="empty" @click=${this._handleEdit}>
            ${unsafeSVG(svgPencil)}
          </button>
          </div>
          `)}
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
