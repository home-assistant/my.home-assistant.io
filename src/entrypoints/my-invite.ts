import "@material/web/button/filled-button";
import { LitElement, TemplateResult, html } from "lit";
import { customElement } from "lit/decorators.js";

const SUPPORTED_PARAMS = ["url"];

const INVITE_URL = new URL("homeassistant://invite");
// We read params from location.hash instead of location.search, as they
// won't be sent to the server when the user visits the link.
const hashParams = new URLSearchParams(location.hash.substring(1));
const inviteHashParams = new URLSearchParams();
for (const [key, value] of hashParams.entries()) {
  if (SUPPORTED_PARAMS.includes(key)) {
    inviteHashParams.append(key, value);
  }
}
if (inviteHashParams.size > 0) {
  INVITE_URL.hash = inviteHashParams.toString();
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
