# Chrome Web Store submission notes

Everything needed for the listing, plus the three things you should decide before you hit submit.

---

## 1. Decide these first

### a. The name contains a trademark

The extension was originally called *LinkedIn Hover Translate*. Chrome Web Store policy prohibits names that imply affiliation with a trademark holder, and a name that **starts** with another company's mark is the usual rejection trigger. It has been renamed to:

> **Hover Translate for LinkedIn**

The `X for Y` form is the pattern Google's own guidance points to, and it is what most LinkedIn-adjacent extensions ship under. It is still not risk-free — LinkedIn (Microsoft) can file a takedown at any time. If you want zero exposure, pick a standalone brand name (e.g. *HoverLingo*) and mention LinkedIn only in the description body.

The icon also uses LinkedIn's blue (`#0A66C2`). Combined with the name it leans toward implied affiliation. Consider recoloring to a neutral hue — regenerate with the script and change the one hex value.

### b. The translation endpoint is unofficial

`translate.googleapis.com/translate_a/single?client=gtx` is an undocumented internal endpoint. It has no SLA, is not covered by any Terms of Service you can point at, and can be rate-limited or shut off without warning. Reviewers rarely catch it, but:

- If it breaks, every user's extension silently stops working.
- Distributing a product that depends on it is a business risk, not just a technical one.

The supported alternative is the **Google Cloud Translation API** with a user-supplied API key (add a key field to the popup, send it from `background.js`). That is more work and pushes billing onto the user, but it is the only version that is safe to charge for or rely on long-term.

### c. Optional: localize the listing

The popup UI, the manifest description, and the README are all English now. The in-page panel and bubble still follow whatever target language the user picks, which is the behaviour you want.

If you later want a Korean store listing too, add `_locales`: set `default_locale`, move the name/description/popup strings into `_locales/en/messages.json` and `_locales/ko/messages.json`, and reference them as `__MSG_key__`.

---

## 2. Listing copy

**Name** (45 char max)

```
Hover Translate for LinkedIn
```

**Short description** (132 char max — currently 117)

```
Auto-translates the text you hover over on any LinkedIn page and shows it in a bubble at the top-right of your cursor.
```

**Detailed description**

```
Read LinkedIn in any language without leaving the page.

Hover over a post, a comment, a headline, a message — anything — and the translation appears in a small bubble next to your cursor. No selecting, no right-clicking, no new tabs.

HOW IT WORKS
• Rest your cursor on text for 0.2 seconds and the translation appears
• Translates the paragraph under your cursor; long paragraphs fall back to the sentence you are pointing at
• The bubble never blocks clicks and disappears the moment you scroll, click, or press Esc
• If the text is already in your language, nothing pops up

PICK A LANGUAGE IN ONE CLICK
A small tab sits on the left edge of the screen showing your current language. Click it, choose from 17 languages, and it applies instantly. The interface text switches to the language you picked, including right-to-left support for Arabic and Hebrew.

TUNE IT
Open the toolbar popup to change the hover delay, set how long a paragraph can get before it falls back to sentence mode, or switch the extension off entirely.

PRIVACY
No accounts, no analytics, no tracking. The only thing that leaves your browser is the text you hover over, sent to Google's translation service to be translated. The extension runs on linkedin.com and nowhere else.

Languages: Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hebrew, Hindi, Thai, Vietnamese, Indonesian
```

**Category:** Productivity
**Language:** English (add Korean if you do `_locales`)

---

## 3. Permission justifications

Paste these into the *Privacy practices* tab. Each one must be filled in or the submission is blocked.

| Field | Text |
| --- | --- |
| **Single purpose** | Translates the text a user hovers over on LinkedIn and displays it in a bubble beside the cursor. |
| **`storage`** | Stores the user's own settings — target language, hover delay, maximum paragraph length, and the on/off toggle. No user content is stored. |
| **Host permission `translate.googleapis.com`** | The hovered text is sent to Google's translation endpoint to be translated. The request is made from the service worker because a content-script fetch would be blocked by CORS. |
| **Host permission `linkedin.com`** (content script) | The extension must read the text under the cursor and inject the translation bubble into the page. This is the extension's core function and it runs on no other site. |
| **Remote code** | No. All code is bundled in the package; nothing is fetched or evaluated at runtime. |

**Data usage checkboxes**

- ☑ **Website content** — collected? *Yes, transmitted.* The hovered text is sent to the translation service.
- ☐ Personally identifiable information, health, financial, authentication, personal communications, location, web history, user activity — none.
- ☑ I do not sell or transfer user data to third parties outside of approved use cases
- ☑ I do not use or transfer user data for purposes unrelated to the item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL** — required, because website content is transmitted. Served from GitHub Pages out of `docs/`:

```
https://juunary.github.io/Hover-Translate-for-LinkedIn/privacy.html
```

Enable it once at **Settings -> Pages -> Source: Deploy from a branch -> main / /docs**. The listing's optional *Website* field can point at `https://juunary.github.io/Hover-Translate-for-LinkedIn/`.

---

## 4. Assets

| Asset | Spec | Status |
| --- | --- | --- |
| Store icon | 128×128 PNG | ✅ `icons/icon128.png` |
| Screenshots | 1280×800 or 640×400, 1–5 of them | ✅ `store-assets/screenshot-1..3.png` |
| Small promo tile | 440×280 PNG | Optional |
| Marquee promo tile | 1400×560 PNG | Optional |

The three screenshots show, in order: the bubble over a post, the left-edge language panel open, and the toolbar popup.

**Where they come from.** They are captured by `tools/capture.ps1`, which runs headless Chrome at exactly 1280×800 against `tools/screenshot-page.html`. That page loads the *real* `content.js` and `langs.js`, so every pixel of the bubble, the panel, and the popup is the shipping UI. What is staged is the page underneath: a generic professional feed, not linkedin.com, with translations pre-fetched from the real endpoint so the capture does not depend on the network.

This was deliberate. Loading an unpacked extension cannot be automated (it needs a native file dialog), and screenshotting a real logged-in LinkedIn feed would put other people's posts and your own connections into a public store listing. Copying LinkedIn's actual page design into promotional images is also a trademark exposure you do not want on top of the naming question in section 1a.

If you would rather ship captures of the real site, load the unpacked extension yourself, open your feed, and grab the same three states at 1280×800. Swap the files in `store-assets/` — nothing else needs to change.

Regenerate after any UI change:

```bash
powershell -ExecutionPolicy Bypass -File tools\capture.ps1
```

---

## 5. Packaging

```bash
powershell -ExecutionPolicy Bypass -File package.ps1
```

This writes `dist/hover-translate-for-linkedin-1.0.0.zip` containing only the runtime files — `manifest.json` sits at the root of the archive, which is what the store requires. Docs, the 512 px master icon, and the packaging script itself are excluded.

## 6. Submitting

1. Register at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole) — one-time **$5** developer fee.
2. **New item** → upload the ZIP.
3. Fill in the *Store listing* tab from section 2, the *Privacy practices* tab from section 3.
4. Set visibility (Public / Unlisted / Private). **Unlisted is a good first release** — the link works, but it stays out of search while you shake out bugs.
5. Submit. Review typically takes a few days; extensions requesting host permissions sometimes take longer.

## 7. After it is live

- Bump `version` in `manifest.json` for every update — the store rejects re-uploads of the same version.
- Watch for the Google endpoint breaking; that is the most likely cause of a sudden wave of bad reviews.
- If LinkedIn changes its DOM, the paragraph-detection heuristic in `content.js` (`nearestBlock`) is the first place to look.
