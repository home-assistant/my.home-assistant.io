import "@material/mwc-button";
import "@material/mwc-select";
import "@material/mwc-textfield";
import type { TextField } from "@material/mwc-textfield";
import { repeat } from "lit-html/directives/repeat.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import copy from "clipboard-copy";
import {
  customElement,
  html,
  state,
  LitElement,
  TemplateResult,
} from "lit-element";
import redirects from "../../redirect.json";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
import type { Button } from "@material/mwc-button";
import { ParamType, Redirect } from "../const";
import { validateParam } from "../util/validate";

const prettify = (key: string) =>
  capitalizeFirst(key.replace("_", " ").replace("url", "URL"));

const capitalizeFirst = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

let initialRedirect;
const passedInData = extractSearchParamsObject();
{
  if (passedInData.redirect) {
    initialRedirect = redirects.find(
      (info) => info.redirect === passedInData.redirect
    );
  }
  if (!initialRedirect) {
    // Select first one without params so we show the output
    initialRedirect = redirects.find((info) => info.params === undefined);
  }
}

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @state() _redirect: Redirect = initialRedirect;
  @state() _paramsValues = {};
  @state() _filteredRedirects = redirects

  protected createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    const badgeHTML = this._createHTML();
    const badgeTemplate = unsafeHTML(badgeHTML);

    return html`
      <div class="card-content">
        <mwc-select
          label="Redirect to"
          required
          validationMessage="This field is required"
          naturalMenuWidth
          @selected=${this._itemSelected}
        >
          ${this._filteredRedirects.map(
            (redirect) =>
              html`<mwc-list-item
                .selected=${this._redirect?.redirect === redirect.redirect}
                .value=${redirect.redirect}
                >${redirect.name}</mwc-list-item
              >`
          )}
        </mwc-select>

        ${repeat(
          Object.keys(this._redirect?.params || []),
          (key) => `${this._redirect.redirect}-${key}`,
          (key) => html`<mwc-textfield
            required
            validationMessage="This field is required"
            .label=${prettify(key)}
            data-key="${key}"
            @input=${this._paramChanged}
          ></mwc-textfield>`
        )}
        ${this.isValid
          ? html`
              <h1>Your URL</h1>
                <p>A URL to share with others, for example, when chatting on
                our <a href="https://www.home-assistant.io/join-chat"
                target="_blank">Discord</a> chat server.</p>
                <input value=${this._url} readonly @focus=${this._select} />
                <mwc-button outlined @click=${this._copyURL}>
                  Copy URL
                </mwc-button>

                <h1>Markdown</h1>
                <p>A beautiful linked badge in Markdown, for example, when
                posting on our <a href="https://community.home-assistant.io"
                target="_blank">Community Forum</a>.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${this._createMarkdown()}</textarea
                >
                <mwc-button outlined @click=${this._copyMarkdown}>
                  Copy Markdown
                </mwc-button>

                <h1>HTML</h1>
                <p>A beautiful badge in HTML format, which can be used on,
                for example, your website or blog.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${badgeHTML}</textarea
                >
                <mwc-button outlined @click=${this._copyHTML}>
                  Copy HTML
                </mwc-button>
              </a>
            `
          : ""}
      </div>
    `;
  }

  protected firstUpdated(props) {
    super.firstUpdated(props);

    const paramValues = {};

    for (const [key, paramType] of Object.entries(
      this._redirect.params || {}
    )) {
      if (!(key in passedInData) || !passedInData[key]) {
        continue;
      }
      const msg = validateParam(paramType as ParamType, passedInData[key]);
      const inputEl = this.querySelector(
        `mwc-textfield[data-key=${key}]`
      ) as TextField;

      inputEl.value = passedInData[key];

      if (msg) {
        inputEl.updateComplete.then(() => {
          inputEl.setCustomValidity(msg);
          inputEl.reportValidity();
        });
      } else {
        paramValues[key] = passedInData[key];
      }
    }

    this._paramsValues = paramValues;
    this._filteredRedirects = redirects.filter(redirect => !redirect.deprecated)
  }

  private get isValid() {
    return (
      this._redirect &&
      (!this._redirect.params ||
        Object.keys(this._redirect.params).length ===
          Object.keys(this._paramsValues).length)
    );
  }

  private _itemSelected(ev) {
    const newRedirect = this._filteredRedirects[ev.detail.index];

    if (newRedirect.redirect === this._redirect.redirect) {
      return;
    }

    // @ts-expect-error
    this._redirect = newRedirect;
    this._paramsValues = {};
  }

  private _paramChanged(ev) {
    const key = ev.currentTarget.dataset.key;
    let value = ev.target.value;

    const validationMessage = validateParam(this._redirect.params![key], value);
    if (validationMessage) {
      ev.currentTarget.setCustomValidity(validationMessage);
      ev.currentTarget.reportValidity();
      value = undefined;
    }

    if (value) {
      ev.currentTarget.setCustomValidity("");
      ev.currentTarget.reportValidity();
      this._paramsValues = { ...this._paramsValues, [key]: value };
    } else {
      this._paramsValues = { ...this._paramsValues };
      delete this._paramsValues[key];
    }
  }

  private get _url() {
    return `https://my.home-assistant.io/redirect/${this._redirect.redirect}/${
      this._redirect.params ? `?${createSearchParam(this._paramsValues)}` : ""
    }`;
  }

  private _copyURL(ev: Event) {
    this._copy(this._url, ev.currentTarget as Button);
  }

  private _copyHTML(ev: Event) {
    this._copy(this._createHTML(), ev.currentTarget as Button);
  }

  private _copyMarkdown(ev: Event) {
    this._copy(this._createMarkdown(), ev.currentTarget as Button);
  }

  private async _copy(text: string, button: Button) {
    try {
      await copy(text);
      this._copySuccess(button);
    } catch (err) {
      this._copyFailure(err);
    }
  }

  private _copySuccess(element: Button) {
    const prevText = element.innerText;
    element.classList.add("success");
    element.innerText = "Copied!";
    setTimeout(() => {
      element.classList.remove("success");
      element.innerText = prevText;
    }, 1000);
  }

  private _copyFailure(err: Error) {
    alert(`Copying failed! Error: ${err.message}`);
  }

  private get _altText() {
    return `Open your Home Assistant instance and ${this._redirect.description}.`;
  }

  private _createBadge() {
    return `/badges/${this._redirect.redirect}.svg`;
  }

  private _createHTML() {
    return `<a href="${
      this._url
    }" target="_blank"><img src="${window.location.origin}${this._createBadge()}" alt="${
      this._altText
    }" /></a>`;
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
