# Blue

Blue is a minimalist text editor inspired by the Turbo Pascal and Turbo Basic editors of the late 1990's.


## Configuration

Blue reads configuration from a `blue.json` file in the app directory. The options are:

- `wordWrap` (boolean): `true` to wrap long lines (default), `false` to keep long lines on a single row with horizontal scrolling.
- `background` (string): background color for the editor (default `#0000aa`, Turbo Pascal blue).
- `foreground` (string): text/caret color (default `#ffff55`, Turbo Pascal yellow).
- `highlight` (string): accent/highlight color (default `#ffffff`, the white foreground).
- 'bright' (string): bright color (default '', a bright green indicator).
- `dark` (string): gray accent color (default `#888888`).

Example `blue.json`:

```json
{
  "wordWrap": true,
  "background": "#0000aa",
  "foreground": "#ffff55",
  "highlight": "#ffffff",
  "bright": "#00ff00",
  "dark": "#888888"
}
```


## Visual Design

- There are several standard colors: forground (#ffff55), background (#0000aa), highlight (#ffffff), bright (#00ff00), and dark (#888888).
- The editor fills the whole browser view space.
- There is a horizontal Divider Line across the top and bottom of the editor in the highlight color.
- Status Indicator, Title, and Position Indicator are all overlayed on top of the Status Line, centered vertically.
- Centered veritcally on the top line, 2em from the left, is the Status Indicator, which is "[ ]" by default.
- The Status Indicator ("[ ]") changes to "[*]" when the current file has been edited.
- The brackets in the status indicator are dark but the "*" is bright.
- The title of the file is centered vertically and horizontally on the top-line and defaults to "untitled".
- The Position Indicator is centered vertically on the bottom line and is 2em from the left.
- The Position Indicator is formatted as "3:10" (row:column).
- The background is blue ("background" in the css and #0000aa).
- The foreground is yellow ("foreground" in the css and #ffff55).
- The top and bottom lines are white ("highlight" in the css and #ffffff).
- The Position Indicator is gray ("dark" in the css and #888888).
- The tab key should indent a line and subsequent lines should be indented to the same level.


## Keyboard Shortcuts

- F1 → Toggle the help
- F2 → Rename current file
- Cmd/Ctrl+N → New file
- Cmd/Ctrl+O → Open file
- Cmd/Ctrl+S → Save
- Cmd/Ctrl+Shift+S → Save As
- Cmd/Ctrl+K, S → Save (chord)
- Cmd/Ctrl+K, O → Open (chord)
- Tab / Shift+Tab → Indent / Outdent
- Enter → Auto-indent new line

- Save As uses the OS file picker via the File System Access API when available; otherwise it falls back to a download prompt.


## Help Menu

The help menu is a modal. It shows each of the keyboard shortcuts. Clicking on any shortcut runs that shortcuts action. This allows mobile users to open a menu by clicking on the edit indicator and then perform any action with a click instead of a keystroke. Designed mainly for systems without keyboards, like smart phones.

When the help modal is opened the background is darkened.

The modal has a title of "HELP" then lists each of the keyboard shortcuts offered by the program.

At the bottom it says "Press F1 or Esc to close". Clicking or tapping outside of the modal also closes.


## Mouse / Finger Navigation

Blue opens the help modal when you click on the Status Indicator ([*]).

Clicking any of the keyboard shortcuts will close the modal and run that action.


## PWA

Blue has a manifest so that it can run as a PWA.


## Built to Last

Blue is built to last. It is created with pure HTML, JavaScript, and CSS. It has no third party dependencies.

All code is written in distinct functions. Functions remain as small as possible.

Use blue/green test driven development and test every function.

Write unit tests using a dependency-free browser test harness. Requirements:

- Single tests.html file I can open with file:// — no Node, no build step, no npm packages.
- Inline <script type="module"> that defines test(name, fn), assert(cond, msg), and assertEq(a, b) on globalThis, then imports the test files.
- Render results as a list: green "ok — name" on pass, red "FAIL — name: message" on fail. Set document.title to a pass/fail summary.
- Support async test functions and catch thrown errors per-test (one failure shouldn't stop the run).
- Tests live in tests/*.test.js and may touch document/window directly.
- Keep the harness under 40 lines.
