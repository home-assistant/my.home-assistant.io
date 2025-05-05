import "@material/web/button/filled-button";
import { LitElement, TemplateResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { extractSearchParamsObject } from "../util/search-params";

const SUPPORTED_PARAMS = ["url"];

// Craft a new URL homeassistant://invite? with supported params appended
const INVITE_URL = new URL("homeassistant://invite");
for (const [key, value] of Object.entries(extractSearchParamsObject())) {
  if (SUPPORTED_PARAMS.includes(key)) {
    INVITE_URL.searchParams.append(key, value);
  }
}

@customElement("my-invite")
export class MyUrlInputMain extends LitElement {
  protected render(): TemplateResult {
    return html`
      <a href="${INVITE_URL.toString()}">
        <md-filled-button>Accept Invite</md-filled-button>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-invite": MyUrlInputMain;
  }
}
