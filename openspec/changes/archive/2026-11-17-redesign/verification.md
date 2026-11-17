verified-at: 2c2985a

## Layer 1: proof:full

GREEN at 2c2985a (round 4 re-verify, final). check-slop (262 files clean), check-drift (20 files match lock v2.1.0), svelte-check (0 errors, 0 warnings), build clean. Vitest: 63 files, 429 tests passed. Playwright: 793 passed, 169 skipped, 0 failed (16.0m). Full log: `/tmp/claude-1001/-home-Rue-Repos-RA-Echosystem/9bdc0162-37c6-4d31-84c8-158d884fe950/scratchpad/creative-final2/proof-full.log`

```
  ✓  943 [desktop] › e2e/transitions.test.ts:94:1 › a queued toast shows on the next page and hides itself (3.6s)
  ✓  944 [desktop] › e2e/transitions.test.ts:106:1 › a queued toast survives a full page load (200ms)
  -  945 [desktop] › e2e/type-scale.test.ts:9:1 › Scenario: Inputs do not zoom on phone
  ✓  946 [desktop] › e2e/unsaved.test.ts:17:1 › Scenario: Leaving a changed form asks first (463ms)
  ✓  947 [desktop] › e2e/unsaved.test.ts:29:1 › Scenario: Discarding leaves the form (443ms)
  ✓  948 [desktop] › e2e/unsaved.test.ts:38:1 › Scenario: Leaving an untouched form does not ask (255ms)
  ✓  949 [desktop] › e2e/unsaved.test.ts:47:1 › Scenario: Changed edit form asks before leaving (242ms)
  ✓  950 [desktop] › e2e/unsaved.test.ts:56:1 › Scenario: Saving does not ask (448ms)
  ✓  951 [desktop] › e2e/unsaved.test.ts:74:1 › Scenario: Reload of a changed form triggers the native prompt (170ms)
  ✓  952 [desktop] › e2e/unsaved.test.ts:87:1 › Scenario: Reload of an untouched form does not prompt (161ms)
  ✓  953 [desktop] › e2e/unsaved.test.ts:99:1 › Escape in the dialog keeps editing, and typing back to the start is not a change (455ms)
  ✓  954 [desktop] › e2e/unsaved.test.ts:117:1 › Cancel with changes asks first as well (313ms)
  ✓  955 [desktop] › e2e/unsaved.test.ts:125:1 › a failed save keeps the guard on (458ms)
  ✓  956 [desktop] › e2e/unsaved.test.ts:135:1 › the dialog leaves the accessibility tree while it fades out (610ms)
  ✓  957 [desktop] › e2e/worlds.test.ts:6:1 › Scenario: Domain pages use their world (349ms)
  ✓  958 [desktop] › e2e/worlds.test.ts:13:1 › Scenario: Home, collections and settings name no world (273ms)
  ✓  959 [desktop] › e2e/worlds.test.ts:21:1 › Scenario: Detail pages use their type's domain world (220ms)
  ✓  960 [desktop] › e2e/worlds.test.ts:33:1 › a list page uses its domain's world before the list names one (130ms)
  ✓  961 [desktop] › e2e/worlds.test.ts:39:1 › Scenario: A world shows its hero photo in the frame (171ms)
  ✓  962 [desktop] › e2e/worlds.test.ts:51:1 › Scenario: A world without a hero photo shows the colour field (187ms)

  Slow test file: [desktop] › e2e/redesign-shots.test.ts (9.4m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  169 skipped
  793 passed (16.0m)
```

## Layer 2: spec coverage

303 scenarios: 287 covered by a passing test (286 by exact name, 1 non-exact), 15 manual, 1 gap (ship-time, non-blocking). New since 3cb2bb5: 7 scenarios (6 e2e, all found and passing; 1 manual on-device). `openspec validate redesign --strict`: Change 'redesign' is valid

- GAP (ship-time, non-blocking): release > Package and lockfile carry 0.3.0 (unit) - no test; belongs to the ship-time version bump + tag.
- Non-exact name (covered, as in round 3): tracking > No star adapter is left - `src/lib/no-adapters.test.ts` > "no star adapter is left".

| Scenario | proof | Evidence |
|---|---|---|
| collections: New entry goes to the end | unit | ✓ 1 passing line(s) |
| collections: Removing keeps the order of the rest | unit | ✓ 1 passing line(s) |
| collections: Reorder sets the given order | unit | ✓ 1 passing line(s) |
| collections: Reorder with a wrong id set is rejected | unit | ✓ 1 passing line(s) |
| collections: Reorder action saves the order | unit | ✓ 1 passing line(s) |
| collections: Reorder action tells a stale order from a malformed one | unit | ✓ 1 passing line(s) |
| collections: Remove several keeps the rest in order | unit | ✓ 1 passing line(s) |
| collections: Remove-many action removes the given entries | unit | ✓ 1 passing line(s) |
| collections: Migration preserves the existing order | unit | ✓ 1 passing line(s) |
| collections: A migrated database matches a fresh one at head | unit | ✓ 1 passing line(s) |
| collections: Create a collection from the index | e2e | ✓ 2 passing line(s) |
| collections: Add an entry from its detail page | e2e | ✓ 2 passing line(s) |
| collections: Create a collection from the popover | e2e | ✓ 2 passing line(s) |
| collections: Adding an entry twice from the popover keeps one | e2e | ✓ 2 passing line(s) |
| collections: Failed save in the popover shows a toast and reverts | e2e | ✓ 6 passing line(s) |
| collections: Collection page lists mixed entries in order | e2e | ✓ 2 passing line(s) |
| collections: Index shows collage and count | e2e | ✓ 2 passing line(s) |
| collections: Remove an entry from a collection | e2e | ✓ 2 passing line(s) |
| collections: Rename a collection on its page | e2e | ✓ 2 passing line(s) |
| collections: Deleting a collection asks first | e2e | ✓ 2 passing line(s) |
| collections: Index shows descriptions | e2e | ✓ 2 passing line(s) |
| collections: Long description and no images stay inside the card | e2e | ✓ 2 passing line(s) |
| collections: No collections yet | e2e | ✓ 2 passing line(s) |
| collections: Drag reorders on the desktop | e2e | ✓ 1 passing line(s) |
| collections: Move up and down reorder by keyboard and touch | e2e | ✓ 1 passing line(s) |
| collections: Phone rows use a row menu and no drag handle | e2e | ✓ 2 passing line(s) |
| collections: Select is the collection page's primary action | e2e | ✓ 2 passing line(s) |
| collections: Failed reorder restores the order | e2e | ✓ 2 passing line(s) |
| collections: Changed elsewhere reloads politely | e2e | ✓ 2 passing line(s) |
| collections: A move is announced | e2e | ✓ 2 passing line(s) |
| collections: A failed removal drops the moves queued behind it | e2e | ✓ 2 passing line(s) |
| collections: A hundred entries stay usable | e2e | ✓ 2 passing line(s) |
| collections: Reduced motion moves instantly | e2e | ✓ 2 passing line(s) |
| collections: Move several to the top keeps their order | e2e | ✓ 2 passing line(s) |
| collections: A move's toast waits for its save | e2e | ✓ 2 passing line(s) |
| collections: Select mode in a collection moves focus in and back out | e2e | ✓ 2 passing line(s) |
| collections: Move several before another entry | e2e | ✓ 2 passing line(s) |
| collections: Move to bottom with everything selected | e2e | ✓ 2 passing line(s) |
| collections: Remove several from the collection | e2e | ✓ 2 passing line(s) |
| collections: Move order is computed for any selection | unit | ✓ 1 passing line(s) |
| design-system: Vendored files match the lock | unit | ✓ 1 passing line(s) |
| design-system: App renders with the accent | e2e | ✓ 2 passing line(s) |
| design-system: App pages load nothing from other origins | e2e | ✓ 2 passing line(s) |
| design-system: Redesign mockups are hidden without the test flag | unit | ✓ 1 passing line(s) |
| design-system: Mockup routes are hidden without the test flag | unit | ✓ 1 passing line(s) |
| design-system: Every mockup screen is shot at three widths | e2e | ✓ 102 passing line(s) |
| design-system: Worst-case data switches the fixtures | e2e | ✓ 1 passing line(s) |
| design-system: Every world has a mood photo | unit | ✓ 1 passing line(s) |
| design-system: Rue signs off wireframes and hi-fi | manual (human gate) | checklist below |
| design-system: Icon files are served | e2e | ✓ 2 passing line(s) |
| design-system: Head carries the icon links | e2e | ✓ 2 passing line(s) |
| design-system: Icon reads at small sizes | manual (visual judgement at gate 5) | checklist below |
| design-system: Contract strings stay | unit | ✓ 1 passing line(s) |
| design-system: New strings are in the contract | unit | ✓ 1 passing line(s) |
| design-system: Every route renders its contract states | manual (state walk at gate 7, from the verifier's screenshots) | checklist below |
| design-system: Every dialog traps focus and returns it | e2e | ✓ 2 passing line(s) |
| design-system: Delete confirmations are alert sheets | e2e | ✓ 2 passing line(s) |
| design-system: Menus keep the keyboard model | e2e | ✓ 2 passing line(s) |
| design-system: Selection bar announces the count | e2e | ✓ 2 passing line(s) |
| design-system: Toasts are announced without taking focus | e2e | ✓ 2 passing line(s) |
| design-system: No horizontal page scroll from 320 to 1920 | e2e | ✓ 1 passing line(s) |
| design-system: Controls meet the target sizes | e2e | ✓ 2 passing line(s) |
| design-system: Desktop uses its width | e2e | ✓ 1 passing line(s) |
| design-system: Focus is visible and not obscured | e2e | ✓ 2 passing line(s) |
| design-system: Reduced motion removes movement | e2e | ✓ 1 passing line(s) |
| design-system: WCAG 2.2 AA review passes | manual (review at gate 7) | checklist below |
| design-system: Old style files are gone | unit | ✓ 1 passing line(s) |
| design-system: Proof runs check-slop without a baseline | unit | ✓ 1 passing line(s) |
| design-system: Every mockup photo is credited | unit | ✓ 1 passing line(s) |
| design-system: Missing photo shape is generated | unit | ✓ 1 passing line(s) |
| design-system: Mockup photos stay out of the product | unit | ✓ 1 passing line(s) |
| design-system: Pages load no external resources | e2e | ✓ 1 passing line(s) |
| design-system: Display and text fonts load from the app | e2e | ✓ 2 passing line(s) |
| design-system: Inputs do not zoom on phone | e2e | ✓ 1 passing line(s) |
| design-system: Chrome text shows the default cursor | e2e | ✓ 1 passing line(s) |
| design-system: Links and buttons keep the pointer | e2e | ✓ 1 passing line(s) |
| design-system: Prose stays selectable without the text cursor | e2e | ✓ 2 passing line(s) |
| design-system: Chrome is not selectable, fields are | e2e | ✓ 1 passing line(s) |
| design-system: Focus ring follows the element's own radius | e2e | ✓ 1 passing line(s) |
| design-system: Form selects match the filter select | e2e | ✓ 2 passing line(s) |
| design-system: Artist and tag tokens share one tone | e2e | ✓ 2 passing line(s) |
| design-system: Fields in a row keep their own height | e2e | ✓ 1 passing line(s) |
| domain-lists: List shows entries of one type | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter media by status | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter by tag | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter by minimum rating | e2e | ✓ 2 passing line(s) |
| domain-lists: Minimum rating offers whole steps | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter brands and shops by kind | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter pieces by status | e2e | ✓ 2 passing line(s) |
| domain-lists: Wardrobe lists owned pieces | e2e | ✓ 2 passing line(s) |
| domain-lists: Sort by title and rating in the list | e2e | ✓ 2 passing line(s) |
| domain-lists: Filter state survives reload and back | e2e | ✓ 2 passing line(s) |
| domain-lists: Shelves view groups media by status | e2e | ✓ 2 passing line(s) |
| domain-lists: Empty list offers Add | e2e | ✓ 2 passing line(s) |
| domain-lists: Add shows only when the list has entries | e2e | ✓ 2 passing line(s) |
| domain-lists: Filters matching nothing offer reset | e2e | ✓ 2 passing line(s) |
| domain-lists: Five hundred entries and long titles stay usable | e2e | ✓ 2 passing line(s) |
| domain-lists: Retired brands list redirects | e2e | ✓ 3 passing line(s) |
| domain-lists: Retired shops list redirects | e2e | ✓ 3 passing line(s) |
| domain-lists: Unknown list answers 404 | e2e | ✓ 2 passing line(s) |
| domain-lists: List query round-trips through the URL | unit | ✓ 1 passing line(s) |
| domain-lists: Selection toggles and ranges | unit | ✓ 1 passing line(s) |
| domain-lists: Set status on several entries | e2e | ✓ 2 passing line(s) |
| domain-lists: Add and remove a tag on several entries | e2e | ✓ 2 passing line(s) |
| domain-lists: Shift-click selects a range on the desktop | e2e | ✓ 1 passing line(s) |
| domain-lists: Only valid actions are offered | e2e | ✓ 2 passing line(s) |
| domain-lists: Selection bar docks on the phone | e2e | ✓ 2 passing line(s) |
| domain-lists: Nothing selected disables the actions | e2e | ✓ 2 passing line(s) |
| domain-lists: Failed bulk action keeps every value | e2e | ✓ 2 passing line(s) |
| domain-lists: Escape and Done leave Select mode by keyboard | e2e | ✓ 2 passing line(s) |
| domain-lists: Select mode moves focus in and back out | e2e | ✓ 2 passing line(s) |
| domain-lists: Another list leaves Select mode | e2e | ✓ 2 passing line(s) |
| domain-lists: A filter drops the picks it hides | e2e | ✓ 2 passing line(s) |
| domain-lists: Focused card clears the docked bar | e2e | ✓ 1 passing line(s) |
| domain-lists: Bulk status sets every entry and records events | unit | ✓ 1 passing line(s) |
| domain-lists: Unknown id changes nothing | unit | ✓ 1 passing line(s) |
| domain-lists: Invalid status for a type is rejected | unit | ✓ 2 passing line(s) |
| domain-lists: Empty id list is a no-op | unit | ✓ 1 passing line(s) |
| domain-lists: Bulk tag reuses and prunes tags | unit | ✓ 1 passing line(s) |
| domain-lists: Bulk actions answer the list page | unit | ✓ 1 passing line(s) |
| domain-pages: Domain shelves group recent entries by type | unit | ✓ 1 passing line(s) |
| domain-pages: Fashion shelves follow the sub-type order | unit | ✓ 1 passing line(s) |
| domain-pages: Wardrobe holds only owned pieces | unit | ✓ 1 passing line(s) |
| domain-pages: One shelf holds brands and shops | unit | ✓ 1 passing line(s) |
| domain-pages: Domain page shows its hero photo | e2e | ✓ 2 passing line(s) |
| domain-pages: Domain without hero photo shows the colour field | e2e | ✓ 2 passing line(s) |
| domain-pages: Sub-type tabs per domain | e2e | ✓ 2 passing line(s) |
| domain-pages: Sub-types sit below the title | e2e | ✓ 2 passing line(s) |
| domain-pages: Sub-type links show their counts | e2e | ✓ 2 passing line(s) |
| domain-pages: Add offers the domain's types | e2e | ✓ 2 passing line(s) |
| domain-pages: Domain shelves show its entries | e2e | ✓ 2 passing line(s) |
| domain-pages: Shelf counts name their type or entries | e2e | ✓ 2 passing line(s) |
| domain-pages: In progress shelf on a media domain | e2e | ✓ 2 passing line(s) |
| domain-pages: Empty domain keeps sub-types and Add | e2e | ✓ 2 passing line(s) |
| domain-pages: The facts card comes after the shelves on the phone | e2e | ✓ 1 passing line(s) |
| domain-pages: The facts card sits beside the title on desktop | e2e | ✓ 1 passing line(s) |
| domain-pages: Unknown domain answers 404 | e2e | ✓ 2 passing line(s) |
| domain-pages: Domain page looks like the signed-off hi-fi | manual (visual judgement by Rue at gate 7) | checklist below |
| domain-pages: Fashion list config declares the groups | unit | ✓ 1 passing line(s) |
| domain-pages: Fashion tabs come in two labelled groups | e2e | ✓ 2 passing line(s) |
| domain-pages: Other domains keep a flat tab bar | e2e | ✓ 2 passing line(s) |
| domain-pages: Group captions use the type scale and colour tokens | e2e | ✓ 2 passing line(s) |
| domain-pages: Wrapped sub-types never open a line on a dash | e2e | ✓ 1 passing line(s) |
| domain-pages: Sub-types fit the phone | e2e | ✓ 1 passing line(s) |
| entries: Detail shows every filled field | e2e | ✓ 2 passing line(s) |
| entries: Long title shows in full on detail | e2e | ✓ 2 passing line(s) |
| entries: Long title truncates on cards | e2e | ✓ 2 passing line(s) |
| entries: Unknown entry answers 404 | e2e | ✓ 2 passing line(s) |
| entries: Phone detail keeps controls in reach with a long title | e2e | ✓ 1 passing line(s) |
| entries: Delete is never the primary action | e2e | ✓ 1 passing line(s) |
| entries: Delete is a danger item in the entry menu | e2e | ✓ 2 passing line(s) |
| entries: Entry without cover shows the placeholder | e2e | ✓ 2 passing line(s) |
| entries: Artist with no works says so | e2e | ✓ 2 passing line(s) |
| entries: Entry page looks like the signed-off hi-fi | manual (visual judgement by Rue at gate 7) | checklist below |
| entries: Valid status prefills the form | unit | ✓ 1 passing line(s) |
| entries: Status prefill reaches the piece form | e2e | ✓ 2 passing line(s) |
| entries: Status prefill reaches the media form | e2e | ✓ 2 passing line(s) |
| entries: Invalid status is dropped | unit | ✓ 1 passing line(s) |
| entries: Media form saves an initial status | e2e | ✓ 2 passing line(s) |
| entries: Media form defaults to No status | e2e | ✓ 2 passing line(s) |
| entries: Catalogue down leads to the manual form | e2e | ✓ 2 passing line(s) |
| entries: HEIC photo is rejected in the add form | e2e | ✓ 2 passing line(s) |
| entries: Duplicate title and long title are allowed | e2e | ✓ 2 passing line(s) |
| entries: Add form looks like the signed-off hi-fi | manual (visual judgement by Rue at gate 7, real phone) | checklist below |
| entries: Edit opens every type with its values | e2e | ✓ 2 passing line(s) |
| entries: Edited form asks before leaving | e2e | ✓ 2 passing line(s) |
| entries: Contract lists magazines | unit | ✓ 1 passing line(s) |
| entries: Existing magazines appear in their list | e2e | ✓ 2 passing line(s) |
| harness: Test routes answer 404 without the test flag | unit | ✓ 1 passing line(s) |
| harness: Reset empties the archive | e2e | ✓ 1 passing line(s) |
| harness: Seed returns the ids of what it inserted | e2e | ✓ 1 passing line(s) |
| harness: Proof prints test names and passes | manual (infrastructure; its output is the evidence every other unit relies on, read in U1's report) | checklist below |
| harness: Proof fails on a failing check | manual (infrastructure; proven once in U1 with a deliberate raw colour in a new file and a deliberate vendored edit, then reverted) | checklist below |
| harness: Proof runs the fingerprint guards | unit | ✓ 1 passing line(s) |
| home: Home shows the sections in order | e2e | ✓ 2 passing line(s) |
| home: In progress shelf lists media in progress | e2e | ✓ 2 passing line(s) |
| home: In progress cards read their progress with its total | e2e | ✓ 2 passing line(s) |
| home: Nothing in progress leaves the section out | e2e | ✓ 2 passing line(s) |
| home: Recently added shelves per domain | e2e | ✓ 2 passing line(s) |
| home: Collections section shows collages | e2e | ✓ 2 passing line(s) |
| home: No collections shows a New collection prompt | e2e | ✓ 2 passing line(s) |
| home: Settings is reached from the Home header | e2e | ✓ 2 passing line(s) |
| home: Empty archive shows a welcome per domain | e2e | ✓ 2 passing line(s) |
| home: Home head offers Add on the desktop only | e2e | ✓ 2 passing line(s) |
| home: Long titles and missing images stay inside Home | e2e | ✓ 1 passing line(s) |
| home: Home looks like the signed-off hi-fi | manual (visual judgement by Rue at gate 7) | checklist below |
| layout: Active section is derived for sub-routes | unit | ✓ 1 passing line(s) |
| layout: One Main navigation at every width | e2e | ✓ 2 passing line(s) |
| layout: Tablets get the phone layout | e2e | ✓ 2 passing line(s) |
| layout: Nav marks the current section | e2e | ✓ 1 passing line(s) |
| layout: Entry pages mark their domain | e2e | ✓ 3 passing line(s) |
| layout: Content never sits under the navigation | e2e | ✓ 2 passing line(s) |
| layout: Focused control is not hidden by the navigation | e2e | ✓ 2 passing line(s) |
| layout: Top bar shows brand, six sections and Settings | e2e | ✓ 1 passing line(s) |
| layout: Top bar fits from 1024 to 1280 px | e2e | ✓ 1 passing line(s) |
| layout: Top bar looks like the signed-off hi-fi | manual (visual judgement by Rue at gate 7) | checklist below |
| layout: Phone bar shows five pills and the round add button | e2e | ✓ 1 passing line(s) |
| layout: Current section pill is marked on the phone | e2e | ✓ 1 passing line(s) |
| layout: Phone bar fits at 320 px | e2e | ✓ 1 passing line(s) |
| layout: Pills are icon-only below 360 px and labelled from 360 px | e2e | ✓ 1 passing line(s) |
| layout: Phone bar hides while a text field has focus | e2e | ✓ 1 passing line(s) |
| layout: Collections and Settings are reached from Home on the phone | e2e | ✓ 1 passing line(s) |
| layout: Safe areas and soft keyboard on a real phone | manual (real hardware at gate 7) | checklist below |
| layout: Add items per scope | unit | ✓ 1 passing line(s) |
| layout: Plus on Home offers every type grouped by domain | e2e | ✓ 1 passing line(s) |
| layout: Plus inside a domain offers its types | e2e | ✓ 1 passing line(s) |
| layout: Plus on Wardrobe adds an owned piece | e2e | ✓ 1 passing line(s) |
| layout: Type sheet closes on Escape, outside tap and back | e2e | ✓ 1 passing line(s) |
| layout: Plus is inert on add and edit forms | e2e | ✓ 1 passing line(s) |
| layout: Scrolled top bar is a compact capsule | e2e | ✓ 1 passing line(s) |
| layout: Capsule keeps clear of the selection bar and focus | e2e | ✓ 1 passing line(s) |
| layout: Domain pages use their world | e2e | ✓ 2 passing line(s) |
| layout: Home, collections and settings name no world | e2e | ✓ 2 passing line(s) |
| layout: World screens carry their world and the night stage | e2e | ✓ 2 passing line(s) |
| layout: Home, collections and settings stay light | e2e | ✓ 2 passing line(s) |
| layout: The banner keeps the photo visible | e2e | ✓ 2 passing line(s) |
| layout: A world without a hero photo shows the flat night band | e2e | ✓ 2 passing line(s) |
| layout: A world without a hero photo keeps a banner-tall head | e2e | ✓ 1 passing line(s) |
| layout: The tablet banner keeps clear photo above the title | e2e | ✓ 1 passing line(s) |
| layout: Head text on the night is light or sits on its own surface | e2e | ✓ 2 passing line(s) |
| layout: Overlays in a world stay readable | e2e | ✓ 2 passing line(s) |
| layout: Focus rings in a world stand out from what they sit on | e2e | ✓ 2 passing line(s) |
| layout: The status bar takes the screen's colour | e2e | ✓ 2 passing line(s) |
| layout: The status bar colours come from the fingerprint tokens | unit | ✓ 1 passing line(s) |
| layout: Status bar on a real phone | manual (needs a real phone: the browser chrome is not drawn in Playwright) | checklist below |
| layout: Detail pages use their type's domain world | e2e | ✓ 4 passing line(s) |
| layout: A world shows its hero photo in the frame | e2e | ✓ 2 passing line(s) |
| layout: A world without a hero photo shows the colour field | e2e | ✓ 2 passing line(s) |
| motion: Shelf rows drag-scroll with inertia on desktop | e2e | ✓ 1 passing line(s) |
| motion: Reduced motion drag-scroll stops on release | e2e | ✓ 1 passing line(s) |
| motion: Inertia decays to a stop | unit | ✓ 1 passing line(s) |
| motion: Cards do not move on hover on desktop | e2e | ✓ 1 passing line(s) |
| motion: Cards press in | e2e | ✓ 1 passing line(s) |
| motion: Reduced motion cards stay still when pressed | e2e | ✓ 1 passing line(s) |
| motion: Navigation starts no view transition | e2e | ✓ 2 passing line(s) |
| motion: Back restores the shelf scroll position | e2e | ✓ 2 passing line(s) |
| motion: Browser without View Transitions navigates plainly | e2e | ✓ 2 passing line(s) |
| motion: Typed rating draws the confirm line | e2e | ✓ 2 passing line(s) |
| motion: Status changes at once | e2e | ✓ 2 passing line(s) |
| motion: Menus open and close softly | e2e | ✓ 1 passing line(s) |
| motion: A menu above its button grows from its bottom edge | e2e | ✓ 1 passing line(s) |
| motion: Dialogs open softly | e2e | ✓ 1 passing line(s) |
| motion: Reduced motion opens menus and dialogs at once | e2e | ✓ 1 passing line(s) |
| motion: A new collection rises into the list | e2e | ✓ 1 passing line(s) |
| motion: A new tag chip rises into the field | e2e | ✓ 1 passing line(s) |
| motion: The new-collection form fades and the cards glide | e2e | ✓ 1 passing line(s) |
| motion: Reduced motion opens and closes the new-collection form at once | e2e | ✓ 1 passing line(s) |
| motion: Moving to another entry does not raise its chips | e2e | ✓ 1 passing line(s) |
| motion: Rows glide after a pointer move, a keyboard move jumps | e2e | ✓ 1 passing line(s) |
| motion: Toast confirms save | e2e | ✓ 2 passing line(s) |
| motion: Reduced motion toast appears without sliding | e2e | ✓ 2 passing line(s) |
| motion: Toast confirms delete | e2e | ✓ 2 passing line(s) |
| motion: Micro-interactions stay calm | manual (motion quality at gate 7) | checklist below |
| release: Package and lockfile carry 0.3.0 | unit | ✗ gap: no passing test named "Scenario: Package and lockfile carry 0.3.0" |
| release: Release v0.3.0 published | manual (runs on GitHub after the ship-time tag push) | checklist below |
| settings: Upload a hero photo for Home | e2e | ✓ 2 passing line(s) |
| settings: Replace a domain hero photo | e2e | ✓ 2 passing line(s) |
| settings: Remove a hero photo | e2e | ✓ 2 passing line(s) |
| settings: Unsupported hero file shows an inline error | e2e | ✓ 2 passing line(s) |
| settings: Oversize hero file shows an inline error | e2e | ✓ 2 passing line(s) |
| settings: Slots come in world order | e2e | ✓ 2 passing line(s) |
| settings: Slots sit three to a row on desktop | e2e | ✓ 2 passing line(s) |
| settings: Replace and Remove are equal choices | e2e | ✓ 2 passing line(s) |
| settings: Settings explanation matches the contract | e2e | ✓ 2 passing line(s) |
| tracking: Rating accepts 0 to 10 with two decimals | unit | ✓ 1 passing line(s) |
| tracking: Create and update accept the full rating range | unit | ✓ 1 passing line(s) |
| tracking: Rating is stored in whole hundredths | unit | ✓ 1 passing line(s) |
| tracking: Migration converts star ratings | unit | ✓ 1 passing line(s) |
| tracking: Clearing keeps 0 distinct from unrated | unit | ✓ 1 passing line(s) |
| tracking: Type a rating with two decimals | e2e | ✓ 2 passing line(s) |
| tracking: Steps and arrow keys change the rating | e2e | ✓ 2 passing line(s) |
| tracking: Step buttons stop at the ends | e2e | ✓ 2 passing line(s) |
| tracking: Too many decimals are rejected inline | e2e | ✓ 2 passing line(s) |
| tracking: Clear the rating | e2e | ✓ 2 passing line(s) |
| tracking: Zero is a rating | e2e | ✓ 2 passing line(s) |
| tracking: Rated entries show their rating on cards | e2e | ✓ 2 passing line(s) |
| tracking: Unrated entries show no rating on cards | e2e | ✓ 2 passing line(s) |
| tracking: No star adapter is left | unit | ✓ non-exact name: `src/lib/no-adapters.test.ts` > "no star adapter is left" (2 passing lines) |
| tracking: Step episodes with plus and minus | e2e | ✓ 2 passing line(s) |
| tracking: Type progress directly | e2e | ✓ 2 passing line(s) |
| tracking: Progress value is not editable text until activated | e2e | ✓ 2 passing line(s) |
| tracking: Clicking the value enters edit mode with the value selected | e2e | ✓ 2 passing line(s) |
| tracking: Keyboard enters edit mode | e2e | ✓ 2 passing line(s) |
| tracking: Leaving the input saves the edit | e2e | ✓ 2 passing line(s) |
| tracking: Escape cancels editing | e2e | ✓ 2 passing line(s) |
| tracking: Invalid input reverts without saving | e2e | ✓ 2 passing line(s) |
| tracking: Typed progress is parsed strictly | unit | ✓ 1 passing line(s) |
| tracking: Progress value is named for screen readers | e2e | ✓ 2 passing line(s) |
| tracking: Numeric keyboard opens only in edit mode | e2e | ✓ 1 passing line(s) |
| tracking: Activating the value on a card stays on the list | e2e | ✓ 2 passing line(s) |
| tracking: Progress control fits a phone shelf card | e2e | ✓ 1 passing line(s) |
| tracking: Three-digit progress fits a phone shelf card | e2e | ✓ 1 passing line(s) |
| tracking: Desktop cards show the total | e2e | ✓ 1 passing line(s) |
| tracking: Progress cannot go below zero | unit | ✓ 1 passing line(s) |
| tracking: Progress cannot exceed a known total | unit | ✓ 1 passing line(s) |
| tracking: Unknown total has no upper bound | unit | ✓ 1 passing line(s) |
| tracking: Ongoing manga shows n / ? | e2e | ✓ 2 passing line(s) |
| tracking: Reaching the total offers Mark as watched | e2e | ✓ 2 passing line(s) |
| tracking: Reaching the chapter total offers Mark as read | e2e | ✓ 2 passing line(s) |
| tracking: Progress moves want to in progress | unit | ✓ 1 passing line(s) |
| tracking: Progress leaves other statuses alone | unit | ✓ 1 passing line(s) |
| tracking: Manga tracks chapters and volumes separately | unit | ✓ 1 passing line(s) |
| tracking: Progress on the card | e2e | ✓ 2 passing line(s) |

## Manual checklist (start: `npm run dev` -> http://localhost:5173)

- [ ] design-system: Rue signs off wireframes and hi-fi - manual (human gate)
- [ ] design-system: Icon reads at small sizes - manual (visual judgement at gate 5)
- [ ] design-system: Every route renders its contract states - manual (state walk at gate 7, from the verifier's screenshots)
- [ ] design-system: WCAG 2.2 AA review passes - manual (review at gate 7)
- [ ] domain-pages: Domain page looks like the signed-off hi-fi - manual (visual judgement by Rue at gate 7)
- [ ] entries: Entry page looks like the signed-off hi-fi - manual (visual judgement by Rue at gate 7)
- [ ] entries: Add form looks like the signed-off hi-fi - manual (visual judgement by Rue at gate 7, real phone)
- [ ] harness: Proof prints test names and passes - manual (infrastructure; its output is the evidence every other unit relies on, read in U1's report)
- [ ] harness: Proof fails on a failing check - manual (infrastructure; proven once in U1 with a deliberate raw colour in a new file and a deliberate vendored edit, then reverted)
- [ ] home: Home looks like the signed-off hi-fi - manual (visual judgement by Rue at gate 7)
- [ ] layout: Top bar looks like the signed-off hi-fi - manual (visual judgement by Rue at gate 7)
- [ ] layout: Safe areas and soft keyboard on a real phone - manual (real hardware at gate 7)
- [ ] motion: Micro-interactions stay calm - manual (motion quality at gate 7)
- [ ] release: Release v0.3.0 published - manual (runs on GitHub after the ship-time tag push)
- [ ] layout: Status bar on a real phone - manual (needs a real phone: the browser chrome is not drawn in Playwright). On the device: Home, Collections and Settings show the page colour (`#E7E2DC`) in the status bar, a domain screen shows its night (Music `#2A191C`, Animanga `#11142B`, Books `#16252A`, Fashion `#29211D`), also after tapping between screens

## Diffstat

```
 764 files changed, 53130 insertions(+), 11697 deletions(-)
```

## Screenshots

Under `test-results/shots/` (redesign/ slug-width-variant), written by the proof:full run at HEAD.

## Review

### Verify round 2 fixer (c529352..ea368fd)
- Nav phone overlap: test waits for the capsule scroll-padding (timing race in the test, the app was fine).
- Globals h2 count: scoped to grid cards.
- Capsule spec 1024 -> 1100: MODIFIED in the delta spec.
- Heading-hierarchy test added.
- progressGroup: exact names.
- ReorderList re-announce: fixed, regression test added.

### Gate-7 polish pass (e9f96f0..a20717a)
- Cursor and selection, soft overlays 160 ms, card press 0.97, created items rise, rows glide, hi-fi fixes.

### Round 3 reviewer
- R1 entry chips rose on client navigation: `{#key}` + regression test (d0fe685).
- R2 rise test scoped to the new card (e4e08a5).
- R3 settings slot grid scenario + whole-row check (8292d32).
- R4 strings from copy.ts, Anime/Manga count in entries (6c477c6).
- R5 sub-type counts as text, data-n removed (a19c655).
- R6 new-collection form fades, no rise (d79290c).

### Round 3 design pass
- D1/D2 delete confirmations are alert sheets, alertdialog (534d12c).
- D3 cards glide when the form leaves (d79290c).
- D4 tag chips rise/glide (1ca1c8b).
- D5 phone Save pill arrow right (0866d50).
- D6 "n / total unit" on narrow cards (7caae51).
- D7 round thumbs (0f7a044).
- D8 see R4.
- D9 Unlink artist text button (86d4e94).
- D10 44 px crumbs (daefbef).
- D11 only fields + Rue's prose selectable (cb4af5b).
- D12 flipped menu grows from bottom (996b4e6, made deterministic in caca603).
- P1 "+" rim over charcoal (ca3cc38).

### Final proof:full
- Red at c1d66f2: phone a11y-floor goto race after the "+" sheet's history.back (test waits for popstate, 64a891e, 10/10) and flipped menu origin (ResizeObserver picks the corner before first paint, caca603, 10/10).
- Rerun at HEAD green: 771 passed, 165 skipped, unit 427 passed.

### Open for Rue at Gate 7 (taste, not built; first round)
- List grid 12rem vs hi-fi 10rem.
- Entry "···" menu vs hi-fi glass rail.
- Status shapes vs plain bar.
- Phone key-facts card position.
- Tag chips inside vs below input.
- Typed "- 7 +" vs round steppers.
- Entry page settle after Save.
- Reduced-motion fade of the new-collection form.
- Collection rows taller on touch.
- Vendored DESIGN.md says menus instant (Design-System request).

### Gate 7 feedback from Rue (2026-11-17)
- (1) Fashion sub-type toggle above the heading: moved below the title on all domain and list pages (465df1d, e2e).
- (2) Hero images as banners and (3) a vibe per domain: three directions mocked, Rue chose B "Night banner". Design-System fingerprint 2.1.0 (requests #24 world tokens, #25 night stage, #26 gitleaks) synced (1a8ed13); night banner built (3697a86, 1e02b27).

### Re-verify round 4 (3cb2bb5, proof:full green 787)
- R1 caption spec vs test: spec MODIFIED.
- R2 halo focus ring now measured.
- R3 overlays checked over night and veil.
- R4 painted veil sampled.
- R5 no-hero band asserted on /books.
- R6 no-hero head-height scenario.
- D1 theme-color per route from tokens (c2b3b44).
- D2 768 clear photo strip >= 64 px (096c86f).
- D3 kicker dash can't start a wrapped line, app-wide (cbd882c).
- D4 Year field (00c5aff).
- D5 halo and dialog backdrop in the world's night (949b7ea).
- Every new assertion was shown to fail with its fix reverted.
- Final proof:full at 2c2985a: green, e2e 793 passed / 169 skipped, unit 429 passed, check-drift 20 files match lock v2.1.0.

### Open for Rue (taste, as built, round 4)
- Kicker on the veil is white-secondary (glow only on the accent word).
- Add/edit forms keep the short head.
- Settings copy "soft colour field" vs the night band.
- Phone facts card at the bottom vs under Add.
- Plus the earlier list: grid 12rem, entry "..." menu, status shapes, key-facts position, tag chips in field, - n + control, settle after Save, reduced-motion form fade, collection rows on touch.

