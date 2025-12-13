# Blue

Blue is a minimalist text editor inspired by the Turbo Pascal and Turbo Basic editors of the late 90's.

## Configuration

Blue reads configuration from a `blue.json` file in the app directory. At the moment the only option is:

- `wordWrap` (boolean): `true` to wrap long lines (default), `false` to keep long lines on a single row with horizontal scrolling.

Example `blue.json`:

```json
{
  "wordWrap": true
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
