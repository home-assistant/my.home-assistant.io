/*
 * Adapted from Home Assistant frontend:
 * https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/ha-icon-button.ts
 */
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./ha-button";
import "./ha-svg-icon";

@customElement("ha-icon-button")
export class HaIconButton extends LitElement {
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property() public path?: string;
  @property() public label?: string;

  static shadowRootOptions: ShadowRootInit = {
    mode: "open",
    delegatesFocus: true,
  };

  protected render() {
    return html`
      <ha-button
        appearance="plain"
        variant="neutral"
        aria-label=${this.label ?? nothing}
        title=${this.label ?? nothing}
        .disabled=${this.disabled}
        .iconTag=${"ha-svg-icon"}
      >
        <ha-svg-icon .path=${this.path}></ha-svg-icon>
      </ha-button>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      outline: none;
      --ha-button-height: var(--ha-icon-button-size, 48px);
    }
    ha-button {
      position: relative;
      isolation: isolate;
      --wa-form-control-padding-inline: var(
        --ha-icon-button-padding-inline,
        var(--ha-space-2)
      );
      --wa-color-on-normal: currentColor;
      --wa-color-fill-quiet: transparent;
      --ha-button-label-overflow: visible;
    }
    ha-button::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0;
      pointer-events: none;
    }
    ha-button::part(base) {
      width: var(--wa-form-control-height);
      aspect-ratio: 1;
      outline-offset: -4px;
    }
    ha-button::part(label) {
      display: flex;
    }
    @media (hover: hover) {
      :host(:hover:not([disabled])) ha-button::after {
        opacity: 0.1;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-icon-button": HaIconButton;
  }
}
