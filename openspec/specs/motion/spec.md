# motion Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Page transitions
In-app navigation SHALL use same-document View Transitions when `document.startViewTransition` exists and reduced
motion is off: navigating from a card to `/entries/<id>` SHALL morph that card's cover into the detail cover, going
back SHALL morph it back into the card, and every other navigation SHALL crossfade. Without View Transitions support
navigation SHALL work plainly without errors; under reduced motion no transition SHALL start.

The morphing cover SHALL keep the card radius (`--r-card`) for the whole transition in both directions, SHALL carry
the detail cover's shadow (`--shadow-float`) while it moves, and SHALL fill its box without stretching (`object-fit:
cover`) when the card and the detail cover have different aspect ratios. A forward morph SHALL start from the card at
rest: no hover lift, no tilt and no image zoom in the old snapshot. Going back (history back) SHALL morph into the card
that was clicked — the same shelf (`data-shelf`) and index, even when the entry is in two shelves; without a
remembered click (the detail page was reached another way) the first matching card in view — after restoring
that shelf row's horizontal scroll position, and the target card and every other card in view SHALL already be shown
in place when the new page is captured (no reveal offset, no chrome popping in). When that card no longer exists on
the page or lies outside the viewport after the restore, going back SHALL crossfade without a morph: no card is named,
and the detail cover, which has to be named before the list page exists (the old page is captured first), SHALL fade
out with the page — no radius, clip or shadow of its own, and the root crossfade's duration.

#### Scenario: Card to detail morphs the cover
- **WHEN** a seeded album card on `/music/albums` is clicked on desktop
- **THEN** `startViewTransition` is called once, during it the clicked card's cover in the old page and the detail cover carry `view-transition-name: cover-<id>`, no other element carries that name, and the detail page shows
- **proof:** e2e

#### Scenario: Back from detail reverses the morph
- **WHEN** the browser goes back from that detail page
- **THEN** a view transition runs in which the detail cover and the matching card cover carry `cover-<id>`, and the list shows again
- **proof:** e2e

#### Scenario: Morphing cover keeps its rounded corners
- **WHEN** a card is clicked and, on the detail page, the browser goes back, with the transition's animations paused halfway each time
- **THEN** both times the computed `border-radius` of `::view-transition-group(cover-<id>)` equals `--r-card` (24px) and its `overflow` clips its content
- **proof:** e2e

#### Scenario: Morph carries the detail cover's shadow
- **WHEN** a card is clicked and the transition is paused halfway
- **THEN** the computed `box-shadow` of `::view-transition-group(cover-<id>)` is not `none`
- **proof:** e2e

#### Scenario: Forward morph starts from the card at rest
- **WHEN** on desktop the pointer hovers a card until it is lifted, tilted and its image zoomed, and the card is clicked
- **THEN** at the moment `startViewTransition` is called the card's computed transform is `none` and its cover image's computed transform is `none`
- **proof:** e2e

#### Scenario: Morph does not stretch between shapes
- **WHEN** a manga card in Home's mixed "In progress" shelf (4/5) is clicked and the transition is paused halfway
- **THEN** `::view-transition-old(cover-<id>)` and `::view-transition-new(cover-<id>)` both have computed `object-fit: cover` and a height equal to their group's height
- **proof:** e2e

#### Scenario: Back morph lands on the clicked card
- **WHEN** an anime that sits in both Home's "In progress" and "Recently added · Animanga" shelves is opened from the "Recently added" copy and the browser goes back, at 390 and at 1280 px
- **THEN** the card named `cover-<id>` in the new page is the one in `[data-shelf="recent-animanga"]` at the clicked index, and its bounding box when the new page is captured equals its box after the transition has finished (within 1 px)
- **proof:** e2e

#### Scenario: Back restores the shelf scroll position
- **WHEN** a shelf row with 12 cards is scrolled so that its 8th card is in view, that card is clicked and the browser goes back
- **THEN** the row's `scrollLeft` when the new page is captured is within 2 px of its value before the click, and the 8th card carries `cover-<id>`
- **proof:** e2e

#### Scenario: Back shows in-view cards without re-running the reveal
- **WHEN** the browser goes back from a detail page to the list it was opened from
- **THEN** when the new page is captured, the target card's list item and every list item in the viewport carry `data-revealed`, with computed opacity 1 and transform `none`
- **proof:** e2e

#### Scenario: Back to a card that left its shelf crossfades
- **WHEN** a watching anime is opened from the "In progress" shelf on `/animanga`, its status set to "Watched", and the browser goes back
- **THEN** a view transition runs, no element of the new page carries a `cover-` name, the only `cover-` animation is the detail cover's `::view-transition-old`, it lasts as long as the root's, and its group's computed `box-shadow` is `none` and `border-radius` `0px`
- **proof:** e2e

#### Scenario: Back to an off-screen card crossfades
- **WHEN** the back target is resolved for a remembered card whose element exists but lies outside the viewport, and for one whose element is gone
- **THEN** no card is named, the root carries `data-morph="fade"` while the transition runs (so the detail cover fades with the page), and once it has finished no element is named and the attribute is gone
- **proof:** unit

#### Scenario: Forward morph without View Transitions navigates plainly
- **WHEN** `pageTransition` runs for a card → detail navigation while `document.startViewTransition` is missing
- **THEN** it returns without starting a transition and names no element
- **proof:** unit

#### Scenario: Reduced motion skips the morph
- **WHEN** reduced motion is on and a card is clicked
- **THEN** `startViewTransition` is not called, no element carries a `cover-` name, and the detail page shows
- **proof:** e2e

#### Scenario: Other navigations crossfade
- **WHEN** the nav moves from Home to Music
- **THEN** `startViewTransition` is called and no element carries a `cover-` name
- **proof:** e2e

#### Scenario: Reduced motion skips the crossfade
- **WHEN** reduced motion is on and the nav moves from Home to Music
- **THEN** `startViewTransition` is not called and Music shows
- **proof:** e2e

#### Scenario: Browser without View Transitions navigates plainly
- **WHEN** `document.startViewTransition` is deleted before the app loads and the nav moves from Home to Books
- **THEN** Books shows, the URL is `/books` and no page error is raised
- **proof:** e2e

#### Scenario: Morph targets follow the URLs
- **WHEN** `morphTarget` is given `/music/albums` → `/entries/7`, `/entries/7` → `/music/albums`, and `/` → `/books`
- **THEN** it returns `{ id: 7, direction: 'forward' }`, `{ id: 7, direction: 'back' }` and `null`
- **proof:** unit

#### Scenario: Page transitions look smooth
- **WHEN** Rue navigates card → detail → back and between sections in Chromium and in LibreWolf, on phone and desktop
- **THEN** the cover morph keeps its corners, does not jump at the start or the end, lands on the clicked card, and LibreWolf either morphs or navigates plainly
- **proof:** manual (motion quality and real-browser support are visual judgements at Gate 2)

### Requirement: Scroll motion
Sections and cards SHALL fade-rise into view when they first enter the viewport (staggered), hero photos SHALL move
with a parallax offset while scrolling, and shelf headers SHALL stick on desktop (≥1024 px) while their shelf scrolls
past. When a page is reached by history back — with or without View Transitions, and also when only its query string
changes — nodes already in the viewport SHALL show at once without the fade-rise;
nodes below the fold still reveal on scroll, and any other navigation reveals as before. Under reduced motion content
SHALL be visible immediately and hero photos SHALL not move.

#### Scenario: Cards reveal on scroll
- **WHEN** a list with 30 seeded albums is scrolled down on desktop
- **THEN** cards below the fold have no `data-revealed` and opacity below 1 before they enter the viewport, and gain `data-revealed` and opacity 1 after
- **proof:** e2e

#### Scenario: Reveal shows in-view nodes at once on history back
- **WHEN** `reveal` runs on one node inside and one outside the viewport while a history-back navigation is being restored
- **THEN** the node in view gets `data-revealed` at once with no transition, and the other gets `data-reveal` and is observed as usual
- **proof:** unit

#### Scenario: History back reveals at once without View Transitions
- **WHEN** `pageTransition` runs for a history back while `document.startViewTransition` is missing, and for a history back that only changes the query string (`?view=`), and a node in view and one below the fold mount before the navigation completes
- **THEN** no transition starts, nothing is observed before the navigation completes, and then the node in view has `data-revealed` and only the other is observed
- **proof:** unit

#### Scenario: Reveal runs as before on other navigations
- **WHEN** `reveal` runs on a node inside the viewport while no history-back navigation is being restored
- **THEN** it gets `data-reveal` without `data-revealed` and is observed, so it fades in when the observer reports it
- **proof:** unit

#### Scenario: Reduced motion shows content immediately
- **WHEN** reduced motion is on and the same list loads
- **THEN** every card has `data-revealed` and opacity 1 before any scrolling
- **proof:** e2e

#### Scenario: Parallax offset follows scroll
- **WHEN** `parallaxOffset` is given scrollY 0, 200 and 400 with reduced motion off, and 400 with it on
- **THEN** it returns 0, a positive value, twice that value, and 0
- **proof:** unit

#### Scenario: Hero photo moves with scroll
- **WHEN** `/music` with a seeded hero photo is scrolled by 300 px
- **THEN** the hero image's transform differs from its transform before scrolling
- **proof:** e2e

#### Scenario: Reduced motion keeps the hero still
- **WHEN** reduced motion is on and `/music` is scrolled by 300 px
- **THEN** the hero image's transform is unchanged
- **proof:** e2e

#### Scenario: Shelf headers stick on desktop
- **WHEN** the shelves view of a list is open on desktop
- **THEN** each shelf header's computed `position` is `sticky`
- **proof:** e2e

#### Scenario: Shelf headers do not stick on phone
- **WHEN** the same view is open on phone
- **THEN** each shelf header's computed `position` is not `sticky`
- **proof:** e2e

#### Scenario: Scroll motion looks calm
- **WHEN** Rue scrolls Home, a domain page and a list
- **THEN** reveals and parallax feel calm, not busy
- **proof:** manual (motion quality is a visual judgement at Gate 2)

### Requirement: Card interaction
Home's hero SHALL show a coverflow: the centre card flat, its neighbours tilted in 3D, a "01 / N" counter and round
prev/next arrows, stepping by arrows, by arrow keys on desktop and by swipe/drag on phone; with one item no arrows and
"01 / 01"; with no items the coverflow is hidden. Shelf rows SHALL drag-scroll with the mouse and keep gliding after
release. Cards SHALL lift and tilt on hover on desktop only. Under reduced motion the coverflow SHALL have no tilt and
step instantly, drag-scroll SHALL stop on release and cards SHALL not tilt.

#### Scenario: Coverflow tilts the neighbours
- **WHEN** Home loads with 5 seeded entries with images
- **THEN** the centre card has `data-active` and no rotation, its neighbours' transforms contain a non-zero rotateY, and the counter reads "01 / 05"
- **proof:** e2e

#### Scenario: Coverflow arrows step through entries
- **WHEN** next is pressed twice and prev once
- **THEN** the counter reads "02 / 05" and the second newest entry is the active card
- **proof:** e2e

#### Scenario: Arrow keys step the coverflow on desktop
- **WHEN** the coverflow has focus on desktop and ArrowRight is pressed
- **THEN** the counter reads "02 / 05"
- **proof:** e2e

#### Scenario: Swipe steps the coverflow on phone
- **WHEN** the active card is swiped from right to left on phone
- **THEN** the counter reads "02 / 05"
- **proof:** e2e

#### Scenario: Single entry coverflow has no arrows
- **WHEN** Home loads with one entry with an image
- **THEN** the coverflow shows that card, the counter reads "01 / 01" and no prev/next arrows exist
- **proof:** e2e

#### Scenario: Coverflow is hidden without entries with images
- **WHEN** Home loads with entries that all lack images
- **THEN** no coverflow is rendered
- **proof:** e2e

#### Scenario: Reduced motion coverflow steps without tilt
- **WHEN** reduced motion is on and next is pressed
- **THEN** no card transform contains a rotation and the active card changes without a running animation
- **proof:** e2e

#### Scenario: Coverflow index clamps at the ends
- **WHEN** `coverflowState` is asked for index 0 of 1, step +1 from the last of 5, and step −1 from the first
- **THEN** it reports "01 / 01" with no arrows, stays on the last, and stays on the first
- **proof:** unit

#### Scenario: Shelf rows drag-scroll with inertia on desktop
- **WHEN** a shelf with 20 cards is dragged left with the mouse and released quickly on desktop
- **THEN** its `scrollLeft` keeps increasing for a moment after `mouseup`
- **proof:** e2e

#### Scenario: Reduced motion drag-scroll stops on release
- **WHEN** reduced motion is on and the same drag is released
- **THEN** `scrollLeft` does not change after `mouseup`
- **proof:** e2e

#### Scenario: Inertia decays to a stop
- **WHEN** `inertiaSteps` is given a release velocity of 2 px/ms
- **THEN** each step's velocity is smaller than the previous one and the sequence ends below 0.05 px/ms
- **proof:** unit

#### Scenario: Cards lift on hover on desktop
- **WHEN** the pointer hovers a card on desktop
- **THEN** the card's transform is not `none`
- **proof:** e2e

#### Scenario: Cards do not tilt on phone
- **WHEN** a card is tapped and held on phone
- **THEN** its transform stays `none`
- **proof:** e2e

#### Scenario: Reduced motion cards do not tilt
- **WHEN** reduced motion is on and the pointer hovers a card on desktop
- **THEN** its transform stays `none`
- **proof:** e2e

#### Scenario: Coverflow and shelves feel like the inspiration
- **WHEN** Rue steps the coverflow and drags shelves
- **THEN** depth, tilt and glide feel like the Mindframe coverflow and the Zellerfeld/Shader references
- **proof:** manual (motion quality is a visual judgement at Gate 2)

### Requirement: Micro-interactions
Rating SHALL animate the star fill, a status change SHALL animate the status pill, saving and deleting SHALL show a
toast ("Saved", "Deleted") that hides itself after about 3 s, and Home's shelf and collection counts SHALL count up
from 0 on first view. Under reduced motion every state SHALL appear instantly (the toast still appears).

#### Scenario: Star fill animates on rate
- **WHEN** the fifth star's half is chosen on a detail page
- **THEN** an animation runs on the changed star and the rating reads 4.5 afterwards
- **proof:** e2e

#### Scenario: Reduced motion fills stars instantly
- **WHEN** reduced motion is on and a rating is chosen
- **THEN** no animation runs on the stars and the new rating shows at once
- **proof:** e2e

#### Scenario: Status pill animates on change
- **WHEN** the status is changed on a detail page
- **THEN** an animation runs on the pill label and the new label shows afterwards
- **proof:** e2e

#### Scenario: Reduced motion changes status instantly
- **WHEN** reduced motion is on and the status is changed
- **THEN** no animation runs on the pill and the new label shows at once
- **proof:** e2e

#### Scenario: Toast confirms save
- **WHEN** an entry is saved from the form
- **THEN** a `role="status"` toast with "Saved" appears after landing on `/entries/<id>` and is gone after 4 s
- **proof:** e2e

#### Scenario: Reduced motion toast appears without sliding
- **WHEN** reduced motion is on and an entry is saved
- **THEN** the "Saved" toast is visible with no running animation
- **proof:** e2e

#### Scenario: Toast confirms delete
- **WHEN** an entry is deleted and the confirm accepted
- **THEN** the list page shows a `role="status"` toast with "Deleted"
- **proof:** e2e

#### Scenario: Home counts count up on first view
- **WHEN** Home loads with 12 entries in progress
- **THEN** the "In progress" count shows a number below 12 right after it is revealed and 12 once the animation ends
- **proof:** e2e

#### Scenario: Reduced motion shows final counts immediately
- **WHEN** reduced motion is on and Home loads with 12 entries in progress
- **THEN** the "In progress" count shows 12 from the start
- **proof:** e2e

#### Scenario: Micro-interactions feel alive
- **WHEN** Rue rates, changes a status, saves and opens Home
- **THEN** the stars, pill, toast and counts feel lively but not noisy
- **proof:** manual (motion quality is a visual judgement at Gate 2)

