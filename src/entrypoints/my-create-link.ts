import "../components/ha-button";
import "../components/input/ha-input";
import "../components/ha-generic-picker";
import type { HaInput } from "../components/input/ha-input";
import type { HaButton } from "../components/ha-button";
import type { PickerComboBoxItem } from "../components/ha-picker-combo-box";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import copy from "clipboard-copy";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createSearch, extractSearchParamsObject } from "../util/search-params";
import { ParamType, Redirect } from "../const";
import { toCanonical } from "../data/redirect";
import { findRedirect, visibleRedirects } from "../data/redirects";
import { validateParam } from "../util/validate";

const prettify = (key: string) =>
  capitalizeFirst(key.replace("_", " ").replace("url", "URL"));

const capitalizeFirst = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const passedInData = extractSearchParamsObject();
const requested = passedInData.redirect
  ? findRedirect(passedInData.redirect)
  : undefined;
// Select first one without params so we show the output
const initialRedirect = passedInData.redirect
  ? requested?.redirect
  : visibleRedirects.find((info) => info.params === undefined);
const unknownRedirect =
  passedInData.redirect && !initialRedirect ? passedInData.redirect : undefined;

const redirectItems: PickerComboBoxItem[] = visibleRedirects.map(
  (redirect) => ({
    id: redirect.redirect,
    primary: redirect.name,
  }),
);

const getRedirectItems = () => redirectItems;

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @state() _redirect?: Redirect = initialRedirect;
  @state() _paramsValues = {};

  protected createRenderRoot() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    return this;
  }

  protected render(): TemplateResult {
    const badgeHTML = this._redirect ? this._createHTML() : "";
    const badgeTemplate = unsafeHTML(badgeHTML);

    return html`
      <div class="card-content">
        ${
          unknownRedirect && !this._redirect
            ? html`<p class="error">
                Unknown redirect "${unknownRedirect}". Pick one below, or
                <a
                  href="https://github.com/home-assistant/my.home-assistant.io/issues"
                  target="_blank"
                  rel="noreferrer noopener"
                  >report a bug</a
                >
                if it should exist.
              </p>`
            : ""
        }
        <ha-generic-picker
          .label=${"Redirect to"}
          .required=${true}
          .getItems=${getRedirectItems}
          .value=${this._redirect?.redirect || ""}
          .valueRenderer=${this._renderRedirectValue}
          @value-changed=${this._itemSelected}
        ></ha-generic-picker>

        ${repeat(
          Object.entries(this._redirect?.params || []),
          ([key, _]) => `${this._redirect!.redirect}-${key}`,
          ([key, type]) =>
            html`<ha-input
              ?required=${!type.endsWith("?")}
              .validationMessage=${
                !type.endsWith("?") ? "This field is required" : ""
              }
              .label=${prettify(key)}
              data-key="${key}"
              @input=${this._paramChanged}
              .type=${type.startsWith("url") ? "url" : "text"}
            ></ha-input>`,
        )}
        ${
          this.isValid
            ? html`
              <h1>Your URL</h1>
                <p>A URL to share with others, for example, when chatting on
                our <a href="https://www.home-assistant.io/join-chat"
                target="_blank">Discord</a> chat server.</p>
                <input value=${this._url} readonly @focus=${this._select} />
                <ha-button appearance="outlined" @click=${this._copyURL}>
                  Copy URL
                </ha-button>

                <h1>Markdown</h1>
                <p>A beautiful linked badge in Markdown, for example, when
                posting on our <a href="https://community.home-assistant.io"
                target="_blank">Community Forum</a>.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${this._createMarkdown()}</textarea
                >
                <ha-button appearance="outlined" @click=${this._copyMarkdown}>
                  Copy Markdown
                </ha-button>

                <h1>HTML</h1>
                <p>A beautiful badge in HTML format, which can be used on,
                for example, your website or blog.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${badgeHTML}</textarea
                >
                <ha-button appearance="outlined" @click=${this._copyHTML}>
                  Copy HTML
                </ha-button>
              </a>
            `
            : ""
        }
      </div>
    `;
  }

  protected firstUpdated(props) {
    super.firstUpdated(props);

    if (!this._redirect) {
      return;
    }

    const paramValues = {};
    const passedInParams = toCanonical(requested?.legacy, passedInData);

    for (const [key, paramType] of Object.entries(
      this._redirect.params || {},
    )) {
      if (!passedInParams[key]) {
        continue;
      }
      const msg = validateParam(paramType as ParamType, passedInParams[key]);
      const inputEl = this.querySelector<HaInput>(`ha-input[data-key=${key}]`);

      if (!inputEl) {
        continue;
      }

      inputEl.value = passedInParams[key];

      if (msg) {
        inputEl.updateComplete.then(() => {
          inputEl.setCustomValidity(msg);
          inputEl.reportValidity();
        });
      } else {
        inputEl.setCustomValidity("");
        paramValues[key] = passedInParams[key];
      }
    }

    this._paramsValues = paramValues;
  }

  private get isValid() {
    return (
      this._redirect &&
      (!this._redirect.params ||
        !Object.entries(this._redirect.params).find(
          ([key, type]) => !type.endsWith("?") && !this._paramsValues[key],
        ))
    );
  }

  private _renderRedirectValue = (value: string) =>
    html`${findRedirect(value)?.redirect.name || value}`;

  private _itemSelected(ev: CustomEvent<{ value: string }>) {
    const newRedirect = visibleRedirects.find(
      (rd) => rd.redirect === ev.detail.value,
    );

    if (!newRedirect || newRedirect.redirect === this._redirect?.redirect) {
      return;
    }

    this._redirect = newRedirect;
    this._paramsValues = {};
  }

  private _paramChanged(ev: Event & { currentTarget: HaInput }) {
    const inputEl = ev.currentTarget;
    const key = inputEl.dataset.key;

    if (!key) {
      return;
    }

    let value: string | undefined = inputEl.value || "";

    const paramType = this._redirect?.params?.[key];

    if (!paramType) {
      return;
    }

    inputEl.setCustomValidity("");

    if (paramType.startsWith("url")) {
      value = decodeURI(value);
    }

    const validationMessage =
      !value && paramType.endsWith("?")
        ? undefined
        : validateParam(paramType, value);

    if (validationMessage) {
      inputEl.setCustomValidity(validationMessage);
      value = undefined;
    }

    inputEl.reportValidity();

    if (value) {
      this._paramsValues = { ...this._paramsValues, [key]: value };
    } else {
      this._paramsValues = { ...this._paramsValues };
      delete this._paramsValues[key];
    }
  }

  private get _url() {
    return `https://my.home-assistant.io/redirect/${this._redirect!.redirect}/${createSearch(this._paramsValues)}`;
  }

  private _copyURL(ev: Event & { currentTarget: HaButton }) {
    this._copy(this._url, ev.currentTarget);
  }

  private _copyHTML(ev: Event & { currentTarget: HaButton }) {
    this._copy(this._createHTML(), ev.currentTarget);
  }

  private _copyMarkdown(ev: Event & { currentTarget: HaButton }) {
    this._copy(this._createMarkdown(), ev.currentTarget);
  }

  private async _copy(text: string, button: HaButton) {
    try {
      await copy(text);
      this._copySuccess(button);
    } catch (err) {
      this._copyFailure(err as Error);
    }
  }

  private _copySuccess(element: HaButton) {
    const prevText = element.textContent;
    const prevVariant = element.variant;
    element.variant = "success";
    element.textContent = "Copied!";
    setTimeout(() => {
      element.variant = prevVariant;
      element.textContent = prevText;
    }, 1000);
  }

  private _copyFailure(err: Error) {
    alert(`Copying failed! Error: ${err.message}`);
  }

  private get _altText() {
    return `Open your Home Assistant instance and ${this._redirect!.description}.`;
  }

  private _createBadge() {
    return `/badges/${this._redirect!.redirect}.svg`;
  }

  private _createHTML() {
    return `<a href="${this._url}" target="_blank" rel="noreferrer noopener"><img src="${
      window.location.origin
    }${this._createBadge()}" alt="${this._altText}" /></a>`;
  }

  private _createMarkdown() {
    return `[![${
      this._altText
    }](https://my.home-assistant.io${this._createBadge()})](${this._url})`;
  }

  private _select(ev) {
    const input = ev.target;
    // Safari fires focus too soon
    setTimeout(() => {
      input.select();
    }, 1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-create-link": MyCreateLink;
  }
}
