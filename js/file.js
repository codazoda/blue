import { state } from "./state.js";
import { md5 } from "./md5.js";
import { updateStatus, updateCursorPosition } from "./status.js";

const editor = document.getElementById("editor");
const fileInput = document.getElementById("fileInput");

export function initFile() {
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      editor.value = e.target.result || "";
      state.currentFilename = file.name || "untitled.txt";
      state.fileHandle = null;
      state.baselineHash = md5(editor.value);
      state.isDirty = false;
      updateStatus();

      editor.selectionStart = 0;
      editor.selectionEnd = 0;
      editor.focus();
      updateCursorPosition();
    };
    reader.readAsText(file);

    fileInput.value = "";
  });
}

export function newFile() {
  editor.value = "";
  state.currentFilename = "";
  state.fileHandle = null;
  state.baselineHash = md5(editor.value);
  state.isDirty = false;
  updateStatus();
  editor.selectionStart = 0;
  editor.selectionEnd = 0;
  editor.focus();
  updateCursorPosition();
}

export function openFileDialog() {
  fileInput.click();
}

export function renameFile() {
  const nextName = prompt("Rename file", state.currentFilename || "untitled.txt");
  if (nextName === null) return;
  const trimmed = nextName.trim();
  if (!trimmed) return;
  state.currentFilename = trimmed;
  state.fileHandle = null;
  updateStatus();
  editor.focus();
}

export async function saveFile() {
  if (state.fileHandle && state.fileHandle.createWritable) {
    try {
      await writeToHandle(state.fileHandle);
      state.baselineHash = md5(editor.value);
      state.isDirty = false;
      updateStatus();
      return;
    } catch (_err) {
      // fall back to download if write fails
    }
  }

  downloadFile(state.currentFilename || "untitled.txt");
  state.baselineHash = md5(editor.value);
  state.isDirty = false;
  updateStatus();
}

export async function saveFileAs() {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: state.currentFilename || "untitled.txt",
        types: [
          {
            description: "Text",
            accept: { "text/plain": [".txt", ".md", ".log", ".text"] },
          },
        ],
      });
      state.fileHandle = handle;
      state.currentFilename = handle.name || state.currentFilename;
      await writeToHandle(handle);
      state.baselineHash = md5(editor.value);
      state.isDirty = false;
      updateStatus();
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      // fall through to browser-style save
    }
  }

  const nextName = prompt("Save as", state.currentFilename || "untitled.txt");
  if (nextName === null) return;
  const trimmed = nextName.trim();
  if (!trimmed) return;
  state.currentFilename = trimmed;
  state.fileHandle = null;
  downloadFile(trimmed);
  state.baselineHash = md5(editor.value);
  state.isDirty = false;
  updateStatus();
}

async function writeToHandle(handle) {
  const writable = await handle.createWritable();
  await writable.write(editor.value);
  await writable.close();
}

function downloadFile(name) {
  const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = name || "untitled.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
