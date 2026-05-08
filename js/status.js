import { state } from "./state.js";
import { md5 } from "./md5.js";

const STATUS_FRONT = 15;
const STATUS_BACK = 15;

const editor = document.getElementById("editor");
const statusFilename = document.getElementById("status-filename");
const statusDirty = document.getElementById("status-dirty");
const statusDirtyBox = document.getElementById("status-dirty-box");
const statusPos = document.getElementById("status-pos");

export function updateStatus() {
  if (statusDirtyBox) {
    statusDirtyBox.textContent = state.isDirty ? "*" : " ";
    statusDirty?.setAttribute(
      "aria-label",
      state.isDirty ? "File has unsaved changes" : "File is saved"
    );
  }
  if (!statusFilename) return;
  const nameForStatus = getDisplayPath();
  statusFilename.textContent = shortenName(
    nameForStatus || "Untitled",
    STATUS_FRONT,
    STATUS_BACK
  );
  updateCursorPosition();
}

export function updateCursorPosition() {
  if (!statusPos || !editor) return;
  const pos = editor.selectionStart || 0;
  const textUpToPos = editor.value.slice(0, pos);
  const line = textUpToPos.split("\n").length;
  const lastBreak = textUpToPos.lastIndexOf("\n");
  const col = pos - (lastBreak === -1 ? -1 : lastBreak);
  statusPos.textContent = `${line}:${col}`;
}

export function updateDirtyStateFromContent() {
  const currentHash = md5(editor.value);
  const nextDirty = currentHash !== state.baselineHash;
  if (nextDirty !== state.isDirty) {
    state.isDirty = nextDirty;
    updateStatus();
  }
}

function getDisplayPath() {
  if (state.fileHandle && state.fileHandle.name) {
    return state.fileHandle.name;
  }
  return state.currentFilename || "";
}

function shortenName(name, front, back) {
  if (!name) return "Untitled";
  if (typeof name !== "string") return "Untitled";
  const max = front + back + 3;
  if (name.length <= max) return name;
  const start = name.slice(0, front);
  const end = name.slice(name.length - back);
  return `${start}...${end}`;
}
