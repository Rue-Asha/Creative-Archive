# Scope: ui-polish

Triage: feature — polish pass across design-system, motion, tracking, home, entries and layout. It resolves the user's
four complaints plus the full UI audit (audit.md); no schema change. Escalated from tweak because the user chose
"everything" (>5 S-items). Appetite: one long session.

## Problem
The owner finds the app unpolished: glows and fades have visible edges, font sizes are uneven, a text caret appears
in what looks like static text, and the card ↔ detail image morph stutters, especially on the way back. The audit
(audit.md, with Mobbin references in research-mobbin.md) found the causes plus ~14 more consistency defects.

## Flows
- Browse → open entry: list/shelf card → tap → cover morphs into the detail cover → detail.
- Back to list: detail → browser back / back control → cover morphs into the same card in the same shelf, at the same
  scroll position, with the list already visible.
- Log progress: card or detail → tap −/+ or tap the number → type → Enter/blur saves.
- Browse Home/domain pages: hero → shelves with glows → collections bento.
- Edit entry / settings / collections forms on phone (focus inputs without zoom).

## In scope
- **S1** The progress value ("3 / 28") is non-editable text by default: clicking/tapping it shows no caret, no text
  cursor and no keyboard until it switches to edit mode. Tap/click (or Enter/Space when focused) switches to an input
  with the value selected; Enter or blur saves through the existing save queue; Escape cancels. Same on cards and the
  detail page.
  - edges: invalid or empty input → revert to the old value, no save · value above total → clamp as today · −/+ keep
    working while not editing · the screen reader name stays "Episodes/Chapters/Pages … of …" · inside a card,
    tapping the number does not open the detail page · phone opens the numeric keyboard only in edit mode.
- **S2** Chrome text (nav, chips, counts, eyebrows, card overlays, buttons) shows the default cursor, never the I-beam.
  Prose (notes, descriptions) stays selectable.
  - edges: links and buttons keep the pointer cursor.
- **S3** Forward morph (card → detail): the cover keeps its rounded corners for the whole transition, starts from the
  un-hovered card (no tilt, no 1.05 zoom), carries the detail cover's shadow during the morph (no pop at the end), and
  does not stretch between different aspect ratios (4/5 card → 2/3 detail).
  - edges: reduced motion → no morph (as today) · browser without View Transitions → plain navigation.
- **S4** Back morph (detail → list): the cover lands on the card that was clicked (same shelf and index, even when the
  entry is in two shelves), the shelf's horizontal scroll position is restored, and the target card and the other
  in-view cards are already visible: no reveal re-run, no chrome pop-in.
  - edges: the card no longer exists (deleted, status changed so it left the list) → plain fade, no morph · the card is
    off-screen after restore → no morph · forward navigation to a list (not back) → reveal runs as today.
- **S5** Hero and detail fades end without a visible crease: the hero photo mask and scrim, the framed Home hero, the
  detail backdrop's bottom fade, and the no-photo gradient fallback use eased multi-stop ramps (tokens), and
  colour-to-colour gradients interpolate `in oklab`.
  - edges: light theme · no photo (fallback gradient) · desktop and phone heights.
- **S6** Shelf, bento and list glows are smooth and centred: one cover as the source (not a 4-column grid), moderate
  saturation, an eased mask with room to fade vertically, and the top not cut by the sticky head bar.
  - edges: 0 images → no glow · 1 image · light theme.
- **S7** The "No photo yet" placeholders (ImagePlaceholder, HeroSlot) and the page ambient have no visible ellipse rim
  or banding; the ambient is a fixed layer, not `background-attachment: fixed`.
  - edges: light theme · iOS (fixed ignored today) · long scroll.
- **S8** Type scale: every font-size goes through a scale token. 14px → small (13), 15px → body (16), 22/21px →
  display-3, 18px → title, 10.5/12px → eyebrow. Section headings (Shelf, Bento) share one size (display-3 below
  1024px), and all caps labels use the eyebrow size and tracking. A unit test bans raw font-size values outside the
  token files.
  - edges: phone tab bar labels at eyebrow size still fit ("Animanga", "Collections") · shelf heading "Recently added ·
    Music" fits one line at 390px.
- **S9** Every input, select and textarea renders at ≥16px, so iOS does not zoom on focus.
  - edges: none (pure style).
- **S10** In 168px phone shelf cards the progress control fits: nothing is clipped, and −, value and + are each ≥44px
  tall and wide. The total moves into the accessible name when space is short.
  - edges: 3-digit values (e.g. 120 / 327) · desktop cards keep showing the total.
- **S11** An `--error` token per scheme (AA contrast on ground and glass) replaces the five raw `tomato` mixes; the
  colour test also bans named colours.
  - edges: light and dark theme.
- **S12** The Home collections bento features the first collection that has images; empty collections are never the
  big tile.
  - edges: no collection has images → current non-featured layout · no collections → as today.
- **S13** Detail on phone: the cover is at most 240px wide, so the title starts above the fold at 390×844. The progress
  label no longer offsets the status/stars row on desktop, and Delete is a quiet text button on the same row as the
  other actions.
  - edges: long titles · entries without progress.
- **S14** Small consistency:
  - Settings Replace/Remove use one button variant, side by side.
  - Focus rings follow each element's own radius (outline + offset, no forced pill).
  - The edit form's select uses the FilterBar chevron style.
  - Artist and tag tokens use one chip tone.
  - The phone tab bar has room around "Animanga"/"Collections".
  - The desktop sticky shelf-head glass bar keeps the heading text on the column edge with balanced padding.
  - edges: keyboard focus on cards, stars, chips · light theme.

## Non-goals
- New features, routes, data or schema changes — this is polish only.
- Layout restructures beyond the named spots (no new Home or detail layout).
- New fonts or a palette change — tokens get added (fades, error), not redesigned.
- Global `user-select: none` — it would only hide the symptom and break copying prose.
- Handling browser caret browsing (F7) — that is a browser setting, not the app.
- Replacing the glow with a Spotify-style wash or removing it — the owner chose to keep it and smooth it.

## Codebase touchpoints
(from the audit report, audit.md, line numbers at 1c6d84f)
- `src/lib/.../ProgressControl.svelte` — tap-to-edit value (S1, S10); Card.svelte `.extra`, Shelf.svelte card width (S10)
- `morph.ts`, `motion.ts` (reveal), `tilt.ts`, `Card.svelte` `.media`, `global.css` view-transition rules (S3, S4)
- `PhotoHero.svelte`, `routes/+page.svelte` frame, `entries/[id]/+page.svelte` backdrop, `tokens.css` (S5, S7, S11)
- `Shelf.svelte`, `CollectionsBento.svelte`, `[domain]/[list]/+page.svelte` glows (S6, S8, S12, S14)
- `ImagePlaceholder.svelte`, `HeroSlot.svelte`, `global.css` `[data-world]` (S7, S14)
- Font-size sites listed in audit.md → Type scale (S8); input sites in audit.md finding 10 (S9)
- Error sites in audit.md finding 9; `motion.test.ts` colour bans (S11)
- `PillNav.svelte`, `TagInput.svelte`, `Counter.svelte`, `Chip.svelte`, `EntryForm`/FieldInput, `global.css`
  `:focus-visible` (S14)

## Risks
- R1 Back-navigation timing (Kit scroll restore vs the View Transition update callback vs reveal) → accepted: audit
  measured the cause and the planner assigns S4 an e2e that checks the morph's end rect against the card rect (frame
  check), run with `--repeat-each`.
- R2 Existing e2e tests that `fill` the progress input break under tap-to-edit → accepted: the planner lists every e2e
  file using the progress input; tests adapt to the new interaction (a contract change, not a weakened assertion).
- R3 Folding 14→13 and 15→16 shifts the look on many screens → accepted: Gate 2 shows phone + desktop screenshots of
  every main screen.
- R4 motion.test.ts bans raw colours and clip-path transitions → new fade/error values live only in token files.

## Decisions
- Scope = all four complaints + all 18 audit findings — owner's choice ("Everything").
- Type scale folds into existing tokens (14→13, 15→16) rather than adding 14/15 tokens — owner's choice; matches Mobbin
  (no sizes between 14 and 16, weight carries hierarchy).
- Progress value = tap-to-edit on cards and detail — owner's choice.
- Glow stays, made smooth (single source, eased mask) — owner's choice.
- Narrow cards hide the total visually (kept in the accessible name) rather than widening phone cards to 184px —
  keeps shelf density.
- Sticky shelf-head glass bar stays, realigned — the smaller change; dropping it is open for Gate 2 taste.
- Detail Delete becomes a quiet text button — destructive action stays reachable but de-emphasised.

## Done when
- Tapping "3 / 28" anywhere shows no caret until edit mode; Enter saves, Escape cancels.
- Card → detail → back looks continuous at both viewports: rounded corners all the way, lands on the clicked card, no
  pop-in.
- No visible crease or patch in heroes, shelf glows, the detail backdrop or placeholders (Gate 2 screenshots).
- `rg "font-size"` outside the token files shows only tokens; the unit test enforces it.
- Phone: no input zoom, no clipped "+" in shelf cards, the detail title above the fold.
- `npm run proof:full` green.

## Split off
- none
