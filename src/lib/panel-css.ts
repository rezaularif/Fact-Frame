/** Panel + settings + verdicts styles (injected on YouTube and full settings page). */
export function getPanelCss(panelId: string): string {
  return `#${panelId} {
  --ytc-surface: #121214;
  --ytc-surface-2: #161618;
  --ytc-border-hairline: rgba(255, 255, 255, 0.09);
  --ytc-border: rgba(255, 255, 255, 0.1);
  --ytc-border-soft: rgba(255, 255, 255, 0.06);
  --ytc-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --ytc-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ytc-bright: rgba(255, 255, 255, 0.96);
  --ytc-text: rgba(255, 255, 255, 0.94);
  --ytc-text-muted: rgba(255, 255, 255, 0.62);
  --ytc-text-dim: rgba(255, 255, 255, 0.42);
  --ytc-link: rgba(180, 200, 220, 0.95);
  --ytc-link-hover: rgba(255, 255, 255, 0.98);
  font-family: var(--ytc-sans);
  font-size: 13px;
  line-height: 1.4;
  background: linear-gradient(
    165deg,
    rgba(18, 18, 20, var(--ytc-idle-a1, 0.55)) 0%,
    rgba(18, 18, 20, var(--ytc-idle-a2, 0.52)) 50%,
    rgba(22, 22, 26, var(--ytc-idle-a3, 0.58)) 100%
  ) !important;
  color: var(--ytc-text);
  border: 1px solid var(--ytc-border-hairline) !important;
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
  border-radius: 9px !important;
  box-sizing: border-box;
  transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}
#${panelId} .ytc-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  z-index: 3;
  cursor: nwse-resize;
  touch-action: none;
  border-radius: 0 0 8px 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.12) 100%
  );
}
#${panelId} .ytc-resize-handle:hover {
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 45%,
    rgba(255, 255, 255, 0.2) 45%,
    rgba(255, 255, 255, 0.22) 100%
  );
}
#${panelId}:hover,
#${panelId}:focus-within {
  background: linear-gradient(
    165deg,
    rgb(18, 18, 20) 0%,
    rgb(20, 20, 24) 50%,
    rgb(24, 24, 28) 100%
  ) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
}
#${panelId}.ytc-panel--idle .ytc-ring-center {
  fill: rgba(255, 255, 255, 0.92);
}
#${panelId}.ytc-panel--checking .ytc-ring-center {
  fill: rgba(255, 255, 255, 0.98);
  animation: ytc-ring-pulse 1.1s ease-in-out infinite;
}
#${panelId}.ytc-panel--error .ytc-ring-center {
  fill: rgba(220, 140, 140, 0.95);
}
#${panelId}.ytc-panel--checking .ytc-ring-outer-rot {
  animation: ytc-ring-pulse 1.1s ease-in-out infinite;
}
@keyframes ytc-ring-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
#${panelId} .ytc-header {
  padding: 10px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  border-bottom: 1px solid var(--ytc-border-soft);
  background: rgba(0, 0, 0, 0.15);
  transition: background 0.22s ease;
  box-sizing: border-box;
}
#${panelId}:hover .ytc-header,
#${panelId}:focus-within .ytc-header {
  background: rgba(255, 255, 255, 0.03);
}
#${panelId} .ytc-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  padding: 2px 2px;
  box-sizing: border-box;
}
#${panelId} .ytc-title {
  font-family: var(--ytc-sans);
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: var(--ytc-bright);
  pointer-events: none;
  flex: 1;
  min-width: 0;
}
#${panelId} .ytc-settings-mode-hint {
  display: none;
  margin: 0;
  padding: 0 2px 0;
  font-size: 10px;
  line-height: 1.45;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.48);
  max-width: 100%;
}
#${panelId} .ytc-settings-mode-hint strong {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
}
#${panelId}.ytc-panel--settings-open .ytc-settings-mode-hint {
  display: block;
  margin-top: 6px;
  padding-bottom: 2px;
}
#${panelId} .ytc-hero {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px 6px;
}
#${panelId} .ytc-ring-wrap {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
}
#${panelId} .ytc-ring-svg {
  display: block;
  width: 100%;
  height: 100%;
}
#${panelId} .ytc-ring-outer {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 1;
  stroke-dasharray: 1.2 5;
}
#${panelId} .ytc-ring-mid {
  fill: none;
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
#${panelId} .ytc-ring-inner {
  fill: none;
  stroke: rgba(255, 255, 255, 0.38);
  stroke-width: 1;
}
#${panelId} .ytc-ring-center {
  transition: fill 0.2s ease;
}
#${panelId} .ytc-btn-ghost {
  background: rgba(255, 255, 255, var(--ytc-idle-ghost, 0.06));
  color: var(--ytc-text);
  border: 1px solid var(--ytc-border-soft);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  transition: background 0.22s ease, border-color 0.22s ease;
}
#${panelId} .ytc-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 30px;
  min-height: 30px;
  padding: 5px;
}
#${panelId} .ytc-btn-icon.ytc-btn-icon--back {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.16);
}
#${panelId} .ytc-btn-icon svg {
  display: block;
}
#${panelId}:hover .ytc-btn-ghost,
#${panelId}:focus-within .ytc-btn-ghost {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.16);
}
#${panelId} .ytc-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.18);
}
#${panelId} .ytc-settings {
  display: none;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border-bottom: 1px solid var(--ytc-border-soft);
  max-height: min(52vh, 360px);
  overflow: hidden;
}
#${panelId} .ytc-settings-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
#${panelId} .ytc-settings-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
#${panelId} .ytc-settings-section-title {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: rgba(255, 255, 255, 0.38);
  margin: 0;
  padding: 0 4px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
#${panelId} .ytc-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 6px;
}
#${panelId} .ytc-settings-grid .ytc-field {
  min-width: 0;
}
#${panelId} .ytc-settings-actions {
  padding: 4px 10px 8px;
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.15) 100%);
}
/* Settings mode: hide results; solid shell so nothing bleeds through translucent panel */
#${panelId}.ytc-panel--settings-open {
  overflow: hidden;
  background: var(--ytc-surface) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55), 0 1px 0 rgba(255, 255, 255, 0.05) inset !important;
}
#${panelId}.ytc-panel--settings-open .ytc-status,
#${panelId}.ytc-panel--settings-open .ytc-verdicts,
#${panelId}.ytc-panel--settings-open .ytc-hero {
  display: none !important;
}
#${panelId}.ytc-panel--settings-open .ytc-settings {
  flex: 1;
  min-height: 0;
  max-height: none;
  border-bottom: none;
  background: var(--ytc-surface);
}
#${panelId}.ytc-panel--settings-open .ytc-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
#${panelId} .ytc-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
}
#${panelId} .ytc-field-hint {
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.01em;
  text-transform: none;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.35;
  margin-top: 1px;
}
#${panelId} .ytc-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: row;
  text-transform: none;
  letter-spacing: normal;
}
#${panelId} input[type="range"].ytc-range {
  flex: 1;
  min-width: 0;
  padding: 0;
  height: 5px;
  border-radius: 3px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  accent-color: rgba(200, 210, 225, 0.85);
}
#${panelId} .ytc-range-value {
  flex-shrink: 0;
  min-width: 2.25rem;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-transform: none;
  letter-spacing: normal;
  color: rgba(255, 255, 255, 0.65);
  text-align: right;
}
#${panelId} .ytc-input,
#${panelId} .ytc-settings select {
  padding: 5px 8px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.35);
  color: var(--ytc-text);
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.01em;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
#${panelId}.ytc-panel--settings-open .ytc-input,
#${panelId}.ytc-panel--settings-open .ytc-settings select {
  background: rgba(0, 0, 0, 0.45);
}
#${panelId}:hover .ytc-input,
#${panelId}:focus-within .ytc-input,
#${panelId}:hover .ytc-settings select,
#${panelId}:focus-within .ytc-settings select {
  background: rgba(0, 0, 0, 0.5);
}
#${panelId} .ytc-input:focus,
#${panelId} .ytc-settings select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.06);
}
/* Chrome autofill paints password fields light; override to match dark inputs */
#${panelId} .ytc-input:-webkit-autofill,
#${panelId} .ytc-input:-webkit-autofill:hover,
#${panelId} .ytc-input:-webkit-autofill:focus,
#${panelId} .ytc-input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--ytc-text) !important;
  caret-color: var(--ytc-text);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.35) inset !important;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.35) inset !important;
}
#${panelId}.ytc-panel--settings-open .ytc-input:-webkit-autofill,
#${panelId}.ytc-panel--settings-open .ytc-input:-webkit-autofill:hover,
#${panelId}.ytc-panel--settings-open .ytc-input:-webkit-autofill:focus,
#${panelId}.ytc-panel--settings-open .ytc-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.45) inset !important;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.45) inset !important;
}
#${panelId}:hover .ytc-input:-webkit-autofill,
#${panelId}:focus-within .ytc-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5) inset !important;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5) inset !important;
}
#${panelId} .ytc-input-key-wrap {
  position: relative;
  width: 100%;
  display: block;
}
#${panelId} .ytc-input-key-wrap .ytc-input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 54px;
}
#${panelId} .ytc-input-key-suffix {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}
#${panelId} .ytc-input-key-suffix .ytc-key-clear {
  pointer-events: auto;
}
#${panelId} .ytc-key-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, box-shadow 0.18s ease;
}
#${panelId} .ytc-key-dot.ytc-key-dot--active {
  opacity: 1;
  background: #34d399;
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.35), 0 0 8px rgba(52, 211, 153, 0.25);
}
#${panelId} .ytc-key-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
}
#${panelId} .ytc-key-clear.ytc-key-clear--visible {
  opacity: 1;
  visibility: visible;
}
#${panelId} .ytc-key-clear:hover {
  background: rgba(248, 113, 113, 0.18);
  color: rgba(252, 165, 165, 0.95);
}
#${panelId} .ytc-key-clear:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.35);
}
#${panelId} .ytc-check {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}
#${panelId} .ytc-check input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 2px 0 0 0;
  flex-shrink: 0;
  accent-color: rgba(200, 210, 225, 0.85);
  border-radius: 3px;
}
#${panelId} .ytc-btn-save {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.1);
  color: var(--ytc-bright);
  border: 1px solid var(--ytc-border) !important;
  border-radius: 6px;
  padding: 7px 10px;
  font-family: var(--ytc-sans);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}
#${panelId} .ytc-btn-save:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.16) !important;
}
#${panelId} .ytc-btn-save:active {
  transform: translateY(1px);
}
#${panelId} .ytc-btn-save.ytc-btn-save--success {
  background: rgba(52, 211, 153, 0.2);
  border-color: rgba(52, 211, 153, 0.42) !important;
  color: rgba(220, 255, 238, 0.98);
  transform: none;
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.12), 0 2px 10px rgba(52, 211, 153, 0.12);
}
#${panelId} .ytc-btn-save.ytc-btn-save--success:hover {
  background: rgba(52, 211, 153, 0.26);
  border-color: rgba(52, 211, 153, 0.5) !important;
}
#${panelId} .ytc-btn-save.ytc-btn-save--error {
  background: rgba(248, 113, 113, 0.16);
  border-color: rgba(248, 113, 113, 0.4) !important;
  color: rgba(255, 220, 220, 0.98);
  transform: none;
}
#${panelId} .ytc-btn-save.ytc-btn-save--pending {
  background: rgba(251, 191, 36, 0.18);
  border-color: rgba(251, 191, 36, 0.45) !important;
  color: rgba(255, 235, 180, 0.98);
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.12), 0 2px 10px rgba(251, 191, 36, 0.1);
}
#${panelId} .ytc-btn-save.ytc-btn-save--pending:hover {
  background: rgba(251, 191, 36, 0.24);
  border-color: rgba(251, 191, 36, 0.55) !important;
}
#${panelId} .ytc-btn-save.ytc-btn-save--saving {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.45) !important;
  color: rgba(220, 235, 255, 0.98);
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.12), 0 2px 10px rgba(96, 165, 250, 0.1);
  cursor: wait;
}
#${panelId} .ytc-btn-save.ytc-btn-save--saving::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: ytc-btn-spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes ytc-btn-spin {
  to { transform: rotate(360deg); }
}
#${panelId} .ytc-save-feedback {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-align: center;
  min-height: 16px;
  margin: 0 0 6px;
  line-height: 1.35;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
#${panelId} .ytc-save-feedback[hidden] {
  display: none;
}
#${panelId} .ytc-save-feedback.ytc-save-feedback--success {
  color: rgba(110, 231, 183, 0.95);
  text-shadow: 0 0 12px rgba(52, 211, 153, 0.25);
}
#${panelId} .ytc-save-feedback.ytc-save-feedback--error {
  color: rgba(252, 165, 165, 0.95);
}
#${panelId} .ytc-status {
  padding: 6px 10px 7px;
  border-bottom: 1px solid var(--ytc-border-soft);
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
}
#${panelId} .ytc-status-body {
  font-family: var(--ytc-sans);
  font-size: 12px;
  line-height: 1.35;
  color: var(--ytc-text);
  white-space: pre-line;
  transition: color 0.22s ease;
}
#${panelId}:hover .ytc-status-body,
#${panelId}:focus-within .ytc-status-body {
  color: var(--ytc-bright);
}
#${panelId} .ytc-verdicts {
  flex: 1;
  overflow: auto;
  padding: 6px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.14) rgba(0, 0, 0, 0.2);
}
#${panelId} .ytc-verdicts::-webkit-scrollbar {
  width: 6px;
}
#${panelId} .ytc-verdicts::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.14);
  border-radius: 4px;
}
#${panelId} .ytc-settings-scroll::-webkit-scrollbar {
  width: 5px;
}
#${panelId} .ytc-settings-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}
#${panelId} .ytc-empty {
  font-size: 11px;
  color: var(--ytc-text-muted);
  line-height: 1.35;
}
#${panelId} .ytc-fc-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 6px;
  margin-bottom: 4px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--ytc-border-soft);
}
#${panelId} .ytc-fc-head-total {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ytc-text-muted);
}
#${panelId} .ytc-fc-head-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
#${panelId} .ytc-fc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 4px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
}
#${panelId} .ytc-fc-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
#${panelId} .ytc-fc-chip--supported {
  background: rgba(95, 145, 115, 0.14);
  border-color: rgba(110, 160, 125, 0.28);
  color: rgba(175, 210, 185, 0.92);
}
#${panelId} .ytc-fc-chip--supported .ytc-fc-chip-dot {
  background: rgba(115, 165, 135, 0.9);
}
#${panelId} .ytc-fc-chip--unclear {
  background: rgba(155, 145, 85, 0.12);
  border-color: rgba(175, 165, 100, 0.24);
  color: rgba(200, 190, 140, 0.95);
}
#${panelId} .ytc-fc-chip--unclear .ytc-fc-chip-dot {
  background: rgba(175, 160, 95, 0.85);
}
#${panelId} .ytc-fc-chip--contradicted {
  background: rgba(155, 95, 95, 0.12);
  border-color: rgba(175, 110, 110, 0.26);
  color: rgba(215, 165, 165, 0.95);
}
#${panelId} .ytc-fc-chip--contradicted .ytc-fc-chip-dot {
  background: rgba(185, 110, 110, 0.88);
}
#${panelId} .ytc-fc-chip-num {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-left: 1px;
}
#${panelId} .ytc-fc-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
#${panelId} .ytc-fc-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
#${panelId} .ytc-fc-row:last-child {
  border-bottom: none;
}
#${panelId} .ytc-fc-toggle {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 3px 0;
  cursor: pointer;
  font: inherit;
  text-align: left;
}
#${panelId} .ytc-fc-toggle:hover {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  margin: 0 -4px;
  padding-left: 4px;
  padding-right: 4px;
  width: calc(100% + 8px);
}
#${panelId} .ytc-fc-toggle:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.35);
  outline-offset: 2px;
  border-radius: 4px;
}
#${panelId} .ytc-fc-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 5px;
}
#${panelId} .ytc-fc-dot--supported { background: rgba(115, 165, 135, 0.9); }
#${panelId} .ytc-fc-dot--contradicted { background: rgba(185, 110, 110, 0.88); }
#${panelId} .ytc-fc-dot--unclear { background: rgba(175, 160, 95, 0.85); }
#${panelId} .ytc-fc-one {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  line-height: 1.3;
  color: var(--ytc-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
#${panelId} .ytc-fc-detail {
  padding: 0 0 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
#${panelId} .ytc-fc-detail[hidden] {
  display: none !important;
}
#${panelId} .ytc-fc-detail .ytc-badge {
  align-self: flex-start;
}
#${panelId} .ytc-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  width: fit-content;
  border: 1px solid transparent;
}
#${panelId} .ytc-badge--supported {
  background: rgba(30, 55, 40, 0.85);
  color: rgba(145, 195, 165, 0.95);
  border-color: rgba(55, 80, 62, 0.9);
}
#${panelId} .ytc-badge--contradicted {
  background: rgba(55, 32, 32, 0.88);
  color: rgba(210, 155, 155, 0.95);
  border-color: rgba(85, 50, 50, 0.85);
}
#${panelId} .ytc-badge--unclear {
  background: rgba(50, 46, 28, 0.88);
  color: rgba(195, 180, 130, 0.95);
  border-color: rgba(75, 68, 42, 0.85);
}
#${panelId} .ytc-claim {
  font-weight: 600;
  font-size: 12px;
  line-height: 1.35;
  color: var(--ytc-text);
}
#${panelId} .ytc-expl {
  font-size: 11px;
  line-height: 1.4;
  color: var(--ytc-text-muted);
}
#${panelId} .ytc-sources {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
  border-top: 1px solid var(--ytc-border-soft);
}
#${panelId} .ytc-sources-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ytc-text-dim);
}
#${panelId} a.ytc-src-link {
  font-size: 11px;
  line-height: 1.35;
  color: var(--ytc-link) !important;
  text-decoration: underline !important;
  text-underline-offset: 2px;
  word-break: break-all;
}
#${panelId} a.ytc-src-link:hover {
  color: var(--ytc-link-hover) !important;
}

/* ── Minimize button in header ── */
#${panelId} .ytc-btn-minimize {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 30px;
  min-height: 30px;
  padding: 5px;
  background: rgba(255, 255, 255, var(--ytc-idle-ghost, 0.06));
  color: var(--ytc-text);
  border: 1px solid var(--ytc-border-soft);
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  transition: background 0.22s ease, border-color 0.22s ease;
}
#${panelId}:hover .ytc-btn-minimize,
#${panelId}:focus-within .ytc-btn-minimize {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.16);
}
#${panelId} .ytc-btn-minimize:hover {
  background: rgba(255, 255, 255, 0.18);
}
#${panelId} .ytc-btn-minimize svg {
  display: block;
}
/* ── Panel minimized state ── */
#${panelId}.ytc-panel--minimized {
  opacity: 0 !important;
  pointer-events: none !important;
  transform: scale(0.92) translateX(30px);
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}
`;
}

/** CSS for the mini floating action button on the right edge. */
export function getFabCss(fabId: string): string {
  return `
#${fabId} {
  position: fixed;
  z-index: 999998;
  right: 0;
  top: 50%;
  width: 36px;
  height: 36px;
  transform: translateX(0);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px 0 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-right: none;
  background: linear-gradient(
    165deg,
    rgba(18, 18, 20, 0.92) 0%,
    rgba(24, 24, 28, 0.95) 100%
  );
  box-shadow:
    -4px 2px 16px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  transition: width 0.2s ease, background 0.18s ease, box-shadow 0.18s ease, opacity 0.2s ease, transform 0.2s ease;
  opacity: 0;
  pointer-events: none;
}
#${fabId}.ytc-fab--visible {
  opacity: 1;
  pointer-events: auto;
}
#${fabId}:hover {
  width: 42px;
  background: linear-gradient(
    165deg,
    rgba(28, 28, 32, 0.96) 0%,
    rgba(32, 32, 38, 0.98) 100%
  );
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    -6px 4px 22px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}
#${fabId}:active {
  transform: translateX(2px);
}
#${fabId} .ytc-fab-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
#${fabId} .ytc-fab-icon svg {
  display: block;
}
/* Dragging state — no transitions during drag */
#${fabId}.ytc-fab--dragging {
  transition: none !important;
}
`;
}

/** Full-page settings window: undo floating-panel constraints from {@link getPanelCss}. */
export function getStandaloneSettingsPageCss(panelId: string): string {
  return `
html, body {
  margin: 0;
  min-height: 100%;
  background: #0c0c0e;
}
body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
#${panelId}.ytc-panel--standalone-settings {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  right: auto !important;
  width: 100% !important;
  max-width: 520px !important;
  height: auto !important;
  min-height: 100vh !important;
  max-height: none !important;
  margin: 0 auto !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  display: flex !important;
  flex-direction: column !important;
}
#${panelId}.ytc-panel--standalone-settings .ytc-settings {
  display: flex !important;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  max-height: none !important;
}
#${panelId}.ytc-panel--standalone-settings .ytc-header {
  cursor: default;
}
#${panelId} .ytc-standalone-hint {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.45);
  margin: 6px 0 0;
  line-height: 1.4;
  text-transform: none;
}
`;
}
