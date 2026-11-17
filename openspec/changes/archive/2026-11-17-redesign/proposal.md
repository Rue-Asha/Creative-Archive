## Why

Rue captures media and fashion on the phone and curates and browses on the desktop; Home is the way in. The biggest pain apart from the look is upkeep: ordering a collection is tedious, and changing several entries means one detail page each. The UI also has to move onto the shared design fingerprint (Design-System 1.0.0) and finally deliver the UI the gate-1 decisions (0.2.0) left on thin adapters. This change is gates 3–8 of the ecosystem pipeline for Creative Archive; gate 3 (`scope.md`) was signed off on 2026-11-15.

## What Changes

- **Fingerprint.** Vendor fingerprint 1.0.0 with `sync.sh`; `check-slop` and `check-drift` run in `proof` (with an app-owned slop baseline until the old UI is gone); accent heather (Rue's pick of 2026-11-16, fingerprint 2.0.0); light theme only. **BREAKING (UI):** today's dark worlds with one accent each become the fingerprint's light frame with one app accent; a world is expressed by its photo and `data-world`, and a world without a hero photo shows the fingerprint's blurred colour field (S4; Rue, Gate 1).
- **Shell and navigation.** Desktop top bar: brand, Home · Music · Animanga · Books · Fashion · Collections, Settings; one nav "Main" (S1). **BREAKING (UI):** the floating pill nav and tab bar are replaced; on the phone a bar like Notes with pills Home · Music · Animanga · Books · Fashion and a round context "+" (S2); Collections and Settings are reached via Home. The "+" opens a type sheet: all types on Home, Collections and Settings, the domain's types inside a domain (S3).
- **Screens.** Home with domain tiles, In progress, Recently added (replacing the "Latest additions" coverflow), a Collections section and a Settings icon (S5); domain page (S6); list with filters, sort, Grid/Shelves (S7); add (S10), entry page with the typed 0–10 rating (S11), edit (S12); collections index with descriptions (S14); collection page with drag reorder on the desktop and Move up / Move down (S15); Settings (S17).
- **Bulk actions (new behaviour).** Select mode in a list sets a status or adds/removes a tag on several entries at once (S8), backed by all-or-nothing list actions on the server (S9; Rue relaxed the ecosystem's UI-only rule for this). Select mode in a collection moves several entries (top, bottom, before…) or removes them, one save per action (S16).
- **Magazines** are a full Fashion type in the functional contract too (§4.3/§4.4), with their own list and `/add/magazine` (S13; the code already has both since 0.1.3).
- **Cross-cutting.** All contract states per route, English copy, WCAG 2.2 AA, phone targets ≥44 px, no horizontal scroll at 320/390 px, desktop uses its width (S19); the gate-1 adapters (stars = value/2, combined tabs) are removed when the new controls land (S18); master icon `icons/Creative-Archive/icon.svg` (S20).
- **Cleanup.** Old tokens, worlds, global styles, old fonts, old atoms, the old `/__mockups` and their guard tests are removed route by route and finally as a whole; the gate 4/5 mockups live under `/__mockups/redesign/*`.
- The work runs in the pipeline's fixed gate order: gate 4 greyscale wireframes and gate 5 hi-fi (incl. the master icon and a mood photo per world), each ending with Rue's sign-off; ecosystem checkpoint A re-syncs the fingerprint; gate 6 builds in waves (foundation → shell, overlays, cards → Home, domain + Settings, list → entry, forms, collections → cleanup); gate 7 is flow's Verify; gate 8 is Ship with the release tag v0.3.0.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `layout`: the floating pill nav is replaced by the desktop top bar, the phone bar and the context "+" with its type sheet (S1–S3); worlds are expressed inside the fingerprint frame (S4).
- `home`: Home's sections, order and states (S5).
- `motion`: the Home coverflow and the count-up go ("Recently added" replaces the coverflow, Rue at Gate 1); shelf drag-scroll and card hover stay.
- `domain-pages`: domain landing states on the fingerprint (S6).
- `domain-lists`: list states (S7), Select mode and bulk status/tag actions (S8, S9).
- `entries`: add flow with the media initial status (S10), entry page (S11), edit form (S12), magazines in the contract (S13).
- `tracking`: the rating becomes a typed 0–10 field with steps; the star adapter goes (S11, S18).
- `collections`: index with descriptions (S14), reorder by drag and by Move up / Move down with conflict handling (S15), Select mode with move and remove (S16).
- `settings`: hero photo slots and reworded copy (S17).
- `design-system`: the local tokens, worlds, fonts, atoms and old mockups are replaced by the vendored fingerprint, the redesign mockups, the app icon, the contract-state and copy rule, shared overlays and the accessibility floor (S19, S20).
- `harness`: `proof` runs the fingerprint guards.
- `release`: version 0.3.0.

## Impact

- UI layer: `src/routes/(app)/**/+page.svelte`, `(app)/+layout.svelte`, `src/lib/{shell,ui,home,domains,entries,collections,settings}/**/*.svelte`, `src/lib/shell/nav.ts`, `src/lib/motion.ts`, `src/lib/copy.ts`, `src/lib/styles/**`, `src/app.html`, `static/` (fingerprint fonts, icon set, manifest), `package.json` (`proof`), `src/routes/__mockups/**`, the e2e suite.
- Server (S9, S15, S16 only, own unit with tests): a new `src/lib/server/bulk.ts`, `removeManyFromCollection` in `src/lib/server/collections.ts`, new actions on `[domain]/[list]/+page.server.ts` and `collections/[id]/+page.server.ts`. No schema change and no migration: status, events, tags and collection positions exist since 0.2.0, and magazines since 0.1.3.
- Vendored, never edited here: `src/lib/styles/fingerprint/`, `scripts/fingerprint/`, `DESIGN.md`, `DESIGN.json`, `DESIGN-reference.md`, `fingerprint.lock`.
- Docs: `docs/functional-contract.md` (bulk actions, magazines, Settings copy, navigation, new strings) and `PRODUCT.md` are updated in the wave that ships the behaviour.
- Cross-repo: the master icon lives in Design-System (`icons/Creative-Archive/icon.svg`); fingerprint change requests go to Design-System `requests.md`. Both are the ecosystem orchestrator's steps, not this repo's units.

## Non-Goals

- Global search across all entries: per-list filters are enough (Rue).
- Bulk edit of anything other than status and tags (title, rating, images).
- Drag reorder on the phone: Move up/down and Select cover touch.
- Dark mode: decided for all apps at ecosystem checkpoint B (12.2).
- A schema change or data migration: the redesign's server work uses the tables 0.2.0 shipped.

## Appetite

Several sessions, in phases: gate 4 wireframes, gate 5 hi-fi, then the build in waves (each gate ends with Rue's sign-off).

## Done criteria

- [ ] Rue has signed off gate 4 wireframes and gate 5 hi-fi (incl. the master icon) for every screen in the inventory (SC1–SC9, G1–G6).
- [ ] Every contract route renders on the fingerprint at 375 / 768 / 1280, and the screenshots have been looked at.
- [ ] `npm run proof:full` is green, with `check-slop` and `check-drift` in `proof` and no slop baseline left.
- [ ] A collection reorders by drag on the desktop and by Move up / Move down and Select (keyboard and touch); each move survives a reload.
- [ ] Several list entries get a status or a tag in one action, and the toast names the count.
- [ ] `/fashion/magazines` lists magazines and `/add/magazine` creates one; the contract lists both.
- [ ] The entry page rating is a typed 0–10 field with +/− steps; no star adapter is left in the code.
- [ ] A WCAG 2.2 AA review passes; no horizontal scroll at 320 px.
- [ ] No old styling is left: `src/lib/styles/{tokens.css,tokens.ts,worlds.ts,global.css}`, the old fonts, the old `/__mockups` screens and their guard tests are gone.
- [ ] Released as v0.3.0 and deployed after Rue's OK (gate 8), with the previous release tag recorded.
