# Scope: redesign

Triage: feature — from-scratch UI redesign of Creative Archive on fingerprint 1.0.0 (ecosystem-ui-revamp gates 3–8), plus bulk actions (status/tags in lists, move/remove in collections) and magazines as a full type. Appetite: several sessions, in phases (gate 4 wireframes, gate 5 hi-fi, then the build in waves).

## Problem
Rue captures media and fashion on the phone and curates and browses on the desktop. Home is the way in. The biggest pain apart from the look is upkeep: ordering a collection is tedious, and changing several entries means one detail page each. The UI also has to move onto the shared fingerprint and finally deliver the UI the gate-1 decisions left on thin adapters.

## Usage (Rue, 2026-11-14)
- Phone: quick capture; looking things up (ratings, lists, collections).
- Desktop: curating (collections, lists, photos); browsing domains and entries.
- Main entry: Home.
- Biggest pain apart from the look: ordering inside collections.

## Entities (contract §3, confirm at Gate 0)
Entry (one of 11 types incl. magazine, in 4 domains: Music album/artist/song, Animanga anime/manga, Books book, Fashion brand/site/influencer/magazine/piece/look) with image, tags, note; media have status + dated events, rating 0..10 and progress; pieces have wishlist/owned/gone. Album/song → artist link. Collection = ordered, mixed, no duplicates; deleting an entry removes it from collections. Hero image per world (home + 4 domains). Wardrobe = pieces with status Owned (derived).

## Flows
From the contract (jobs J1–J15):
- Start (J7, J14): Home → domain tiles / In progress / Recently added / Collections → entry or domain.
- Capture on the phone (J1–J3): round "+" (Home: all types; inside a domain: its types) → catalogue search / paste URL / manual → form (incl. initial status) → save → toast.
- Track (J4–J6): entry page or quick controls on cards → status, progress step or typed value, rating typed 0..10 (+/− steps) → saves at once.
- Browse a list (J8, J9): domain → list → filters (status/kind, tag, min rating), sort, Grid/Shelves → entry; URL state, Back restores.
- Bulk in a list (new): list → Select → pick several → set status or add/remove a tag → toast with count.
- Curate a collection (J10): Home Collections section / All collections → collection → drag to reorder (desktop) or Move up/down (keyboard, touch); Select → move several / remove several; rename, delete; add to collection from an entry.
- Artist (J11): album/song → artist page → works.
- Edit / delete (J12): entry → Edit (unsaved guard) / Delete dialog.
- Settings (J13): Home header icon → hero photo slots (Home, Music, Animanga, Books, Fashion), Replace / Remove.

## Screen inventory (gate 3)
Posture: *pointer* (desktop, top bar) and *touch* (phone, bottom bar).

| # | Screen | Route | Jobs | Posture |
|---|---|---|---|---|
| SC1 | Home: domain tiles, In progress, Recently added, Collections section, Settings icon | `/` | J7, J10, J14 | both |
| SC2 | Domain page: hero, sub-types, Add menu, in-progress shelf, shelves per sub-type | `/[domain]` | J7, J14 | both |
| SC3 | List: filters, sort, Grid/Shelves, Select mode | `/[domain]/[list]` | J8, J9, bulk | both |
| SC4 | Add: catalogue search / URL preview / manual form | `/add/[type]` | J1–J3 | phone first |
| SC5 | Entry page: cover, fields, status, rating, progress, collections, works | `/entries/[id]` | J4–J6, J10–J12 | both |
| SC6 | Edit entry | `/entries/[id]/edit` | J12 | both |
| SC7 | Collections index with descriptions, New collection | `/collections` | J10 | both |
| SC8 | Collection: order, Select mode, rename, delete | `/collections/[id]` | J10 | desktop first for drag |
| SC9 | Settings: hero photo slots | `/settings` | J13 | both |
| G1 | Desktop top bar: brand, Home · Music · Animanga · Books · Fashion · Collections, Settings | layout | J14 | pointer |
| G2 | Phone bar: pills for Home + 4 domains, round context "+" | layout | J14, J1 | touch |
| G3 | "+" type sheet (all types on Home, the domain's types inside a domain) | overlay | J1–J3 | touch |
| G4 | Selection bar (count, actions, Done) | overlay | bulk | both |
| G5 | Dialogs and menus: Delete entry, Delete collection, Add to collection, status menu, tag picker, discard guard | overlay | J4, J9, J10, J12 | both |
| G6 | Toasts | overlay | J15 | both |

## In scope

Shell and navigation
- **S1** Desktop top bar on the fingerprint: brand, Home · Music · Animanga · Books · Fashion · Collections, Settings; one nav named "Main"; aria-current marks the section (entry/add/list pages mark their domain).
  - edges: 1024–1280 widths; content never covered.
- **S2** Phone bar like Notes: pills Home · Music · Animanga · Books · Fashion plus a round "+"; current section marked; hidden while a text field has focus; safe-area insets; Collections and Settings are reached via Home.
  - edges: 320 px width (five pills + "+"); landscape phone; soft keyboard.
- **S3** The round "+" is context-dependent: on Home (and Collections/Settings) a sheet with all types grouped by domain; inside a domain a sheet with that domain's types; each opens /add/<type>.
  - edges: Fashion "Brand or shop" is one item (/add/brand); Wardrobe context → piece with status Owned; on an add/edit form the "+" is inert.
- **S4** Per-domain colour worlds stay (`data-world`), expressed inside the fingerprint's frame: a world is its photo (the hero from Settings) plus `data-world`, with the single heather accent and the light theme; today's dark worlds go light. A world without a hero photo shows the fingerprint's blurred colour field (`data-backdrop="field"`, as Notes); no bundled photos in `static/` (Rue, Gate 1).
  - edges: Home world on Collections and Settings; list pages use their domain world before the list names one.

Home and domains
- **S5** Home shows, in order: domain tiles (way into each domain), In progress, Recently added, a Collections section with "All collections"; a Settings icon in the Home header. "Recently added" replaces the "Latest additions" coverflow, which retires with its count-up (Rue, Gate 1).
  - edges: empty archive (welcome state with "+"); nothing in progress → section absent; no collections → New collection prompt; long titles; no images (fallback tiles).
- **S6** Domain page: hero, sub-type navigation, Add menu (the domain's types), in-progress shelf (media domains), one shelf per sub-type with See all.
  - edges: empty domain; one sub-type empty; no hero photo.

Lists and bulk
- **S7** List: filters (status/kind, tag, min rating), sort, Grid/Shelves (shelves order In progress, Want, Done, Dropped, No status), URL state, Add (only when the list has entries), Reset filters, empty and filtered-empty states; Kind filter wording from gate-1.
  - Minimum rating options are whole steps on 0–10: "Any rating", "9 and up", "8 and up", "7 and up", "6 and up", "5 and up" (as in the Design-System specimen); the URL keeps accepting any valid 0–10 value (Rue, Gate 1).
  - edges: 500+ entries; filters match nothing; long titles; any script.
- **S8** Select mode in a list: enter Select, pick several (tap / click / shift-click range on desktop), then set status or add/remove a tag for all; a toast names the count; Escape or Done leaves.
  - edges: mixed types without a shared status set (pieces vs media) → only valid actions offered; partial failure → toast names what failed, nothing silently lost; 0 selected → actions disabled; keyboard reachable.
- **S9** spike-free server unit: bulk endpoints for status and tags on a set of entry ids, all-or-nothing per request (Rue relaxed the UI-only rule for this).
  - edges: unknown id → 400 and nothing changes; invalid status for a type → rejected; empty set → no-op.

Entry, add, edit
- **S10** Add flow: catalogue search → form, URL preview → form, manual; initial status on the media add form (gate-1 debt); `?status=` prefill; Save toast; discard guard.
  - edges: catalogue down → manual; HEIC rejected with a message; duplicate title allowed; 180+ char titles.
- **S11** Entry page: cover, fields, status menu, rating as a typed number 0..10 with up to two decimals plus +/− steps (spin-button semantics, Home/End), progress step or typed value, Mark as watched/read, Add to collection, Edit, Delete; artist works group.
  - edges: rating cleared; 8.755 rejected inline; progress over total; no cover; artist with 0 works.
- **S12** Edit form for all types; status, rating and progress stay on the entry page (piece status in the form); unsaved guard.
- **S13** Magazines become a full type: their own Fashion list and /add/magazine like the other Fashion types; contract §4.3/§4.4 updated.
  - edges: existing magazine entries (if any) appear in the new list.

Collections
- **S14** Collections index shows each collection's description and collage; New collection (name + description).
  - edges: none yet; long descriptions; collection with no images.
- **S15** Collection page: drag to reorder on the desktop with Move up / Move down for keyboard and touch; each move saves at once; Rename, Delete collection.
  - edges: 409/concurrent change → reload with a polite toast (a stale order — a well-formed list that no longer matches the collection — answers 409, a malformed list stays 400; Rue, Gate 1); save fails → order reverts with a toast; reduced motion; 100+ entries.
- **S16** Select mode in a collection: pick several → Move to top / Move to bottom / Move before…, or Remove from collection; one save per action.
  - edges: all selected; the moved set keeps its relative order; remove the last entries → empty state.

Settings
- **S17** Settings: hero photo slots in order Home, Music, Animanga, Books, Fashion with Replace and Remove as equal choices; copy reworded (contract note).
  - edges: upload error; HEIC rejected; no photo set.

Cross-cutting
- **S18** Remove the gate-1 adapters (stars = value/2, combined tabs) when the new controls land.
- **S19** All contract states per route, English copy list, WCAG 2.2 AA, phone targets ≥44 px, no horizontal scroll at 320/390 px, desktop uses its width (column ≤1200 px).
- **S20** Master icon `icons/Creative-Archive/icon.svg` from the app's main jobs, in the family sheet (ecosystem 9.5).

## Non-goals
- Global search across all entries — per-list filters are enough (Rue).
- Bulk edit of anything other than status and tags (title, rating, images).
- Drag reorder on the phone — Move up/down and Select cover touch.
- Dark mode — decided at checkpoint B (ecosystem 12.2).

## Codebase touchpoints
- `src/routes/(app)/+layout.svelte`, `src/lib/shell/AppNav.svelte`, `src/lib/shell/nav.ts`, `src/lib/ui/PillNav.svelte` — shell, worlds, view transitions (explorer).
- `src/lib/server/` — new bulk endpoints (S9); existing `reorderCollection` and the `reorder` action back S15/S16.
- `src/lib/entries/EntryForm.svelte`, `src/routes/(app)/add/[type]/` — initial status, magazine (S10, S13).
- `docs/functional-contract.md`, `PRODUCT.md` — bulk actions, magazine, Settings copy.
- `/__mockups/redesign/*` — gate 4 wireframes and gate 5 hi-fi.

## Risks
- R1 This change depends on gate-1-decisions (0.2.0: contract, 0..10 rating, reorder, initial status) → resolved: flow/redesign merges origin/main after 0.2.0 ships, before the planner runs.
- R2 Five pills + "+" at 320 px → accepted: gate 4 tests 320 px first; fallback icon-only pills.
- R3 Bulk status over mixed types → resolved in S8 (only valid actions offered).
- R4 Breaking the "UI-only" rule (ecosystem 11.1) → accepted by Rue for bulk endpoints and magazine routes; they get their own server unit with tests.

## Decisions
- Home is the main entry: domain tiles, In progress, Recently added, Collections section; Settings icon in the Home header (Rue, rounds 1, 3, 5).
- Phone bar like Notes, context "+" (Rue, rounds 2, 4).
- No global search (Rue, round 1).
- Keep colour worlds (Rue, round 1).
- Bulk into the redesign: status/tags in lists, move/remove in collections (Rue, rounds 3, 4).
- Collection order: drag on desktop + multi-select (Rue, round 2).
- Rating: typed number + steps (Rue, round 6).
- Magazines: full type (Rue, round 6).
- References: `references.md` (Mobbin, agent-found).

## Gate 1 answers (Rue, 2026-11-15)
- A1 yes: Minimum rating options in whole steps "9 and up" … "5 and up" (S7).
- A2 yes: stale reorder → 409, malformed → 400 (S15).
- Q1 yes: "Recently added" replaces the coverflow; coverflow and count-up retire (S5).
- Q2 (b): no hero photo → the fingerprint's blurred colour field; no bundled photos (S4).
- P5 yes: colour worlds = per-world photo + `data-world`, one heather accent, light theme (S4).

## Gate 4 additions (Rue, 2026-11-15)
- **S21** Home head: a labelled "Settings" chip and, in the desktop posture only, a dark "Add" arrow pill opening the all-types sheet (owner U18). Edge: at 1280 px the top bar and the Home head both have a link "Settings"; e2e scope the head's one.
- **S22** Selection bar posture (lists and collections): desktop sticky above the list with every action; phone docked at the bottom with the count, one main action and a "More" menu portalled to `body` (owners U16 component, U20 list, U23 collection).
- **S23** Collection rows on the phone: a per-row "…" menu with Move up / Move down / Remove instead of the second button row; the drag handle shows only on a fine pointer; "Select" is the page's one dark pill, Rename secondary, Delete danger (owner U23).
- Settled picks (no new behaviour): top bar from 1024 px, tablets get the phone layout (S1/S2); phone pills icon-only below 360 px, labelled from 360 px (R2; Rue 2026-11-16, fingerprint 2.0.0), the dock fades out while typing, the dock applies below 1024 px; Recently added = one shelf per domain stacked in one card (S5); rating steps ±0.25 with round buttons beside the typed figure, typing stays (S11; exception to the fingerprint's "no stepper arrows", Design-System request); "Move before…" applies on pick; empty archive welcome replaces tiles and shelves; colour-field head without a hero photo.
- Open for gate 5: bulk and 409 toast wording, "+" sheet titles, Settings explanation copy, scrolled/compact top bar.

## Done when
- Rue signs off gate 4 wireframes and gate 5 hi-fi for every screen in the inventory.
- After the build: every route on the fingerprint at 375/768/1280; proof:full green; a collection reorders by drag and by Select; several list entries get a status or tag in one action; magazines have a list and an add form.

## Split off
- none
