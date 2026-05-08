import { md5 } from "./md5.js";
import { state } from "./state.js";
import { loadConfig, applyConfig } from "./config.js";
import {
  updateStatus,
  updateCursorPosition,
  updateDirtyStateFromContent,
} from "./status.js";
import { handleTabKey, handleEnterKey } from "./keys.js";
import {
  initFile,
  newFile,
  openFileDialog,
  saveFile,
  saveFileAs,
  renameFile,
} from "./file.js";
import { isHelpOpen, closeHelp, toggleHelp, initHelp } from "./help.js";

const editor = document.getElementById("editor");

loadConfig().then((config) => applyConfig(editor, config));

editor.value = "";
editor.selectionStart = 0;
editor.selectionEnd = 0;
state.baselineHash = md5(editor.value);
updateStatus();

editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    handleTabKey(event);
  } else if (event.key === "Enter") {
    handleEnterKey(event);
  }
});

editor.addEventListener("input", () => {
  updateDirtyStateFromContent();
  updateCursorPosition();
});
["click", "keyup", "mouseup", "focus"].forEach((evt) => {
  editor.addEventListener(evt, updateCursorPosition);
});

let awaitingChord = false;
let chordTimer = null;

window.addEventListener("keydown", (event) => {
  const modKey = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (modKey && key === "r") {
    event.preventDefault();
    return;
  }

  if (key === "f1") {
    event.preventDefault();
    toggleHelp();
    resetChord();
    return;
  }

  if (isHelpOpen() && key === "escape") {
    event.preventDefault();
    closeHelp();
    return;
  }

  if (key === "f2") {
    event.preventDefault();
    renameFile();
    resetChord();
    return;
  }

  if (modKey && key === "s") {
    event.preventDefault();
    if (event.shiftKey) {
      saveFileAs();
    } else {
      saveFile();
    }
    resetChord();
    return;
  }

  if (modKey && key === "n") {
    event.preventDefault();
    newFile();
    resetChord();
    return;
  }

  if (modKey && key === "o") {
    event.preventDefault();
    openFileDialog();
    resetChord();
    return;
  }

  if (awaitingChord) {
    if (key === "s") {
      event.preventDefault();
      resetChord();
      saveFile();
      return;
    }
    if (key === "o") {
      event.preventDefault();
      resetChord();
      openFileDialog();
      return;
    }
    resetChord();
    return;
  }

  if (modKey && key === "k") {
    event.preventDefault();
    awaitingChord = true;
    chordTimer = setTimeout(resetChord, 3000);
  }
});

function resetChord() {
  awaitingChord = false;
  if (chordTimer) {
    clearTimeout(chordTimer);
    chordTimer = null;
  }
}

initFile();
initHelp();

window.addEventListener("beforeunload", (event) => {
  if (!state.isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("load", () => {
  editor.focus();
  updateCursorPosition();
});
