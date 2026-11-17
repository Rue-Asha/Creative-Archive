## ADDED Requirements

### Requirement: Main navigation
The app SHALL expose exactly one navigation named "Main" at a time at every viewport width. The current section SHALL carry `aria-current="page"`: Home on `/`, the domain on `/[domain]`, its lists and on the add, entry and edit pages of its types, Collections on `/collections*`, Settings on `/settings` (no domain marked there). From the posture switch (`POSTURE_SWITCH` = 1024 px, gate 4) up the navigation SHALL be the desktop top bar, below it — tablets included — the phone bar; exactly one of the two SHALL be shown. Content and focused elements SHALL never sit under the navigation.

#### Scenario: Active section is derived for sub-routes
- **WHEN** `activeSection` is given `/` (world home), `/books/books` (books), `/entries/3` (animanga), `/add/piece` (fashion), `/entries/9/edit` (music), `/collections/2` (home) and `/settings` (home)
- **THEN** it returns home, books, animanga, fashion, music, collections and settings
- **proof:** unit

#### Scenario: One Main navigation at every width
- **WHEN** `/music/albums` is opened at 320×640, 390×844, 768×1024, 844×390, 1024×768 and 1280×800
- **THEN** each time exactly one navigation named "Main" is exposed, Music is its only item with `aria-current="page"`, and only one of the top bar and the phone bar is visible
- **proof:** e2e

#### Scenario: Tablets get the phone layout
- **WHEN** `/music/albums` is opened at 768×1024, 1023×768 and 1024×768
- **THEN** the phone bar shows at 768 and 1023 px wide and the top bar at 1024 px
- **proof:** e2e

#### Scenario: Nav marks the current section
- **WHEN** `/`, `/music`, `/fashion/pieces`, `/collections` and `/settings` are opened in turn at 1280×800
- **THEN** Home, Music, Fashion, Collections and Settings respectively carry `aria-current="page"` and no other item does
- **proof:** e2e

#### Scenario: Entry pages mark their domain
- **WHEN** `/entries/<id>` and `/entries/<id>/edit` of a seeded manga and `/add/magazine` are opened
- **THEN** Animanga is marked on the first two and Fashion on the third
- **proof:** e2e

#### Scenario: Content never sits under the navigation
- **WHEN** a long page (a list of 40 albums) is scrolled to its end at 390×844, 768×1024, 844×390 and 1280×800
- **THEN** the last content element's bottom edge is above the phone bar's top edge (phone posture), or its top is below the top bar's bottom edge when scrolled into view (desktop posture)
- **proof:** e2e

#### Scenario: Focused control is not hidden by the navigation
- **WHEN** at 390×844 and at 1280×800 a list page is scrolled to its middle and focus is moved by Tab to each control until one sits next to the bar
- **THEN** every focused control's rectangle has no overlap with the navigation's rectangle
- **proof:** e2e

### Requirement: Desktop top bar
In the desktop posture the top bar SHALL show the brand "Creative Archive" (link to `/`), the section links Home, Music, Animanga, Books, Fashion and Collections in that order, and a Settings button (link to `/settings`), styled with fingerprint roles only. From 1024 px to 1280 px and wider every item SHALL sit on one line without overlapping and the page SHALL not scroll horizontally. From 1024 px to 1099 px the bar is one row with the brand mark only (the wordmark stays in the DOM, visually hidden, so the link keeps its name); the wordmark shows from 1100 px. Source: Rue, checkpoint A, 2026-11-16 (replaces the two-row tablet bar).

#### Scenario: Top bar shows brand, six sections and Settings
- **WHEN** `/books` is opened at 1280×800
- **THEN** the top bar holds a link "Creative Archive" to `/`, the links Home, Music, Animanga, Books, Fashion and Collections in that order, a "Settings" link to `/settings`, and no phone bar is visible
- **proof:** e2e

#### Scenario: Top bar fits from 1024 to 1280 px
- **WHEN** `/fashion/brands-shops` and `/collections` are opened at 1024×768, 1099×800, 1100×800, 1152×800 and 1280×800
- **THEN** on each (and at 1099 and 1100 px) the brand, every section link and Settings share one row (their vertical centres within 4 px), no two of their rectangles overlap, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Top bar looks like the signed-off hi-fi
- **WHEN** Rue opens the running app at 1024 and 1280 px wide
- **THEN** the top bar matches the gate-5 hi-fi of G1
- **proof:** manual (visual judgement by Rue at gate 7)

### Requirement: Phone bar
The dock (fingerprint 2.0.0 `.dock`) SHALL apply below 1024 px (`max-width: 1023px`, tablets included; the top bar starts at 1024 px, the scrolled capsule at 1100 px). It SHALL be a bar at the bottom with the pills Home, Music, Animanga, Books and Fashion plus a separate round "+" button (named "Add") outside the pill group. The current section's pill SHALL be marked (visibly and with `aria-current="page"`); on Collections and Settings the Home pill is marked. Collections and Settings SHALL be reached from Home (its Collections section and its Settings button). The bar SHALL respect the safe-area insets, fit at 320 px with every pill and the "+" at least 44×44 px — below 360 px (viewport width, Rue 2026-11-16) the pills SHALL show icons only with the names kept as accessible names (the label span stays in the markup), from 360 px they SHALL show their labels in full, each tab sized to its label with a 44 px minimum — and never cover content in portrait or landscape. Its inline inset SHALL be `--space-3-5`. While a text field (input, textarea, contenteditable) has focus on a coarse pointer the dock SHALL fade and slide out (`data-hidden` set by `use:hideOnType`, `visibility: hidden` afterwards, instant under reduced motion) and SHALL come back when focus leaves the field; it SHALL stay in the DOM, never be removed. `data-specimen` shows the dock at any width and is used on gallery pages only.

#### Scenario: Phone bar shows five pills and the round add button
- **WHEN** `/` is opened at 390×844
- **THEN** the Main navigation shows the pills Home, Music, Animanga, Books and Fashion in that order and a separate button "Add", and no Collections or Settings pill
- **proof:** e2e

#### Scenario: Current section pill is marked on the phone
- **WHEN** `/animanga/manga`, `/collections` and `/settings` are opened at 390×844
- **THEN** Animanga, Home and Home respectively carry `aria-current="page"`
- **proof:** e2e

#### Scenario: Phone bar fits at 320 px
- **WHEN** `/fashion` is opened at 320×640 and at 844×390
- **THEN** every pill and the "+" are at least 44×44 px, none overlaps another, the bar's right edge is inside the viewport, every pill keeps its accessible name, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Pills are icon-only below 360 px and labelled from 360 px
- **WHEN** `/` is opened at 320×640, 359×640, 360×640 and at 390×844
- **THEN** at 320 and 359 px no pill shows visible label text while each keeps its name ("Home", "Music", "Animanga", "Books", "Fashion") as its accessible name, and at 360 and 390 px every pill shows its label as visible text that does not overflow the pill (Animanga in full)
- **proof:** e2e

#### Scenario: Phone bar hides while a text field has focus
- **WHEN** at 390×844 with a coarse pointer the Title field of `/add/book?manual=1` is focused and then blurred
- **THEN** while focused the dock carries `data-hidden`, is not visible and stays in the DOM, and after blurring it is visible again without `data-hidden`
- **proof:** e2e

#### Scenario: Collections and Settings are reached from Home on the phone
- **WHEN** at 390×844 "All collections" and then the Settings button are activated on `/`
- **THEN** the first lands on `/collections` and the second on `/settings`
- **proof:** e2e

#### Scenario: Safe areas and soft keyboard on a real phone
- **WHEN** Rue uses the app on her phone in portrait and landscape and types into a form
- **THEN** the bar clears the home indicator and notch, and the keyboard never pushes it over the field
- **proof:** manual (real hardware at gate 7)

### Requirement: Context add button
The round "+" SHALL open a type sheet of type chips: on Home, Collections and Settings titled "Add to your archive" with every type grouped by domain (Music, Animanga, Books, Fashion), inside a domain (its page, its lists, its entries) titled "Add to <Domain>" ("Add to Fashion") with that domain's types only (titles fixed at gate 5). Each item SHALL open `/add/<type>`; Fashion offers one "Brand or shop" item (`/add/brand`), Influencer, Magazine, Piece and Look; on `/fashion/wardrobe` the Piece item SHALL open `/add/piece?status=owned`. The sheet SHALL close on Escape, an outside tap and Back. On `/add/*` and `/entries/*/edit` the "+" SHALL be inert (`aria-disabled="true"`, no sheet).

#### Scenario: Add items per scope
- **WHEN** `addItems` is called with `'all'`, `'music'`, `'fashion'` and `('fashion', { list: 'wardrobe' })`
- **THEN** it returns the eleven items of all domains in domain order, Album/Artist/Song, Brand or shop/Influencer/Magazine/Piece/Look with `/add/brand` and `/add/magazine`, and the same Fashion items with Piece pointing at `/add/piece?status=owned`
- **proof:** unit

#### Scenario: Plus on Home offers every type grouped by domain
- **WHEN** at 390×844 "Add" is activated on `/` and "Book" is chosen
- **THEN** a sheet titled "Add to your archive" shows the groups Music, Animanga, Books and Fashion with their types, and the browser lands on `/add/book`
- **proof:** e2e

#### Scenario: Plus inside a domain offers its types
- **WHEN** at 390×844 "Add" is activated on `/fashion/magazines`
- **THEN** the sheet titled "Add to Fashion" offers exactly Brand or shop, Influencer, Magazine, Piece and Look, and Magazine opens `/add/magazine`
- **proof:** e2e

#### Scenario: Plus on Wardrobe adds an owned piece
- **WHEN** at 390×844 "Add" → "Piece" is chosen on `/fashion/wardrobe`
- **THEN** the browser lands on `/add/piece?status=owned`
- **proof:** e2e

#### Scenario: Type sheet closes on Escape, outside tap and back
- **WHEN** the sheet is opened on `/` and closed once with Escape, once with a tap outside it and once with the browser's Back
- **THEN** each time the sheet is gone, focus is on "Add", and the page is still `/`
- **proof:** e2e

#### Scenario: Plus is inert on add and edit forms
- **WHEN** at 390×844 "Add" is activated on `/add/album?manual=1` and on `/entries/<id>/edit`
- **THEN** it carries `aria-disabled="true"` and no sheet opens
- **proof:** e2e

### Requirement: Compact top bar on scroll
From 1100 px the top bar SHALL stay reachable: once the page has scrolled it SHALL stick at the top and shrink to a content-width glass capsule, centred, showing the brand mark only (the brand name stays available to assistive technology). From 1024 to 1099 px the top bar SHALL stay the one-row bar with the brand mark only and SHALL scroll away with the page; no capsule SHALL show there. The capsule SHALL never cover the sticky selection bar or a focused control, and SHALL appear and shrink without motion. Below 1024 px the phone bar SHALL stay unchanged and no capsule SHALL show. Source: Rue, Design-System 2.0.0 family rule, 2026-11-16 (the capsule sticks from 1100 px; 1024–1099 px is a one-row bar with the mark only).

#### Scenario: Scrolled top bar is a compact capsule
- **WHEN** `/music/albums` is opened at 1280×800 and scrolled by 700 px
- **THEN** the top bar is sticky at the top, its width is at most its content plus padding and it is horizontally centred, the brand name is not visible while the brand link keeps its accessible name, and at 390×844 no sticky top bar shows
- **proof:** e2e

#### Scenario: Capsule keeps clear of the selection bar and focus
- **WHEN** Select mode is on at 1024×768 and 1280×800, the page is scrolled by 700 px and focus moves to a control further down with Tab
- **THEN** at 1280 px the top bar is sticky and the selection bar's top edge is below the capsule's bottom edge; at 1024 px the top bar is not sticky and has scrolled out of view, and the selection bar sticks at the viewport's top edge; at both widths the focused control sits fully below the capsule or that top edge
- **proof:** e2e

## MODIFIED Requirements

### Requirement: Worlds per screen
Each app screen SHALL render inside its world: a domain landing page, its lists, the add pages of its types and its entries' detail and edit pages SHALL use the domain's world, carried as `data-world="<domain>"` together with `data-stage="night"` on the app root (the fingerprint's night stage); Home, Collections (the index and every collection, which mix domains) and Settings SHALL use the home world, which sets neither attribute and keeps charcoal and the light stage. The world SHALL select the frame's backdrop inside the fingerprint frame: the world's hero photo from Settings, else the fingerprint's blurred colour field (`data-backdrop="field"`), never a gradient or a bundled photo. On the night stage the hero photo SHALL run as a full-bleed banner under the world's veil, cropped per world (`--photo-x` / `--photo-y`: Music 62 % / 40 %, Animanga 50 % / 45 %, Books 60 % / 40 %, Fashion 60 % / 30 %); from 768 px the banner of a domain, list or entry page SHALL be at least the facts card's width plus the stage overlap tall (`--facts-max` + `--stage-overlap`, growing with 34 vw up to twice `--facts-max`), the type at its foot, and on the phone the photo SHALL show clear for twice `--stage-overlap` above the lead; from 768 to 1099 px the veil's band SHALL end after the bar and the lead SHALL start twice `--stage-overlap` down the head, so a strip of clear photo stays above the title however tall the lead grows (the stage grows with it; Rue, gate 7 re-verify, 2026-11-17); the add and edit forms keep the short head. The veil SHALL be painted as the stage's scrim (`--scrim-text` is the world's veil), not only declared. Without a hero photo a world SHALL show the flat night band, and from 768 px its head SHALL be at least `--facts-max` + `--space-16` tall (growing with 28 vw up to `--facts-max` + `--stage-overlap` + `--space-16`), the type at its foot. Every text in the head SHALL be light on the veil (title, kicker, lede, crumbs, sub-type captions) or sit on its own glass or card, and SHALL hold 4.5:1 (3:1 large) against the night and against the veil over a white pixel; focus rings likewise hold 3:1. Overlays opened in a world (menus, dialogs, sheets, toasts, the selection bar, the rating card) SHALL keep AA against their own surface laid over the night and over the veil. In a world the night also stands in for charcoal in a dark pill's focus halo and in the modal scrim behind dialogs and sheets. The phone's status bar SHALL take the screen's colour: the `theme-color` meta is the world's night on a world screen and the page colour (`--surface-page`) on Home, Collections and Settings, both read from the fingerprint tokens, and it follows client-side navigation. The world switch SHALL be instant (no motion added). Colours SHALL come from the fingerprint roles and the one app accent (heather, confirmed at gate 5); a world's night stands in for charcoal and its glow for the accent on the night. Source: Rue, gate 7, 2026-11-17, direction B; fingerprint 2.1.0.

#### Scenario: Domain pages use their world
- **WHEN** `/music`, `/animanga`, `/books` and `/fashion` are opened
- **THEN** each app root carries `data-world` with its domain and `<html>` carries the app accent
- **proof:** e2e

#### Scenario: Home, collections and settings name no world
- **WHEN** `/`, `/collections` and `/settings` are opened
- **THEN** no app root carries `data-world` or `data-stage`
- **proof:** e2e

#### Scenario: World screens carry their world and the night stage
- **WHEN** each domain page, `/music/albums`, `/fashion/wardrobe`, a book's detail and edit page, a piece's detail page and `/add/anime` are opened
- **THEN** each app root carries its domain's `data-world` and `data-stage="night"`
- **proof:** e2e

#### Scenario: Home, collections and settings stay light
- **WHEN** `/`, `/collections`, a collection and `/settings` are opened
- **THEN** no app root carries `data-world` or `data-stage` and the title is ink
- **proof:** e2e

#### Scenario: The banner keeps the photo visible
- **WHEN** heroes are seeded for all four domains and each domain page is opened at 390 and 1280 px
- **THEN** the stage photo is visible, the world's veil under the type is between 0.72 and 0.84 opaque (strong at most 0.9, soft at most 0.5, clear 0), at 1280 px the stage is at least 340 px tall and its scrim fades to clear, and at 390 px the lead starts at least 200 px below the stage's top; with the photo turned white, the scrim painted under every line of the lead is between 0.72 and 0.9 opaque and the stage shows clear (0) photo beside or above the lead
- **proof:** e2e

#### Scenario: A world without a hero photo shows the flat night band
- **WHEN** no fashion hero is set and `/fashion` is opened
- **THEN** no stage renders, the frame's band is the flat Fashion night (`#29211D`, no gradient) at least as tall as the head, the title is white and the head's text passes the contrast check
- **proof:** e2e

#### Scenario: A world without a hero photo keeps a banner-tall head
- **WHEN** no fashion hero is set and `/fashion` is opened at 768 and 1280 px
- **THEN** the head is at least `--facts-max` + `--space-16` and at most `--facts-max` + `--stage-overlap` + `--space-16` tall, and the lead ends at the head's foot
- **proof:** e2e

#### Scenario: The tablet banner keeps clear photo above the title
- **WHEN** heroes are seeded for all four domains and each domain page is opened at 768 px
- **THEN** with the photo turned white, a band of at least 64 px with no veil (0) lies between the bar and the title
- **proof:** e2e

#### Scenario: Head text on the night is light or sits on its own surface
- **WHEN** each domain page, a list, Fashion's wardrobe, a book and an album with an artist, the add form and the edit form are opened with heroes at 390 and 1280 px
- **THEN** the title is white and every visible text in the bar and the head holds 4.5:1 (3:1 large) against what it sits on, laid over both the world's night and its veil over white
- **proof:** e2e

#### Scenario: Overlays in a world stay readable
- **WHEN** on Books the Add menu, the type sheet (phone), the entry menu, the delete dialog, the status menu, the collection menu, the new-collection dialog, the selection bar, the status sheet and the toast are opened in turn
- **THEN** every visible text in each holds AA against its own surface laid over the night and over the veil (the walk ends at the overlay, never at the light page behind it), and the delete dialog's scrim is the Books night
- **proof:** e2e

#### Scenario: Focus rings in a world stand out from what they sit on
- **WHEN** `/books` and `/books/books` are walked with Tab
- **THEN** every focus ring in the bar and the head holds 3:1 against its backdrop; a pill with a halo holds 3:1 with its ring or its halo against the backdrop and 3:1 between ring and halo, and its halo is the Books night
- **proof:** e2e

#### Scenario: The status bar takes the screen's colour
- **WHEN** `/`, `/collections`, `/settings`, each domain page and a book's page are opened, and Books is reached from Home through the navigation
- **THEN** the head holds one `theme-color` meta: `#E7E2DC` (the page colour) on the light screens and the world's night (Music `#2A191C`, Animanga `#11142B`, Books `#16252A`, Fashion `#29211D`) on the world screens, also after the client-side navigation
- **proof:** e2e

#### Scenario: The status bar colours come from the fingerprint tokens
- **WHEN** the theme colours are read from the vendored `tokens.css`
- **THEN** home is `--surface-page` and each domain its `--world-night`, and a missing token throws
- **proof:** unit

#### Scenario: Status bar on a real phone
- **WHEN** Rue opens Home and a domain page on her phone
- **THEN** the status bar is the page colour on Home and the world's night over the banner
- **proof:** manual (needs a real phone: the browser chrome is not drawn in Playwright)

#### Scenario: Detail pages use their type's domain world
- **WHEN** `/entries/<id>` of a seeded book and `/add/piece` are opened
- **THEN** the app roots carry `data-world="books"` and `data-world="fashion"`
- **proof:** e2e

#### Scenario: A world shows its hero photo in the frame
- **WHEN** a music hero is seeded and `/music/albums` is opened
- **THEN** the frame's stage photo is `/images/<hero id>`
- **proof:** e2e

#### Scenario: A world without a hero photo shows the colour field
- **WHEN** no hero is set and `/` and `/fashion/pieces` are opened
- **THEN** each app root carries `data-backdrop="field"`, no stage photo `<img>` renders, and no request goes to `/images/` or a static photo for the backdrop
- **proof:** e2e

## REMOVED Requirements

### Requirement: Navigation
**Reason**: Replaced by "Main navigation", "Desktop top bar", "Phone bar" and "Context add button" (S1–S3): the floating glass pill nav with Collections and Settings in the phone tab bar goes.
**Migration**: "Nav marks the current section" and "Entry pages mark their domain" move into "Main navigation" with their test names (`e2e/nav.test.ts`), "Active section follows the path" becomes "Active section is derived for sub-routes" (`src/lib/shell/nav.test.ts`), "Content clears the bottom nav on phone" becomes "Content never sits under the navigation". "Desktop shows the top pill nav", "Phone shows the bottom pill nav" (`e2e/nav.test.ts`) and "Phone tab bar labels have room" (`e2e/type-scale.test.ts`) are retired by U15 in the commit that replaces the nav; their checks live on in "Top bar shows brand, six sections and Settings", "Phone bar shows five pills and the round add button" and "Phone bar fits at 320 px".

### Requirement: One alignment rule and desktop width
**Reason**: The fingerprint's frame and screen layout (`.frame`, `.screen-head`, `.screen-body`, `layout.css`) replace the app's own column rule, the sticky shelf head and the bento; the signed-off hi-fi fixes the composition. Width use and the no-scroll rule move to design-system "Accessibility floor" ("Desktop uses its width", "No horizontal page scroll from 320 to 1920").
**Migration**: Retired, each named in the retiring unit's report: "Real screens share one alignment rule" (`e2e/layout.test.ts`, U15, whose frame moves every page header); "Desktop uses the width" (`e2e/layout.test.ts`, U18, whose Home rebuild removes the bento it measures); "No horizontal page scroll on phone" (`e2e/layout.test.ts`, deleted by U24 in the commit that adds `e2e/a11y-floor.test.ts`); "Sticky shelf head keeps the heading on the column edge" (`e2e/surfaces.test.ts`, deleted by U17); "Desktop layouts look composed" (manual, superseded by the gate-5 sign-off and the gate-7 screenshots). `data-column` and `data-page-header` leave the contract §7 allow-list (U24, task 24.5).
