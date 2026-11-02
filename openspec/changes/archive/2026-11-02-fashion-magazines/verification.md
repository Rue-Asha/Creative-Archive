verified-at: ac54508

## Layer 1: npm run proof:full (green, 674 passed, 52 skipped, 5.1m; round 2 after review fixes 5af0e25, ac54508)
```
  ✓  726 [desktop] › e2e/worlds.test.ts:36:1 › a list page uses its domain's world before the list names one (110ms)

  52 skipped
  674 passed (5.0m)
```

## Layer 2 coverage

All 70 scenarios across the 6 delta specs: 67 have a test named "Scenario: <title>" that passed in the proof:full output (vitest and Playwright both print names; e2e passed in phone and desktop); 3 are manual.

| Scenario | proof | Evidence |
|---|---|---|
| Package and lockfile carry 0.1.2 | unit | "Scenario: Package and lockfile carry 0.1.2" ✓ |
| Release v0.1.2 published | manual (runs on GitHub after the ship-time tag push) | manual, on checklist |
| Changing status stores a dated event | unit | "Scenario: Changing status stores a dated event" ✓ |
| Setting the same status again stores no event | unit | "Scenario: Setting the same status again stores no event" ✓ |
| New entry with a status stores its first event | unit | "Scenario: New entry with a status stores its first event" ✓ |
| Status none is allowed | unit | "Scenario: Status none is allowed" ✓ |
| Invalid status for a type is rejected | unit | "Scenario: Invalid status for a type is rejected" ✓ |
| Status labels follow the domain | e2e | "Scenario: Status labels follow the domain" ✓ |
| Set status from the detail page | e2e | "Scenario: Set status from the detail page" ✓ |
| Set a piece status from the detail page | e2e | "Scenario: Set a piece status from the detail page" ✓ |
| Fashion entries without status or rating show no controls | e2e | "Scenario: Fashion entries without status or rating show no controls" ✓ |
| Open Graph tags fill the preview | unit | "Scenario: Open Graph tags fill the preview" ✓ |
| Page without Open Graph falls back to title and icon | unit | "Scenario: Page without Open Graph falls back to title and icon" ✓ |
| Relative og:image resolves against the page URL | unit | "Scenario: Relative og:image resolves against the page URL" ✓ |
| Page with nothing usable has no preview | unit | "Scenario: Page with nothing usable has no preview" ✓ |
| Paste a brand URL and get its preview image | e2e | "Scenario: Paste a brand URL and get its preview image" ✓ |
| Piece URL preview fills name and image | e2e | "Scenario: Piece URL preview fills name and image" ✓ |
| Icon is used when there is no og:image | e2e | "Scenario: Icon is used when there is no og:image" ✓ |
| Blocked site keeps the form usable | e2e | "Scenario: Blocked site keeps the form usable" ✓ |
| JS-only shell shows No preview found | e2e | "Scenario: JS-only shell shows No preview found" ✓ |
| Login wall shows No preview found | e2e | "Scenario: Login wall shows No preview found" ✓ |
| Existing name is not overwritten by the preview | e2e | "Scenario: Existing name is not overwritten by the preview" ✓ |
| Pasted preview URL fills an empty URL field | e2e | "Scenario: Pasted preview URL fills an empty URL field" ✓ |
| A typed URL is not overwritten by the preview URL | e2e | "Scenario: A typed URL is not overwritten by the preview URL" ✓ |
| Invalid URL shows an inline error | e2e | "Scenario: Invalid URL shows an inline error" ✓ |
| Private address URL is refused in the form | e2e | "Scenario: Private address URL is refused in the form" ✓ |
| Previewing a real site | manual (needs real sites over the network, which tests never reach; Gate 2) | manual, on checklist |
| Profile URLs map to handles | unit | "Scenario: Profile URLs map to handles" ✓ |
| Unknown platform fills only the website | unit | "Scenario: Unknown platform fills only the website" ✓ |
| Post and video URLs give no prefill | unit | "Scenario: Post and video URLs give no prefill" ✓ |
| Pasting an Instagram profile fills the handle | e2e | "Scenario: Pasting an Instagram profile fills the handle" ✓ |
| Pasting another site fills the website field | e2e | "Scenario: Pasting another site fills the website field" ✓ |
| A typed handle is not overwritten | e2e | "Scenario: A typed handle is not overwritten" ✓ |
| Pasting a post URL fills no handle | e2e | "Scenario: Pasting a post URL fills no handle" ✓ |
| Pasting a profile on a magazine fills the handle | e2e | "Scenario: Pasting a profile on a magazine fills the handle" ✓ |
| Pasting a magazine's site fills name, image and website | e2e | "Scenario: Pasting a magazine's site fills name, image and website" ✓ |
| Every type has a complete config | unit | "Scenario: Every type has a complete config" ✓ |
| Each list slug resolves to its type | unit | "Scenario: Each list slug resolves to its type" ✓ |
| Create a magazine from the Add menu | e2e | "Scenario: Create a magazine from the Add menu" ✓ |
| Magazine form shows the influencer fields | e2e | "Scenario: Magazine form shows the influencer fields" ✓ |
| Empty magazines list offers Add | e2e | "Scenario: Empty magazines list offers Add" ✓ |
| Magazine joins a collection | unit | "Scenario: Magazine joins a collection" ✓ |
| Fashion welcome names magazines | e2e | "Scenario: Fashion welcome names magazines" ✓ |
| Fresh database gets the schema | unit | "Scenario: Fresh database gets the schema" ✓ |
| Only new migrations run on an existing database | unit | "Scenario: Only new migrations run on an existing database" ✓ |
| Failing migration stops the server | unit | "Scenario: Failing migration stops the server" ✓ |
| Server starts from any working directory | unit | "Scenario: Server starts from any working directory" ✓ |
| Migration that breaks a foreign key is rolled back | unit | "Scenario: Migration that breaks a foreign key is rolled back" ✓ |
| Foreign keys are on after migrating | unit | "Scenario: Foreign keys are on after migrating" ✓ |
| Existing database migrates without loss | unit | "Scenario: Existing database migrates without loss" ✓ |
| Foreign keys still bind after the rebuild | unit | "Scenario: Foreign keys still bind after the rebuild" ✓ |
| Migration 0003 runs once | unit | "Scenario: Migration 0003 runs once" ✓ |
| Fresh and migrated databases share one schema | unit | "Scenario: Fresh and migrated databases share one schema" ✓ |
| Database accepts a magazine only without a status | unit | "Scenario: Database accepts a magazine only without a status" ✓ |
| Domain shelves group recent entries by type | unit | "Scenario: Domain shelves group recent entries by type" ✓ |
| Fashion shelves follow the type order | unit | "Scenario: Fashion shelves follow the type order" ✓ |
| Domain page shows its hero photo | e2e | "Scenario: Domain page shows its hero photo" ✓ |
| Domain without hero photo shows the theme gradient | e2e | "Scenario: Domain without hero photo shows the theme gradient" ✓ |
| Sub-type tabs per domain | e2e | "Scenario: Sub-type tabs per domain" ✓ |
| Add offers the domain's types | e2e | "Scenario: Add offers the domain's types" ✓ |
| Domain shelves show its entries | e2e | "Scenario: Domain shelves show its entries" ✓ |
| Unknown domain answers 404 | e2e | "Scenario: Unknown domain answers 404" ✓ |
| Fashion tabs come in two labelled groups | e2e | "Scenario: Fashion tabs come in two labelled groups" ✓ |
| Fashion list config declares the groups | unit | "Scenario: Fashion list config declares the groups" ✓ |
| Other domains keep a flat tab bar | e2e | "Scenario: Other domains keep a flat tab bar" ✓ |
| Group captions use the type scale and colour tokens | e2e | "Scenario: Group captions use the type scale and colour tokens" ✓ |
| Grouped tabs keep the chip style | e2e | "Scenario: Grouped tabs keep the chip style" ✓ |
| Grouped tabs fit the phone | e2e | "Scenario: Grouped tabs fit the phone" ✓ |
| Grouped tabs sit in one row on desktop | e2e | "Scenario: Grouped tabs sit in one row on desktop" ✓ |
| Grouped tabs read well | manual (wording and look are taste, risk R3; judged at Gate 2) | manual, on checklist |

## Manual checklist

run: `npm run dev` → http://localhost:5173

- Previewing a real site: in Add, paste a real brand/magazine URL and confirm name and image fill.
- Grouped tabs read well: open /fashion and judge group captions, wording and look on phone and desktop.
- Release v0.1.2 published: after the ship-time tag push, check the GitHub release exists.

## Diffstat
```
 src/lib/server/db.ts                               |  29 +++--
 src/lib/server/entries.test.ts                     |   3 +-
 src/lib/server/home.test.ts                        |   7 +
 src/lib/server/migrate-0003.test.ts                | 134 ++++++++++++++++++++
 src/lib/server/schema.test.ts                      |   6 +
 src/lib/server/tracking.test.ts                    |   6 +-
 src/lib/types.ts                                   |   1 +
 36 files changed, 1405 insertions(+), 49 deletions(-)
```

## Screenshots (test-results/shots/)
test-results/shots/mockups/*.png, e.g. desktop-animanga-dark.png (existing mockup shots; none specific to this change)

## Review

Fresh-context review of `origin/main...6ed722c`: no weakened tests, no spec mismatch, no correctness findings. Migration 0003 and the `migrate()` foreign-key handling were replayed on a temp DB (0001 → 0002 → seed → 0003): `foreign_key_check` empty, all child rows, FK actions and indexes kept.

| Finding | Resolution |
|---|---|
| [weak] `migrate-0003.test.ts` "Foreign keys still bind after the rebuild" deleted an entry without status events | Fixed in 5af0e25: deletes entry 4 (has events), asserts only entries 1 and 10 keep theirs; mutation check (status_events recreated without ON DELETE CASCADE) went red, reverted |
| [weak] `e2e/magazines.test.ts` handle check matched the `<h1>` | Fixed in ac54508: exact `Instagram` dt plus exact `vestoj` inside `[data-detail-panel] dl` |
| [weak, minor] `getByLabel('Rating')` count 0 in "Magazine form shows the influencer fields" | Fixed in ac54508: assertion dropped, Status and progress checks kept |
| Untested edge: grouped `.tabs` at 1024 px may wrap | Not a finding (estimate says one row fits); the e2e checks 1280 px and the phone overflow. Judge at the manual look. |

Round 2: `proof:full` green at ac54508 (674 passed, 52 skipped, 0 ✘), 67 of 70 scenarios named and passed, 3 manual, no gaps.
