import { mdiDelete, mdiDragHorizontalVariant } from "@mdi/js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { DEFAULT_HASS_URL } from "../const";
import { setInstanceUrls } from "../data/instance_info";
import { parseInstanceUrl } from "../data/instance_urls";
import { fireEvent } from "../util/fire_event";
import "./ha-button";
import "./ha-icon-button";
import "./ha-sortable";
import "./ha-svg-icon";
import "./input/ha-input";
import type { HaInput } from "./input/ha-input";

interface UrlRow {
  id: number;
  value: string;
}

@customElement("my-url-input")
export class MyUrlInputMain extends LitElement {
  @property({ attribute: false }) public value: string[] = [];

  @state() private _rows: UrlRow[] = [];

  @state() private _error?: string;

  @queryAll("ha-input") private _inputs!: NodeListOf<HaInput>;

  @queryAll(".handle") private _handles!: NodeListOf<HTMLElement>;

  private _nextId = 0;

  public focus(): void {
    this.updateComplete.then(() => this._inputs[0]?.focus());
  }

  protected willUpdate(changedProps: PropertyValues<this>): void {
    if (changedProps.has("value")) {
      this._rows = (this.value.length ? this.value : [DEFAULT_HASS_URL]).map(
        (value) => this._createRow(value),
      );
    }
  }

  protected render() {
    // A single URL keeps the layout from before multiple instances existed,
    // with the save button next to the input.
    const single = this._rows.length === 1;
    const saveButton = html`
      <ha-button appearance="accent" @click=${this._handleSave}
        >${this.value.length ? "Update" : "Save"}</ha-button
      >
    `;
    return html`
      ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
      <ha-sortable
        handle-selector=".handle"
        .disabled=${single}
        @item-moved=${this._rowMoved}
      >
        <div class="rows">
          ${repeat(
            this._rows,
            (row) => row.id,
            (row) => html`
              <div class=${single ? "row single" : "row"}>
                ${
                  single
                    ? nothing
                    : html`<div
                        class="handle"
                        role="button"
                        tabindex="0"
                        aria-label="Reorder instance"
                        aria-keyshortcuts="ArrowUp ArrowDown"
                        title="Drag or use the arrow keys to reorder"
                        @keydown=${(ev: KeyboardEvent) =>
                          this._handleHandleKeyDown(ev, row)}
                      >
                        <ha-svg-icon
                          .path=${mdiDragHorizontalVariant}
                        ></ha-svg-icon>
                      </div>`
                }
                <ha-input
                  label="Home Assistant URL"
                  type="url"
                  .value=${row.value}
                  @input=${(ev: Event) => this._handleInput(ev, row)}
                  @keydown=${this._handleInputKeyDown}
                ></ha-input>
                ${
                  single
                    ? saveButton
                    : html`<ha-icon-button
                        class="remove"
                        label="Remove instance"
                        .path=${mdiDelete}
                        @click=${() => this._removeRow(row)}
                      ></ha-icon-button>`
                }
              </div>
            `,
          )}
        </div>
      </ha-sortable>
      <button type="button" class="link" @click=${this._addRow}>
        + Add another instance
      </button>
      ${single ? nothing : html`<div class="actions">${saveButton}</div>`}
      <p class="note">
        Note: ${single ? "This URL is" : "These URLs are"} only stored in your
        browser.
      </p>
    `;
  }

  private _createRow(value: string): UrlRow {
    return { id: this._nextId++, value };
  }

  private _handleInput(ev: Event, row: UrlRow) {
    const input = ev.currentTarget as HaInput;
    row.value = input.value || "";
    input.setCustomValidity("");
  }

  private _handleInputKeyDown(ev: KeyboardEvent) {
    if (ev.key === "Enter") {
      this._handleSave();
    }
  }

  private _moveRow(oldIndex: number, newIndex: number) {
    const rows = [...this._rows];
    rows.splice(newIndex, 0, rows.splice(oldIndex, 1)[0]);
    this._rows = rows;
  }

  private _rowMoved(ev: CustomEvent<{ oldIndex: number; newIndex: number }>) {
    ev.stopPropagation();
    this._moveRow(ev.detail.oldIndex, ev.detail.newIndex);
  }

  // Dragging needs a pointer, the arrow keys do the same from the keyboard.
  private async _handleHandleKeyDown(ev: KeyboardEvent, row: UrlRow) {
    if (ev.key !== "ArrowUp" && ev.key !== "ArrowDown") {
      return;
    }
    ev.preventDefault();
    const oldIndex = this._rows.indexOf(row);
    const newIndex = oldIndex + (ev.key === "ArrowUp" ? -1 : 1);
    if (newIndex < 0 || newIndex >= this._rows.length) {
      return;
    }
    this._moveRow(oldIndex, newIndex);
    // Moving the row in the DOM can drop the focus.
    await this.updateComplete;
    this._handles[newIndex].focus();
  }

  private async _addRow() {
    this._rows = [...this._rows, this._createRow("")];
    await this.updateComplete;
    this._inputs[this._inputs.length - 1].focus();
  }

  private async _removeRow(row: UrlRow) {
    const index = this._rows.indexOf(row);
    this._rows = this._rows.filter((entry) => entry !== row);
    // Keep the focus in the list instead of losing it with the button.
    await this.updateComplete;
    this._inputs[Math.max(index - 1, 0)].focus();
  }

  private _handleSave() {
    this._error = undefined;
    const inputs = Array.from(this._inputs);
    const urls: string[] = [];
    let valid = true;

    // The inputs are rendered in the order of the rows.
    this._rows.forEach((row, index) => {
      const input = inputs[index];
      input.setCustomValidity("");
      // Empty rows are left out.
      const value = (input.value ?? row.value).trim();
      if (value === "") {
        return;
      }
      const result = parseInstanceUrl(value);
      if ("url" in result && !urls.includes(result.url)) {
        urls.push(result.url);
        return;
      }
      input.setCustomValidity(
        "error" in result
          ? result.error
          : "This instance is already in the list.",
      );
      input.reportValidity();
      valid = false;
    });

    if (!valid) {
      return;
    }
    if (!urls.length) {
      urls.push(DEFAULT_HASS_URL);
    }

    try {
      setInstanceUrls(urls);
    } catch (err) {
      this._error = "Failed to store your URL!";
      return;
    }
    fireEvent(this, "value-changed", { value: urls });
  }

  static styles = css`
    :host {
      display: block;
    }
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ha-space-2);
    }
    .row.single {
      align-items: center;
    }
    .row + .row {
      margin-top: var(--ha-space-2);
    }
    ha-input {
      flex-grow: 1;
    }
    .handle {
      display: flex;
      align-self: flex-start;
      margin-top: var(--ha-space-4);
      color: var(--secondary-text-color);
      cursor: move; /* fallback if grab cursor is unsupported */
      cursor: grab;
    }
    .handle > * {
      pointer-events: none;
    }
    .handle:focus-visible {
      outline: var(--wa-focus-ring);
      outline-offset: var(--wa-focus-ring-offset);
      border-radius: var(--ha-border-radius-sm);
    }
    .remove {
      color: var(--ha-color-on-danger-quiet);
      margin-top: var(--ha-space-1);
    }
    .link {
      display: inline-block;
      margin-top: var(--ha-space-1);
      padding: 0;
      border: none;
      background: none;
      color: var(--link-text-color, var(--primary-color));
      font: inherit;
      text-align: start;
      text-decoration: underline;
      cursor: pointer;
    }
    .link:focus-visible {
      outline: var(--wa-focus-ring);
      outline-offset: var(--wa-focus-ring-offset);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--ha-space-4);
    }
    .note {
      margin: var(--ha-space-4) 0 0;
    }
    .error {
      color: var(--error-color);
      font-weight: bold;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-url-input": MyUrlInputMain;
  }
}
