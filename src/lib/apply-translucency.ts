/** Higher translucency = lower idle alpha (more see-through). Hover/focus stays solid. */
export function applyTranslucencyVariables(root: HTMLElement, translucencyPercent: number): void {
  const t = Math.max(0, Math.min(100, Math.round(translucencyPercent))) / 100;
  const a1 = 0.94 - t * 0.62;
  root.style.setProperty("--ytc-idle-a1", String(a1));
  root.style.setProperty("--ytc-idle-a2", String(a1 * 0.98));
  root.style.setProperty("--ytc-idle-a3", String(a1 * 0.95));
  root.style.setProperty("--ytc-idle-summary-bg", String(0.1 + (1 - t) * 0.38));
  root.style.setProperty("--ytc-idle-card-t", String(0.03 + (1 - t) * 0.07));
  root.style.setProperty("--ytc-idle-card-b", String(0.1 + (1 - t) * 0.18));
  root.style.setProperty("--ytc-idle-input-bg", String(0.18 + (1 - t) * 0.38));
  root.style.setProperty("--ytc-idle-ghost", String(0.04 + (1 - t) * 0.1));
}
