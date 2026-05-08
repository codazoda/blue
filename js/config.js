export const defaultConfig = {
  wordWrap: true,
};

export async function loadConfig() {
  try {
    const res = await fetch("blue.json", { cache: "no-store" });
    if (!res.ok) return defaultConfig;
    const data = await res.json();
    return { ...defaultConfig, ...data };
  } catch (_err) {
    return defaultConfig;
  }
}

export function applyConfig(editor, config) {
  const wrap = config.wordWrap !== false;
  editor.setAttribute("wrap", wrap ? "soft" : "off");
  editor.style.whiteSpace = wrap ? "pre-wrap" : "pre";
  editor.style.overflowX = wrap ? "hidden" : "auto";
}
