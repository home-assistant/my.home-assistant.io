// Adapted from frontend: https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/input/ha-input.ts
// Adapted from frontend: https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/input/wa-input-mixin.ts
// Adapted from frontend: https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/input/ha-input-search.ts
import "@home-assistant/webawesome/dist/components/input/input.js";
import type WaInput from "@home-assistant/webawesome/dist/components/input/input.js";
import { mdiClose, mdiMagnify } from "@mdi/js";
import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../ha-icon-button";
import "../ha-svg-icon";

@customElement("ha-input")
export class HaInput extends LitElement {
  @property() public value?: string;

  @property() public label?: string;

  @property({ type: Boolean, reflect: true }) public required = false;

  @property({ type: Boolean, reflect: true }) public disabled = false;

  @property({ reflect: true }) public type: "text" | "url" | "search" = "text";

  @property({ reflect: true }) public appearance: "material" | "outlined" =
    "material";

  @property() public placeholder?: string;

  @property({ type: Boolean, attribute: "with-clear" }) public withClear =
    false;

  @property() public autocomplete?: string;

  @property({ attribute: "validation-message" })
  public validationMessage?: string;

  @query("wa-input") private _input?: WaInput;

  @state() private _invalid = false;

  private _customError = "";

  public focus(options?: FocusOptions): void {
    this.updateComplete.then(() => this._input?.focus(options));
  }

  public setCustomValidity(message: string): void {
    this._customError = message;
    this._input?.setCustomValidity(message);

    if (this._invalid) {
      this._refreshValidity();
    }
  }

  public checkValidity(): boolean {
    this._syncInput();

    return this._input?.input ? this._input.checkValidity() : false;
  }

  public reportValidity(): boolean {
    const valid = this.checkValidity();
    this._invalid = !valid;

    return valid;
  }

  protected async getUpdateComplete(): Promise<boolean> {
    do {
      await super.getUpdateComplete();

      while ((await this._input?.updateComplete) === false) {
        // WA may schedule another update while refreshing its validity state.
      }
    } while (this.isUpdatePending);

    return true;
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has("value") ||
      changedProperties.has("required") ||
      changedProperties.has("disabled") ||
      changedProperties.has("type")
    ) {
      this._refreshValidity();
    }
  }

  private _syncInput() {
    if (!this.hasUpdated) {
      this.performUpdate();
    }

    if (!this._input) {
      return;
    }

    this._input.value = this.value ?? "";
    this._input.type = this.type;
    this._input.required = this.required;
    this._input.disabled = this.disabled;
    // WA mirrors native validity, which must include pending property changes.
    this._input.toggleAttribute("disabled", this.disabled);

    if (this._input.input) {
      this._input.input.type = this.type;
      this._input.input.value = this.value ?? "";
      this._input.input.required = this.required;
      this._input.input.disabled = this.disabled;
    }

    this._input.setCustomValidity(this._customError);
    this._input.updateValidity();
  }

  private _refreshValidity() {
    this._syncInput();

    if (this._invalid) {
      this._invalid = !(this._input?.validity.valid ?? false);
      this.requestUpdate();
    }
  }

  private _handleInput() {
    this.value = this._input?.value ?? "";
    this._refreshValidity();
  }

  private _handleInvalid() {
    this._invalid = true;
  }

  private _clear() {
    this._input?.clear();
  }

  protected render() {
    return html`
      <wa-input
        .value=${this.value ?? ""}
        .type=${this.type}
        .label=${this.label ?? ""}
        .required=${this.required}
        .disabled=${this.disabled}
        .placeholder=${this.placeholder ?? ""}
        .withClear=${this.withClear}
        .autocomplete=${this.autocomplete}
        class=${classMap({
          invalid: this._invalid,
          "label-raised": !!this.value || !!this.placeholder,
          "no-label": !this.label || this.type === "search",
        })}
        @input=${this._handleInput}
        @change=${this._handleInput}
        @wa-invalid=${this._handleInvalid}
        exportparts="base:wa-base, hint:wa-hint, input:wa-input"
      >
        <slot name="start" slot="start"
          >${
            this.type === "search"
              ? html`<ha-svg-icon .path=${mdiMagnify}></ha-svg-icon>`
              : ""
          }</slot
        >
        <slot name="end" slot="end"></slot>
        <ha-icon-button
          slot="clear-button"
          label="Clear"
          .path=${mdiClose}
          .disabled=${this.disabled}
          @click=${this._clear}
        ></ha-icon-button>
        <div slot="hint" class="error" aria-live="polite">
          ${
            this._invalid
              ? this._customError ||
                this.validationMessage ||
                this._input?.validationMessage
              : ""
          }
        </div>
      </wa-input>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      align-items: flex-start;
      padding-top: var(--ha-input-padding-top, 0);
      padding-bottom: var(--ha-input-padding-bottom, var(--ha-space-2));
      text-align: var(--ha-input-text-align, start);
    }
    :host([appearance="outlined"]) {
      padding-bottom: var(--ha-input-padding-bottom, 0);
    }
    wa-input {
      flex: 1;
      min-width: 0;
      position: relative;
      --wa-transition-fast: var(--wa-transition-normal);
    }
    wa-input::part(label) {
      position: absolute;
      top: 0;
      padding: var(--ha-space-5) var(--ha-space-4) 0;
      font-weight: var(--ha-font-weight-normal);
      font-family: var(--ha-font-family-body);
      transition: all var(--wa-transition-normal) ease-in-out;
      color: var(--secondary-text-color);
      line-height: var(--ha-line-height-condensed);
      z-index: 1;
      pointer-events: none;
      font-size: var(--ha-font-size-m);
    }
    wa-input.label-raised::part(label),
    :host(:focus-within) wa-input::part(label) {
      padding-top: var(--ha-space-3);
      font-size: var(--ha-font-size-xs);
    }
    :host(:focus-within) wa-input::part(label) {
      color: var(--primary-color);
    }
    wa-input::part(base) {
      height: 56px;
      padding: 0 var(--ha-space-4);
      background-color: var(--ha-color-form-background);
      border-radius: var(--ha-border-radius-sm) var(--ha-border-radius-sm) 0 0;
      border: none;
      position: relative;
      transition: background-color var(--wa-transition-normal) ease-in-out;
    }
    :host(:focus-within) wa-input::part(base) {
      outline: none;
    }
    :host([appearance="outlined"]) wa-input::part(base) {
      border: 1px solid var(--ha-color-border-neutral-quiet);
      background-color: var(--card-background-color);
      border-radius: var(--ha-border-radius-md);
      transition: border-color var(--wa-transition-normal) ease-in-out;
    }
    :host([appearance="outlined"]) wa-input.no-label::part(base) {
      height: 32px;
      padding: 0 var(--ha-space-2);
    }
    :host([type="search"][appearance="outlined"]) wa-input::part(base) {
      height: 40px;
    }
    :host([type="search"]) wa-input::part(label) {
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    :host([appearance="material"]) wa-input::part(base)::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: var(--ha-color-border-neutral-loud);
      transition:
        height var(--wa-transition-normal) ease-in-out,
        background-color var(--wa-transition-normal) ease-in-out;
    }
    :host([appearance="material"]:focus-within) wa-input::part(base)::after {
      height: 2px;
      background-color: var(--primary-color);
    }
    wa-input::part(input) {
      padding-top: var(--ha-space-3);
      padding-inline-start: 0;
    }
    wa-input.no-label::part(input) {
      padding-top: 0;
    }
    :host([type="search"]) wa-input::part(input) {
      padding-inline-start: var(--ha-space-1);
    }
    wa-input::part(input)::placeholder {
      color: var(--ha-color-neutral-60);
    }
    wa-input::part(base):hover {
      background-color: var(--ha-color-form-background-hover);
    }
    :host([appearance="outlined"]) wa-input::part(base):hover {
      border-color: var(--ha-color-border-neutral-normal);
    }
    :host([appearance="outlined"]:focus-within) wa-input::part(base) {
      border-color: var(--primary-color);
    }
    :host(:not([disabled])) wa-input.invalid::part(label) {
      color: var(--ha-color-fill-danger-loud-resting);
    }
    :host([appearance="material"]:not([disabled]))
      wa-input.invalid::part(base)::after {
      background-color: var(--ha-color-border-danger-normal);
    }
    :host([appearance="outlined"]:not([disabled]))
      wa-input.invalid::part(base) {
      border-color: var(--ha-color-border-danger-normal);
    }
    :host([disabled]) wa-input::part(base) {
      background-color: var(--ha-color-form-background-disabled);
    }
    :host([disabled]) wa-input::part(label) {
      opacity: 0.5;
    }
    wa-input::part(end) {
      color: var(--secondary-text-color);
    }
    ha-icon-button {
      display: flex;
      align-items: center;
      color: var(--ha-color-text-secondary);
    }
    :host([appearance="outlined"]) wa-input.no-label {
      --ha-icon-button-size: 24px;
      --mdc-icon-size: 18px;
    }
    wa-input::part(hint) {
      min-height: 0;
      margin-block-start: 0;
      margin-inline-start: var(--ha-space-3);
      font-size: var(--ha-font-size-s);
      display: flex;
      align-items: center;
    }
    wa-input.invalid::part(hint) {
      min-height: var(--ha-space-5);
    }
    .error {
      color: var(--ha-color-on-danger-quiet);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-input": HaInput;
  }
}
