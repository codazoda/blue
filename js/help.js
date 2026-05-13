const editor = document.getElementById("editor");
const help = document.getElementById("help");

export function isHelpOpen() {
  return help?.getAttribute("data-open") === "true";
}

export function openHelp() {
  if (!help) return;
  help.setAttribute("data-open", "true");
}

export function closeHelp() {
  if (!help) return;
  help.setAttribute("data-open", "false");
  editor.focus();
}

export function toggleHelp() {
  if (isHelpOpen()) {
    closeHelp();
  } else {
    openHelp();
  }
}

export function initHelp() {
  help?.addEventListener("click", (event) => {
    if (event.target === help) closeHelp();
  });
  const statusDirty = document.getElementById("status-dirty");
  statusDirty?.addEventListener("click", () => openHelp());
}
