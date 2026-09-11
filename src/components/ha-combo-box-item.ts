// Adapted from home-assistant/frontend src/components/ha-combo-box-item.ts.
// Source revision: 3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af.
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ha-combo-box-item")
export class HaComboBoxItem extends LitElement {
  @property() public type: "button" | "text" = "text";
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: Boolean, reflect: true }) public selected = false;
  @property({ type: Boolean, reflect: true }) public compact = false;
  @property({ type: Boolean, reflect: true }) public multiline = false;
  @property({ type: Boolean }) public dialog = false;
  @property({ type: Boolean }) public expanded = false;
  @property({ type: Boolean }) public required = false;

  @query("button") public button?: HTMLButtonElement;

  public focus(options?: FocusOptions): void {
    this.button?.focus(options);
  }

  protected render() {
    const content = html`
      <slot name="start"></slot>
      <span class="text">
        <slot name="overline"></slot>
        <slot name="headline"></slot>
        <slot name="supporting-text"></slot>
      </span>
      <slot name="end"></slot>
    `;

    return this.type === "button"
      ? html`<button
            type="button"
            ?disabled=${this.disabled}
            aria-current=${ifDefined(this.selected ? "true" : undefined)}
            aria-haspopup=${ifDefined(this.dialog ? "dialog" : undefined)}
            aria-expanded=${ifDefined(
              this.dialog ? String(this.expanded) : undefined,
            )}
            aria-describedby=${ifDefined(this.required ? "required" : undefined)}
          >
            ${content}
          </button>
          ${
            this.required
              ? html`<span id="required" hidden>Required</span>`
              : nothing
          }`
      : html`<div class="row">${content}</div>`;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color, #212121);
    }
    button,
    .row {
      display: flex;
      align-items: center;
      gap: var(--ha-space-3, 12px);
      box-sizing: border-box;
      width: 100%;
      min-height: var(--ha-combo-box-item-height, 48px);
      padding: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
      padding-inline-end: var(
        --ha-combo-box-item-padding-inline-end,
        var(--ha-space-4)
      );
      border: 0;
      border-radius: inherit;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
    }
    button {
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: var(--ha-color-fill-neutral-quiet-hover, #0000000a);
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color, #009ac7);
      outline-offset: -2px;
      background: var(--ha-color-fill-neutral-quiet-hover, #0000000a);
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    :host([selected]) {
      background: var(--ha-color-fill-primary-quiet-resting, #009ac71f);
    }
    :host([compact]) button,
    :host([compact]) .row {
      gap: var(--ha-space-2, 8px);
    }
    .text {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
    }
    ::slotted([slot="headline"]),
    ::slotted([slot="supporting-text"]),
    ::slotted([slot="overline"]) {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: var(--ha-line-height-normal, 1.5);
    }
    ::slotted([slot="headline"]) {
      font-size: var(--ha-font-size-m, 16px);
    }
    ::slotted([slot="supporting-text"]) {
      color: var(--secondary-text-color, #727272);
      font-size: var(--ha-font-size-s, 14px);
    }
    ::slotted([slot="overline"]) {
      color: rgba(0, 0, 0, 0.6);
      font-size: calc(var(--ha-font-size-m) * 0.75);
      line-height: calc(var(--ha-font-size-m) * 1.15);
    }
    :host([multiline]) ::slotted([slot="headline"]),
    :host([multiline]) ::slotted([slot="supporting-text"]) {
      white-space: normal;
    }
    ::slotted([slot="start"]),
    ::slotted([slot="end"]) {
      flex-shrink: 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-combo-box-item": HaComboBoxItem;
  }
}
