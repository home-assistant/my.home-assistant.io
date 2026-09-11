/*
 * Adapted from Home Assistant frontend:
 * https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/ha-generic-picker.ts
 */
import "@home-assistant/webawesome/dist/components/popover/popover.js";
import type WaPopover from "@home-assistant/webawesome/dist/components/popover/popover.js";
import {
  css,
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HaBottomSheet } from "./ha-bottom-sheet";
import "./ha-bottom-sheet";
import type {
  HaPickerComboBox,
  PickerComboBoxItem,
} from "./ha-picker-combo-box";
import "./ha-picker-combo-box";
import type { HaPickerField } from "./ha-picker-field";
import "./ha-picker-field";

export type { PickerComboBoxItem } from "./ha-picker-combo-box";

@customElement("ha-generic-picker")
export class HaGenericPicker extends LitElement {
  @property({ attribute: false })
  public getItems: () => PickerComboBoxItem[] = () => [];
  @property() public value?: string;
  @property() public label?: string;
  @property({ attribute: "search-label" }) public searchLabel?: string;
  @property({ type: Boolean }) public required = false;
  @property({ type: Boolean }) public disabled = false;
  @property({ attribute: false })
  public valueRenderer?: (value: string) => TemplateResult;

  @query("ha-picker-field") private _field?: HaPickerField;
  @query("ha-picker-combo-box") private _comboBox?: HaPickerComboBox;
  @query("wa-popover") private _popover?: WaPopover;
  @query("ha-bottom-sheet") private _sheet?: HaBottomSheet;

  @state() private _overlay?: "popover" | "sheet";
  @state() private _open = false;
  @state() private _minHeight = 0;

  private _closing = false;
  private _pendingValue?: string;
  private _width = 250;

  public focus(options?: FocusOptions): void {
    this._field?.focus(options);
  }

  public async open(): Promise<void> {
    if (this.disabled || this._overlay) {
      return;
    }

    this._width = this._field?.offsetWidth || 250;
    this._overlay = window.matchMedia("(max-width: 870px), (max-height: 500px)")
      .matches
      ? "sheet"
      : "popover";
    this._closing = false;
    this._pendingValue = undefined;
    this._minHeight = 0;
    // The drawer only emits after-show when open changes after its first update.
    await this.updateComplete;
    await (this._sheet ?? this._popover)?.updateComplete;

    if (!this.isConnected || this.disabled || !this._overlay) {
      this._overlay = undefined;

      return;
    }

    // The initial `for` watcher clears an anchor assigned before first update.
    if (this._popover) {
      this._popover.anchor = this._field?.button ?? this._field ?? null;
    }

    this._open = true;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._overlay = undefined;
    this._open = false;
    this._closing = false;
    this._pendingValue = undefined;
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("disabled") && this.disabled && this._open) {
      this._pendingValue = undefined;
      this._closing = true;
      this._open = false;
    }
  }

  protected render() {
    const comboBox = this._overlay
      ? html`<ha-picker-combo-box
          .getItems=${this.getItems}
          .value=${this.value}
          .label=${this.searchLabel || "Search"}
          .disabled=${this.disabled}
          .mode=${this._overlay === "sheet" ? "dialog" : "popover"}
          @item-selected=${this._itemSelected}
        ></ha-picker-combo-box>`
      : nothing;

    return html`
      <ha-picker-field
        .value=${this.value}
        .valueLabel=${
          this.value
            ? this.getItems().find((item) => item.id === this.value)?.primary
            : undefined
        }
        .label=${this.label}
        .required=${this.required}
        .disabled=${this.disabled}
        .expanded=${!!this._overlay}
        .valueRenderer=${this.valueRenderer}
        @click=${this.open}
      ></ha-picker-field>
      ${
        this._overlay === "sheet"
          ? html`<ha-bottom-sheet
              .open=${this._open}
              .label=${this.label || "Select option"}
              @after-show=${this._shown}
              @closing=${this._hiding}
              @closed=${this._closed}
            >
              ${comboBox}
            </ha-bottom-sheet>`
          : this._overlay === "popover"
            ? html`<wa-popover
                .open=${this._open}
                placement="bottom"
                without-arrow
                distance="0"
                auto-size="vertical"
                auto-size-padding="16"
                trap-focus
                style=${styleMap({
                  "--picker-width": `${this._width}px`,
                  "--picker-min-height": `${this._minHeight}px`,
                })}
                @wa-show=${this._popoverShow}
                @wa-after-show=${this._shown}
                @wa-hide=${this._hiding}
                @wa-after-hide=${this._closed}
                @click=${this._popoverClick}
              >
                ${comboBox}
              </wa-popover>`
            : nothing
      }
    `;
  }

  private _popoverShow(ev: Event) {
    ev.stopPropagation();
    // This fork has no aria-label property for its native dialog.
    this._popover?.dialog.setAttribute(
      "aria-label",
      this.label || "Select option",
    );
  }

  private async _shown(ev: Event) {
    ev.stopPropagation();
    await this._comboBox?.updateComplete;

    if (this.isConnected && this._open && !this._closing) {
      this._minHeight = this._popover?.body.offsetHeight ?? 0;
      this._comboBox?.focus();
    }
  }

  private _hiding(ev: Event) {
    ev.stopPropagation();
    // External dismissal owns the package's open state until after-hide.
    this._closing = true;
  }

  private _popoverClick(ev: MouseEvent) {
    if (ev.composedPath()[0] === this._popover?.dialog && !this._closing) {
      this._closing = true;
      this._open = false;
    }
  }

  private _itemSelected(ev: CustomEvent<{ value: string }>) {
    ev.stopPropagation();

    if (!this._open || this._closing || this.disabled) {
      return;
    }

    this._pendingValue = ev.detail.value;
    this._closing = true;
    this._open = false;
  }

  private async _closed(ev: Event) {
    ev.stopPropagation();

    if (!this._overlay) {
      return;
    }

    const value = this._pendingValue;
    this._pendingValue = undefined;
    this._overlay = undefined;
    this._open = false;
    this._closing = false;

    if (value !== undefined) {
      this.value = value;
    }

    await this.updateComplete;
    await this._field?.updateComplete;

    if (!this.isConnected) {
      return;
    }

    this.focus();

    if (value !== undefined) {
      this.dispatchEvent(
        new CustomEvent<{ value: string }>("value-changed", {
          detail: { value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  static styles = css`
    :host {
      display: block;
      max-width: 100%;
    }
    wa-popover {
      --wa-space-l: 0;
      --wa-panel-border-radius: var(--ha-border-radius-md, 8px);
    }
    wa-popover::part(dialog)::backdrop {
      background: transparent;
    }
    wa-popover::part(body) {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: max(var(--picker-width), 250px);
      max-width: calc(100vw - 32px);
      max-height: min(70vh, 500px);
      min-height: var(--picker-min-height, 0);
      padding: 0;
      overflow: hidden;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border: 1px solid var(--ha-color-border-neutral-quiet, #e6e6e6);
      border-radius: var(--ha-border-radius-md, 8px);
      box-shadow: var(--ha-box-shadow-m, 0 5px 15px #0003);
    }
    @media (max-height: 1000px) {
      wa-popover::part(body) {
        max-height: min(70vh, 400px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      wa-popover {
        --show-duration: 1ms;
        --hide-duration: 1ms;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-generic-picker": HaGenericPicker;
  }
}
