import { handleTabKey } from "./keys.js";
import {
  newFile,
  openFileDialog,
  saveFile,
  saveFileAs,
  renameFile,
} from "./file.js";

const editor = document.getElementById("editor");
const help = document.getElementById("help");

const actions = {
  help: () => toggleHelp(),
  rename: () => renameFile(),
  new: () => newFile(),
  open: () => openFileDialog(),
  save: () => saveFile(),
  saveAs: () => saveFileAs(),
  indent: () => handleTabKey({ preventDefault: () => {}, shiftKey: false }),
  outdent: () => handleTabKey({ preventDefault: () => {}, shiftKey: true }),
};

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

function isMac() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

function formatKeys(spec, mac) {
  const mod = mac ? "⌘" : "^";
  const shift = mac ? "⇧" : "⇧";
  return spec
    .split(", ")
    .map((part) =>
      part
        .split("+")
        .map((k) => (k === "Mod" ? mod : k === "Shift" ? shift : k))
        .join(" "),
    )
    .join(", ");
}

function renderHelpKeys() {
  const mac = isMac();
  document.querySelectorAll("#help-panel td.key[data-keys]").forEach((el) => {
    el.textContent = formatKeys(el.getAttribute("data-keys"), mac);
  });
}

function runHelpAction(name) {
  const action = actions[name];
  if (!action) return;
  if (name !== "help") closeHelp();
  action();
}

export function initHelp() {
  help?.addEventListener("click", (event) => {
    if (event.target === help) closeHelp();
  });
  const statusDirty = document.getElementById("status-dirty");
  statusDirty?.addEventListener("click", () => openHelp());
  document.querySelectorAll("#help-panel tr[data-action]").forEach((row) => {
    row.addEventListener("click", () => {
      runHelpAction(row.getAttribute("data-action"));
    });
  });
  renderHelpKeys();
}
