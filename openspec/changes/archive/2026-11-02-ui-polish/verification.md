verified-at: 123725b

# Verification: ui-polish (round 2)

## Layer 1: proof:full (green)

Round 2 on the tip after fixer round 1 (48007a6..123725b). `npm run proof:full` exit 0; vitest 47 files / 382 tests passed.

```
  ✓  684 [desktop] › e2e/type-scale.test.ts:29:1 › Scenario: Section headings share one size (198ms)
  -  685 [desktop] › e2e/type-scale.test.ts:40:1 › Scenario: Shelf heading fits one line on phone
  -  686 [desktop] › e2e/type-scale.test.ts:56:1 › Scenario: Inputs do not zoom on phone
  ✓  687 [desktop] › e2e/type-scale.test.ts:103:1 › Scenario: Caps labels share the eyebrow style (337ms)
  -  688 [desktop] › e2e/type-scale.test.ts:130:1 › Scenario: Phone tab bar labels have room
  ✓  689 [desktop] › e2e/unsaved.test.ts:12:1 › Scenario: Leaving a changed form asks first (202ms)
  ✓  690 [desktop] › e2e/unsaved.test.ts:24:1 › Scenario: Discarding leaves the form (206ms)
  ✓  691 [desktop] › e2e/unsaved.test.ts:33:1 › Scenario: Leaving an untouched form does not ask (183ms)
  ✓  692 [desktop] › e2e/unsaved.test.ts:42:1 › Scenario: Changed edit form asks before leaving (175ms)
  ✓  693 [desktop] › e2e/unsaved.test.ts:51:1 › Scenario: Saving does not ask (290ms)
  ✓  694 [desktop] › e2e/unsaved.test.ts:69:1 › Scenario: Reload of a changed form triggers the native prompt (129ms)
  ✓  695 [desktop] › e2e/unsaved.test.ts:82:1 › Scenario: Reload of an untouched form does not prompt (124ms)
  ✓  696 [desktop] › e2e/unsaved.test.ts:94:1 › Escape in the dialog keeps editing, and typing back to the start is not a change (320ms)
  ✓  697 [desktop] › e2e/unsaved.test.ts:112:1 › Cancel with changes asks first as well (165ms)
  ✓  698 [desktop] › e2e/unsaved.test.ts:120:1 › a failed save keeps the guard on (230ms)
  ✓  699 [desktop] › e2e/unsaved.test.ts:130:1 › the dialog leaves the accessibility tree while it fades out (1.1s)
  ✓  700 [desktop] › e2e/worlds.test.ts:13:1 › Scenario: Domain pages use their world (263ms)
  ✓  701 [desktop] › e2e/worlds.test.ts:25:1 › Scenario: Home, collections and settings use the home world (227ms)
  ✓  702 [desktop] › e2e/worlds.test.ts:36:1 › a list page uses its domain's world before the list names one (88ms)

  50 skipped
  652 passed (4.7m)
```

## Layer 2: spec coverage

All 127 scenarios: 119 passed, 0 gap, 8 manual. e2e scenarios passed in both projects unless the test is viewport-specific (skipped in the other project by design, marked below).
Changes since round 1: 1 new scenario (motion "History back reveals at once without View Transitions", unit, passed). No scenario was removed or renamed; every round-1 title still resolves to a passed test.

| Capability | Scenario | proof | Evidence |
|---|---|---|---|
| design-system | Every scheme and accent defines the full token set | unit | `unit` ✓ (unit) |
| design-system | Switching a world is a data change | e2e | e2e ✓ phone + desktop |
| design-system | Text contrast meets AA in every world | unit | `unit` ✓ (unit) |
| design-system | Text over photos stays legible | unit | `unit` ✓ (unit) |
| design-system | Error colour meets AA in both schemes | unit | `unit` ✓ (unit) |
| design-system | Components use no named colour | unit | `unit` ✓ (unit) |
| design-system | Font sizes come from the type scale | unit | `unit` ✓ (unit) |
| design-system | Fade and glow masks are eased ramps | unit | `unit` ✓ (unit) |
| design-system | Ambient light is eased | unit | `unit` ✓ (unit) |
| design-system | Section headings share one size | e2e | e2e ✓ phone + desktop |
| design-system | Shelf heading fits one line on phone | e2e | e2e ✓ phone only (viewport-specific) |
| design-system | Caps labels share the eyebrow style | e2e | e2e ✓ phone + desktop |
| design-system | Inputs do not zoom on phone | e2e | e2e ✓ phone only (viewport-specific) |
| design-system | Type reads even across screens | manual | manual (Gate 2 checklist) |
| design-system | Chrome text shows the default cursor | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | Links and buttons keep the pointer | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | Prose keeps the text cursor and stays selectable | e2e | e2e ✓ phone + desktop |
| design-system | Focus ring follows the element's own radius | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | Focused card shows one ring on its corners | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | Hero photo fades through the eased mask | e2e | e2e ✓ phone + desktop |
| design-system | Framed Home hero fades the same way | e2e | e2e ✓ phone + desktop |
| design-system | Hero without photo blends in oklab | e2e | e2e ✓ phone + desktop |
| design-system | Detail backdrop fades out without a crease | e2e | e2e ✓ phone + desktop |
| design-system | Shelf glow comes from one cover | e2e | e2e ✓ phone + desktop |
| design-system | Shelf glow is centred | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | Shelf glow has room to fade vertically | e2e | e2e ✓ desktop only (viewport-specific) |
| design-system | No glow without covers | e2e | e2e ✓ phone + desktop |
| design-system | Bento and list glows match the shelf glow | e2e | e2e ✓ phone + desktop |
| design-system | Placeholders have no rim | e2e | e2e ✓ phone + desktop |
| design-system | Ambient is a fixed layer | e2e | e2e ✓ phone + desktop |
| design-system | Fades and glows look smooth | manual | manual (Gate 2 checklist) |
| design-system | Form selects match the filter select | e2e | e2e ✓ phone + desktop |
| design-system | Artist and tag tokens share one tone | e2e | e2e ✓ phone + desktop |
| entries | Detail shows every filled field | e2e | e2e ✓ phone + desktop |
| entries | Long title shows in full on detail | e2e | e2e ✓ phone + desktop |
| entries | Long title truncates on cards | e2e | e2e ✓ phone + desktop |
| entries | Unknown entry answers 404 | e2e | e2e ✓ phone + desktop |
| entries | Phone detail shows the title above the fold | e2e | e2e ✓ phone only (viewport-specific) |
| entries | Desktop controls share one row | e2e | e2e ✓ desktop only (viewport-specific) |
| entries | Detail without progress keeps its controls row | e2e | e2e ✓ desktop only (viewport-specific) |
| entries | Delete is a quiet action on the actions row | e2e | e2e ✓ phone + desktop |
| entries | Detail looks balanced | manual | manual (Gate 2 checklist) |
| home | Home shows the hero photo and headline | e2e | e2e ✓ phone + desktop |
| home | Home without hero photo shows the world gradient | e2e | e2e ✓ phone + desktop |
| home | Coverflow shows the most recent entries with images | e2e | e2e ✓ phone + desktop |
| home | In progress shelf lists media in progress | e2e | e2e ✓ phone + desktop |
| home | Recently added shelves per domain | e2e | e2e ✓ phone + desktop |
| home | Collections bento shows collages | e2e | e2e ✓ phone + desktop |
| home | Bento features the first collection with images | e2e | e2e ✓ desktop only (viewport-specific) |
| home | Bento without images features no collection | e2e | e2e ✓ desktop only (viewport-specific) |
| home | Home without collections shows no bento | e2e | e2e ✓ phone + desktop |
| home | Empty archive shows a welcome per domain | e2e | e2e ✓ phone + desktop |
| home | Home looks like the approved mockup | manual | manual (Gate 2 checklist) |
| layout | Desktop shows the top pill nav | e2e | e2e ✓ desktop only (viewport-specific) |
| layout | Phone shows the bottom pill nav | e2e | e2e ✓ phone only (viewport-specific) |
| layout | Phone tab bar labels have room | e2e | e2e ✓ phone only (viewport-specific) |
| layout | Nav marks the current section | e2e | e2e ✓ phone + desktop |
| layout | Entry pages mark their domain | e2e | e2e ✓ phone + desktop |
| layout | Content clears the bottom nav on phone | e2e | e2e ✓ phone only (viewport-specific) |
| layout | Active section follows the path | unit | `unit` ✓ (unit) |
| layout | Real screens share one alignment rule | e2e | e2e ✓ phone + desktop |
| layout | Sticky shelf head keeps the heading on the column edge | e2e | e2e ✓ desktop only (viewport-specific) |
| layout | Desktop uses the width | e2e | e2e ✓ desktop only (viewport-specific) |
| layout | No horizontal page scroll on phone | e2e | e2e ✓ phone only (viewport-specific) |
| layout | Desktop layouts look composed | manual | manual (Gate 2 checklist) |
| motion | Card to detail morphs the cover | e2e | e2e ✓ phone + desktop |
| motion | Back from detail reverses the morph | e2e | e2e ✓ phone + desktop |
| motion | Morphing cover keeps its rounded corners | e2e | e2e ✓ phone + desktop |
| motion | Morph carries the detail cover's shadow | e2e | e2e ✓ phone + desktop |
| motion | Forward morph starts from the card at rest | e2e | e2e ✓ desktop only (viewport-specific) |
| motion | Morph does not stretch between shapes | e2e | e2e ✓ phone + desktop |
| motion | Back morph lands on the clicked card | e2e | e2e ✓ phone + desktop |
| motion | Back restores the shelf scroll position | e2e | e2e ✓ phone + desktop |
| motion | Back shows in-view cards without re-running the reveal | e2e | e2e ✓ phone + desktop |
| motion | Back to a card that left its shelf crossfades | e2e | e2e ✓ phone + desktop |
| motion | Back to an off-screen card crossfades | unit | `unit` ✓ (unit) |
| motion | Forward morph without View Transitions navigates plainly | unit | `unit` ✓ (unit) |
| motion | Reduced motion skips the morph | e2e | e2e ✓ phone + desktop |
| motion | Other navigations crossfade | e2e | e2e ✓ phone + desktop |
| motion | Reduced motion skips the crossfade | e2e | e2e ✓ phone + desktop |
| motion | Browser without View Transitions navigates plainly | e2e | e2e ✓ phone + desktop |
| motion | Morph targets follow the URLs | unit | `unit` ✓ (unit) |
| motion | Page transitions look smooth | manual | manual (Gate 2 checklist) |
| motion | Cards reveal on scroll | e2e | e2e ✓ phone + desktop |
| motion | Reveal shows in-view nodes at once on history back | unit | `unit` ✓ (unit) |
| motion | History back reveals at once without View Transitions **(new)** | unit | `unit` ✓ (unit) |
| motion | Reveal runs as before on other navigations | unit | `unit` ✓ (unit) |
| motion | Reduced motion shows content immediately | e2e | e2e ✓ phone + desktop |
| motion | Parallax offset follows scroll | unit | `unit` ✓ (unit) |
| motion | Hero photo moves with scroll | e2e | e2e ✓ phone + desktop |
| motion | Reduced motion keeps the hero still | e2e | e2e ✓ phone + desktop |
| motion | Shelf headers stick on desktop | e2e | e2e ✓ desktop only (viewport-specific) |
| motion | Shelf headers do not stick on phone | e2e | e2e ✓ phone only (viewport-specific) |
| motion | Scroll motion looks calm | manual | manual (Gate 2 checklist) |
| release | Package and lockfile carry 0.1.1 | unit | `unit` ✓ (unit) |
| release | Release v0.1.1 published | manual | manual (Gate 2 checklist) |
| settings | Upload a hero photo for Home | e2e | e2e ✓ phone + desktop |
| settings | Replace a domain hero photo | e2e | e2e ✓ phone + desktop |
| settings | Remove a hero photo | e2e | e2e ✓ phone + desktop |
| settings | Unsupported hero file shows an inline error | e2e | e2e ✓ phone + desktop |
| settings | Oversize hero file shows an inline error | e2e | e2e ✓ phone + desktop |
| settings | Replace and Remove sit side by side in one style | e2e | e2e ✓ phone + desktop |
| tracking | Step episodes with plus and minus | e2e | e2e ✓ phone + desktop |
| tracking | Type progress directly | e2e | e2e ✓ phone + desktop |
| tracking | Progress value is not editable text until activated | e2e | e2e ✓ phone + desktop |
| tracking | Clicking the value enters edit mode with the value selected | e2e | e2e ✓ phone + desktop |
| tracking | Keyboard enters edit mode | e2e | e2e ✓ phone + desktop |
| tracking | Leaving the input saves the edit | e2e | e2e ✓ phone + desktop |
| tracking | Escape cancels editing | e2e | e2e ✓ phone + desktop |
| tracking | Invalid input reverts without saving | e2e | e2e ✓ phone + desktop |
| tracking | Typed progress is parsed strictly | unit | `unit` ✓ (unit) |
| tracking | Progress value is named for screen readers | e2e | e2e ✓ phone + desktop |
| tracking | Numeric keyboard opens only in edit mode | e2e | e2e ✓ phone only (viewport-specific) |
| tracking | Activating the value on a card stays on the list | e2e | e2e ✓ phone + desktop |
| tracking | Progress control fits a phone shelf card | e2e | e2e ✓ phone only (viewport-specific) |
| tracking | Three-digit progress fits a phone shelf card | e2e | e2e ✓ phone only (viewport-specific) |
| tracking | Desktop cards show the total | e2e | e2e ✓ desktop only (viewport-specific) |
| tracking | Progress cannot go below zero | unit | `unit` ✓ (unit) |
| tracking | Progress cannot exceed a known total | unit | `unit` ✓ (unit) |
| tracking | Unknown total has no upper bound | unit | `unit` ✓ (unit) |
| tracking | Ongoing manga shows n / ? | e2e | e2e ✓ phone + desktop |
| tracking | Reaching the total offers Mark as watched | e2e | e2e ✓ phone + desktop |
| tracking | Reaching the chapter total offers Mark as read | e2e | e2e ✓ phone + desktop |
| tracking | Progress moves want to in progress | unit | `unit` ✓ (unit) |
| tracking | Progress leaves other statuses alone | unit | `unit` ✓ (unit) |
| tracking | Manga tracks chapters and volumes separately | unit | `unit` ✓ (unit) |
| tracking | Progress on the card | e2e | e2e ✓ phone + desktop |

## Manual checklist (Gate 2)

Start from `npm run dev` → http://localhost:5173 (or the screenshots below).

- Type reads even across screens: compare Home, a domain page and a detail page on phone and desktop.
- Fades and glows look smooth: hero photo fade, shelf glows, detail backdrop; look for creases or banding (phone scrim included, fixed in r1).
- Detail looks balanced: open an entry on phone and desktop.
- Home looks like the approved mockup: Home on phone and desktop against the mockup.
- Desktop layouts look composed: /music, /animanga, /books, /fashion at 1280 wide.
- Page transitions look smooth: tap a card, then go back (cover morphs both ways, no stretch); in a real browser also try back to a card that left its shelf (crossfade).
- Scroll motion looks calm: parallax hero, card reveals, sticky shelf heads on desktop.
- Release v0.1.1 published: runs on GitHub after the ship-time tag push.

## Diffstat (git diff --stat origin/main...flow/ui-polish)

82 files changed, 3984 insertions(+), 311 deletions(-)

## Screenshots

Regenerated this round (served `node build` on :4790, seeded fixture data; frames filmed at 0.25x playback, every 2nd frame in the sheet), in
`/tmp/claude-1001/-home-Rue-Repos-Creative-Archive/b6e6b914-5fb4-4448-9530-a5db3004dcbf/scratchpad/verify2/shots/`:
- `morph-phone-fwd.png`, `morph-phone-back.png`, `morph-desktop-fwd.png`, `morph-desktop-back.png` (/music/albums, first card, scrollY 300)
- `phone_.png`, `desktop_.png` (Home, PhotoHero scrim)
- `phone_music.png`, `phone_animanga.png`, `phone_books.png`, `phone_fashion.png`
- `desktop_music.png`, `desktop_animanga.png`, `desktop_books.png`, `desktop_fashion.png`

Not regenerated (unchanged by the fixes), in `.../scratchpad/verify/shots/`: `*_music_albums`, `*_music_artists`, `*_animanga_anime`, `*_books_books`, `*_fashion_pieces`, `*_fashion_looks`, `*_entries_2`, `*_entries_15`, `*_entries_2_edit`, `*_collections`, `*_collections_1`, `*_settings`, progress before/after.

Not produced: a back-to-gone-card sheet (the morph script cannot remove a card between forward and back); that behaviour is covered by e2e "Back to a card that left its shelf crossfades" and unit "Back to an off-screen card crossfades".

## Review

Round 1: fresh-context review of origin/main...flow/ui-polish (7 findings), fixed by fixer r1 (48007a6, f39b6d9, a3238fe, 39ded17, 123725b).
Round 2: scoped review of 96cab7d..flow/ui-polish (fix commits only).

| Finding | Resolution |
|---|---|
| [spec] morph.ts: detail cover named when the back target is off-screen or gone, so it floats with radius and shadow over the crossfade | Fixed. With no landing card, `data-morph="fade"` makes the leftover cover fade with the page (d-base, no radius or shadow). Spec changed: "no element is named" is not feasible, because the browser captures the old page before the list exists; THEN now reads "fades with the page". Owner to accept at Gate 2. |
| [weak] morph.test.ts "Back to an off-screen card crossfades" checked only the list side | Test tightened to both sides, plus an e2e animation check (duration, radius, shadow). Red before the fix. |
| [spec] reveal hold skipped without View Transitions and on same-path popstates | Fixed: the hold starts on every popstate. New unit "History back reveals at once without View Transitions". |
| [weak]+[spec] chrome cursor: shelf rows show `grab` on Home; the test checked other pages | Spec changed (orchestrator decision): default cursor, the control's pointer inside links and buttons, the row's grab inside drag-scroll shelves, never text. The e2e checks Home and /animanga/anime. Round 2 flagged the loosened contract and the dropped `.topbar nav` container check. Not re-added: the nav bar has no text outside its links, and non-link chrome stays covered (Eyebrow, shelf count, grid chip and meta). Owner to accept at Gate 2. |
| [weak] progress "no save" / "one save" polls passed on a stray same-value save | Tightened with `recordSaves` exact save lists. A mutation turned all 3 red. |
| [correctness] PhotoHero phone scrim hard step at 40% | Fixed: strictly increasing stops. The e2e asserts no repeated positions. |
| Round 2 | Nothing else: no bugs, no spec mismatches, no weak tests. |
