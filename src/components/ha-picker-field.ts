// Adapted from home-assistant/frontend src/components/ha-picker-field.ts.
// Source revision: 3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af.
import { mdiMenuDown } from "@mdi/js";
import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { HaComboBoxItem } from "./ha-combo-box-item";
import "./ha-combo-box-item";
import "./ha-svg-icon";

@customElement("ha-picker-field")
export class HaPickerField extends LitElement {
  @property() public value?: string;
  @property() public valueLabel?: string;
  @property() public label?: string;
  @property({ type: Boolean }) public required = false;
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: Boolean, reflect: true }) public expanded = false;
  @property({ attribute: false })
  public valueRenderer?: (value: string) => TemplateResult;

  @query("ha-combo-box-item") private _item?: HaComboBoxItem;

  public get button(): HTMLButtonElement | undefined {
    return this._item?.button;
  }

  public focus(options?: FocusOptions): void {
    this._item?.focus(options);
  }

  protected render() {
    return html`
      <ha-combo-box-item
        type="button"
        compact
        .dialog=${true}
        .expanded=${this.expanded}
        .required=${this.required}
        .disabled=${this.disabled}
      >
        ${
          this.value && this.label
            ? html`<span slot="overline"
                >${this.label}${
                  this.required
                    ? html`<span aria-hidden="true"> *</span>`
                    : nothing
                }</span
              >`
            : nothing
        }
        <span slot="headline">
          ${
            this.value
              ? (this.valueRenderer?.(this.value) ??
                this.valueLabel ??
                this.value)
              : html`${this.label || "Select option"}${
                  this.required
                    ? html`<span aria-hidden="true"> *</span>`
                    : nothing
                }`
          }
        </span>
        <ha-svg-icon
          slot="end"
          .path=${mdiMenuDown}
          aria-hidden="true"
        ></ha-svg-icon>
      </ha-combo-box-item>
    `;
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--ha-font-family-body);
      font-size: var(--ha-font-size-m);
      line-height: normal;
    }
    ha-combo-box-item {
      --ha-combo-box-item-height: 56px;
      --ha-combo-box-item-padding-inline-end: var(--ha-space-2);
      position: relative;
      border-radius: var(--ha-border-radius-sm, 4px)
        var(--ha-border-radius-sm, 4px) 0 0;
      background: var(--ha-color-form-background, #f5f5f5);
    }
    ha-combo-box-item::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 1px;
      background: var(--ha-color-border-neutral-loud, #727272);
      pointer-events: none;
    }
    ha-combo-box-item:focus-within::after,
    :host([expanded]) ha-combo-box-item::after {
      height: 2px;
      background: var(--primary-color, #009ac7);
    }
    :host([disabled]) ha-combo-box-item {
      background: var(--ha-color-form-background-disabled, #f5f5f5);
    }
    ha-svg-icon {
      width: 32px;
      height: 20px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-picker-field": HaPickerField;
  }
}
