# Privacy Policy — Hover Translate for LinkedIn

_Last updated: 2026-08-10_

## What the extension does

Hover Translate for LinkedIn translates the text you hover over on LinkedIn pages and displays the result in a bubble next to your cursor.

## What is collected

**Nothing is collected by the developer.** This extension has no server, no analytics, no telemetry, and no advertising.

## What is transmitted, and to whom

When you hover over text on a LinkedIn page, the extension sends **that text only** to Google's public translation endpoint (`https://translate.googleapis.com`) in order to translate it. Nothing else is sent.

- The request contains the hovered text and your chosen target language.
- No account identifiers, cookies, or credentials are attached (requests are made with `credentials: "omit"`).
- Google's handling of this request is governed by [Google's Privacy Policy](https://policies.google.com/privacy).

Do not hover over confidential text you would not want sent to a third-party translation service.

## What is stored

Your preferences — enabled/disabled, target language, delay, and maximum paragraph length — are stored using `chrome.storage.sync`. They sync through your own Chrome profile and are never sent to the developer.

Translated results are cached in memory only, for at most 500 recent entries, and are discarded when the browser closes.

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Save your settings |
| `https://translate.googleapis.com/*` | Send hovered text for translation |
| Content script on `linkedin.com` | Detect the text under your cursor and draw the bubble |

The extension runs only on `linkedin.com`. It cannot read any other site.

## Data sale and transfer

No data is sold, rented, or transferred to any third party, other than the translation request described above.

## Contact

Open an issue at [https://github.com/Juunary/Hover-Translate-for-LinkedIn/issues](https://github.com/Juunary/Hover-Translate-for-LinkedIn/issues).
