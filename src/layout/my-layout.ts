import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import "../components/ha-card";

@customElement("my-layout")
class MyLayout extends LitElement {
  @property() public subtitle?: string | undefined;

  protected render(): TemplateResult {
    return html`
      <ha-card>
        <div class="layout">
          <img class="hero" src="/images/header.jpg" />
          <h1 class="card-header">
            My Home Assistant${this.subtitle ? ` – ${this.subtitle}` : ""}
          </h1>
          <slot></slot>
        </div>
      </ha-card>
      <div class="footer">
        Found a bug?
        <a
          href="https://github.com/home-assistant/my.home-assistant.io/issues"
          target="_blank"
          >Let us know!</a
        >
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: flex;
        min-height: 100%;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      ha-card {
        display: flex;
        width: 100%;
        max-width: 500px;
      }

      .hero {
        border-radius: 4px 4px 0 0;
      }

      .layout {
        display: flex;
        flex-direction: column;
      }

      .card-header {
        color: var(--ha-card-header-color, --primary-text-color);
        font-family: var(--ha-card-header-font-family, inherit);
        font-size: var(--ha-card-header-font-size, 24px);
        letter-spacing: -0.012em;
        line-height: 32px;
        padding: 24px 16px 16px;
        display: block;
      }

      .subtitle {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: initial;
      }
      .subtitle a {
        color: var(--secondary-text-color);
      }

      :host ::slotted(.card-content:not(:first-child)),
      slot:not(:first-child)::slotted(.card-content) {
        padding-top: 0px;
        margin-top: -8px;
      }

      :host ::slotted(.section-header) {
        font-weight: 500;
        padding: 4px 16px;
        text-transform: uppercase;
      }

      :host ::slotted(.card-content) {
        padding: 16px;
        flex: 1;
      }

      :host ::slotted(.card-actions) {
        border-top: 1px solid #e8e8e8;
        padding: 5px 16px;
        display: flex;
      }

      img {
        width: 100%;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        padding: 8px 0 24px;
        color: var(--secondary-text-color);
      }
      .footer a {
        color: var(--secondary-text-color);
      }

      @media all and (max-width: 500px) {
        :host {
          justify-content: flex-start;
          min-height: 90%;
          margin-bottom: 30px;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-layout": MyLayout;
  }
}
