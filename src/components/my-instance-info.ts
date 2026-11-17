import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svgPencil } from "./svg-pencil";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) public instanceUrls: string[] = [];

  createRenderRoot() {
    return this;
  }

  protected render() {
    if (!this.instanceUrls.length) {
      return nothing;
    }
    const multiple = this.instanceUrls.length > 1;
    const editLabel = multiple ? "Edit instances" : "Edit instance";
    return html`
      <div class=${multiple ? "instance-info multiple" : "instance-info"}>
        <div>
          <div class="instance-header">
            ${multiple ? "HOME ASSISTANT INSTANCES" : "HOME ASSISTANT INSTANCE"}
          </div>
          ${this.instanceUrls.map(
            (url) => html`
              <a
                class="instance-url"
                href=${url}
                rel="noreferrer noopener"
                target="_blank"
              >
                ${url}
              </a>
            `,
          )}
        </div>
        <button
          class="empty"
          aria-label=${editLabel}
          title=${editLabel}
          @click=${this._handleEdit}
        >
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
