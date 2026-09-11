/*
 * Adapted from Home Assistant frontend:
 * https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/ha-button.ts
 */
import Button from "@home-assistant/webawesome/dist/components/button/button.js";
import { css, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

export type Appearance = "accent" | "filled" | "outlined" | "plain";

@customElement("ha-button")
export class HaButton extends Button {
  variant: "brand" | "neutral" | "success" | "warning" | "danger" = "brand";

  static get styles(): CSSResultGroup {
    return [
      Button.styles,
      css`
        :host {
          --wa-form-control-padding-inline: var(--ha-space-4);
          --wa-font-weight-action: var(--ha-font-weight-medium);
          --wa-form-control-border-radius: var(
            --ha-button-border-radius,
            var(--ha-border-radius-pill)
          );
          --wa-form-control-height: var(
            --ha-button-height,
            var(--button-height, 40px)
          );
        }
        .button {
          font-size: var(--ha-font-size-m);
          line-height: 1;
          -webkit-tap-highlight-color: transparent;
          transition: background-color var(--ha-animation-duration-fast)
            ease-out;
          text-wrap: wrap;
          box-shadow: var(--ha-button-box-shadow, none);
        }
        :host([appearance~="accent"]) .button {
          background-color: var(--wa-color-fill-loud);
          color: var(--wa-color-on-loud);
        }
        :host([appearance~="filled"]) .button {
          background-color: var(--wa-color-fill-normal);
          color: var(--wa-color-on-normal);
          border-color: transparent;
        }
        :host([appearance~="plain"]) .button {
          color: var(--wa-color-on-normal);
          background-color: transparent;
        }
        @media (hover: hover) {
          :host([variant="brand"][appearance~="accent"])
            .button:not(.disabled):not(.loading):hover {
            background-color: var(--ha-color-fill-primary-loud-hover);
          }
        }
        :host([variant="brand"][appearance~="accent"])
          .button:not(.disabled):not(.loading):active {
          background-color: var(--ha-color-fill-primary-loud-active);
        }
        .button.disabled {
          opacity: 1;
        }
        :host([appearance~="accent"]) .button.disabled {
          background-color: var(--ha-color-fill-disabled-loud-resting);
          color: var(--ha-color-on-disabled-loud);
        }
        :host([appearance~="filled"]) .button.disabled {
          background-color: var(--ha-color-fill-disabled-normal-resting);
          color: var(--ha-color-on-disabled-normal);
        }
        :host([appearance~="outlined"]) .button.disabled,
        :host([appearance~="plain"]) .button.disabled {
          background-color: transparent;
          color: var(--ha-color-on-disabled-quiet);
        }
        :host([appearance~="outlined"]) .button.disabled {
          border-color: var(--ha-color-on-disabled-quiet);
        }
        :host([loading]) {
          pointer-events: none;
        }
        slot[name="start"]::slotted(*) {
          margin-inline-end: var(--ha-space-1);
        }
        slot[name="end"]::slotted(*) {
          margin-inline-start: var(--ha-space-1);
        }
        .button.has-start {
          padding-inline-start: var(--ha-space-2);
        }
        .button.has-end {
          padding-inline-end: var(--ha-space-2);
        }
        .label {
          overflow: var(--ha-button-label-overflow, hidden);
          text-overflow: ellipsis;
          padding: var(--ha-space-1) 0;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-button": HaButton;
  }
}
