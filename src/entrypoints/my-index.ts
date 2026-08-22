import "@material/web/button/outlined-button";

import { html, LitElement, TemplateResult } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import "../components/my-url-input";
import "../components/my-instance-info";
import { getInstances, Instance, saveInstances } from "../data/instance_info";

@customElement("my-index")
class MyIndex extends LitElement {
  @state() private _instances!: Instance[] | null;

  public connectedCallback() {
    super.connectedCallback();
    this._instances = getInstances();
  }

  protected shouldUpdate() {
    return this._instances !== undefined;
  }

  /*protected render(): TemplateResult {
    return html`
      <my-instance-info
        .instances=${this._instances}
        @edit=${this._handleEdit}
      ></my-instance-info>
    `;
  }*/

  protected render(): TemplateResult {
    console.log("this.instances", this._instances);
    return html`
      <div style="padding: 0 16px 16px">
        <div
          style="width: 100%; display: flex; flex-direction: column; align-items: start; line-break: anywhere; gap: 12px"
        >
          ${this._instances?.map(
            (instance, index) =>
              html`<my-url-input
                .instanceIndex=${index}
                .instance=${instance}
                style="width: 100%"
                @save=${this._handleSave}
                @delete=${this._handleDelete}
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
          <md-outlined-button @click=${this._handleNewInstanceClick}
            >+ Add Instance</md-outlined-button
          >
        </div>
      </div>
    `;
  }

  _handleNewInstanceClick() {
    if (!this._instances) {
      this._instances = [
        {
          url: "",
        },
      ];
    } else {
      this._instances = [...this._instances, { url: "" }];
    }
  }

  _handleSave(ev: CustomEvent) {
    const instanceIndex = ev.detail.instanceIndex;
    if (instanceIndex === undefined) {
      return;
    }

    const instance: Instance = {
      name: ev.detail.instanceName,
      url: ev.detail.instanceUrl,
    };
    // In-place operations (such as .pop) don't trigger re-renders so use a temporary array, mutate it, and then set this._instances.
    let tmp = [...(this._instances || [])];
    if (!this._instances) {
      tmp = [instance];
      return;
    } else if (this._instances.length >= instanceIndex) {
      tmp[instanceIndex] = instance;
    } else {
      tmp.push(instance);
    }
    this._instances = tmp;
    saveInstances(this._instances);
  }
  _handleDelete(ev: CustomEvent) {
    const instanceIndex = ev.detail.instanceIndex;
    if (instanceIndex === undefined) {
      return;
    }

    // .splice changes the array in place which does not trigger a re-render.
    // By using a temporary copy of the array, splicing it, and then setting this._instances to that spliced value
    // a re-render is triggered.
    const tmp = [...(this._instances || [])];
    tmp.splice(instanceIndex, 1) || null;
    this._instances = tmp;
    saveInstances(this._instances);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-index": MyIndex;
  }
}
