import "@material/mwc-button";
import {
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { svgPencil } from "./svg-pencil";
import { InstanceInfo } from "../data/instance_info";

@customElement("my-instance-info")
class MyInstanceInfo extends LitElement {
  @property({ attribute: false }) public instanceInfo!: InstanceInfo;

  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <div class="instance-header">HOME ASSISTANT INSTANCE</div>
      ${!this.instanceInfo.configuredUrl
        ? html`<div class="warning">
            You have not configured your Home Assistant URL yet, do you get to
            your Home Assistant instance when clicking the link below?
            <br /><br />
            If not, click the pencil and enter the URL of your instance.
          </div>`
        : ""}
      <div class="instance">
        <div class="info">
          <a
            href=${this.instanceInfo.url}
            rel="noreferrer noopener"
            target="_blank"
            >${this.instanceInfo.url}</a
          >
        </div>
        <button class="empty" @click=${this._handleEdit}>${svgPencil}</button>
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
