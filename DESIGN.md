---
name: Design fingerprint
description: One rounded glass frame over a full-bleed photo; a thin serif title with one accent word; charcoal for the current thing and the key facts.
colors:
  surface-page: "#E7E2DC"
  surface-frame: "rgba(248, 246, 243, 0.62)"
  surface-glass: "rgba(255, 255, 255, 0.58)"
  surface-glass-strong: "rgba(255, 255, 255, 0.82)"
  surface-card: "rgba(255, 255, 255, 0.93)"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F4F1ED"
  surface-inverse: "#1D1D1F"
  scrim: "#F6F3EF"
  ink: "#1D1D1F"
  ink-secondary: "#423E3A"
  ink-muted: "#6B655F"
  ink-on-inverse: "#FFFFFF"
  edge-control: "#86807A"
  hairline: "rgba(29, 29, 31, 0.12)"
  danger: "#B42318"
  danger-soft: "#FDECEA"
  accent: "#527752"
  accent-ink: "#FFFFFF"
  accent-text: "#3D5A3E"
  accent-soft: "#D8EDD8"
  accent-on-inverse: "#759475"
typography:
  display-xl:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(42px, 5.8vw, 86px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.018em"
  body-s:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  frame: "34px"
  card: "28px"
  panel: "20px"
  pill: "999px"
---

# Design System: Design fingerprint

The shared fingerprint for Creative-Archive, Life-Manager, Notes-Archive and Rues-Cooking-Hub (Rues-Arcade is out). Direction: `DECISION.md`. Proof: `specimen/`. Every token named here is in `tokens.css`, which wins over any doc.

> **Exact values, snippets, every token, the primitives, the worst-case data and the icon spec are in `DESIGN-reference.md`.** Read it before you write markup or pick a value. This file holds the rules and stays small enough for `impeccable context` to inline it (`tests/design-budget.test.mjs`).

## Overview

**Creative North Star: "The Frame over the Photo"**

One rounded glass frame over a full-bleed photo. Type sits on the photo: one thin Gilda Display title with one accent word, under a tracked kicker. Chrome is glass; reading sits on solid cards. Charcoal marks the current thing and the key facts. Colour comes from the photo plus one accent. Working tools (Operate mode): ambition shows as precision.

### The composition

- **Backdrop:** the photo runs on behind the frame to the screen edge, blurred and veiled (`.app[data-photo]`). Notes: `.app[data-backdrop="field"]`, frame on `--surface-frame-strong`.
- **Frame:** one glass frame (`.frame`), centred, photo on every side.
- **Stage:** the photo again, sharp, from the bar to the head (`figure.stage`), running under the body so the first cards overlap it. `--scrim-text` sits under every line of type.
- **Head on the photo:** kicker, title, lede, seg bar, ruled facts (`.screen-head`). **Body:** solid cards (`.screen-body[data-settle]`).
- **Widths:** wide ≥1100, tablet 768–1099, phone <768 px. Tablet: the nav gets its own row below 1024; 1024–1099 stays one row, wordmark hidden. Phone: the rail turns horizontal, the seg bar stacks.
- Light theme, except the night stage of an app with worlds (below); components use roles, never hues.

### Worlds: the night stage

An app with worlds (Creative's Music, Animanga, Books, Fashion) sets `.app[data-world="…"][data-stage="night"]` on a world's screens; Home sets neither and stays light.

- **Night and glow:** each world has a night (`--world-night`, `-raised`, `-hover`) and a glow (`--world-glow`). The night replaces charcoal everywhere in the world (current pill, primary pill, key-facts and rating cards); the glow is `--accent-on-inverse` there and the accent word on the night. The app's accent stays for everything on light.
- **The banner:** the stage photo under the world's veil, from the left on wide, a feathered plate behind the lead below 1100 px with the photo clear above. Title, kicker and lede turn light; a primary pill on the night is white with night ink; chrome is strong glass. No hero photo: a flat night band behind bar and head.

**The Night Scrim Rule.** On the night stage every scrim stop becomes the world's veil (`--world-veil-strong`, `--world-veil`, `-soft`, `-clear`). `--world-veil` is the floor under every line of type, checked against a white pixel. Each world sets its own strength: deep for a dark photo, near the floor for a light one, so it stays bright, not murky.

### Signature moves

A screen without all four is not in the family.

1. **Frame over photo:** `.app[data-photo] > .frame > figure.stage`; the photo is never boxed in a card.
2. **The accent title:** `ul.kicker`, then `<h1>… <em class="accent-word">word</em></h1>`, one per screen.
3. **The charcoal pill:** the current item (`[aria-current]`, `[aria-pressed="true"]`) is `--surface-inverse` (a world's night in a world) and glides (`[data-pill]`); the primary action is the dark arrow pill (`.btn.primary.arrow`).
4. **One charcoal key-facts card:** `[data-surface="inverse"]` on one `.card` or `ul.screen-facts`. Notes has none.

## Colors

- **Surfaces:** `--surface-frame`; `--surface-glass` (chrome on frame or scrim), `--surface-glass-strong` (chrome on bare photo); `--surface-card` (reading), `--surface-raised` (fields, menus), `--surface-sunken` (rows in a card); `--surface-inverse` (charcoal); `--scrim-text` (floor under type on a photo).
- **Ink:** `--ink`, `--ink-secondary`, `--ink-muted` (on solid only), `--ink-on-inverse`.
- **Edges and states:** `--edge-control` (3:1 boundary); `--hairline`, `--rim` (decorative); `--danger`, `--danger-soft`.

### Accent: one per app

`<html data-accent="…">` swaps the accent roles (`--accent`, `--accent-ink`, `--accent-text`, `--accent-soft`, `--accent-on-inverse`); without it rosemary applies (a stale name falls back to it). Four muted accents, mapping confirmed at each app's gate 5: `rosemary` Rues-Cooking-Hub, `slate` Notes-Archive, `heather` Creative-Archive, `lagoon` Life-Manager.

**The One Accent Rule.** One accent per app, from these four. No orange, ember or amber app accent (Rue, round 1).

**The Aspect Colour Note.** Life's `--aspect-ochre` and `--aspect-tangerine` (orange) are category colours, not accents: the no-orange/amber rule covers app accents only.

**The Colour from the Photo Rule.** The UI adds no colour beyond the accent. Content palettes (Notes' text colours, syntax, aspects) never stand in for the accent and never carry a state alone.

**The Roles not Hues Rule.** Components reference role tokens only (`check-slop` fails on colour literals).

## Typography

Gilda Display (`--font-display`, one weight) for the title and big figures; DM Sans (`--font-ui`) for everything else; `--font-mono` for code.

- **Gilda roles:** `display-xl`, `display-l`, `display-m`, `display-s`, `figure`.
- **DM Sans roles:** `title`, `body`, `body-s` (UI default), `label`, `caption`, `kicker`, `overline`, `brand`.

**The One Weight Rule.** Gilda Display is never bold, italic or reweighted (`font-synthesis: none`).

**The Accent Word Rule.** A title carries one accent word, `<em class="accent-word">`. On count titles the accent may cover the whole count phrase ("16 titles", "7 / 18 done"). No accent on list items, labels, card heads or buttons.

**The Kicker Rule.** Kicker parts are sentence case; CSS draws the em-dashes and the uppercase.

## Layout

Frame rows `bar / rail / head / body`, an optional rail column; a 4 px spacing grid (`--space-*`). Every `layout.css` size is a token; media queries repeat the widths.

- **Phone dock:** below 1024 px the nav is a floating `.dock` (icon over label, icon only below 360; current tab a charcoal pill, round add button). `data-hidden` while typing, never removed; `data-specimen` shows it at any width.
- **Scrolled bar:** from 1100 px `.app-bar[data-scrolled]` is a sticky, solid compact capsule; set the attribute from an IntersectionObserver sentinel, not a scroll listener.
- **Detail actions:** `.detail-actions` is a status label ("Saved") plus one ··· button opening a `Menu`; Delete sits in it as a danger item.

## Elevation & Depth

The photo gives depth; glass (`--glass-filter`, `--shadow-rim`), `--elevation-card` and `--elevation-frame` carry it.

**The Glass for Chrome Rule.** Glass holds controls, never running text or lists; over bare photo use `--surface-glass-strong`.

**The One Charcoal Card Rule.** One `[data-surface="inverse"]` card per screen, `--shadow-lift`, no glass, holding the key facts.

## Shapes

Pills for every control (`--radius-control`), big radii for surfaces, circles (`--radius-round`) for icon buttons, marks and thumbs.

## Components

`layout.css` is the shell; primitives come from `primitives/`. At most one dark arrow pill per view. Danger has a trash icon and is never primary. Icon buttons have an accessible name. Numbers are typed text, never `type="number"`; no slider or spin arrows. Only a rating may carry round −/+ buttons (step 0.25) beside its typed figure. A `Menu` primitive exists; the active listbox option is the charcoal pill, like a checked menu item.

## Do's and Don'ts

### Do:
- **Do** start every screen from the skeleton in `DESIGN-reference.md`.
- **Do** keep one display title, one accent (word or count phrase) and one charcoal card per screen.
- **Do** mark dark surfaces `data-surface="inverse"`, solid cards with buttons `data-surface="solid"`.
- **Do** check new colour pairs (`contrast-pairs.json`, `check-contrast.mjs`), night pairs in every world.
- **Do** render every screen with the worst-case data at 375, 768 and 1280.

### Don't:
- **Don't** box the main photo in a card or replace a missing image with a gradient.
- **Don't** put text on plain glass over a busy photo.
- **Don't** use orange, ember or amber as an app accent, or a content colour as the accent.
- **Don't** make Delete the primary button, or reveal anything on hover only.

### Kept out

`banned.md` is the full list; `check-slop` enforces it in `proof`.

## Motion

Motion confirms and orients, then gets out of the way. Only `transform`, `opacity` and `clip-path` move, only through the four `motion.css` hooks; a control without a hook stays still. Never animate `backdrop-filter`, `filter` or layout; no `transition: all`.

1. **Press:** `data-press` scales; `data-nudge` moves the arrow on hover.
2. **The pill glides:** `data-pill`; keyboard activation jumps.
3. **The cards settle:** `data-settle`, on a full page load only.
4. **The rating is confirmed:** `data-confirm-line` draws an accent line under a changed rating.

Instant on purpose: menus, switches, high-frequency numbers, Notes. Hover changes colour only. Reduced motion keeps colour and opacity only.

## Accessibility

**WCAG 2.2 AA** in every app. Text ≥4.5:1 and UI ≥3:1 against the worst pixel; targets `--target` (24 px, 44 px on touch); focus always visible; never colour alone; one `h1`; zoom never locked. Details: `DESIGN-reference.md`.

## Voice and copy

English, UK spelling, plain and short, sentence case. A calm tool: no exclamation marks, no "Oops", no jokes in errors.

- **Buttons:** verb plus object: "Add recipe", "Delete todo". No "Submit", "OK" or "Yes".
- **Errors:** what failed — what to do: "Couldn't save — try again". Specific causes stand alone: "That file isn't an image".
- **Empty states:** "No albums yet" / "Add the first one to start the list."
- **Toasts:** past tense, optional undo: "Saved" + "Undo".
- **Confirmations:** "Delete this album?", the consequence, "Cancel" (focused), the verb as `danger`.
- **Numbers and dates:** "1,093", "400 g", "8.75 / 10", "01 / 16", "Thu 8 Oct", "14:05", "9 – 15 November".

Full rules: `DESIGN-reference.md`.

## How apps consume it

- **Vendored, never edited.** `scripts/sync.sh <app-path>` copies `sync.manifest` (with `.gitleaks.toml`, which allowlists only `fingerprint.lock`); `check-drift` in `proof` fails on any edit. Set `<html lang="en" data-accent="…">`.
- **Requests go upstream** to Design-System `requests.md`; `VERSION` bumps, `sync.sh` runs per app.
- **Primitives are copied in** (`--primitive <name>`); the app owns the copy. Good patterns are promoted here, never copied app to app.

## Known limits

- Notes' deep tree levels truncate past the indent cap; its chevron is 24 × 28 px on touch (settle at the Notes gate).
- Rating field Home / End move the cursor (confirm at contract sign-off).
- Recipe photos are 960 px wide and soft at full width.
- `review-animations` per app is gate 7; only Rue starts it.
