import "@material/web/button/outlined-button";
import "@material/web/textfield/filled-text-field";
import "@material/web/select/filled-select";
import "@material/web/select/select-option";
import type { MdFilledTextField } from "@material/web/textfield/filled-text-field";
import type { MdOutlinedButton } from "@material/web/button/outlined-button";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import copy from "clipboard-copy";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import redirects from "../../redirect.json";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../util/search-params";
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
      (info) => info.redirect === passedInData.redirect,
    );
  }
  if (!initialRedirect) {
    // Select first one without params so we show the output
    initialRedirect = redirects.find((info) => info.params === undefined);
  }
}

const filteredRedirects = redirects.filter((redirect) => !redirect.deprecated);

@customElement("my-create-link")
class MyCreateLink extends LitElement {
  @state() _redirect: Redirect = initialRedirect;
  @state() _paramsValues = {};

  protected createRenderRoot() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    return this;
  }

  protected render(): TemplateResult {
    const badgeHTML = this._createHTML();
    const badgeTemplate = unsafeHTML(badgeHTML);

    return html`
      <div class="card-content">
        <md-filled-select
          label="Redirect to"
          required
          errorText="This field is required"
          .value=${this._redirect.redirect}
          @input=${this._itemSelected}
        >
          ${filteredRedirects.map(
            (redirect) =>
              html`<md-select-option
                .selected=${this._redirect?.redirect === redirect.redirect}
                .value=${redirect.redirect}
                ><div slot="headline">${redirect.name}</div></md-select-option
              >`,
          )}
        </md-filled-select>

        ${repeat(
          Object.entries(this._redirect?.params || []),
          ([key, _]) => `${this._redirect.redirect}-${key}`,
          ([key, type]) =>
            html`<md-filled-text-field
              ?required=${!type.endsWith("?")}
              .errorText=${!type.endsWith("?") ? "This field is required" : ""}
              .label=${prettify(key)}
              data-key="${key}"
              @input=${this._paramChanged}
              .type=${type.startsWith("url") ? "url" : "text"}
            ></md-filled-text-field>`,
        )}
        ${this.isValid
          ? html`
              <h1>Your URL</h1>
                <p>A URL to share with others, for example, when chatting on
                our <a href="https://www.home-assistant.io/join-chat"
                target="_blank">Discord</a> chat server.</p>
                <input value=${this._url} readonly @focus=${this._select} />
                <md-outlined-button @click=${this._copyURL}>
                  Copy URL
                </md-outlined-button>

                <h1>Markdown</h1>
                <p>A beautiful linked badge in Markdown, for example, when
                posting on our <a href="https://community.home-assistant.io"
                target="_blank">Community Forum</a>.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${this._createMarkdown()}</textarea
                >
                <md-outlined-button @click=${this._copyMarkdown}>
                  Copy Markdown
                </md-outlined-button>

                <h1>HTML</h1>
                <p>A beautiful badge in HTML format, which can be used on,
                for example, your website or blog.</p>

                ${badgeTemplate}

                <textarea rows="3" readonly @focus=${this._select}>
${badgeHTML}</textarea
                >
                <md-outlined-button @click=${this._copyHTML}>
                  Copy HTML
                </md-outlined-button>
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
      this._redirect.params || {},
    )) {
      if (!(key in passedInData) || !passedInData[key]) {
        continue;
      }
      const msg = validateParam(paramType as ParamType, passedInData[key]);
      const inputEl = this.querySelector(
        `md-filled-text-field[data-key=${key}]`,
      ) as MdFilledTextField;

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

  private _itemSelected(ev) {
    const newRedirect = filteredRedirects.find(
      (rd) => rd.redirect === ev.target.value,
    );

    if (newRedirect!.redirect === this._redirect.redirect) {
      return;
    }

    // @ts-expect-error
    this._redirect = newRedirect;
    this._paramsValues = {};
  }

  private _paramChanged(ev) {
    const key = ev.currentTarget.dataset.key;
    let value = ev.target.value;

    const paramType = this._redirect.params![key];

    if (paramType.startsWith("url")) {
      value = decodeURI(value);
    }

    const validationMessage = validateParam(paramType, value);
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
      Object.keys(this._paramsValues).length
        ? `?${createSearchParam(this._paramsValues)}`
        : ""
    }`;
  }

  private _copyURL(ev: Event) {
    this._copy(this._url, ev.currentTarget as MdOutlinedButton);
  }

  private _copyHTML(ev: Event) {
    this._copy(this._createHTML(), ev.currentTarget as MdOutlinedButton);
  }

  private _copyMarkdown(ev: Event) {
    this._copy(this._createMarkdown(), ev.currentTarget as MdOutlinedButton);
  }

  private async _copy(text: string, button: MdOutlinedButton) {
    try {
      await copy(text);
      this._copySuccess(button);
    } catch (err) {
      this._copyFailure(err as Error);
    }
  }

  private _copySuccess(element: MdOutlinedButton) {
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
