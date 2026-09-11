// Adapted from frontend: https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/components/ha-picker-combo-box.ts
import Fuse from "fuse.js";
import { mdiMagnify, mdiMinusBoxOutline } from "@mdi/js";
import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { multiTermSortedSearch } from "../util/fuse-multi-term";
import { HaComboBoxItem } from "./ha-combo-box-item";
import type { HaInput } from "./input/ha-input";
import "./input/ha-input";
import "./ha-svg-icon";

export interface PickerComboBoxItem {
  id: string;
  primary: string;
  secondary?: string;
  disabled?: boolean;
}

const DEFAULT_SEARCH_KEYS = [
  { name: "primary", weight: 10 },
  { name: "secondary", weight: 7 },
  { name: "id", weight: 3 },
];

@customElement("ha-picker-combo-box")
export class HaPickerComboBox extends LitElement {
  @property({ attribute: false })
  public getItems: () => PickerComboBoxItem[] = () => [];
  @property() public value?: string;
  @property() public label = "Search";
  @property({ type: Boolean }) public disabled = false;
  @property({ reflect: true }) public mode: "popover" | "dialog" = "popover";

  @state() private _items: PickerComboBoxItem[] = [];
  @query("ha-input") private _searchField?: HaInput;
  @query(".results") private _results?: HTMLDivElement;

  private _allItems: PickerComboBoxItem[] = [];
  private _fuseIndex = Fuse.createIndex<PickerComboBoxItem>(
    DEFAULT_SEARCH_KEYS,
    [],
  );
  private _search = "";

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeyDown);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeyDown);
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("getItems")) {
      this.refreshItems();
    }
  }

  public refreshItems(): void {
    this._allItems = [...this.getItems()];
    this._fuseIndex = Fuse.createIndex(DEFAULT_SEARCH_KEYS, this._allItems);
    this._items = multiTermSortedSearch(
      this._allItems,
      this._search,
      (item) => item.id,
      this._fuseIndex,
    );
  }

  public focus(options?: FocusOptions): void {
    this._searchField?.focus(options);
  }

  protected render() {
    return html`
      <ha-input
        type="search"
        appearance="outlined"
        .label=${this.label}
        .placeholder=${this.label}
        .disabled=${this.disabled}
        .value=${this._search}
        .withClear=${true}
        autocomplete="off"
        @input=${this._filterChanged}
        @change=${this._stopEvent}
      ></ha-input>
      <div class="results" role="group" aria-label="Search results">
        ${
          this._items.length
            ? repeat(
                this._items,
                (item) => item.id,
                (item) => html`
                  <ha-combo-box-item
                    type="button"
                    compact
                    .disabled=${this.disabled || !!item.disabled}
                    .selected=${this.value === item.id}
                    @click=${(ev: MouseEvent) => {
                      ev.stopPropagation();
                      this._select(item);
                    }}
                  >
                    <span slot="headline">${item.primary}</span>
                    ${
                      item.secondary
                        ? html`<span slot="supporting-text"
                            >${item.secondary}</span
                          >`
                        : nothing
                    }
                  </ha-combo-box-item>
                `,
              )
            : html`<ha-combo-box-item type="text" compact>
                <ha-svg-icon
                  slot="start"
                  .path=${this._search.trim() ? mdiMagnify : mdiMinusBoxOutline}
                ></ha-svg-icon>
                <span slot="headline"
                  >${
                    this._search.trim()
                      ? "No matching items found"
                      : "No items available"
                  }</span
                >
              </ha-combo-box-item>`
        }
      </div>
      <span
        class="assistive"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        >${
          this._items.length === 1
            ? "1 result"
            : `${this._items.length} results`
        }</span
      >
    `;
  }

  private _stopEvent(ev: Event) {
    ev.stopPropagation();
  }

  private _filterChanged(ev: Event) {
    ev.stopPropagation();
    this._search = this._searchField?.value ?? "";
    this._items = multiTermSortedSearch(
      this._allItems,
      this._search,
      (item) => item.id,
      this._fuseIndex,
    );
    this._results?.scrollTo({ top: 0 });
  }

  private _select(item: PickerComboBoxItem) {
    if (this.disabled || item.disabled) {
      return;
    }

    // Only the generic picker publishes a value after its overlay has closed.
    this.dispatchEvent(
      new CustomEvent<{ value: string }>("item-selected", {
        detail: { value: item.id },
      }),
    );
  }

  private _handleKeyDown = (ev: KeyboardEvent) => {
    if (
      this.disabled ||
      ev.isComposing ||
      ev.altKey ||
      ev.ctrlKey ||
      ev.metaKey ||
      ev.shiftKey
    ) {
      return;
    }

    const row = ev
      .composedPath()
      .find((node) => node instanceof HaComboBoxItem);

    if (
      !row &&
      !ev.composedPath().some((node) => node instanceof HTMLInputElement)
    ) {
      return;
    }

    const rows = Array.from(
      this._results?.querySelectorAll("ha-combo-box-item") ?? [],
    ).filter((item) => item.type === "button" && !item.disabled);

    // Home and End retain native caret behaviour in the search field.
    if ((ev.key === "Home" || ev.key === "End") && !row) {
      return;
    }

    if (ev.key === "Enter") {
      if (!row) {
        ev.preventDefault();
        ev.stopPropagation();
        const item = this._items.find((item) => !item.disabled);

        if (item) {
          this._select(item);
        }
      }

      // Native result buttons handle Enter and Space themselves.
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(ev.key)) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    if (!rows.length) {
      return;
    }

    const index = row ? rows.indexOf(row) : -1;
    let nextIndex: number;

    switch (ev.key) {
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = rows.length - 1;
        break;
      case "ArrowUp":
        if (index === 0) {
          this.focus();

          return;
        }

        nextIndex = index < 0 ? rows.length - 1 : index - 1;
        break;
      default:
        nextIndex = Math.min(index + 1, rows.length - 1);
    }

    rows[nextIndex].focus({ preventScroll: true });
    rows[nextIndex].scrollIntoView({ block: "nearest" });
  };

  static styles = css`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding-top: var(--ha-space-4, 16px);
      color: var(--primary-text-color, #212121);
    }
    ha-input {
      flex-shrink: 0;
      margin: 0 var(--ha-space-3, 12px) var(--ha-space-3, 12px);
    }
    :host([mode="dialog"]) ha-input {
      margin-inline: var(--ha-space-4);
    }
    .results {
      overflow: auto;
      overscroll-behavior: contain;
      min-height: 0;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--scrollbar-thumb-color, #888) transparent;
      padding-bottom: var(--ha-space-2, 8px);
    }
    .assistive {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-picker-combo-box": HaPickerComboBox;
  }
}
