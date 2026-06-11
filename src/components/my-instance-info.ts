import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Instance } from "../data/instance_info";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) public instances!: Instance[] | null;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    console.log("this.instances", this.instances);
    if (!this.instances?.length) {
      console.error("my-instance-info rendered with a empty instance list");
      return html``;
    }
    return html`
      <div style="padding: 0 16px 16px">
        <div
          style="width: 100%; display: flex; flex-direction: column; align-items: start; line-break: anywhere; gap: 12px"
        >
          ${this.instances.map(
            (instance) =>
              html`<my-url-input
                .instance=${instance}
                style="width: 100%"
              />` /*
              <div
                style="width: 100%; display: flex; flex-direction: column; align-items: start; line-break: anywhere; gap: 4px"
              >
                <div
                  style="font-weight: 600; letter-spacing: 0.05em; font-size: 12px; text-transform: capitalize"
                >
                  ${instance.name || "HOME ASSISTANT INSTANCE"}
                </div>
                <div
                  style="display: flex; align-items: center; width: 100%; justify-content: space-between;"
                >
                  <a
                    href="${instance.url}"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    ${instance.url}
                  </a>
                  <button
                    @click=${this._handleEdit}
                    style="display: inline-flex; background: none; color: inherit; border: none; padding: 0; font: inherit; text-align: left; cursor: pointer;"
                  >
                    ${unsafeSVG(svgPencil)}
                  </button>
                </div>
              </div>
            `,*/,
          )}
          <a href="#" rel="noreferrer noopener" target="_blank">
            + Add Instance
          </a>
        </div>
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
