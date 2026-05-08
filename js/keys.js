import { updateCursorPosition } from "./status.js";

const INDENT = "\t";
const editor = document.getElementById("editor");

export function handleTabKey(event) {
  event.preventDefault();

  const { selectionStart, selectionEnd, value } = editor;

  if (selectionStart === selectionEnd) {
    if (event.shiftKey) {
      outdentCaret(selectionStart, value);
    } else {
      insertIndent(selectionStart, value);
    }
    return;
  }

  adjustBlockIndent(event.shiftKey, selectionStart, selectionEnd, value);
}

export function handleEnterKey(event) {
  event.preventDefault();
  const { selectionStart, selectionEnd, value } = editor;
  const atEnd = selectionEnd === value.length;

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const currentLine = value.slice(lineStart, selectionStart);
  const indentMatch = currentLine.match(/^\t*/);
  const currentIndent = indentMatch ? indentMatch[0] : "";

  const insertion = "\n" + currentIndent;
  const newValue =
    value.slice(0, selectionStart) +
    insertion +
    value.slice(selectionEnd);
  const newPos = selectionStart + insertion.length;

  editor.value = newValue;
  editor.setSelectionRange(newPos, newPos);
  triggerInputSync();
  if (atEnd) {
    editor.scrollTop = editor.scrollHeight;
  }
  updateCursorPosition();
}

function insertIndent(pos, value) {
  const newValue = value.slice(0, pos) + INDENT + value.slice(pos);
  const newPos = pos + INDENT.length;
  editor.value = newValue;
  editor.setSelectionRange(newPos, newPos);
  triggerInputSync();
}

function outdentCaret(pos, value) {
  const lookStart = Math.max(0, pos - INDENT.length);
  const chunk = value.slice(lookStart, pos);
  const matchTab = chunk === "\t";
  const matchSpaces = chunk.match(/ {1,4}$/);
  const removeCount = matchTab ? 1 : matchSpaces ? matchSpaces[0].length : 0;
  if (!removeCount) return;

  const newValue =
    value.slice(0, pos - removeCount) + value.slice(pos);
  const newPos = pos - removeCount;
  editor.value = newValue;
  editor.setSelectionRange(newPos, newPos);
  triggerInputSync();
}

function adjustBlockIndent(isOutdent, start, end, value) {
  const startLine = value.lastIndexOf("\n", start - 1) + 1;
  const endLineBreak = value.indexOf("\n", end);
  const endLine = endLineBreak === -1 ? value.length : endLineBreak;
  const lines = value.slice(startLine, endLine).split("\n");

  if (!isOutdent) {
    const indented = lines.map((line) => INDENT + line);
    const newValue =
      value.slice(0, startLine) + indented.join("\n") + value.slice(endLine);
    const deltaTotal = INDENT.length * lines.length;
    editor.value = newValue;
    editor.setSelectionRange(start + INDENT.length, end + deltaTotal);
    triggerInputSync();
    return;
  }

  let removedTotal = 0;
  let removedStart = 0;
  const outdented = lines.map((line, idx) => {
    const leading = line.match(/^[ \t]*/)[0];
    const removeCount = leading.startsWith("\t")
      ? 1
      : Math.min(4, leading.length);
    if (idx === 0) removedStart = removeCount;
    removedTotal += removeCount;
    return line.slice(removeCount);
  });

  const newValue =
    value.slice(0, startLine) + outdented.join("\n") + value.slice(endLine);
  const newStart = Math.max(start - removedStart, startLine);
  const newEnd = Math.max(newStart, end - removedTotal);
  editor.value = newValue;
  editor.setSelectionRange(newStart, newEnd);
  triggerInputSync();
}

function triggerInputSync() {
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}
