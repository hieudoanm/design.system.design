# Styling

## Design tokens

- All colour, type and spacing values come from the `@theme` block in `src/app/globals.css`.
- Never hard-code a hex value in a component.

| Token    | Value     | Meaning                     |
| -------- | --------- | --------------------------- |
| `paper`  | `#f2f4f1` | page background             |
| `ink`    | `#111827` | text, the mark's background |
| `mute`   | `#566070` | secondary text              |
| `rule`   | `#cfd6df` | borders and the major grid  |
| `marker` | `#c2255c` | Design System               |
| `cobalt` | `#1f4fd8` | System Design               |

- The chart palette is a separate block of six categorical colours.
- They are used in a fixed order, so a series keeps its colour across every drawing.

| Token     | Value     | Meaning                   |
| --------- | --------- | ------------------------- |
| `chart-1` | `#1f4fd8` | cobalt, the first series  |
| `chart-2` | `#c2255c` | marker, the second series |
| `chart-3` | `#0f766e` | teal, the third series    |
| `chart-4` | `#b45309` | amber, the fourth series  |
| `chart-5` | `#6d28d9` | violet, the fifth series  |
| `chart-6` | `#475569` | slate, the sixth series   |

- The background is a graph paper.
- It is a 24px minor grid at 3% ink and a 120px major grid at 7% ink.
- Both are declared as four `linear-gradient` backgrounds on `body`.
- Dark mode is one attribute: `data-theme='dark'` on `<html>`.
- The dark block overrides the same token values, so components stay theme-blind.
- `src/lib/theme.ts` reads, applies and stores the choice (`localStorage`).
- `layout.tsx` sets the attribute before paint, so there is no flash.
- `ThemeToggle.tsx` is the footer switch.
- Shiki code blocks carry both palettes and switch with the same attribute.

## Assets

- `public/icons` holds the mark at every size a platform asks for.
- It is `icon.svg` plus PNGs at 16, 32, 48, 64, 96, 128, 152, 167, 180, 192, 256, 384 and 512.
- It also holds a multi-resolution `favicon.ico`.
- `public/images` holds `og.png` and `og.svg` — the same 1200×630 card.
- The SVG is the source.
- The card and the icon are generated from the tokens and the site's own typefaces, so they must match `globals.css`.
- If you change a colour or a typeface, regenerate them.
- The mark in the card's bottom-right corner is `public/icons/icon.svg` at 1.5× — a 96×96 tile.
- The pill is 72×24, centred (12px margins), split 25.5/21/25.5.
- Do not redraw it: scale the icon's own geometry.
- Otherwise the pill drifts off-centre and the tile reads as a plain dark square.
- They are wired up in the `metadata` export of `src/app/layout.tsx`: `icons`, `openGraph`, `twitter`, `manifest`, `alternates.canonical` and a `viewport` export for `themeColor`.
- Removing a file from `public/` without updating `layout.tsx` leaves a dangling reference.
