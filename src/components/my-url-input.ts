import "@material/web/button/filled-button";
import "@material/web/button/outlined-button";
import "@material/web/button/text-button";
import "@material/web/textfield/filled-text-field";
import "@material/web/dialog/dialog";
import type { MdFilledTextField } from "@material/web/textfield/filled-text-field";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, state, query, property } from "lit/decorators.js";
import { DEFAULT_INSTANCE_NAME, DEFAULT_INSTANCE_URL } from "../const";
import { fireEvent } from "../util/fire_event";
import { Instance } from "../data/instance_info";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { svgPencil } from "./svg-pencil";
import { MdDialog } from "@material/web/dialog/dialog";

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property() public value?: string;
  @property() public instance!: Instance;
  @property() public instanceIndex!: number;

  @state() private _instanceName?: string;
  @state() private _instanceUrl?: string;

  @query("md-dialog", true) private _dialog!: MdDialog;

  _handleEditButtonClick() {
    this._instanceName = this.instance.name;
    this._instanceUrl = this.instance.url;
    this._dialog.show();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    // If no instance url is set that means this instance is being added so go ahead and show the edit dialog.
    if (this.instance.url === "") {
      this._handleEditButtonClick();
    }
  }

  protected render(): TemplateResult {
    return html`
    <div style="width: 100%; display: flex; flex-direction: column; align-items: start; line-break: anywhere; gap: 4px">
      <div
          style="font-weight: 600; letter-spacing: 0.05em; font-size: 12px; text-transform: uppercase"
        >
          ${this.instance.name || DEFAULT_INSTANCE_NAME}
        </div>
        <div
          style="display: flex; align-items: center; width: 100%; justify-content: space-between;"
        >
          <a
            href="${this.instance.url}"
            rel="noreferrer noopener"
            target="_blank"
          >
            ${this.instance.url || DEFAULT_INSTANCE_URL}
          </a>
          <button
            @click=${this._handleEditButtonClick}
            style="display: inline-flex; background: none; color: inherit; border: none; padding: 0; font: inherit; text-align: left; cursor: pointer;"
          >
            ${unsafeSVG(svgPencil)}
          </button>
          <md-dialog style="min-width: 400px; max-width: 600px" @close=${this._handleDialogClose}>
            <div slot="headline" id="foo">
              ${this.instance.url ? "Edit Instance" : "New Instance"}
            </div>
            <form slot="content" id="form" method="dialog">
              <div
                style="width: 100%; display: flex; flex-direction: column; align-items: start; line-break: anywhere; gap: 4px"
              >
                <md-filled-text-field
                  id="dialog-instance-name"
                  label="Instance Name"
                  .value=${this._instanceName || DEFAULT_INSTANCE_NAME}
                  style="width: 100%"
                ></md-filled-text-field>
                <br/>
                <md-filled-text-field
                  id="dialog-instance-url"
                  label="Instance URL"
                  .value=${this._instanceUrl || DEFAULT_INSTANCE_URL}
                  style="width: 100%"
                ></md-filled-text-field>
              </div>
            </form>
            <div slot="actions">
              ${this.instance.url !== "" ? html`<md-text-button form="form" value="delete">Delete</md-text-button>` : html``}
              <div style="flex: 1"></div>
              <md-text-button form="form" value="cancel">Cancel</md-text-button>
              <md-text-button value="save" @click=${this._handleSave}>Save</md-text-button>
            </div>
          </md-dialog>
        </div>
      </div>
    </div>
    `;
  }

  private _handleDialogClose() {
    switch (this._dialog.returnValue) {
      case "save":
        fireEvent(this, "save", {
          instanceIndex: this.instanceIndex,
          instanceName: this._instanceName,
          instanceUrl: this._instanceUrl,
        });
        return;
      case "delete":
        fireEvent(this, "delete", { instanceIndex: this.instanceIndex });
        return;
      case "cancel":
        if (!this.instance.url) {
          // As a special case, if cancelled and url === "" then delete it.
          // This happens when adding a new instance.
          fireEvent(this, "delete", { instanceIndex: this.instanceIndex });
        }
        return;
      default:
        return;
    }
  }

  private _handleSave() {
    const instanceUrlField = this.renderRoot.querySelector(
      "md-filled-text-field#dialog-instance-url",
    ) as MdFilledTextField;

    let value = instanceUrlField?.value || "";

    if (value == "" || value.indexOf("://") === -1) {
      instanceUrlField.setCustomValidity(
        "Please enter your full URL, including the protocol part (https://).",
      );
      instanceUrlField.reportValidity();
      return;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(value);
    } catch (err: any) {
      instanceUrlField.setCustomValidity("Invalid URL: " + err.toString());
      instanceUrlField.reportValidity();
      return;
    }
    this._instanceName =
      (
        this.renderRoot.querySelector(
          "md-filled-text-field#dialog-instance-name",
        ) as MdFilledTextField
      )?.value || DEFAULT_INSTANCE_NAME;
    this._instanceUrl = `${urlObj.protocol}//${urlObj.host}`;

    this._dialog.close("save");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-url-inout": MyUrlInputMain;
  }
}
