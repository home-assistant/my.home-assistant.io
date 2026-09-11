/*
 * Adapted from Home Assistant frontend:
 * https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/ha-bottom-sheet.ts
 */
import "@home-assistant/webawesome/dist/components/drawer/drawer.js";
import type WaDrawer from "@home-assistant/webawesome/dist/components/drawer/drawer.js";
import { css, html, LitElement } from "lit";
import {
  customElement,
  eventOptions,
  property,
  query,
} from "lit/decorators.js";
import { fireEvent } from "../util/fire_event";
import { SwipeGestureRecognizer } from "../util/swipe-gesture-recognizer";

const ANIMATION_DURATION = 300;

@customElement("ha-bottom-sheet")
export class HaBottomSheet extends LitElement {
  @property({ type: Boolean }) public open = false;
  @property() public label = "Select option";

  @query("wa-drawer") private _drawer?: WaDrawer;

  private _gesture = new SwipeGestureRecognizer();
  private _touchId?: number;
  private _startX = 0;
  private _dragging = false;
  private _closing = false;
  private _snapTimer?: ReturnType<typeof setTimeout>;

  protected async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this._drawer?.updateComplete;

    return result;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupGesture();
  }

  protected render() {
    return html`
      <wa-drawer
        placement="bottom"
        without-header
        .open=${this.open}
        .label=${this.label}
        .lightDismiss=${true}
        @wa-after-show=${this._afterShow}
        @wa-hide=${this._hide}
        @wa-after-hide=${this._afterHide}
        @touchstart=${this._touchStart}
      >
        <div class="handle" aria-hidden="true"></div>
        <slot></slot>
      </wa-drawer>
    `;
  }

  private _afterShow(ev: Event) {
    if (ev.target !== this._drawer) {
      return;
    }

    ev.stopPropagation();
    this._drawer?.drawer.setAttribute("aria-label", this.label);

    if (!this._closing) {
      fireEvent(this, "after-show");
    }
  }

  private _hide(ev: Event) {
    if (ev.target !== this._drawer) {
      return;
    }

    ev.stopPropagation();
    this._closing = true;
    this._cleanupGesture();
    fireEvent(this, "closing");
  }

  private _afterHide(ev: Event) {
    if (ev.target !== this._drawer) {
      return;
    }

    ev.stopPropagation();
    this.open = false;
    this._closing = false;
    fireEvent(this, "closed");
  }

  @eventOptions({ passive: true })
  private _touchStart(ev: TouchEvent) {
    if (!this.open || this._closing || ev.touches.length !== 1) {
      this._cleanupGesture();

      return;
    }

    for (const target of ev.composedPath()) {
      if (target === this._drawer) {
        break;
      }

      if (
        target instanceof HTMLElement &&
        (target.scrollTop > 0 ||
          target.localName === "ha-input" ||
          target instanceof HTMLInputElement)
      ) {
        return;
      }
    }

    ev.stopPropagation();
    this._cleanupGesture();
    this._touchId = ev.touches[0].identifier;
    this._startX = ev.touches[0].clientX;
    this._gesture.start(ev.touches[0].clientY);
    document.addEventListener("touchmove", this._touchMove, { passive: false });
    document.addEventListener("touchend", this._touchEnd);
    document.addEventListener("touchcancel", this._touchCancel);
  }

  private _touchMove = (ev: TouchEvent) => {
    if (ev.touches.length !== 1 || ev.touches[0].identifier !== this._touchId) {
      this._cleanupGesture();

      return;
    }

    const delta = this._gesture.move(ev.touches[0].clientY);

    if (!this._dragging) {
      if (delta > 0 || Math.abs(ev.touches[0].clientX - this._startX) > 8) {
        this._cleanupGesture();

        return;
      }

      if (delta > -8) {
        return;
      }
    }

    ev.preventDefault();
    this._dragging = true;
    this.style.setProperty(
      "--sheet-transform",
      `translateY(${Math.max(0, -delta)}px)`,
    );
  };

  private _touchEnd = () => {
    const result = this._gesture.end();
    const height = this._drawer?.drawer.offsetHeight ?? 0;

    const close =
      this._dragging &&
      (result.isSwipe
        ? result.isDownwardSwipe
        : height > 0 && -result.delta > height * 0.5);

    this._cleanupGesture();

    if (close) {
      this.open = false;
    } else {
      this._snapBack();
    }
  };

  private _touchCancel = () => {
    this._cleanupGesture();
    this._snapBack();
  };

  private _snapBack() {
    this.style.setProperty(
      "--sheet-transition",
      `transform ${ANIMATION_DURATION}ms ease-out`,
    );
    this._snapTimer = setTimeout(() => {
      this.style.removeProperty("--sheet-transition");
      this._snapTimer = undefined;
    }, ANIMATION_DURATION);
  }

  private _cleanupGesture() {
    document.removeEventListener("touchmove", this._touchMove);
    document.removeEventListener("touchend", this._touchEnd);
    document.removeEventListener("touchcancel", this._touchCancel);
    clearTimeout(this._snapTimer);
    this._snapTimer = undefined;
    this._touchId = undefined;
    this._dragging = false;
    this.style.removeProperty("--sheet-transform");
    this.style.removeProperty("--sheet-transition");
  }

  static styles = css`
    wa-drawer {
      --size: var(--ha-bottom-sheet-height, calc(100dvh - 48px));
      --show-duration: ${ANIMATION_DURATION}ms;
      --hide-duration: ${ANIMATION_DURATION}ms;
      color: var(--primary-text-color, #212121);
    }
    wa-drawer::part(dialog) {
      max-width: var(--ha-bottom-sheet-max-width, 600px);
      max-height: calc(100dvh - max(env(safe-area-inset-top, 0px), 48px));
      margin-inline: auto;
      inset-inline: 0;
      overflow: hidden;
      background: var(--card-background-color, #fff);
      border-radius: var(--ha-border-radius-2xl, 28px)
        var(--ha-border-radius-2xl, 28px) 0 0;
      transform: var(--sheet-transform, none);
      transition: var(--sheet-transition, none);
    }
    wa-drawer::part(dialog)::backdrop {
      background: none;
      backdrop-filter: var(--ha-dialog-scrim-backdrop-filter);
    }
    wa-drawer::part(body) {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      border-radius: var(--ha-border-radius-2xl) var(--ha-border-radius-2xl) 0 0;
      padding: 0 env(safe-area-inset-right, 0px)
        env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    }
    .handle {
      position: absolute;
      top: 6px;
      left: calc(50% - 20px);
      width: 40px;
      height: 4px;
      border-radius: var(--ha-border-radius-md, 8px);
      background: var(--divider-color, #ccc);
      pointer-events: none;
    }
    ::slotted(ha-picker-combo-box) {
      flex: 1;
      min-height: 0;
    }
    @media (prefers-reduced-motion: reduce) {
      wa-drawer {
        --show-duration: 1ms;
        --hide-duration: 1ms;
      }
      wa-drawer::part(dialog) {
        transition: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-bottom-sheet": HaBottomSheet;
  }
}
