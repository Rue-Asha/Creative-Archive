## Why

The owner finds the app unpolished: glows and fades have visible edges, font sizes are uneven, a text caret appears
in what looks like static text, and the card ↔ detail image morph stutters, especially on the way back. The audit
(audit.md, with Mobbin references in research-mobbin.md) found the causes plus ~14 more consistency defects.

Appetite: one long session. Exceeding it means renegotiating scope.

## What Changes

- **BREAKING (interaction)** The progress value ("3 / 28") on cards and the detail page is a button, not a text input:
  no caret, no I-beam, no keyboard until it is tapped (or Enter/Space). Edit mode shows a numeric input with the value
  selected; Enter or blur saves through the existing save queue, Escape cancels, invalid input reverts without a save.
  The accessible name stays "Episodes/Chapters/Volumes … of …" (S1).
- Chrome text (nav, chips, counts, eyebrows, card overlays) shows the default cursor; prose (notes, collection
  descriptions) keeps the text cursor and stays selectable (S2).
- Forward morph keeps the card radius the whole way, starts from the un-hovered card, carries the detail cover's
  shadow and does not stretch between 4/5 and 2/3 covers (S3).
- Back morph lands on the card that was clicked (same shelf and index), restores that shelf's horizontal scroll, and
  the cards in view are already revealed; a vanished or off-screen card falls back to the plain crossfade (S4).
- Hero, framed Home hero, detail backdrop and no-photo fallback fade through eased multi-stop token ramps; colour
  gradients interpolate `in oklab` (S5).
- Shelf, bento and list glows come from one cover, at moderate saturation, under an eased mask with room to fade
  vertically (S6).
- "No photo yet" placeholders lose their ellipse rim; the page ambient becomes a fixed layer instead of
  `background-attachment: fixed` (S7).
- Type scale: every font-size is a scale token (14→13, 15→16, 21/22→display-3, 18→title, 10.5/12→eyebrow), section
  headings share `--t-section`, caps labels share the eyebrow style; a unit test bans raw font-size values (S8).
- Every input, select and textarea renders at ≥16px (S9).
- Phone shelf cards fit the progress control: −, value and + each ≥44px, the total hidden visually but kept in the
  accessible name (S10).
- An `--error` token per scheme replaces the five `tomato` mixes; the colour test also bans named colours (S11).
- Home bento features the first collection that has images (S12).
- Detail on phone: cover ≤240px so the title starts above the fold; desktop controls row aligned; Delete is a quiet
  text button on the actions row (S13).
- Small consistency: Settings Replace/Remove one variant side by side; focus rings follow each element's radius; the
  edit form's select uses the FilterBar chevron; artist and tag tokens share one chip tone; phone tab bar labels have
  room; the desktop sticky shelf-head bar keeps the heading on the column edge (S14).
- Release 0.1.1 (patch, polish release).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `tracking`: progress value becomes tap-to-edit; narrow cards hide the total visually (S1, S10).
- `motion`: page transitions keep the cover shape, start un-hovered, land on the clicked card with scroll restored;
  scroll reveal does not re-run on history back (S3, S4).
- `design-system`: tokens gain fade/glow masks, `--error`, section and initials sizes; named colours and raw font sizes
  are banned; type scale, chrome cursor and focus rings, smooth fades and glows, and consistent control styles are
  specified (S2, S5–S9, S11, S14).
- `home`: the bento features the first collection with images (S12).
- `entries`: detail layout on phone and desktop, quiet Delete (S13).
- `settings`: Replace and Remove share one button variant side by side (S14).
- `layout`: phone tab bar labels have room; the desktop sticky shelf head keeps the heading on the column edge (S14).
- `release`: version 0.1.1.

## Non-Goals

- New features, routes, data or schema changes — this is polish only.
- Layout restructures beyond the named spots (no new Home or detail layout).
- New fonts or a palette change — tokens get added (fades, error), not redesigned.
- Global `user-select: none` — it would only hide the symptom and break copying prose.
- Handling browser caret browsing (F7) — that is a browser setting, not the app.
- Replacing the glow with a Spotify-style wash or removing it — the owner chose to keep it and smooth it.

## Done criteria

- [ ] Tapping "3 / 28" anywhere shows no caret until edit mode; Enter saves, Escape cancels.
- [ ] Card → detail → back looks continuous at both viewports: rounded corners all the way, lands on the clicked card,
      no pop-in.
- [ ] No visible crease or patch in heroes, shelf glows, the detail backdrop or placeholders (Gate 2 screenshots).
- [ ] `rg "font-size"` outside the token files shows only tokens; the unit test enforces it.
- [ ] Phone: no input zoom, no clipped "+" in shelf cards, the detail title above the fold.
- [ ] `package.json` and `package-lock.json` carry 0.1.1.
- [ ] `npm run proof:full` green.

## Impact

- Tokens and globals: `src/lib/styles/tokens.css`, `tokens.ts`, `tokens.test.ts`, `global.css`, new
  `src/lib/style-rules.test.ts`.
- Progress: `src/lib/ui/ProgressControl.svelte`, `src/lib/entries/progress.ts`; e2e that read or type the progress
  value (`progress`, `cards`, `journey`, `design`, `autofill`) and `e2e/helpers.ts`.
- Morph: `src/lib/shell/morph.ts`, `src/lib/motion.ts`, `src/lib/entries/tilt.ts`, `src/lib/ui/Card.svelte`,
  `src/routes/(app)/+layout.svelte`.
- Surfaces: `PhotoHero.svelte`, `(app)/+page.svelte`, `Shelf.svelte`, `CollectionsBento.svelte`,
  `[domain]/[list]/+page.svelte`, `entries/[id]/+page.svelte`, `DetailPanel.svelte`, `DeleteEntry.svelte`,
  `ImagePlaceholder.svelte`, `HeroSlot.svelte`.
- Forms: `FilterBar.svelte`, `FieldInput.svelte`, `EntryForm.svelte`, `TagInput.svelte`, `ArtistField.svelte`,
  `Chip.svelte`, plus the error sites in `AddToCollection.svelte`, `PreviewPanel.svelte` and both collections pages.
- Type scale: every component and route with a font-size (audit.md → Type scale), the mockups page included.
- Release: `package.json`, `package-lock.json`, `scripts/version.test.ts`.
- No schema, migration, API or dependency change.
