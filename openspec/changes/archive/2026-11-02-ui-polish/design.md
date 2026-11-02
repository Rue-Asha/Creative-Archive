## Context

A polish pass over the shipped 0.1.0 app, from the owner's four complaints (glow/fade edges, uneven type, a caret in
"static" text, a stuttering card ↔ detail morph) plus the 18-finding screenshot audit (audit.md, line numbers at
1c6d84f) and the Mobbin rules (research-mobbin.md). No schema, route or data change. The work is cross-cutting: a few
shared files (`tokens.css`, `global.css`, `Card.svelte`, `Shelf.svelte`, `ProgressControl.svelte`) are touched by
several S-items, and the type scale touches ~30 component files, so the units are cut by file ownership. Two existing
guards shape the work: `motion.test.ts` bans raw colours (hex/rgb/hsl) and non-transform/opacity animation outside
`src/lib/styles/`, so every new fade value lives in `tokens.css`. All five worlds are dark today; the light scheme is
only visible on the `/__mockups/*/light` pages.

## Goals / Non-Goals

**Goals:** everything in scope.md S1–S14 and its Done-when list, released as 0.1.1.

**Non-Goals:**
- New features, routes, data or schema changes — this is polish only.
- Layout restructures beyond the named spots (no new Home or detail layout).
- New fonts or a palette change — tokens get added (fades, error), not redesigned.
- Global `user-select: none` — it would only hide the symptom and break copying prose.
- Handling browser caret browsing (F7) — that is a browser setting, not the app.
- Replacing the glow with a Spotify-style wash or removing it — the owner chose to keep it and smooth it.

## Decisions

From scope.md (owner's choices, unchanged):
- Scope = all four complaints + all 18 audit findings — owner's choice ("Everything").
- Type scale folds into existing tokens (14→13, 15→16) rather than adding 14/15 tokens — owner's choice; matches Mobbin
  (no sizes between 14 and 16, weight carries hierarchy).
- Progress value = tap-to-edit on cards and detail — owner's choice.
- Glow stays, made smooth (single source, eased mask) — owner's choice.
- Narrow cards hide the total visually (kept in the accessible name) rather than widening phone cards to 184px —
  keeps shelf density.
- Sticky shelf-head glass bar stays, realigned — the smaller change; dropping it is open for Gate 2 taste.
- Detail Delete becomes a quiet text button — destructive action stays reachable but de-emphasised.

Planning decisions:
- **View mode is a real `<button>`, edit mode a real `<input>`.** No input exists outside edit mode, so no caret, no
  I-beam and no phone keyboard can appear; Enter/Space activation, focus and the 44 px target come from the button.
  Alternative (readonly input styled as text) still focuses and draws a caret in some engines.
- **Above-total input keeps today's UI behaviour** (the control refuses and reverts; only the server clamps). scope.md
  says "clamp as today"; today's control does not clamp, so the spec keeps the refusal (see the planner's additions).
- **Cursor by inheritance:** `html { cursor: default }` in `global.css`, `cursor: auto` restored on inputs, textareas,
  selects, `[contenteditable]` and `[data-prose]`. Links and buttons keep the pointer from the UA sheet and
  `button { cursor: pointer }`. One rule instead of `cursor: default` on dozens of chrome selectors.
- **Morph shape via the transition pseudo-elements**, not the snapshot: `morph.ts` sets `view-transition-class: cover`
  next to the name, and `(app)/+layout.svelte` styles `::view-transition-group(*.cover)` (radius `--r-card`, overflow
  clip, `--shadow-float`) and `::view-transition-old/new(*.cover)` (`block-size: 100%`, `object-fit: cover`). Where a
  browser lacks transition classes the morph still runs, only without the corner/shadow fix; if Chromium's support
  turns out insufficient, a per-transition `<style>` naming the exact `cover-<id>` is the fallback. `Card.svelte`
  `.media` also gets `border-radius: inherit; overflow: hidden` so the old snapshot itself is rounded.
- **Forward morph un-hovers the card before naming it:** `morph.ts` clears the tilt's inline transform and pins the
  cover image's transform to `none` on the clicked card before `name(before)`, and restores both when the transition
  ends.
- **Back morph remembers the click in `morph.ts`**, keyed by the list URL the detail was opened from: the clicked
  card's `data-shelf` key and index, and every `[data-shelf-row]`'s `scrollLeft`. On a `popstate` navigation the update
  callback restores the rows, resolves exactly that card, and names it only if it still shows the entry and is in the
  viewport; otherwise it crossfades. Module memory, not `history.state`: no page file has to change and a full reload
  (which loses it) never morphs anyway. There is no in-app back control on the detail page; "back" means history back.
- **Reveal does not re-run on back:** `motion.ts` exposes a restoring flag that `morph.ts` sets for the duration of a
  popstate navigation; while it is set `reveal()` marks nodes already in the viewport as revealed at once with an
  inline `transition: none` (removed after the frame) and observes the rest as usual.
- **Fades are alpha masks, not colour ramps:** `--fade-down` and `--glow-mask` are scheme-independent alpha gradients
  on `:root`; heroes, the Home frame and the detail backdrop mask with `--fade-down` (the backdrop's two-stop `::after`
  colour overlay goes away), glows and placeholder tints mask with `--glow-mask`. Colour-to-colour gradients that remain
  in components (the no-photo fallback, the hero scrim) interpolate `in oklab` and ease through `color-mix()` stops of
  existing tokens — no raw colours, so motion.test.ts stays green.
- **Glow from one cover:** the glow renders only the first cover, `object-fit: cover` over the whole box,
  `saturate(1.2)`, `inset: -20% -4%`, masked by `--glow-mask`; no covers → no glow element. Same for bento and list.
- **Ambient as a fixed layer:** `[data-world]::before { position: fixed; inset: 0; z-index: -1 }` painted with
  `--ambient`; the world wrapper gets `isolation: isolate` so the layer sits above the wrapper's ground.
- **Guards land with their migrations.** The named-colour ban lands in U1 together with the `tomato` → `--error` and
  `white`-mask → token migrations; the raw font-size ban lands in U7 together with the type-scale migration. Each guard
  is red against the current code (red lines recorded in the task) and only goes green with its migration.
- **Type scale last, alone.** Its migration edits ~30 files that wave-1 and wave-2 units also own, so it runs in its
  own wave after them. Earlier units add no raw font size (they use scale tokens in new code), so U7 only folds the
  values audit.md lists. S9 (inputs ≥16 px) rides along: every input site is a font-size site.
- **Section heading size:** `--t-section` = display-3 below 1024 px, display-2 from 1024 px (the shelf's current
  desktop size); the bento heading follows it on desktop too. Taste is checked at Gate 2.
- **Release 0.1.1** (patch) as the last task, with the release delta spec and the retitled version test.

## Contracts

Shared between units; the owner is the unit that creates it. Consumers use the names as given and do not edit the
owner's files outside their own unit.

**Tokens (U1)** — `src/lib/styles/tokens.css`:
```css
:root {
  --fade-down: linear-gradient(180deg, <opaque to ~50%, ≥6 eased alpha stops, ends at alpha 0>);
  --glow-mask: radial-gradient(farthest-side, <≥5 eased alpha stops from opaque to alpha 0>);
  --t-section: var(--t-display-3);          /* @media (min-width: 1024px) → var(--t-display-2) */
  --t-initials: clamp(28px, 34cqi, 120px);  /* ImagePlaceholder initials */
}
[data-scheme='dark']  { --error: <≈ #FF8A7A>; --ambient: <eased, in oklab>; }
[data-scheme='light'] { --error: <≈ #B3261E>; --ambient: <eased, in oklab>; }
```
`tokens.ts` gains `error` in `SCHEME_TOKENS` and both schemes (mirrored values, AA-tested on ground and on
`--glass-strong` over ground). `--fade-down`, `--glow-mask`, `--t-section` and `--t-initials` are decoration/type
tokens and are not mirrored (like `--grain`). Rule for any later token: an alpha-only mask goes on `:root`; a token
that references scheme or accent colours is declared in each scheme block, because a custom property resolves its
`var()`s where it is declared. U4 may tune the stop values of `--fade-down` and `--glow-mask` in wave 2; the names and
the ≥5-stop rule are fixed.

**Error colour (U1)** — every failure/field-error text uses `var(--error)` (the local `--field-error` mixes become
`--field-error: var(--error)` or go away); never a hex, a named colour or an ink fallback.

**Globals (U1)** — `src/lib/styles/global.css`:
- `html { cursor: default }`; `input, textarea, select, [contenteditable], [data-prose] { cursor: auto }`.
- Prose marker `data-prose` on the entry note (`DetailPanel.svelte`) and the collection description
  (`collections/[id]/+page.svelte`).
- `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px }` with no `border-radius` or `box-shadow`
  override; `[data-card] a:focus-visible { outline: none }` so the card's own `--focus-ring` (`.card:has(a:focus-visible)`)
  is the only ring.
- `[data-world] { background: var(--ground); isolation: isolate }` and `[data-world]::before` as the fixed ambient
  layer (`content: ''; position: fixed; inset: 0; z-index: -1; background: var(--ambient); pointer-events: none`).

**Style rules test (U1 creates, U7 extends)** — new `src/lib/style-rules.test.ts`, same file walk and comment
stripping as `motion.test.ts`. U1 adds `it('Scenario: Components use no named colour')` (files outside
`src/lib/styles/`); U7 adds `it('Scenario: Font sizes come from the type scale')` (every file except `tokens.css`;
allowed values: `var(--t-…)`, `calc()` of those with unitless factors, `0`, `inherit`).

**ProgressControl (U2)** — props unchanged: `{ label, current, total, onstep, onset, tone? }`. DOM:
```html
<div role="group" aria-label="Episodes" class="progress">
  <button aria-label="Episodes: one less">−</button>
  <!-- view mode -->
  <button type="button" class="value" aria-label="Episodes 3 of 28">3<span class="total" aria-hidden="true">/ 28</span></button>
  <!-- edit mode (replaces the value button) -->
  <input type="text" inputmode="numeric" aria-label="Episodes" />
  <button aria-label="Episodes: one more">+</button>
</div>
```
Unknown total: name "Chapters 120 of unknown", visible "120 / ?". `.total` is hidden under
`@container (max-width: 209px)` (the card is the container; the detail page has none, so it always shows the total).
`src/lib/entries/progress.ts` exports `parseProgress(raw: string, total: number | null): number | null` (trimmed
non-negative integer ≤ a known total, else `null`).

**e2e helpers (U2)** — `e2e/helpers.ts` gains `progressValue(scope: Page | Locator, label: string): Locator` (the value
button inside the group named `label`) and `editProgress(scope, label, text: string, end: 'Enter' | 'Escape' | 'blur')`.
Tests that reload after a progress write await `countSaves` first (repo learning).

**Morph hooks (U3 reads; U4 and U5 keep them)** — cards keep `[data-card]` with `.media[data-cover-id]`; shelves keep
`section[data-shelf="<key>"]` holding `ul[data-shelf-row]` with one `li` per card in order and `use:reveal` on each
`li`; the detail cover keeps `.cover[data-cover-id]`. `pageTransition`'s `Navigation` gains `type` (Kit's navigation
type); back = `type === 'popstate'`. e2e window globals are named per file (`window.__backMorph` in
`e2e/back-morph.test.ts`).

**Section headings (U7 applies, U4 keeps the hook)** — `h2[data-section-heading]` in `Shelf.svelte` and
`CollectionsBento.svelte` use `font-size: var(--t-section)`.

**Shared select (U6)** — FilterBar's `.select` wrapper style (appearance none + chevron) moves to `global.css` as
`.select`; FilterBar, `FieldInput.svelte` and `EntryForm.svelte` wrap their `<select>` in it.

**Test-file owners** — U1: `e2e/globals.test.ts` (new), `src/lib/styles/tokens.test.ts`, `src/lib/style-rules.test.ts`
(new). U2: `e2e/progress.test.ts`, `e2e/cards.test.ts`, `e2e/journey.test.ts`, `e2e/design.test.ts`,
`e2e/autofill.test.ts`, `e2e/helpers.ts`, `src/lib/entries/progress.test.ts`. U3: `e2e/morph.test.ts`,
`e2e/back-morph.test.ts` (new), `e2e/reveal.test.ts`, `src/lib/shell/morph.test.ts`, `src/lib/motion.test.ts`.
U4: `e2e/surfaces.test.ts` (new), `e2e/home.test.ts`. U5: `e2e/detail.test.ts`, `e2e/delete.test.ts`,
`e2e/settings.test.ts`, `e2e/placeholders.test.ts` (new). U6: `e2e/form-controls.test.ts` (new). U7:
`e2e/type-scale.test.ts` (new), `e2e/layout.test.ts`, `src/lib/style-rules.test.ts` (extends). U8:
`scripts/version.test.ts`.

## Risks / Trade-offs

- R1 Back-navigation timing (Kit scroll restore vs the View Transition update callback vs reveal) → the S4 e2e
  compares the named card's box at capture with its box after the transition (frame check) and runs with
  `--repeat-each=10` before committing.
- R2 Existing e2e tests that `fill` the progress input break under tap-to-edit → U2 owns every e2e file that reads or
  types the progress value (progress, cards, journey, design, autofill) and adapts them to the new interaction (a
  contract change, not a weakened assertion); reloads after a write await `countSaves`.
- R3 Folding 14→13 and 15→16 shifts the look on many screens → Gate 2 shows phone + desktop screenshots of every main
  screen, taken by the verifier.
- R4 motion.test.ts bans raw colours and clip-path transitions → new fade/error values live only in token files.
- [Computed styles of `::view-transition-*` pseudo-elements are only readable while a transition runs] → the morph
  tests pause the transition's animations (`document.getAnimations()`) halfway and read the pseudo styles then.
- [Transition classes may be missing in LibreWolf] → the morph still runs there; corner/shadow polish is judged in
  Chromium, LibreWolf at Gate 2 only has to morph or navigate plainly (existing manual scenario).
- [U4 tuning a fade token changes U5's backdrop/placeholder look in the same wave] → tests count stops, not values;
  the look is judged once at Gate 2 on merged code.
- [The type unit is large] → it is mechanical (audit.md lists every site with its target token) and alone in its wave.

## Migration Plan

None: no data, schema or API change. Rollback is reverting the merge; the 0.1.0 release stays installable.
