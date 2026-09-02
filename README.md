# Hover Translate for LinkedIn

A Chrome extension that auto-translates the text you hover over on any LinkedIn page and shows it in a bubble at the top-right of your cursor.

## How it works

- Translation starts when the cursor rests on text for **0.2 s** (adjustable in the popup).
- It translates the whole paragraph under the cursor. If the paragraph is long (over 600 characters by default), only the **sentence** under the cursor is translated.
- The bubble stays put while you move the cursor within the same paragraph.
- If the source text is already in your target language, no bubble is shown.
- The bubble uses `pointer-events: none`, so it never swallows clicks.
- It disappears immediately on scroll, click, `Esc`, or when the window loses focus.
- Translation uses the public Google Translate endpoint (`translate.googleapis.com`) — no API key required. Up to 500 recent results are cached in memory.

## Choosing a language

A tab (🌐 + the current language code) is pinned to the **middle of the left edge** of the screen. Click it to open the language list; picking one applies immediately.

- The panel heading (`Translate to`), the bubble's status text (`Translating…`, `Translation failed`), and the tab tooltip **all switch to the selected language.** These strings live under `ui` in `langs.js`.
- Right-to-left languages such as Arabic and Hebrew are rendered with `dir="rtl"`.
- The tab is semi-transparent at rest and becomes opaque on hover.
- When the extension is disabled, the tab is dimmed further.
- Click outside the list or press `Esc` to close it.
- After changing the language, the next hover translates into the new one.

## Install (unpacked)

1. Open `chrome://extensions` in Chrome
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the folder you cloned this repository into
5. Reload any LinkedIn tab that is already open

## Settings

The target language can be changed straight from the left-edge panel; everything else lives in the toolbar popup. Both share the same storage.

| Setting | Default | Description |
| --- | --- | --- |
| Enabled | on | Global on/off |
| Target language | Korean | Language to translate into |
| Delay | 200 ms | How long the cursor must rest before translating |
| Max paragraph length | 600 | Longer paragraphs fall back to sentence-level translation |

## Files

| File | Role |
| --- | --- |
| `manifest.json` | MV3 manifest |
| `content.js` | Text extraction under the cursor, bubble rendering, left-edge language panel |
| `langs.js` | Language list and UI strings (shared by the content script and the popup) |
| `background.js` | Translation API calls + cache (works around CORS) |
| `popup.html` / `popup.js` | Settings UI |
| `icons/` | Extension icons (16/32/48/128, plus a 512 master for the store listing) |
| `store-assets/` | 1280×800 store screenshots |
| `tools/` | Screenshot stage page and the headless-Chrome capture script |
| `package.ps1` | Builds the store upload ZIP into `dist/` |
| `STORE.md` | Chrome Web Store submission notes |
| `PRIVACY.md` | Privacy policy to publish alongside the listing |

## Notes

- The public Google Translate endpoint is unofficial. It can rate-limit or break without notice, and a shorter delay means more requests. See `STORE.md` before publishing.
- Do not add files whose names start with `_` to the extension root — Chrome reserves those and refuses to load the extension.
