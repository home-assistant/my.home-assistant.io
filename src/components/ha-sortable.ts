// Adapted from frontend: https://github.com/home-assistant/frontend/blob/fdd66b5cecd7c15b772deb709bc51fe89b3910bf/src/components/ha-sortable.ts
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import Sortable, { type SortableEvent } from "sortablejs";
import { fireEvent } from "../util/fire_event";

@customElement("ha-sortable")
export class HaSortable extends LitElement {
  private _sortable?: Sortable;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Boolean, attribute: "no-style" })
  public noStyle = false;

  @property({ type: String, attribute: "draggable-selector" })
  public draggableSelector?: string;

  @property({ type: String, attribute: "handle-selector" })
  public handleSelector?: string;

  @property({ type: Boolean })
  public rollback = true;

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("disabled")) {
      if (this.disabled) {
        this._destroySortable();
      } else {
        this._createSortable();
      }
    }
  }

  // Workaround for connectedCallback just after disconnectedCallback (when dragging sortable with sortable children)
  private _shouldBeDestroy = false;

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._shouldBeDestroy = true;
    setTimeout(() => {
      if (this._shouldBeDestroy) {
        this._destroySortable();
        this._shouldBeDestroy = false;
      }
    }, 1);
  }

  public connectedCallback() {
    super.connectedCallback();
    this._shouldBeDestroy = false;
    if (this.hasUpdated && !this.disabled) {
      this._createSortable();
    }
  }

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    if (this.noStyle) return nothing;
    return html`
      <style>
        .sortable-fallback {
          display: none !important;
        }

        .sortable-ghost {
          box-shadow: 0 0 0 2px var(--primary-color);
          background: var(--ha-color-fill-primary-normal-resting);
          border-radius: var(--ha-border-radius-sm);
          opacity: 0.4;
        }

        .sortable-drag {
          border-radius: var(--ha-border-radius-sm);
          opacity: 1;
          background: var(--card-background-color);
          box-shadow: 0px 4px 8px 3px #00000026;
          cursor: grabbing;
        }
      </style>
    `;
  }

  private _createSortable() {
    if (this._sortable) return;
    const container = this.children[0] as HTMLElement | undefined;

    if (!container) return;

    const options: Sortable.Options = {
      scroll: true,
      // Force the autoscroll fallback because it works better than the native one
      forceAutoScrollFallback: true,
      scrollSpeed: 20,
      animation: 150,
      onChoose: this._handleChoose,
      onEnd: this._handleEnd,
      onUpdate: this._handleUpdate,
    };

    if (this.draggableSelector) {
      options.draggable = this.draggableSelector;
    }
    if (this.handleSelector) {
      options.handle = this.handleSelector;
    }

    this._sortable = new Sortable(container, options);
  }

  private _handleUpdate = (evt: SortableEvent) => {
    fireEvent(this, "item-moved", {
      newIndex: evt.newIndex!,
      oldIndex: evt.oldIndex!,
    });
  };

  private _handleEnd = (evt: SortableEvent) => {
    // put back in original location
    if (this.rollback && (evt.item as any).placeholder) {
      (evt.item as any).placeholder.replaceWith(evt.item);
      delete (evt.item as any).placeholder;
    }
  };

  private _handleChoose = (evt: SortableEvent) => {
    if (!this.rollback) return;
    (evt.item as any).placeholder = document.createComment("sort-placeholder");
    evt.item.after((evt.item as any).placeholder);
  };

  private _destroySortable() {
    if (!this._sortable) return;
    this._sortable.destroy();
    this._sortable = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-sortable": HaSortable;
  }
}
