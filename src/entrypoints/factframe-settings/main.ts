import { applyTranslucencyVariables } from "../../lib/apply-translucency";
import { loadExtensionSettings } from "../../lib/load-extension-settings";
import { getPanelCss, getStandaloneSettingsPageCss } from "../../lib/panel-css";
import { PANEL_ID, PANEL_STYLE_ID } from "../../lib/panel-constants";
import { fillSettingsForm, getSettingsFormInnerHtml, wireSettingsForm } from "../../lib/settings-form";

const loadSettings = loadExtensionSettings;

function injectStyles(): void {
  if (document.getElementById(PANEL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PANEL_STYLE_ID;
  style.textContent = getPanelCss(PANEL_ID) + getStandaloneSettingsPageCss(PANEL_ID);
  document.head.appendChild(style);
}

function init(): void {
  injectStyles();
  const root = document.getElementById(PANEL_ID);
  if (!root) return;

  root.className = "ytc-panel--settings-open ytc-panel--standalone-settings";
  root.innerHTML = `
    <header class="ytc-header">
      <div class="ytc-header-main">
        <div class="ytc-title">FactFrame</div>
      </div>
      <p class="ytc-standalone-hint">Configure your search and LLM keys. You can change these anytime from the panel on a YouTube video page.</p>
    </header>
    <div class="ytc-settings" style="display:flex;flex-direction:column;flex:1;min-height:0;">
      ${getSettingsFormInnerHtml()}
    </div>
  `;

  const settingsEl = root.querySelector<HTMLElement>(".ytc-settings");
  if (!settingsEl) return;

  void (async () => {
    const s = await loadSettings();
    applyTranslucencyVariables(root, s.translucencyPercent);
    fillSettingsForm(settingsEl, s);
    wireSettingsForm(settingsEl, {
      loadSettings,
      enableChangeDetection: true,
      onTranslucencyInput: (percent) => {
        applyTranslucencyVariables(root, percent);
      },
      onSaved: async (next) => {
        applyTranslucencyVariables(root, next.translucencyPercent);
      },
    });
  })();
}

init();
