# Assets

Everything here is either the app's own artwork or a badge from Apple.

- `icon-light.png`, `icon-dark.png` — the app icon, drawn by
  `SEND?/scripts/make_icon.py`. Regenerate from there rather than editing.
  Both variants are the same file today: the icon is a violet gradient that
  reads correctly on either ground, so a separate dark version would be the
  same picture under a different name. Split them if that stops being true.
- `apple-touch-icon.png` — the same icon at 180pt.
- `app-store-black.svg`, `app-store-white.svg` — Apple's badge, black for
  light backgrounds and white for dark. Unused until the app ships; a badge
  that links nowhere is worse than no badge.
- `home.png`, `verdict.png`, `phrases.png`, `rewrites.png` — framed
  screenshots. Do not frame them by hand: put raw captures in `raw/` and run
  `./tools/frame-shots.sh`.

## Still needed

| File | What it should show | Size |
|---|---|---|
| `og-image.png` | Social preview: icon, wordmark, one line | 1200 × 630 |
