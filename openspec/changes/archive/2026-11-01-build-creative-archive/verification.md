verified-at: 6ace36b

# Verification, round 3b (re-stamp after 6ace36b)

Layer 1: `npm run proof:full` green (svelte-check 0 errors / 0 warnings, build ok, vitest 368 passed in 46 files, Playwright 570 passed, 30 skipped = project-gated phone/desktop skips, no failures). `openspec validate build-creative-archive --strict`: valid.

```
  ✓  598 [desktop] › e2e/worlds.test.ts:13:1 › Scenario: Domain pages use their world (341ms)
  ✓  599 [desktop] › e2e/worlds.test.ts:25:1 › Scenario: Home, collections and settings use the home world (244ms)
  ✓  600 [desktop] › e2e/worlds.test.ts:36:1 › a list page uses its domain's world before the list names one (105ms)

  30 skipped
  570 passed (5.2m)
```

Flaky checks (`--repeat-each 5`, phone + desktop, `e2e/collection-popover.test.ts`, 4 tests incl. the two typeless-403 ones from 6ace36b): 60 passed, 0 failed. Earlier round-3 repeat over progress, journey, rating, cards, preview: 555 passed, 15 skipped (project-gated), 0 failed.

Coverage: 305 scenarios, 101 unit passed, 176 e2e passed, 28 manual, 0 gaps.

Done tests (journey.test.ts), all pass on phone and desktop:
- Done: add Blonde, Frank Ocean linked, Listened, rated 4.5
- Done: Frieren to 28/28 offers Mark as watched, ongoing manga shows 0 / ?
- Done: brand URL gives a preview image, a blocking site takes an upload
- Done: owned pieces appear under Wardrobe
- Done: tagged entry in a mixed collection shows a collage
- Done: Home shows hero, coverflow and shelves, domain pages show their worlds
- Done: cover morphs, scrolling reveals, everything is still at reduced motion
- Done: the whole journey under reduced motion

## Coverage table

| Scenario | proof | Evidence |
|---|---|---|
| artist-link: Album links to its artist | e2e | `e2e` "Scenario: Album links to its artist" ✓ (2) |
| artist-link: Unlinked artist name shows as text | e2e | `e2e` "Scenario: Unlinked artist name shows as text" ✓ (2) |
| artist-link: Artist lists linked albums and songs | e2e | `e2e` "Scenario: Artist lists linked albums and songs" ✓ (2) |
| artist-link: Deleting an artist keeps the name text | unit | `unit` "Scenario: Deleting an artist keeps the name text" ✓ (1) |
| artist-link: Ensure artist reuses the same Deezer id | unit | `unit` "Scenario: Ensure artist reuses the same Deezer id" ✓ (1) |
| artist-link: Same name with different Deezer ids stays separate | unit | `unit` "Scenario: Same name with different Deezer ids stays separate" ✓ (1) |
| artist-link: Autofill creates the artist with status none and photo | e2e | `e2e` "Scenario: Autofill creates the artist with status none and photo" ✓ (2) |
| artist-link: Autofill links an existing artist | e2e | `e2e` "Scenario: Autofill links an existing artist" ✓ (2) |
| artist-link: Unticking Add artist stores the name only | e2e | `e2e` "Scenario: Unticking Add artist stores the name only" ✓ (2) |
| artist-link: Manual entry picks an existing artist | e2e | `e2e` "Scenario: Manual entry picks an existing artist" ✓ (2) |
| artist-link: Manual entry types an artist as text only | e2e | `e2e` "Scenario: Manual entry types an artist as text only" ✓ (2) |
| autofill: Deezer album results map to drafts | unit | `unit` "Scenario: Deezer album results map to drafts" ✓ (1) |
| autofill: EP record type maps to EP | unit | `unit` "Scenario: EP record type maps to EP" ✓ (1) |
| autofill: Failed album enrichment leaves the year empty | unit | `unit` "Scenario: Failed album enrichment leaves the year empty" ✓ (1) |
| autofill: Deezer artist results carry the photo | unit | `unit` "Scenario: Deezer artist results carry the photo" ✓ (1) |
| autofill: Deezer track results carry album and artist | unit | `unit` "Scenario: Deezer track results carry album and artist" ✓ (1) |
| autofill: AniList anime maps episodes and year | unit | `unit` "Scenario: AniList anime maps episodes and year" ✓ (1) |
| autofill: AniList null totals stay empty | unit | `unit` "Scenario: AniList null totals stay empty" ✓ (1) |
| autofill: AniList errors become a provider error | unit | `unit` "Scenario: AniList errors become a provider error" ✓ (1) |
| autofill: Open Library keeps the author in original script | unit | `unit` "Scenario: Open Library keeps the author in original script" ✓ (1) |
| autofill: Open Library result without cover has no cover | unit | `unit` "Scenario: Open Library result without cover has no cover" ✓ (1) |
| autofill: Provider times out after 5 seconds | unit | `unit` "Scenario: Provider times out after 5 seconds" ✓ (1) |
| autofill: Real providers answer a live search | manual | on manual checklist |
| autofill: Search shows results with cover, title, creator and year | e2e | `e2e` "Scenario: Search shows results with cover, title, creator and year" ✓ (2) |
| autofill: Typing is debounced | e2e | `e2e` "Scenario: Typing is debounced" ✓ (2) |
| autofill: Picking a result prefills the form | e2e | `e2e` "Scenario: Picking a result prefills the form" ✓ (2) |
| autofill: Saved cover is stored locally | e2e | `e2e` "Scenario: Saved cover is stored locally" ✓ (2) |
| autofill: Anime search prefills episodes | e2e | `e2e` "Scenario: Anime search prefills episodes" ✓ (2) |
| autofill: Ongoing manga autofill leaves totals empty | e2e | `e2e` "Scenario: Ongoing manga autofill leaves totals empty" ✓ (2) |
| autofill: Original-script author stays editable | e2e | `e2e` "Scenario: Original-script author stays editable" ✓ (2) |
| autofill: Existing entry shows Already in your archive | e2e | `e2e` "Scenario: Existing entry shows Already in your archive" ✓ (2) |
| autofill: Provider error offers Add manually with the query | e2e | `e2e` "Scenario: Provider error offers Add manually with the query" ✓ (2) |
| autofill: Provider timeout offers Add manually with the query | e2e | `e2e` "Scenario: Provider timeout offers Add manually with the query" ✓ (2) |
| autofill: No results offers Add manually with the query | e2e | `e2e` "Scenario: No results offers Add manually with the query" ✓ (2) |
| autofill: Cover download failure saves without cover | e2e | `e2e` "Scenario: Cover download failure saves without cover" ✓ (2) |
| autofill: Server refuses a duplicate provider id on save | unit | `unit` "Scenario: Server refuses a duplicate provider id on save" ✓ (1) |
| collections: Collection requires a name | unit | `unit` "Scenario: Collection requires a name" ✓ (1) |
| collections: Same entry added twice is kept once | unit | `unit` "Scenario: Same entry added twice is kept once" ✓ (1) |
| collections: Collage uses the first three images in added order | unit | `unit` "Scenario: Collage uses the first three images in added order" ✓ (1) |
| collections: Deleting a collection keeps its entries | unit | `unit` "Scenario: Deleting a collection keeps its entries" ✓ (1) |
| collections: Rename a collection | unit | `unit` "Scenario: Rename a collection" ✓ (3) |
| collections: Create a collection from the index | e2e | `e2e` "Scenario: Create a collection from the index" ✓ (2) |
| collections: Add an entry from its detail page | e2e | `e2e` "Scenario: Add an entry from its detail page" ✓ (2) |
| collections: Create a collection from the popover | e2e | `e2e` "Scenario: Create a collection from the popover" ✓ (2) |
| collections: Adding an entry twice from the popover keeps one | e2e | `e2e` "Scenario: Adding an entry twice from the popover keeps one" ✓ (2) |
| collections: Failed save in the popover shows a toast and reverts | e2e | `e2e` "Scenario: Failed save in the popover shows a toast and reverts" ✓ (6) |
| collections: Collection page shows mixed cards | e2e | `e2e` "Scenario: Collection page shows mixed cards" ✓ (2) |
| collections: Index shows collage and count | e2e | `e2e` "Scenario: Index shows collage and count" ✓ (2) |
| collections: Remove an entry from a collection | e2e | `e2e` "Scenario: Remove an entry from a collection" ✓ (2) |
| collections: Rename a collection on its page | e2e | `e2e` "Scenario: Rename a collection on its page" ✓ (2) |
| collections: Deleting a collection asks first | e2e | `e2e` "Scenario: Deleting a collection asks first" ✓ (2) |
| design-system: Every mockup photo is credited | unit | `unit` "Scenario: Every mockup photo is credited" ✓ (1) |
| design-system: Missing photo shape is generated | unit | `unit` "Scenario: Missing photo shape is generated" ✓ (1) |
| design-system: Mockup photos stay out of the product | unit | `unit` "Scenario: Mockup photos stay out of the product" ✓ (1) |
| design-system: Every scheme and accent defines the full token set | unit | `unit` "Scenario: Every scheme and accent defines the full token set" ✓ (1) |
| design-system: Switching a world is a data change | e2e | `e2e` "Scenario: Switching a world is a data change" ✓ (2) |
| design-system: Text contrast meets AA in every world | unit | `unit` "Scenario: Text contrast meets AA in every world" ✓ (1) |
| design-system: Text over photos stays legible | unit | `unit` "Scenario: Text over photos stays legible" ✓ (1) |
| design-system: Display and text fonts load from the app | e2e | `e2e` "Scenario: Display and text fonts load from the app" ✓ (6) |
| design-system: Type pairings are token blocks selected by data-font | unit | `unit` "Scenario: Type pairings are token blocks selected by data-font" ✓ (2) |
| design-system: Pages load no external resources | e2e | `e2e` "Scenario: Pages load no external resources" ✓ (20) |
| design-system: Card follows the Swap layout | e2e | `e2e` "Scenario: Card follows the Swap layout" ✓ (2) |
| design-system: Star rating shows half stars | e2e | `e2e` "Scenario: Star rating shows half stars" ✓ (2) |
| design-system: Status split-pill opens its choices | e2e | `e2e` "Scenario: Status split-pill opens its choices" ✓ (2) |
| design-system: Placeholder shows a tint and initials | unit | `unit` "Scenario: Placeholder shows a tint and initials" ✓ (1) |
| design-system: Controls are at least 44px on phone | e2e | `e2e` "Scenario: Controls are at least 44px on phone" ✓ (11) |
| design-system: Components match the visual brief | manual | on manual checklist |
| design-system: Mockups render every world in light and dark | e2e | `e2e` "Scenario: Mockups render every world in light and dark" ✓ (20) |
| design-system: Mockup routes are hidden without the test flag | unit | `unit` "Scenario: Mockup routes are hidden without the test flag" ✓ (1) |
| design-system: Mockup screenshots are produced for both viewports | e2e | `e2e` "Scenario: Mockup screenshots are produced for both viewports" ✓ (20) |
| design-system: Mockups share one alignment rule | e2e | `e2e` "Scenario: Mockups share one alignment rule" ✓ (20) |
| design-system: Rue picks a world per domain | manual | on manual checklist |
| design-system: Requested changes revise the mockups | manual | on manual checklist |
| domain-lists: List query filters by status, kind, tag and minimum rating | unit | `unit` "Scenario: List query filters by status, kind, tag and minimum rating" ✓ (1) |
| domain-lists: List query sorts by added, rating and title | unit | `unit` "Scenario: List query sorts by added, rating and title" ✓ (1) |
| domain-lists: List shows entries of one type | e2e | `e2e` "Scenario: List shows entries of one type" ✓ (2) |
| domain-lists: Filter media by status | e2e | `e2e` "Scenario: Filter media by status" ✓ (2) |
| domain-lists: Filter by tag | e2e | `e2e` "Scenario: Filter by tag" ✓ (2) |
| domain-lists: Filter by minimum rating | e2e | `e2e` "Scenario: Filter by minimum rating" ✓ (2) |
| domain-lists: Filter shops by kind | e2e | `e2e` "Scenario: Filter shops by kind" ✓ (2) |
| domain-lists: Filter pieces by status | e2e | `e2e` "Scenario: Filter pieces by status" ✓ (2) |
| domain-lists: Wardrobe lists owned pieces | e2e | `e2e` "Scenario: Wardrobe lists owned pieces" ✓ (2) |
| domain-lists: Sort by title and rating in the list | e2e | `e2e` "Scenario: Sort by title and rating in the list" ✓ (2) |
| domain-lists: Filter state survives reload and back | e2e | `e2e` "Scenario: Filter state survives reload and back" ✓ (2) |
| domain-lists: Shelves view groups media by status | e2e | `e2e` "Scenario: Shelves view groups media by status" ✓ (2) |
| domain-lists: Empty list offers Add | e2e | `e2e` "Scenario: Empty list offers Add" ✓ (2) |
| domain-lists: Filters matching nothing offer reset | e2e | `e2e` "Scenario: Filters matching nothing offer reset" ✓ (2) |
| domain-lists: Unknown list answers 404 | e2e | `e2e` "Scenario: Unknown list answers 404" ✓ (2) |
| domain-lists: List query round-trips through the URL | unit | `unit` "Scenario: List query round-trips through the URL" ✓ (1) |
| domain-pages: Domain shelves group recent entries by type | unit | `unit` "Scenario: Domain shelves group recent entries by type" ✓ (1) |
| domain-pages: Domain page shows its hero photo | e2e | `e2e` "Scenario: Domain page shows its hero photo" ✓ (2) |
| domain-pages: Domain without hero photo shows the theme gradient | e2e | `e2e` "Scenario: Domain without hero photo shows the theme gradient" ✓ (2) |
| domain-pages: Sub-type tabs per domain | e2e | `e2e` "Scenario: Sub-type tabs per domain" ✓ (2) |
| domain-pages: Add offers the domain's types | e2e | `e2e` "Scenario: Add offers the domain's types" ✓ (2) |
| domain-pages: Domain shelves show its entries | e2e | `e2e` "Scenario: Domain shelves show its entries" ✓ (2) |
| domain-pages: Unknown domain answers 404 | e2e | `e2e` "Scenario: Unknown domain answers 404" ✓ (2) |
| entries: Every type has a complete config | unit | `unit` "Scenario: Every type has a complete config" ✓ (1) |
| entries: Each list slug resolves to its type | unit | `unit` "Scenario: Each list slug resolves to its type" ✓ (1) |
| entries: Create an entry of each type | unit | `unit` "Scenario: Create an entry of each type" ✓ (1) |
| entries: Server rejects a blank title | unit | `unit` "Scenario: Server rejects a blank title" ✓ (1) |
| entries: Fields of another type are ignored | unit | `unit` "Scenario: Fields of another type are ignored" ✓ (1) |
| entries: Create an album manually from the form | e2e | `e2e` "Scenario: Create an album manually from the form" ✓ (2) |
| entries: Form shows the fields of its type | e2e | `e2e` "Scenario: Form shows the fields of its type" ✓ (2) |
| entries: Empty title is not saved | e2e | `e2e` "Scenario: Empty title is not saved" ✓ (2) |
| entries: Double submit creates one entry | e2e | `e2e` "Scenario: Double submit creates one entry" ✓ (2) |
| entries: Kind decides the brand or site type | unit | `unit` "Scenario: Kind decides the brand or site type" ✓ (1) |
| entries: Edit changes are saved | e2e | `e2e` "Scenario: Edit changes are saved" ✓ (2) |
| entries: Update bumps the updated timestamp | unit | `unit` "Scenario: Update bumps the updated timestamp" ✓ (1) |
| entries: Detail shows every filled field | e2e | `e2e` "Scenario: Detail shows every filled field" ✓ (2) |
| entries: Long title shows in full on detail | e2e | `e2e` "Scenario: Long title shows in full on detail" ✓ (2) |
| entries: Long title truncates on cards | e2e | `e2e` "Scenario: Long title truncates on cards" ✓ (2) |
| entries: Unknown entry answers 404 | e2e | `e2e` "Scenario: Unknown entry answers 404" ✓ (2) |
| entries: Delete asks first and returns to the list | e2e | `e2e` "Scenario: Delete asks first and returns to the list" ✓ (2) |
| entries: Cancelled delete keeps the entry | e2e | `e2e` "Scenario: Cancelled delete keeps the entry" ✓ (2) |
| entries: Deleted entry leaves every collection | unit | `unit` "Scenario: Deleted entry leaves every collection" ✓ (1) |
| entries: Leaving a changed form asks first | e2e | `e2e` "Scenario: Leaving a changed form asks first" ✓ (2) |
| entries: Discarding leaves the form | e2e | `e2e` "Scenario: Discarding leaves the form" ✓ (2) |
| entries: Leaving an untouched form does not ask | e2e | `e2e` "Scenario: Leaving an untouched form does not ask" ✓ (2) |
| entries: Changed edit form asks before leaving | e2e | `e2e` "Scenario: Changed edit form asks before leaving" ✓ (2) |
| entries: Saving does not ask | e2e | `e2e` "Scenario: Saving does not ask" ✓ (2) |
| entries: Reload of a changed form triggers the native prompt | e2e | `e2e` "Scenario: Reload of a changed form triggers the native prompt" ✓ (2) |
| entries: Reload of an untouched form does not prompt | e2e | `e2e` "Scenario: Reload of an untouched form does not prompt" ✓ (2) |
| harness: Proof prints test names and passes | manual | on manual checklist |
| harness: Proof fails on a failing check | manual | on manual checklist |
| harness: Proof-full runs e2e on an isolated database | manual | on manual checklist |
| harness: Each e2e test runs on phone and desktop | manual | on manual checklist |
| harness: App is hydrated before tests interact | e2e | `e2e` "Scenario: App is hydrated before tests interact" ✓ (2) |
| harness: Fresh database gets the schema | unit | `unit` "Scenario: Fresh database gets the schema" ✓ (1) |
| harness: Only new migrations run on an existing database | unit | `unit` "Scenario: Only new migrations run on an existing database" ✓ (1) |
| harness: Failing migration stops the server | unit | `unit` "Scenario: Failing migration stops the server" ✓ (1) |
| harness: Server starts from any working directory | unit | `unit` "Scenario: Server starts from any working directory" ✓ (1) |
| harness: Healthy server answers 200 | unit | `unit` "Scenario: Healthy server answers 200" ✓ (1) |
| harness: Unreadable database answers 503 | unit | `unit` "Scenario: Unreadable database answers 503" ✓ (1) |
| harness: Test routes answer 404 without the test flag | unit | `unit` "Scenario: Test routes answer 404 without the test flag" ✓ (1) |
| harness: Reset empties the archive | e2e | `e2e` "Scenario: Reset empties the archive" ✓ (1) |
| harness: Seed returns the ids of what it inserted | e2e | `e2e` "Scenario: Seed returns the ids of what it inserted" ✓ (1) |
| harness: Test mode uses the fake provider and remote | unit | `unit` "Scenario: Test mode uses the fake provider and remote" ✓ (1) |
| harness: Production mode never uses the fakes | unit | `unit` "Scenario: Production mode never uses the fakes" ✓ (1) |
| harness: Package produces a verifiable tarball | unit | `unit` "Scenario: Package produces a verifiable tarball" ✓ (1) |
| harness: Harness declared with merge and tag policy | manual | on manual checklist |
| harness: README documents setup and env vars | manual | on manual checklist |
| home: Coverflow takes the 20 newest entries with images | unit | `unit` "Scenario: Coverflow takes the 20 newest entries with images" ✓ (1) |
| home: In progress orders by last update | unit | `unit` "Scenario: In progress orders by last update" ✓ (1) |
| home: Home shelves omit empty ones | unit | `unit` "Scenario: Home shelves omit empty ones" ✓ (1) |
| home: Home shows the hero photo and headline | e2e | `e2e` "Scenario: Home shows the hero photo and headline" ✓ (2) |
| home: Home without hero photo shows the world gradient | e2e | `e2e` "Scenario: Home without hero photo shows the world gradient" ✓ (2) |
| home: Coverflow shows the most recent entries with images | e2e | `e2e` "Scenario: Coverflow shows the most recent entries with images" ✓ (2) |
| home: In progress shelf lists media in progress | e2e | `e2e` "Scenario: In progress shelf lists media in progress" ✓ (2) |
| home: Recently added shelves per domain | e2e | `e2e` "Scenario: Recently added shelves per domain" ✓ (2) |
| home: Collections bento shows collages | e2e | `e2e` "Scenario: Collections bento shows collages" ✓ (2) |
| home: Empty archive shows a welcome per domain | e2e | `e2e` "Scenario: Empty archive shows a welcome per domain" ✓ (2) |
| home: Home looks like the approved mockup | manual | on manual checklist |
| images: Uploaded image is stored as WebP | unit | `unit` "Scenario: Uploaded image is stored as WebP" ✓ (1) |
| images: Each listed format is accepted | unit | `unit` "Scenario: Each listed format is accepted" ✓ (1) |
| images: Unsupported file is rejected by the server | unit | `unit` "Scenario: Unsupported file is rejected by the server" ✓ (1) |
| images: Image over 16 MB is rejected by the server | unit | `unit` "Scenario: Image over 16 MB is rejected by the server" ✓ (1) |
| images: Image from a URL is stored | unit | `unit` "Scenario: Image from a URL is stored" ✓ (1) |
| images: Image is served with caching headers | unit | `unit` "Scenario: Image is served with caching headers" ✓ (1) |
| images: Upload an image in the form | e2e | `e2e` "Scenario: Upload an image in the form" ✓ (2) |
| images: Uploading replaces the current image | e2e | `e2e` "Scenario: Uploading replaces the current image" ✓ (2) |
| images: Replacing an image removes the old row | unit | `unit` "Scenario: Replacing an image removes the old row" ✓ (1) |
| images: Unsupported file shows an inline error | e2e | `e2e` "Scenario: Unsupported file shows an inline error" ✓ (2) |
| images: Oversize file shows an inline error | e2e | `e2e` "Scenario: Oversize file shows an inline error" ✓ (2) |
| images: Entry without image shows a tinted placeholder with initials | e2e | `e2e` "Scenario: Entry without image shows a tinted placeholder with initials" ✓ (2) |
| layout: Desktop shows the top pill nav | e2e | `e2e` "Scenario: Desktop shows the top pill nav" ✓ (1) |
| layout: Phone shows the bottom pill nav | e2e | `e2e` "Scenario: Phone shows the bottom pill nav" ✓ (1) |
| layout: Nav marks the current section | e2e | `e2e` "Scenario: Nav marks the current section" ✓ (2) |
| layout: Entry pages mark their domain | e2e | `e2e` "Scenario: Entry pages mark their domain" ✓ (2) |
| layout: Content clears the bottom nav on phone | e2e | `e2e` "Scenario: Content clears the bottom nav on phone" ✓ (1) |
| layout: Active section follows the path | unit | `unit` "Scenario: Active section follows the path" ✓ (1) |
| layout: Domain pages use their world | e2e | `e2e` "Scenario: Domain pages use their world" ✓ (2) |
| layout: Home, collections and settings use the home world | e2e | `e2e` "Scenario: Home, collections and settings use the home world" ✓ (2) |
| layout: Detail pages use their type's domain world | e2e | `e2e` "Scenario: Detail pages use their type's domain world" ✓ (2) |
| layout: Real screens share one alignment rule | e2e | `e2e` "Scenario: Real screens share one alignment rule" ✓ (2) |
| layout: Desktop uses the width | e2e | `e2e` "Scenario: Desktop uses the width" ✓ (1) |
| layout: No horizontal page scroll on phone | e2e | `e2e` "Scenario: No horizontal page scroll on phone" ✓ (1) |
| layout: Desktop layouts look composed | manual | on manual checklist |
| link-preview: Only http and https URLs are fetched | unit | `unit` "Scenario: Only http and https URLs are fetched" ✓ (1) |
| link-preview: Loopback and private addresses are refused | unit | `unit` "Scenario: Loopback and private addresses are refused" ✓ (1) |
| link-preview: Hostname resolving to a private address is refused | unit | `unit` "Scenario: Hostname resolving to a private address is refused" ✓ (1) |
| link-preview: Redirect to a private address is refused | unit | `unit` "Scenario: Redirect to a private address is refused" ✓ (1) |
| link-preview: Too many redirects fail | unit | `unit` "Scenario: Too many redirects fail" ✓ (1) |
| link-preview: Slow page times out after 5 seconds | unit | `unit` "Scenario: Slow page times out after 5 seconds" ✓ (1) |
| link-preview: Oversized page is cut at 1 MB | unit | `unit` "Scenario: Oversized page is cut at 1 MB" ✓ (1) |
| link-preview: Oversized image fails | unit | `unit` "Scenario: Oversized image fails" ✓ (1) |
| link-preview: Open Graph tags fill the preview | unit | `unit` "Scenario: Open Graph tags fill the preview" ✓ (1) |
| link-preview: Page without Open Graph falls back to title and icon | unit | `unit` "Scenario: Page without Open Graph falls back to title and icon" ✓ (1) |
| link-preview: Relative og:image resolves against the page URL | unit | `unit` "Scenario: Relative og:image resolves against the page URL" ✓ (1) |
| link-preview: Page with nothing usable has no preview | unit | `unit` "Scenario: Page with nothing usable has no preview" ✓ (1) |
| link-preview: Paste a brand URL and get its preview image | e2e | `e2e` "Scenario: Paste a brand URL and get its preview image" ✓ (2) |
| link-preview: Piece URL preview fills name and image | e2e | `e2e` "Scenario: Piece URL preview fills name and image" ✓ (2) |
| link-preview: Icon is used when there is no og:image | e2e | `e2e` "Scenario: Icon is used when there is no og:image" ✓ (2) |
| link-preview: Blocked site keeps the form usable | e2e | `e2e` "Scenario: Blocked site keeps the form usable" ✓ (2) |
| link-preview: JS-only shell shows No preview found | e2e | `e2e` "Scenario: JS-only shell shows No preview found" ✓ (2) |
| link-preview: Login wall shows No preview found | e2e | `e2e` "Scenario: Login wall shows No preview found" ✓ (2) |
| link-preview: Existing name is not overwritten by the preview | e2e | `e2e` "Scenario: Existing name is not overwritten by the preview" ✓ (2) |
| link-preview: Pasted preview URL fills an empty URL field | e2e | `e2e` "Scenario: Pasted preview URL fills an empty URL field" ✓ (2) |
| link-preview: A typed URL is not overwritten by the preview URL | e2e | `e2e` "Scenario: A typed URL is not overwritten by the preview URL" ✓ (2) |
| link-preview: Invalid URL shows an inline error | e2e | `e2e` "Scenario: Invalid URL shows an inline error" ✓ (2) |
| link-preview: Private address URL is refused in the form | e2e | `e2e` "Scenario: Private address URL is refused in the form" ✓ (2) |
| link-preview: Previewing a real site | manual | on manual checklist |
| link-preview: Profile URLs map to handles | unit | `unit` "Scenario: Profile URLs map to handles" ✓ (1) |
| link-preview: Unknown platform fills only the website | unit | `unit` "Scenario: Unknown platform fills only the website" ✓ (1) |
| link-preview: Post and video URLs give no prefill | unit | `unit` "Scenario: Post and video URLs give no prefill" ✓ (1) |
| link-preview: Pasting an Instagram profile fills the handle | e2e | `e2e` "Scenario: Pasting an Instagram profile fills the handle" ✓ (2) |
| link-preview: Pasting another site fills the website field | e2e | `e2e` "Scenario: Pasting another site fills the website field" ✓ (2) |
| link-preview: A typed handle is not overwritten | e2e | `e2e` "Scenario: A typed handle is not overwritten" ✓ (2) |
| link-preview: Pasting a post URL fills no handle | e2e | `e2e` "Scenario: Pasting a post URL fills no handle" ✓ (2) |
| motion: Card to detail morphs the cover | e2e | `e2e` "Scenario: Card to detail morphs the cover" ✓ (2) |
| motion: Back from detail reverses the morph | e2e | `e2e` "Scenario: Back from detail reverses the morph" ✓ (2) |
| motion: Reduced motion skips the morph | e2e | `e2e` "Scenario: Reduced motion skips the morph" ✓ (2) |
| motion: Other navigations crossfade | e2e | `e2e` "Scenario: Other navigations crossfade" ✓ (2) |
| motion: Reduced motion skips the crossfade | e2e | `e2e` "Scenario: Reduced motion skips the crossfade" ✓ (2) |
| motion: Browser without View Transitions navigates plainly | e2e | `e2e` "Scenario: Browser without View Transitions navigates plainly" ✓ (2) |
| motion: Morph targets follow the URLs | unit | `unit` "Scenario: Morph targets follow the URLs" ✓ (1) |
| motion: Page transitions look smooth | manual | on manual checklist |
| motion: Cards reveal on scroll | e2e | `e2e` "Scenario: Cards reveal on scroll" ✓ (2) |
| motion: Reduced motion shows content immediately | e2e | `e2e` "Scenario: Reduced motion shows content immediately" ✓ (2) |
| motion: Parallax offset follows scroll | unit | `unit` "Scenario: Parallax offset follows scroll" ✓ (1) |
| motion: Hero photo moves with scroll | e2e | `e2e` "Scenario: Hero photo moves with scroll" ✓ (2) |
| motion: Reduced motion keeps the hero still | e2e | `e2e` "Scenario: Reduced motion keeps the hero still" ✓ (2) |
| motion: Shelf headers stick on desktop | e2e | `e2e` "Scenario: Shelf headers stick on desktop" ✓ (1) |
| motion: Shelf headers do not stick on phone | e2e | `e2e` "Scenario: Shelf headers do not stick on phone" ✓ (1) |
| motion: Scroll motion looks calm | manual | on manual checklist |
| motion: Coverflow tilts the neighbours | e2e | `e2e` "Scenario: Coverflow tilts the neighbours" ✓ (2) |
| motion: Coverflow arrows step through entries | e2e | `e2e` "Scenario: Coverflow arrows step through entries" ✓ (2) |
| motion: Arrow keys step the coverflow on desktop | e2e | `e2e` "Scenario: Arrow keys step the coverflow on desktop" ✓ (1) |
| motion: Swipe steps the coverflow on phone | e2e | `e2e` "Scenario: Swipe steps the coverflow on phone" ✓ (1) |
| motion: Single entry coverflow has no arrows | e2e | `e2e` "Scenario: Single entry coverflow has no arrows" ✓ (2) |
| motion: Coverflow is hidden without entries with images | e2e | `e2e` "Scenario: Coverflow is hidden without entries with images" ✓ (2) |
| motion: Reduced motion coverflow steps without tilt | e2e | `e2e` "Scenario: Reduced motion coverflow steps without tilt" ✓ (2) |
| motion: Coverflow index clamps at the ends | unit | `unit` "Scenario: Coverflow index clamps at the ends" ✓ (1) |
| motion: Shelf rows drag-scroll with inertia on desktop | e2e | `e2e` "Scenario: Shelf rows drag-scroll with inertia on desktop" ✓ (1) |
| motion: Reduced motion drag-scroll stops on release | e2e | `e2e` "Scenario: Reduced motion drag-scroll stops on release" ✓ (1) |
| motion: Inertia decays to a stop | unit | `unit` "Scenario: Inertia decays to a stop" ✓ (1) |
| motion: Cards lift on hover on desktop | e2e | `e2e` "Scenario: Cards lift on hover on desktop" ✓ (1) |
| motion: Cards do not tilt on phone | e2e | `e2e` "Scenario: Cards do not tilt on phone" ✓ (1) |
| motion: Reduced motion cards do not tilt | e2e | `e2e` "Scenario: Reduced motion cards do not tilt" ✓ (1) |
| motion: Coverflow and shelves feel like the inspiration | manual | on manual checklist |
| motion: Star fill animates on rate | e2e | `e2e` "Scenario: Star fill animates on rate" ✓ (2) |
| motion: Reduced motion fills stars instantly | e2e | `e2e` "Scenario: Reduced motion fills stars instantly" ✓ (2) |
| motion: Status pill animates on change | e2e | `e2e` "Scenario: Status pill animates on change" ✓ (2) |
| motion: Reduced motion changes status instantly | e2e | `e2e` "Scenario: Reduced motion changes status instantly" ✓ (2) |
| motion: Toast confirms save | e2e | `e2e` "Scenario: Toast confirms save" ✓ (2) |
| motion: Reduced motion toast appears without sliding | e2e | `e2e` "Scenario: Reduced motion toast appears without sliding" ✓ (2) |
| motion: Toast confirms delete | e2e | `e2e` "Scenario: Toast confirms delete" ✓ (2) |
| motion: Home counts count up on first view | e2e | `e2e` "Scenario: Home counts count up on first view" ✓ (2) |
| motion: Reduced motion shows final counts immediately | e2e | `e2e` "Scenario: Reduced motion shows final counts immediately" ✓ (2) |
| motion: Micro-interactions feel alive | manual | on manual checklist |
| release: Workflow actions are pinned to commit SHAs | unit | `unit` "Scenario: Workflow actions are pinned to commit SHAs" ✓ (1) |
| release: CI is green on the change's PR | manual | on manual checklist |
| release: Push to main runs on a GitHub-hosted runner | manual | on manual checklist |
| release: Superseded PR run is cancelled | manual | on manual checklist |
| release: E2E runs against the unpacked tarball | manual | on manual checklist |
| release: Dependabot config covers actions and npm | manual | on manual checklist |
| release: Tag does not match the version | manual | on manual checklist |
| release: Release publishes the tested tarball | manual | on manual checklist |
| release: Bump fails until the deploy change exists | manual | on manual checklist |
| release: Runbook lists the outward steps | manual | on manual checklist |
| release: Package and lockfile carry 0.1.0 | unit | `unit` "Scenario: Package and lockfile carry 0.1.0" ✓ (1) |
| release: No tag exists before the first release | manual | on manual checklist |
| release: Release v0.1.0 published | manual | on manual checklist |
| settings: Setting a hero replaces the old image | unit | `unit` "Scenario: Setting a hero replaces the old image" ✓ (1) |
| settings: Removing a hero deletes its image | unit | `unit` "Scenario: Removing a hero deletes its image" ✓ (1) |
| settings: Upload a hero photo for Home | e2e | `e2e` "Scenario: Upload a hero photo for Home" ✓ (2) |
| settings: Replace a domain hero photo | e2e | `e2e` "Scenario: Replace a domain hero photo" ✓ (2) |
| settings: Remove a hero photo | e2e | `e2e` "Scenario: Remove a hero photo" ✓ (2) |
| settings: Unsupported hero file shows an inline error | e2e | `e2e` "Scenario: Unsupported hero file shows an inline error" ✓ (2) |
| settings: Oversize hero file shows an inline error | e2e | `e2e` "Scenario: Oversize hero file shows an inline error" ✓ (2) |
| tags: Tags are global across types | unit | `unit` "Scenario: Tags are global across types" ✓ (1) |
| tags: Tag names dedupe ignoring case including umlauts | unit | `unit` "Scenario: Tag names dedupe ignoring case including umlauts" ✓ (1) |
| tags: Empty and whitespace tags are ignored | unit | `unit` "Scenario: Empty and whitespace tags are ignored" ✓ (1) |
| tags: Unused tags are removed | unit | `unit` "Scenario: Unused tags are removed" ✓ (1) |
| tags: Add a tag with autocomplete | e2e | `e2e` "Scenario: Add a tag with autocomplete" ✓ (2) |
| tags: Typing an existing tag in other case reuses it | e2e | `e2e` "Scenario: Typing an existing tag in other case reuses it" ✓ (2) |
| tags: Remove a tag | e2e | `e2e` "Scenario: Remove a tag" ✓ (2) |
| tracking: Changing status stores a dated event | unit | `unit` "Scenario: Changing status stores a dated event" ✓ (1) |
| tracking: Setting the same status again stores no event | unit | `unit` "Scenario: Setting the same status again stores no event" ✓ (1) |
| tracking: New entry with a status stores its first event | unit | `unit` "Scenario: New entry with a status stores its first event" ✓ (1) |
| tracking: Status none is allowed | unit | `unit` "Scenario: Status none is allowed" ✓ (1) |
| tracking: Invalid status for a type is rejected | unit | `unit` "Scenario: Invalid status for a type is rejected" ✓ (1) |
| tracking: Status labels follow the domain | e2e | `e2e` "Scenario: Status labels follow the domain" ✓ (2) |
| tracking: Set status from the detail page | e2e | `e2e` "Scenario: Set status from the detail page" ✓ (2) |
| tracking: Set a piece status from the detail page | e2e | `e2e` "Scenario: Set a piece status from the detail page" ✓ (2) |
| tracking: Fashion entries without status or rating show no controls | e2e | `e2e` "Scenario: Fashion entries without status or rating show no controls" ✓ (2) |
| tracking: Step episodes with plus and minus | e2e | `e2e` "Scenario: Step episodes with plus and minus" ✓ (2) |
| tracking: Type progress directly | e2e | `e2e` "Scenario: Type progress directly" ✓ (2) |
| tracking: Progress cannot go below zero | unit | `unit` "Scenario: Progress cannot go below zero" ✓ (1) |
| tracking: Progress cannot exceed a known total | unit | `unit` "Scenario: Progress cannot exceed a known total" ✓ (1) |
| tracking: Unknown total has no upper bound | unit | `unit` "Scenario: Unknown total has no upper bound" ✓ (1) |
| tracking: Ongoing manga shows n / ? | e2e | `e2e` "Scenario: Ongoing manga shows n / ?" ✓ (2) |
| tracking: Reaching the total offers Mark as watched | e2e | `e2e` "Scenario: Reaching the total offers Mark as watched" ✓ (2) |
| tracking: Reaching the chapter total offers Mark as read | e2e | `e2e` "Scenario: Reaching the chapter total offers Mark as read" ✓ (2) |
| tracking: Progress moves want to in progress | unit | `unit` "Scenario: Progress moves want to in progress" ✓ (1) |
| tracking: Progress leaves other statuses alone | unit | `unit` "Scenario: Progress leaves other statuses alone" ✓ (1) |
| tracking: Manga tracks chapters and volumes separately | unit | `unit` "Scenario: Manga tracks chapters and volumes separately" ✓ (1) |
| tracking: Progress on the card | e2e | `e2e` "Scenario: Progress on the card" ✓ (2) |
| tracking: Failed save on the detail page shows a toast and reverts | e2e | `e2e` "Scenario: Failed save on the detail page shows a toast and reverts" ✓ (2) |
| tracking: Failed save on the card shows a toast and reverts | e2e | `e2e` "Scenario: Failed save on the card shows a toast and reverts" ✓ (2) |
| tracking: Rating is stored in half steps | unit | `unit` "Scenario: Rating is stored in half steps" ✓ (1) |
| tracking: Rate in half stars | e2e | `e2e` "Scenario: Rate in half stars" ✓ (2) |
| tracking: Clear the rating | e2e | `e2e` "Scenario: Clear the rating" ✓ (2) |
| tracking: Keyboard rates with arrow keys | e2e | `e2e` "Scenario: Keyboard rates with arrow keys" ✓ (2) |
| tracking: Rated entries show stars on cards | e2e | `e2e` "Scenario: Rated entries show stars on cards" ✓ (2) |
| tracking: Unrated entries show no stars on cards | e2e | `e2e` "Scenario: Unrated entries show no stars on cards" ✓ (2) |

## Manual checklist (start: `npm run dev` then http://localhost:5173)

- Autofill live (network): Add entry > Music, type "Blonde", confirm real results appear and picking one fills title, artist, cover.
- Link preview live (network): paste a real brand URL in a fashion entry's link field, confirm a preview image appears.
- Design checkpoint items (world per domain, mockups match brief, components match visual brief): open /, /music, /animanga, /books, /fashion, check each has its own world and matches the approved mockups in test-results/shots/mockups.
- Home looks like the approved mockup: open / on desktop and phone width, compare hero, coverflow, shelves, bento against mockups.
- Desktop layouts look composed: open each domain list and an entry page at 1440 px wide, check width use and alignment.
- Page transitions: click through list > entry > back, check the cover morphs and nothing flashes.
- Scroll motion: scroll home and a list, check reveals are calm and not janky.
- Coverflow and shelves: drag/arrow through the coverflow, scroll a shelf, check the feel.
- Micro-interactions: hover cards, rate stars, toggle a status, check small animations.
- Harness items (output/documentation): read CLAUDE.md Harness section and README (setup, env vars); this file's Layer 1 tail shows proof prints test names and passes; failing-proof, isolated-DB and phone/desktop projects were proven in U1 and by the run list.
- Release items (GitHub, after ship): CI green on the PR, hosted runner, cancelled superseded run, e2e against tarball, Dependabot config (read .github/dependabot.yml), tag/version mismatch fails, release publishes tarball, bump fails until deploy change exists, runbook lists outward steps, no tag before first release, v0.1.0 published. Read workflows and runbook locally now; the rest needs the repo on GitHub.

## Diffstat

 292 files changed, 30048 insertions(+)

## Screenshots

test-results/shots/mockups/ (20 PNGs, phone and desktop, light and dark, per domain). The e2e run wrote no further shots to test-results/shots/.

## Review

Fresh-context reviewer (opus), four passes: r1 on the full diff, r2 on fix r1, r3 on fix r2, r3b on fix r3. Weakened tests: none in any pass.

| Round | Finding | Resolution |
|---|---|---|
| r1 | Spec mismatch: Fonts requirement said serif display; world selected by two attributes | Fixed in spec (b23555b): matches Rue's pick in design.md "World pick" — pairing a (Bricolage Grotesque + Figtree), `data-font` as third world attribute, new scenario "Type pairings are token blocks selected by data-font" |
| r1 | Coverflow: tap after a phone swipe swallowed | Fixed (c2014e6): `swiped` cleared on pointerdown; phone e2e red first |
| r1 | Clearing the episode field + Enter stored 0 (client and server) | Fixed (c2014e6): empty value invalid on both sides; e2e red first |
| r1 | `vm.tiktok.com` / `music.youtube.com` links filled the website field | Fixed (c2014e6): subdomain matching in handles.ts; unit test red first |
| r1 | 8 weak tests (net timeout default, home headline font, private-address preview, placeholder tint, piece default status, placeholder collage, domain gradient, coverflow swipe) | Tightened (b23555b, c2014e6), 7 shown red under a mutation; private-address refusal is evidenced by the net.ts unit scenarios (not observable at form level) |
| r1 | Verifier: intermittent journey phone test; progress test flaky 1/20 | Fixed (856d979): test races (reload before queued write answered; outgoing list cards matched) — `countSaves` helper; 400/400 and 460/460 repeat runs |
| r1 | Orchestrator: image-only preview did not count as unsaved input | Fixed (c2014e6): EntryForm snapshot includes hidden fields |
| r1+ | Fixer friction: one failed save poisoned the detail page's write queue | Fixed (9a92ccf); e2e red first |
| r2 | Same unguarded queue in EntryCard progress and AddToCollection | Fixed (0b314f9): shared `createWriteQueue`, plus Rue's decision R3 (toast "Couldn't save — try again" + revert) on all three surfaces; e2e red first |
| r2 | Rue's decisions R1–R3 | Recorded in scope.md + specs (7beee75); R2 URL autofill specced with two scenarios (38b0838) |
| r3 | Popover ignored non-`error` failures (type-less CSRF 403): no toast, create form closed as success | Fixed (6ace36b): every non-success/redirect/failure answer throws; two e2e red first |
| r3b | Low: the 403 popover tests don't re-check "later changes still save"; two create-test assertions can't fail under the route stub; `saved(1)` counts the stubbed response | Accepted: both tests failed before the fix via the toast and open-form assertions; "later saves go through" is pinned by the abort-based popover test and writeQueue.test.ts. Fix rounds exhausted (3) |

Accepted limits (Rue, 2026-11-01): a write is lost if the page is reloaded or closed within milliseconds of the click (Non-goal); Home mockup's stats panel and CTA not built (Non-goal).
