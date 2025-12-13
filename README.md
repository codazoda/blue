# Blue

Blue is a minimalist text editor inspired by the Turbo Pascal and Turbo Basic editors of the late 90's.

## Configuration

Blue reads configuration from a `blue.json` file in the app directory. Options:

- `wordWrap` (boolean): `true` to wrap long lines (default), `false` to keep long lines on a single row with horizontal scrolling.
- `background` (string): background color for the editor (default `#0000aa`, Turbo Pascal blue).
- `foreground` (string): text/caret color (default `#ffff55`, Turbo Pascal yellow).
- `highlight` (string): accent/highlight color (default `#ffffff`, the previous white foreground).
- `dark` (string): gray accent color (default `#444444`).

Example `blue.json`:

```json
{
  "wordWrap": true,
  "background": "#0000aa",
  "foreground": "#ffff55",
  "highlight": "#ffffff",
  "dark": "#444444"
}
```

## Shortcuts

- File → Save: `Cmd/Ctrl+S`
- File → Save As: `Cmd/Ctrl+Shift+S`
- File → Open: `Cmd/Ctrl+O`
- In the desktop build, these appear in the native File menu. Save As uses the OS file picker via the File System Access API when available; otherwise it falls back to a download prompt.

## Development

- Install prerequisites for Tauri 2 (Rust toolchain, npm, platform-specific deps).
- Install JS deps: `npm install`
- Run the desktop app in dev mode: `npm run tauri dev`
- For a browser-only preview (no Tauri APIs): `npm run dev` and open the shown Vite URL.

Joel was here.