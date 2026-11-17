# Creative Archive: functional contract

This contract describes what the app does, never how it looks. It is the only input for the UI/UX redesign. Anything not stated here (layout, components, colour, spacing, hierarchy, icons, motion style) is free for the designer to decide. Anything stated here as behavior must survive the redesign.

Sources: `README.md`, `openspec/specs/*`, `e2e/*`, the route load/actions, and `.svelte` files read for behavior only (data shown, actions, states, exact copy, data hooks). `/__test/*` and `/__mockups/*` are out of scope.

## 1. Purpose and usage context

Creative Archive is a private, single-user, self-hosted archive for music, anime/manga, books and fashion. It records what to consume next, what is in progress, what is done, and the brands, shops, influencers, pieces and looks worth remembering.

Usage context: one person (Rue), no accounts or sharing, used on a phone and on a desktop browser (both are first-class; e2e runs a phone and a desktop viewport). Usage is frequent and short: add an item right after discovering it, bump progress (episode, chapter) on the go, glance at "what's in progress", browse a list. Data lives in a local SQLite file; images are stored in it too. The UI language is English.

## 2. Jobs-to-be-done

- J1. Add a music, anime/manga or book item fast by searching an online catalogue and picking a result (cover and facts prefilled).
- J2. Add a fashion item (brand, shop/site, influencer, piece) by pasting a URL and getting a name, image and description, or add any item by hand.
- J3. Record a look (outfit inspiration) with an image and a source link.
- J4. Track status of media (want, in progress, done, dropped; optionally already when adding) and wardrobe pieces (wishlist, owned, gone). Wishlist is for pieces that are cool to remember; Owned pieces make up the Wardrobe.
- J5. Track progress of anime (episodes) and manga (chapters, volumes) with one-tap steps or a typed value.
- J6. Rate media with a number from 0 to 10 (up to two decimals, e.g. 8.75) and clear a rating.
- J7. See at a glance what is in progress and what was added recently (home and per domain).
- J8. Browse one kind of item as a list (brands and shops share one list); filter by status, kind, tag, minimum rating; sort by added, rating, title; view grouped by status.
- J9. Tag entries with free labels and find them again through the tag filter.
- J10. Group entries of any kind into named collections, put them in an order of my choosing, and revisit them.
- J11. Link an album or song to its artist and see an artist's works from the artist page.
- J12. Edit or delete an entry, including its image, without losing work by accident.
- J13. Set a personal hero photo for Home and for each domain.
- J14. Move between sections (Home, Music, Animanga, Books, Fashion, Collections, Settings) from any screen.
- J15. Get immediate, trustworthy feedback: saves, failures, confirmations, validation messages.

## 3. Entities

### Entry (one table)

Shared fields: id, type, title (called "Title" or "Name" per type), image (optional, one per entry), tags (0..n), note (free text, optional), created time, updated time. Per-type fields below. Every entry belongs to exactly one domain through its type.

| Domain | Type (label) | List slug | Title label | Type-specific fields | Status | Rating | Progress | Catalogue search | URL preview |
|---|---|---|---|---|---|---|---|---|---|
| Music | Album | `albums` | Title | Year, Type (Album or EP), Tracks, Artist (link or text) | media | yes | none | Deezer | no |
| Music | Artist | `artists` | Name | none | media | yes | none | Deezer | no |
| Music | Song | `songs` | Title | Album (text), Year, Artist (link or text) | media | yes | none | Deezer | no |
| Animanga | Anime | `anime` | Title | Alternative title, Year, Episodes total | media | yes | episodes | AniList | no |
| Animanga | Manga | `manga` | Title | Alternative title, Year, Chapters total, Volumes total | media | yes | chapters, volumes | AniList | no |
| Books | Book | `books` | Title | Authors (one per line, original script kept), Year | media | yes | none | Open Library | no |
| Fashion | Brand / Shop / Site (one type, one combined list) | `brands-shops` | Name | Kind (Brand, Shop, Site; default Brand), URL, Description | none | no | none | no | yes |
| Fashion | Influencer | `influencers` | Name | Handles: Instagram, TikTok, YouTube, Website | none | no | none | no | yes |
| Fashion | Magazine | `magazines` | Name | Handles: Instagram, TikTok, YouTube, Website | none | no | none | no | yes |
| Fashion | Piece | `pieces` | Name | Brand (text), URL, Price (free text), Status | piece | no | none | no | yes |
| Fashion | Look | `looks` | Title | Source URL | none | no | none | no | no |

Per-domain differences that matter for UI:
- Music: albums and songs carry an artist link, a distinct relation (below).
- Animanga: anime tracks one counter, manga two. Totals can be unknown ("n / ?").
- Books: authors are a list; original-script names must display and edit unchanged.
- Fashion: no status or rating on brand/shop/site, influencer, magazine, look. Only pieces have a status. Fashion has an extra derived list, Wardrobe (pieces with status Owned).
- Brands, shops and sites are one combined list named "Brands & shops", filtered by Kind (Brand, Shop, Site; one choice at a time, "All" shows everything). Kind is an ordinary field: changing it on edit keeps the entry in the same list. Cards, the detail page and dialogs name such an entry by its Kind label (Brand, Shop or Site). The Add menu offers one item for the combined type; the form's Kind starts on Brand and can be changed before saving. The routes `/add/brand` and `/add/site` both open this one form (Kind preselected Brand and Shop respectively).

### Status (lifecycle)

- Media status: No status (none), Want, In progress, Done, Dropped. Labels per domain:
  - Music (Album, Artist, Song): No status, Want to listen, Listening, Listened, Dropped.
  - Anime: No status, Plan to watch, Watching, Watched, Dropped.
  - Manga, Book: No status, Want to read, Reading, Read, Dropped.
- Piece status: Wishlist (default on create), Owned, Gone. No history. Add opened from the Wardrobe list preselects Owned, so the new piece appears in Wardrobe; the status stays editable in the form. Add opened from anywhere else defaults to Wishlist.
- Any change of media status stores a dated status event (new status plus time). Setting the same status again stores nothing. The add form offers an initial status for media (default No status, with the domain's labels); choosing one other than none stores the first status event at creation. Without a choice a new media entry starts with status none. Status of existing entries is changed on the detail page.
- Progress above 0 while status is Want moves status to In progress automatically.
- Reaching the known total of the finishing counter (episodes for anime, chapters for manga) offers "Mark as watched" / "Mark as read", which sets status to Done.
- Progress never changes status none or dropped.

### Progress

Per key: current (integer >= 0) and total (integer or unknown). Current never below 0 and never above a known total. With an unknown total the value reads "n / ?" and has no upper bound. Keys: episodes (anime), chapters and volumes (manga).

### Rating

Media only (Albums, Artists, Songs, Anime, Manga, Books; Artists keep status and rating). A number from 0 to 10 inclusive with at most two decimal places (8, 8.5 and 8.75 are valid; 8.755, -1 and 10.01 are not), or none. 0 is a real rating and differs from none. Existing ratings were stored on a 0.5-to-5 star scale and are converted to the same number doubled (4.5 stars becomes 9, 0.5 stars becomes 1) with no loss. An unrated entry shows no rating value wherever entries are listed. The value is shown without losing precision and without padding zeros (8.75, 9, 8.5).

### Tag

Free label shared by all entry types. Deduplicated by Unicode-aware, case-insensitive, whitespace-collapsed match; the existing spelling is reused. Empty names are ignored. A tag with no entries disappears (no longer suggested or filterable).

### Collection

Required name (error "Name is required" when blank), optional description. Holds entries of mixed types in an order Rue controls: a newly added entry goes to the end, and entries can be reordered by hand (the order is saved at once and is the order shown everywhere, including the collage source). Existing collections keep the order in which entries were added. No duplicates (adding again changes nothing). Reports a count and a collage source (images of its first three entries in that order that have one). Removing an entry or deleting the collection never deletes entries. Deleting an entry removes it from every collection.

### Artist link (Album and Song only)

Stored as artist name text plus an optional link to one Artist entry. Linked: name navigates to the artist. Unlinked: plain text. Deleting an artist clears the link and keeps the name text. An Artist's page lists its linked albums and songs ("Works").

### Image

At most one per entry, plus one hero image per world (home, music, animanga, books, fashion). Accepts jpeg, png, webp, gif, avif, heif up to 16 MB (HEIC files, `.heic`, are not accepted); stored as WebP (long side up to 1600 px). Served at `/images/<id>` with a long immutable cache. Replacing or removing an image deletes the old one. Entries without an image show a placeholder built from the title's initials (e.g. "KC" for "Kitchen Confidential"), never a broken image.

### Hero photo

One optional photo per world, shown as the hero of Home and of each domain page. Without one, the hero is in its fallback state and renders no image element (what the fallback looks like is free).

### World

Each domain (and Home, which also hosts Collections and Settings) is a "world". Entry detail, edit, add and list screens belong to their type's domain world. Which world is active is behavior only in that it drives which nav section is marked current (below); the look of a world is the design system's concern.

## 4. Routes

Common to every app route (`(app)` group): global navigation (section 5), toasts (transient, non-blocking status messages; section 5), and SvelteKit's default error page for unknown ids/paths (404). Rue decided to keep it: no custom error page and no navigation on it, and it is outside the redesign's scope. Document title pattern: `<Page> · Creative Archive`; Home is just `Creative Archive`, a list is `<List> · <Domain> · Creative Archive`, a collection is `<Name> · Collections · Creative Archive`, the add form is `New <type lowercase> · Creative Archive`, the edit form is `Edit <entry title> · Creative Archive`.

State legend: E = empty, L = loading, X = error, 1 = single item, N = many, T = overlong text. "yes" applies, "n/a" does not apply.

### 4.1 `/` (Home)

Serves: J7, J10, J14.

Data shown: headline "Everything you love, kept close" and intro "Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed." Domain names (Music, Animanga, Books, Fashion). Home has no hero block of its own: the home world's photo is the frame's stage (from the layout), and without a photo the page shows the colour field. A "Domains" region with one tile per domain showing its entry count, and a charcoal key-facts card (hidden while the archive is empty). Shelves (a shelf is a named group of entries with a count and an optional link to the full set), in order: "In progress" (media entries with status in progress, most recently updated first, any domain, mixed types), then one "Recently added" card holding a ruled shelf per domain that has entries (12 newest, with the domain's total count and a "See all" link to the domain page). A "Collections" group with every collection, newest first: name, count ("1 entry" / "n entries"), its collage (the images of its first three entries, in the collection's order, that have one), and the description for the featured one; the first collection that has images (by newest) is featured and is listed first, a collection without images is never featured, with none featured all are equal; link "All collections" (always present).

Actions:
- Open any listed entry (navigates to `/entries/<id>`).
- Browse a shelf beyond the entries that fit at once ("Scroll left", "Scroll right", drag, native scroll); the step controls are disabled at either end.
- Change progress on an in-progress entry in a shelf (see 4.5 progress behavior); activating the progress value does not open the detail.
- "See all"-style link from a shelf to its domain page; "All collections" to `/collections`; each collection to `/collections/<id>`.

Validation/errors: none on the page. A failed background save of progress shows the toast "Couldn't save — try again" and the control returns to the server value.

States: E yes (archive empty: the welcome "Your archive starts here" with one entry per domain: Music "Albums, artists and songs you love or want to hear.", Animanga "What you watch and read, episode by episode.", Books "The shelf you are in the middle of, and the one waiting.", Fashion "Brands, shops, magazines, pieces you own and looks you keep."; each with link "Add your first album", "Add your first anime", "Add your first book", "Add your first piece"; no domain tiles, facts card, shelves or collections group). Empty shelves are hidden; no collections means no collections group. L n/a (server-rendered). X n/a. 1 yes. N yes (shelves cap at 12). T yes (titles and collection names may be shortened in listings; full text on detail).

Keyboard/touch: shelf step controls are real buttons; drag/scroll for shelves; all interactive targets at least 44 px on phone; progress control must not raise a text caret or keyboard until activated.

### 4.2 `/[domain]` (Music, Animanga, Books, Fashion landing)

Valid values: `music`, `animanga`, `books`, `fashion`. Anything else answers 404. Serves: J7, J8, J14, J1/J2/J3 (entry point), J13 (consumer).

Data shown: domain name with the label "Domain"; the world's photo is the frame's stage, or the colour field without one. Sub-type navigation (named "Sub-types") linking to each list: Music: Albums, Artists, Songs. Animanga: Anime, Manga. Books: Books. Fashion: Wardrobe, Pieces, Looks, Brands & shops, Influencers, Magazines. Shelves: "In progress" (media domains only, only when something is in progress; this domain only) then one shelf per sub-type with entries, titled by the type plural (e.g. Albums, Artists), each with a count and a "See all" link to the list (12 newest). A charcoal key-facts card captioned "Whole domain" counts entries, in progress (media domains only) and sub-types; it follows the shelves on the phone, sits beside the title on desktop and is hidden while the domain has no entries. Fashion's Sub-types navigation keeps two caption groups, "My things" (Wardrobe, Pieces, Looks) and "Discover" (Brands & shops, Influencers, Magazines). A charcoal key-facts card captioned "Whole domain" counting entries, in progress (media domains only) and sub-types; it follows the shelves on the phone and sits beside the title on desktop, and is hidden while the domain has no entries.

Actions:
- "Add" opens a menu named "Add to <Domain>" listing the domain's types (Music: Album, Artist, Song; Animanga: Anime, Manga; Books: Book; Fashion: Brand or shop (one item), Influencer, Magazine, Piece, Look). Choosing one navigates to `/add/<type>` (the Brand or shop item opens `/add/brand`). Menu: opens focusing the first item, ArrowUp/ArrowDown/Home/End move, Escape closes and returns focus to the button, Tab or an outside pointer closes.
- Open a sub-type list, open an entry, browse a shelf, change progress on an in-progress entry (as 4.1).

States: E yes (no entries: heading "No <domain lowercase> yet", text "Add the first one to start the list." and a link "Add an album" / "Add an anime" / "Add a book" / "Add a piece"; no shelves or facts card; sub-types and Add stay available). L n/a. X n/a (404 for unknown domain). 1 yes. N yes. T yes.

Keyboard/touch: menu keyboard model above; touch targets at least 44 px.

### 4.3 `/[domain]/[list]` (one list)

Valid pairs are the sub-types in 4.2 (`/music/albums`, `/music/artists`, `/music/songs`, `/animanga/anime`, `/animanga/manga`, `/books/books`, `/fashion/brands-shops`, `/fashion/influencers`, `/fashion/magazines`, `/fashion/pieces`, `/fashion/wardrobe`, `/fashion/looks`). Anything else answers 404, except the retired `/fashion/brands` and `/fashion/shops`: both permanently redirect (308) to `/fashion/brands-shops`, keeping any query values; `/fashion/brands` adds `kind=brand`, `/fashion/shops` adds no kind because it used to hold both shops and sites. Serves: J8, J9, J4/J5/J6 (quick controls on listed entries), J1/J2/J3 (Add), J14.

Data shown: list name, the number of entries currently shown, the entries. Each listed entry shows: cover (or initials placeholder), title (may be shortened), a type-specific secondary value (album/song: artist name; book: authors; piece: brand; anime/manga: year), a status label when status is not "none" (or the Kind label Brand/Shop/Site for brands and shops), the rating when rated, and for in-progress anime/manga a progress control. The head shows the sub-type kicker (named "Sub-types": the domain, then every list of the domain in order, the current one marked), the title with the count of entries shown as a phrase ("Albums 16 titles", "Magazines 3 magazines"), one line under it, and a charcoal key-facts card counting what is shown by status (Brands & shops by kind; lists without a split show their own count; the caption reads "Whole list" or, with filters on, "Shown · n of total"; no card when every count is 0; on the phone the card follows the grid). A group of filter controls exposed as a toolbar named "Filters", each a native select labelled by its name: Status (media lists: All and the domain's four labels; Pieces: All, Wishlist, Owned, Gone), Kind (Brands & shops only: All, Brand, Shop, Site; "All" clears status and kind), Tag ("All tags" plus every tag used by entries of this list; present only when at least one entry of the list has a tag), Minimum rating (options "Any rating", "9 and up", "8 and up", "7 and up", "6 and up", "5 and up" on the 0 to 10 scale; media only; the URL accepts any value from 0 to 10 with up to two decimals), Sort (Recently added; Rating (media only); Title), and for media lists a View choice named "View" (Grid, Shelves; a pill glides to the pressed option). The bar ends with "Select" and "Add". Wardrobe has no status filter (it is fixed to Owned). Influencers, Magazines and Looks have only Tag (when tags exist) and Sort; Brands & shops add Kind.

Actions:
- Every filter/sort/view change updates the URL query (`status`, `kind`, `tag`, `rating`, `sort`, `view=shelves`); each change is a history entry; reload and Back restore the state; invalid or inapplicable query values are dropped.
- Shelves view groups media by status in the order In progress, Want, Done, Dropped, No status, one shelf per status that has entries, titled with the domain's status label.
- "Add" (shown only when the list has entries) goes to `/add/<type>` (Wardrobe goes to `/add/piece?status=owned`; brands and shops to `/add/brand`).
- Open an entry; change progress on in-progress entries; "Reset filters" clears all filters and the query.
- Select mode (wording fixed at gate 5): a list with entries offers "Select". In Select mode a tap or click on an entry toggles it instead of opening it, a shift-click on the desktop selects the range from the last toggled entry, and a selection bar shows the count of selected entries, the actions valid for the selection and "Done". "Set status" is offered only when every selected entry has the same status set (all media, or all pieces) and lists that set's statuses; "Add tag" and "Remove tag" are offered for every type ("Remove tag" lists only tags present on the selection). With nothing selected the actions are disabled. Each action is one request that applies to every selected entry or to none; success shows a toast naming the count, a failure keeps every value and the selection and shows "Couldn't update N entries — try again". The toasts read "Status set to <status> for N entries", "Tag added to N entries" and "Tag removed from N entries" ("1 entry" in the singular). Select mode shows the grid whatever the view is. The selection bar (region "Selection") announces "N selected" politely; from 1024 px it sticks below the top bar above the list with every action, below that it is docked at the bottom with the count, one main action ("Set status" when offered, else "Add tag") and a "More" menu with the rest. Escape or "Done" leaves Select mode, after which an entry opens again on activation. Selecting is operable by keyboard and by touch.
- Sorting: Recently added (newest first, default), Rating (highest first, unrated last), Title (Unicode-aware, case- and accent-insensitive).

States: E yes (no entries at all: heading "No <plural lowercase> yet", text "Add the first one to start the list.", "Add" link; filters hidden). Filtered-empty yes ("Nothing matches" with "Reset filters"). L n/a. X n/a. 1 yes. N yes (no pagination; whole list is returned). T yes (titles may be shortened in the list; counts are short).

Keyboard/touch: filter controls operable by keyboard; the Grid and Shelves view buttons expose pressed state; each listed entry is a link (in Select mode its title is a toggle with pressed state); shelves browsable as 4.1.

### 4.4 `/add/[type]` (create an entry)

Valid `type`: album, artist, song, anime, manga, book, brand, site, influencer, magazine, piece, look (`brand` and `site` open the same combined form, see section 3). Unknown answers 404. Query: `manual=1` forces the manual form; `title=<text>` prefills the title; `status=<status>` preselects the form's status when it is valid for the type (the Wardrobe Add uses `status=owned` on `/add/piece`; an invalid value is dropped). Serves: J1, J2, J3, J9, J11, J12 (guard), J15.

Three entry modes by type:
- With a catalogue (album, artist, song, anime, manga, book): a search step first, then the form. The form is shown directly when `manual=1`.
- With URL preview (brand, site, influencer, magazine, piece): a "Page URL" field is offered first, and the full form is always available too (no search step).
- Neither (look): the manual form directly.

Data shown (search step): a search box (placeholder "Search <type lowercase>…", label "Search <type lowercase>"), a status line, a results list named "Search results" (cover or placeholder, title, creator, year), and a link "Add manually". Picked state: "Picked result" summary (cover, title, creator), a checkbox "Add artist" (albums and songs from Deezer only, ticked by default), and "Choose another".

Search behavior: input is debounced (300 ms, no request per keystroke; one request with the final query); Enter searches immediately; an empty query shows nothing. Statuses: "Searching…", "Search is unavailable right now" (provider error or 5 s timeout), "No results". Both failure and empty show "Add manually", which opens the manual form with the query as title. A result whose provider id already exists in the archive shows "Already in your archive", links to that entry and cannot be picked. Picking a result prefills the form, which stays fully editable; unknown totals stay empty.

Preview behavior (brand, site, influencer, magazine, piece): URL is checked when committed (change or Enter). Invalid URL shows "Enter a valid http or https URL" and makes no request. While loading: "Looking up the page…". On success the found image appears labelled "Page preview", a found title fills an empty name field, a found description fills an empty Description, and the pasted URL fills an empty URL field; fields the user already filled are never overwritten. When nothing usable is found (blocked, JS-only, login wall, private address, no image) the status reads "No preview found" and the form stays fully usable with manual image upload. Influencers: a profile URL also fills the matching handle (Instagram, TikTok, YouTube); any other http(s) URL fills only the Website handle; post, reel and video URLs fill nothing; a handle that already holds a value is not overwritten.

Layout (unit 22): the breadcrumb kicker reads "Domain — List — Add" (brands and shops: the combined list) on one line, with only the last part truncating. The media form offers a Status select ("No status" by default; the domain's labels; preselected by a valid `?status=`); the flow is search, pick a result, then the form, and "Add manually" is available in every search state. Leaving a changed form asks "Discard changes?" (below).

The form (all types): Image (Add image / Replace, Remove image; preview labelled "Preview"; client checks: type must be an image of a listed format, size at most 16 MB; inline errors "Unsupported image type" and "Image is larger than 16 MB"), Title or Name (per type), Artist (albums and songs: combobox of existing artists by name; once linked, the field shows the linked artist as linked and offers "Unlink artist"; or free text stored without creating an artist), the type's fields (section 3), the totals for progress types (labels "Episodes total", "Chapters total", "Volumes total"; whole numbers), Status (media: No status plus the domain's labels, default No status; pieces: Wishlist, Owned, Gone, default Wishlist unless preselected), Tags, Note, Cancel, Save. Kind (brands and shops) is one of the type's fields.

Validation (field-level inline messages, focus moves to the first invalid field, a message clears when its field is edited):
- Blank title/name: "Title is required" or "Name is required" per type. Nothing is stored.
- Whole-number fields (Year, Tracks, totals): "Enter a whole number".
- URL fields (URL, Source URL, Website handle): "Enter a valid http or https URL".
- Image errors as above (a `.heic` file reads "Unsupported image type"); image rejected by the server shows the same message at the Image field.
- Duplicate provider id on save: the form is shown again with a notice "Already in your archive" linking to the existing entry.

Save behavior: Save is disabled and reads "Saving…" while submitting, so repeated presses create one entry. On success: toast "Saved", navigate to `/entries/<id>`. A search-picked cover is downloaded server-side at save; if that fails the entry is saved without an image and the toast "Cover could not be downloaded" shows. A preview image is stored at save. With "Add artist" ticked, an album/song picked from Deezer links the existing Artist entry with the same Deezer id or creates one (status none, with the Deezer photo); unticked stores the name only. Two artists with the same name but different Deezer ids stay separate.

Unsaved-changes guard: leaving the form in-app (nav, links) when values differ from how the form opened (a catalogue or preview prefill counts as a change) asks "Discard changes?" with "Keep editing" (default focus; Escape also keeps editing) and "Discard". Reload or close in that state triggers the browser's native prompt. An untouched form, Save, and the navigation after a successful save never ask.

Cancel returns to the type's list (brands and shops: the combined list).

States: E (empty form, yes). L yes (search, preview, saving). X yes (search failure, validation, image). 1 n/a. N yes (up to the provider's result count). T yes (long titles, long query).

Keyboard/touch: combobox for artist (ArrowUp/ArrowDown choose, Enter picks, Escape closes); tag input (Enter or comma confirms, Backspace on empty removes last, matching existing tags offered as suggestions); dialog traps focus; file choosers reachable by keyboard; numeric inputs open a numeric keyboard on phone.

Supporting endpoints (not pages):
- `GET /add/[type]/search?q=` returns `{results}` or `{error}`; 404 for types without a catalogue.
- `POST /add/[type]/preview` with `{url}` returns `{title, description, image}` or `{error: "invalid-url"}`; 404 for types without preview. Server-side fetches refuse non-http(s) schemes, loopback/private addresses, more than 3 redirects, anything over 5 s or too large.

### 4.5 `/entries/[id]` (entry detail)

Unknown or non-numeric id answers 404. Serves: J4, J5, J6, J9, J10, J11, J12, J14.

Data shown: cover (or initials placeholder), domain and type label, full (un-truncated) title, for albums/songs the artist (link to the artist entry when linked, plain text otherwise), controls (below), every filled field of the type as label/value pairs (links open in a new tab: URL, Source URL, Website; Authors joined by commas; Kind shown by label; Handles each labelled Instagram, TikTok, YouTube, Website; URL values shown without scheme), tags, the note (prose), and for Artists a "Works" group with the albums and songs linked to that artist (type label, year, rating). A failed cover download at creation surfaces as the toast "Cover could not be downloaded" on arrival.

Controls by type:
- Media (album, artist, song, anime, manga, book): a Status control (button named "Status: <current label>", a menu of options with exactly one checked: for the domain labels in section 3, plus "No status"); a Rating control (0 to 10, up to two decimals) with a "Clear rating" action visible when rated; for anime and manga the progress counters.
- Anime: "Episodes". Manga: "Chapters" and "Volumes".
- "Mark as watched" / "Mark as read" appears when the finishing counter has reached a known total and status is not Done; choosing it sets status to Done.
- Piece: a Status control (Wishlist, Owned, Gone); no rating.
- Entry menu (unit 21): a "···" pill named "Entry menu" in the head offers "Edit" and "Delete" (a danger item, separated from Edit).
- Rating (unit 21): a typed field "Rating" with "/ 10", the round buttons "Rating: one less" (disabled when unrated or at 0) and "Rating: one more" (disabled at 10), and the helper "0 to 10, up to two decimals. Leave empty for no rating." ArrowUp/ArrowDown and the round buttons step and save at once, without a confirm line; a typed value commits on Enter or blur and draws the confirm line; Escape reverts the text to the saved value.
- "In collections" card (unit 21): the collections holding the entry, with "Add to collection"; "Not in any collection yet." when none.
- Artist without linked works: "No works yet. Albums and songs linked to this artist appear here." in the Works group.
- Tags: a long list is shortened behind "Show all N tags" and "Show fewer tags".
- Breadcrumb (unit 21): "Domain — List" only (no title crumb; the title is the heading), on one line, only the last crumb truncating.
- Brand/Shop/Site, Influencer, Look: no status, no rating, no progress.

Actions:
- Change status, rating, progress: shown at once, saved in the background through a one-at-a-time queue; later changes still save after a failure. On failure the toast "Couldn't save — try again" shows and the control returns to the server's value.
- Rating: Rue can set any value from 0 to 10 with up to two decimals (e.g. 8.75), by pointer, by typing, or by stepping; every such value must be reachable and the control must make the scale (out of 10) clear. Keyboard: it is a typed number field, so arrows step the value (step size is free), Delete/Backspace edit and clear as in any text field, and Home and End move the text cursor (they do not set 0 or 10; confirmed by Rue on 2026-11-13, gate 1 / task 2.5). Exposed with the name "Rating" and its numeric value (spin button semantics, no slider; the accessible value text reads "<n> of 10"). Allowed values 0 to 10 with at most two decimals; others are rejected with "Rating must be between 0 and 10 with up to two decimals".
- Progress control (also on in-progress entries in shelves and lists): a step-down and a step-up button named "<Label>: one less" and "<Label>: one more" (step-down disabled at 0, step-up disabled at a known total). The value is plain text exposed as a button named "<Label> <current> of <total|unknown>" with no text input and no caret. Activating it (click, tap, Enter, Space) turns it into a numeric input named "<Label>" (numeric keyboard hint), focused with the value selected. Enter or leaving saves a changed value and returns to the button; Escape returns without saving. Empty, non-integer, negative, or above-known-total input reverts without a save. The displayed value reads "n / total" or "n / ?" everywhere.
- "Add to collection" menu: lists all collections with a checked state for those holding this entry (toggle membership immediately), and "New collection" which asks for a Name (error "Name is required"), then creates the collection and adds the entry at once. Keyboard: arrows/Home/End, Escape closes and refocuses the button.
- "Edit" navigates to `/entries/<id>/edit`.
- "Delete" opens a confirmation dialog "Delete this <type lowercase>?" (brands and shops: the Kind label) with the title, the text "It leaves your collections and its history goes with it.", "Cancel" and "Delete". Delete must never be the entry page's primary or default action. Confirming removes the entry, its image, tag links, status history and collection memberships, navigates to the type's list and shows the toast "Deleted". Cancel keeps everything. The dialog traps focus, Escape cancels, focus returns to the Delete button.

States: E n/a. L n/a. X yes (failed saves, 404). 1 n/a. N yes (many tags, many works). T yes (180-character titles shown in full; on phone the title must not push the page's own controls or navigation out of reach).

Keyboard/touch: spin button semantics for the typed rating field, button semantics for the counters, menu semantics for status and collection; 44 px targets; progress value never raises a keyboard until activated.

### 4.6 `/entries/[id]/edit`

Unknown id answers 404. Serves: J12, J9, J11, J15.

Same form as the add form (4.4, manual mode) opened with every stored value: image, title/name, artist (linked token or text), the type's fields (including Kind on brands and shops), the progress totals (not the current count), piece Status, tags, note. Media status, rating and current progress are not part of this form (they are changed on the detail page). The heading is "Edit <type lowercase>"; the document title uses the entry title. Cancel returns to `/entries/<id>`.

Layout (unit 22): the form exists for all twelve types. Media status is not editable here (pieces keep their Status select). The breadcrumb reads "Domain — List — <entry title>" on one line and only the last crumb (the title, a link back to the entry) truncates. The lede reads "Status, rating and progress stay on the entry page. Cancel returns to the entry." for media types ("Change what you stored. Cancel returns to the entry." for the others).

Save runs the same validation as 4.4, replaces the image only when a new one is chosen or "Remove image" was used (the old image is deleted), bumps the updated time, shows the toast "Saved" and navigates to the detail page. The unsaved-changes guard applies as in 4.4 (an untouched form never asks).

States: E n/a. L yes (saving). X yes (validation). 1/N n/a. T yes.

### 4.7 `/collections`

Serves: J10, J14.

Data shown: heading "All collections", the collection count and a facts card (collections, entries inside); every collection, newest first, on a solid card with its collage (the images of its first three entries, in the collection's order, that have one; a placeholder of initials when it has none), name (link to its page), its description when it has one (shortened to three lines), and count (accessible as "<n> entry/entries").

Actions: "New collection" (the head's dark arrow pill, or the empty state's) reveals a form with Name and Description and actions "Cancel" and "Create"; the name field is focused. Blank name shows "Name is required". On success the form closes and the collection appears with count 0. Each collection links to `/collections/<id>`.

States: E yes ("No collections yet", "Group entries of any kind into one place."; creating is still possible). L n/a. X yes (validation). 1 yes. N yes. T yes (names, descriptions).

### 4.8 `/collections/[id]`

Unknown or non-numeric id answers 404. Serves: J10.

Data shown: name (last word accented), "Collections" crumb link, the count in the kicker (accessible as "<n> entry/entries"), description when present (three lines on desktop, six on the phone), and a facts card "This collection" (entries, types) that sits in the head and, on the phone, after the list (Rue 2026-11-16); no facts card when the collection is empty. The entries (mixed types) are ordered rows in the collection's order (initially the order added): position ("01 / 05" on desktop, "01" on the phone), cover thumbnail or initials plate, title (link to the entry), "<Type> · <maker>". Head actions: "Select" (the page's one dark arrow pill, only with entries), "Rename" (secondary), "Delete collection" (danger, never focused on load).

Actions:
- "Rename" shows Name and Description fields (prefilled) with "Cancel" and "Save"; blank name shows "Name is required"; the page and the index show the new name after saving.
- Reorder: each entry offers "Move up" and "Move down" (not offered at the first and last position respectively), which work by keyboard and by touch: from 1024 px as icon buttons "Move <title> up" / "Move <title> down" (plus "Remove <title>") on the row, below that as items of the row's "Actions for <title>" "…" menu (Move up, Move down, Remove; the menu is a popover, so it sits in the top layer). Focus stays on the moved entry's control (the row menu's button after a menu move). On a fine pointer an entry can also be dragged by its handle to another position (the row follows the pointer with `transform`, a charcoal line shows the drop; Escape cancels); the handle shows only under `(pointer: fine)` and not with a single entry. Moves are instant (no list animation, so reduced motion needs no special case). The new order is saved at once, survives a reload, and a failed save shows the toast "Couldn't save — try again" and restores the saved order. Adding an entry to a collection puts it at the end; removing keeps the order of the rest. With one entry there is nothing to reorder. A save that finds the collection changed since the page loaded (the sent order no longer matches its entries) is answered with 409: the page reloads the saved order and shows a polite toast; a malformed order answers 400 and restores the saved order.
- Select mode (wording fixed at gate 5): a collection with entries offers "Select". Picking entries (tap, click, shift-click range on the desktop, keyboard) offers "Move to top", "Move to bottom", "Move before…" (choosing a target entry that is not in the selection) and "Remove from collection". Each action is one save; the moved set keeps its relative order, and a toast names the count. Selected rows get a charcoal ring and a check; the title takes the moss accent. On the phone the bar docks at the bottom with "Move to top" as the main action and the rest behind "More"; "Move before…" opens a sheet "Move N entries before…" listing the entries not selected, and picking one applies the move at once. Every entry can be selected; removing the last entries shows the empty state and leaves Select mode. Escape or "Done" leaves Select mode.
- "Remove <title>" (desktop) or the row menu's "Remove" (phone) removes the entry from this collection only (one `removeMany` save, toast "1 entry removed from this collection"); it leaves this page, the count drops by one, the entry still exists.
- "Delete collection" opens a sheet "Delete this collection?" (Sheet, `mode="sheet"`, focus on "Cancel") with the name and "Its entries stay in your archive.", "Cancel" and a danger "Delete". Confirming deletes only the collection, navigates to `/collections` and shows the toast "Deleted". Dialog traps focus, Escape cancels, focus returns to its opener.
- Open any entry.

States: E yes ("Nothing in here yet", "Use "Add to collection" on any entry's page."). L n/a. X yes (rename validation). 1 yes. N yes. T yes.

### 4.9 `/settings`

Serves: J13, J14.

Data shown: heading "Hero photos" and the explanation "Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB.". One slot per world in the order Home, Music, Animanga, Books, Fashion. A slot shows its current photo, or the text "No photo yet" when none.

Actions per slot: "Upload" (no photo yet) or "Replace" (a photo is set) chooses an image file (accessible name "<World> photo file"); a valid file uploads immediately, replaces the previous photo (the old image is deleted) and the slot shows the new image. "Remove" (only when a photo is set) deletes it. Validation messages appear inside the affected slot only and leave the hero unchanged: "Unsupported image type" (not an image or unsupported format) and "Image is larger than 16 MB". While a request is pending the slot's actions are disabled. Replace and Remove are equal alternatives; neither is the default action.

States: E yes per slot ("No photo yet"). L yes (pending). X yes (the two messages). 1/N n/a. T n/a.

Settings is the only configuration; no preferences, accounts or sign-in exist.

### 4.10 Non-page routes

Form actions beyond create, edit and delete (all answer `{ … }` data on success or `fail(400, { errors })`):
- `/[domain]/[list]`: `bulkStatus` (`ids` comma-separated, `status`) sets the status of every given entry, `bulkTag` (`ids`, `tag`, `op` = `add` | `remove`) adds or removes one tag on every given entry; each applies to all given entries or to none, and answers `{ updated: n }`. A non-numeric id, an unknown id or a status invalid for a given entry's type answers 400 and changes nothing; an empty list changes nothing.
- `/collections/[id]`: `removeMany` (`ids`) removes the given entries from this collection only, keeps the order of the rest and answers `{ removed: n }`, with 400 when an id is not a member; `reorder` answers 400 for a malformed order (non-numeric or duplicate ids) and 409 for a well-formed order that no longer matches the collection's entries.

- `GET /images/[id]`: returns the stored WebP (`image/webp`, `cache-control: public, max-age=31536000, immutable`); unknown or non-numeric id answers 404. Image URLs are stable and can be embedded anywhere.
- `GET /healthz`: plain text `ok` (200) while the database answers, 503 `database unavailable` otherwise. Operational only; no UI.

## 5. Cross-cutting behavior

Navigation (behavior, not layout):
- Every app screen offers the same primary destinations: Home (`/`), Music (`/music`), Animanga (`/animanga`), Books (`/books`), Fashion (`/fashion`), Collections (`/collections`), plus Settings (`/settings`) and a link back to Home from the app name. Exactly one navigation, a landmark named "Main", is exposed at a time. The current section is marked (aria-current="page"); entry detail, edit, add and list pages mark their type's domain; `/collections*` marks Collections; Settings is marked on `/settings` and no domain is marked there; Home marks Home. Navigation must stay reachable while scrolling and never cover the end of the content or a focused control.
- Top bar (from 1024 px): the brand "Creative Archive" (link to `/`), the six sections and a Settings button on one row; from 1024 to 1099 px the brand shows its mark only (the name stays its accessible name). Once the page has scrolled (from 1100 px) the bar stays at the top as a compact capsule with the brand mark only; below 1024 px there is no sticky top bar.
- Phone bar (below 1024 px, tablets included): a bar at the bottom with the pills Home, Music, Animanga, Books and Fashion and a separate round "Add" button; Collections and Settings are reached from Home (its Collections section and its Settings button), so Home is the marked pill there. Below 360 px the pills show icons only (names stay accessible names). While a text field has focus on a touch screen the bar fades out and comes back when focus leaves the field.
- The round "Add" button opens a sheet of type chips: "Add to your archive" with every type grouped by domain on Home, Collections and Settings, "Add to <Domain>" with that domain's types inside a domain (Fashion: Brand or shop, Influencer, Magazine, Piece, Look; on `/fashion/wardrobe` Piece opens `/add/piece?status=owned`). Each chip opens `/add/<type>`. The sheet closes on Escape, an outside tap and Back; on add and edit forms the button is inert (`aria-disabled="true"`).
- Navigating between pages shows no transition (no morph, no crossfade); going back with the browser's Back restores the horizontal scroll of the shelf rows. Navigation to an entry from any listing and back keeps scroll and filter context (filters live in the URL, so Back restores them).

Persistence:
- SQLite file (`DATABASE_PATH`); migrations apply on start; one user; no authentication. Images are stored as WebP BLOBs. Timestamps are stored on every entry; status changes are kept as dated events.
- Optimistic writes: status, rating, progress and collection membership change at once in the UI and are sent in the background through an ordered queue; on failure the control reverts to the server value and the toast "Couldn't save — try again" shows. Later changes still save.
- Toasts: transient (about 3 s), non-blocking, announced as status messages; a message raised just before a redirect or reload is shown on the destination page (kept in session storage). Messages: "Saved", "Deleted", "Couldn't save — try again", "Cover could not be downloaded".

App icon: a web manifest for the icon only (`/manifest.webmanifest`, icon files in `static/`); no service worker.

Image handling:
- Allowed: jpeg, png, webp, gif, avif, heif. HEIC (`.heic`, `image/heic`) is not accepted. Max 16 MB. Converted server-side to WebP (long side 1600 px). Client rejects early with the inline messages above; the server re-checks.
- Placeholder (initials of the title) for any entry without image, wherever an entry image would appear (listings, detail, search results, picked result); never a broken image. Cover and hero images are decorative or described by the entry title; hero images carry no text alternative.
- Images are referenced as `/images/<id>`; covers must never be distorted (stretched or squashed). How a cover is framed per type is the designer's choice.

Settings: hero photos only (4.9).

Shortcuts and keyboard summary: carousel (ArrowLeft/Right), shelves (step buttons and drag), menus (ArrowUp/Down, Home, End, Escape, Tab closes), rating (arrows step; Home and End move the cursor; Delete/Backspace edit), progress value (Enter/Space to edit, Enter or blur to save, Escape to cancel), tag input (Enter and comma confirm, Backspace removes last), artist combobox (arrows, Enter, Escape), dialogs (Tab trapped, Escape to cancel/keep editing), search (Enter searches now). No global shortcuts exist.

Sizing and devices: all interactive targets at least 44 px on phone; no horizontal page scroll on a phone viewport (390 px); on a desktop viewport (1280 px) the content must make use of the available width rather than staying at phone width. Both are covered by e2e.

Text handling: titles and names may be 180 or more characters, in any script (e.g. Japanese author names), with accents; listings may shorten them while detail pages and headings show the full text; sorting by title is accent- and case-insensitive.

Accessibility contract: every control has an accessible name (see section 6); progress, rating, status, menus, dialogs, toolbar, combobox and carousel keep their roles (rating: slider or spin button with its numeric value); status and errors are announced (`role=status`, `role=alert`); focus is managed on dialog open/close and on the first invalid field.

## 6. Copy list

All UI copy moves to English. Every string the e2e suite matches exactly is already English; the redesign keeps them (target equals current). Patterns with `<...>` are templates. `test-routes.test.ts` targets test routes and is excluded. German strings found: 0.

Strings the e2e suite does not match but the UI shows (already English, keep as the target text): "Everything you love, kept close", the home intro, "Your archive starts here", the four welcome lines (4.1), "Latest additions", "Latest entries", "Domain", "Archive", "Hero photos" and its explanation, "No <plural> yet", "Add the first one to start the list.", "Searching…", "Looking up the page…", "Saving…", "Choose another", "Picked result", "Add image", "Upload", "Enter a whole number", "No collections yet", "Group entries of any kind into one place.", "Nothing in here yet", "Use "Add to collection" on any entry's page.", "Delete this <type>?", "It leaves your collections and its history goes with it.", "Delete this collection?", "Its entries stay in your archive.", "What you changed on this entry isn't saved yet.", "Invalid status for <type>", "Rating must be between 0 and 10 with up to two decimals". Redesign may reword these.

Strings added by the redesign units 21 and 22 (kept inline in their components, not in `COPY`): "Entry menu", "Edit", "Delete", "Not in any collection yet.", "Add to collection", "In collections", "Rating: one less", "Rating: one more", "Clear rating", "0 to 10, up to two decimals. Leave empty for no rating.", "No works yet. Albums and songs linked to this artist appear here.", "Show all <n> tags", "Show fewer tags", "Discard changes?", "Keep editing", "Discard", "Status, rating and progress stay on the entry page. Cancel returns to the entry.", "Change what you stored. Cancel returns to the entry.".

| current string | English target | used in spec file |
|---|---|---|
| Main | Main | detail.test.ts, entry-edit.test.ts, entry-form.test.ts, nav.test.ts, transitions.test.ts, type-scale.test.ts, unsaved.test.ts |
| Home | Home | nav.test.ts, settings.test.ts, unsaved.test.ts |
| Music | Music | domain-pages.test.ts, nav.test.ts, placeholders.test.ts, settings.test.ts, transitions.test.ts, type-scale.test.ts, unsaved.test.ts |
| Animanga | Animanga | detail.test.ts, nav.test.ts, settings.test.ts |
| Books | Books | domain-pages.test.ts, nav.test.ts, placeholders.test.ts, settings.test.ts, transitions.test.ts |
| Fashion | Fashion | nav.test.ts, settings.test.ts |
| Collections | Collections | home.test.ts, nav.test.ts, unsaved.test.ts |
| Settings | Settings | nav.test.ts |
| Sub-types | Sub-types | domain-pages.test.ts |
| Filters | Filters | form-controls.test.ts, globals.test.ts, list-filters.test.ts, shelves.test.ts |
| Tag | Tag | list-filters.test.ts |
| Minimum rating | Minimum rating | list-filters.test.ts |
| Sort | Sort | form-controls.test.ts, list-filters.test.ts |
| Grid | Grid | shelves.test.ts |
| Shelves | Shelves | shelves.test.ts |
| All | All | globals.test.ts |
| Scroll right | Scroll right | globals.test.ts |
| Previous entry | Previous entry | none |
| Next entry | Next entry | none |
| Add | Add | domain-pages.test.ts, lists.test.ts |
| Add to Fashion | Add to Fashion | domain-pages.test.ts |
| Add manually | Add manually | autofill-errors.test.ts |
| Add to collection | Add to collection | collection-popover.test.ts, journey.test.ts, type-scale.test.ts |
| Add a tag | Add a tag | form-controls.test.ts, journey.test.ts, tags.test.ts, type-scale.test.ts |
| Add artist | Add artist | artist-autofill.test.ts, autofill.test.ts |
| Cancel | Cancel | collections.test.ts, delete.test.ts, preview.test.ts, unsaved.test.ts |
| Clear rating | Clear rating | rating.test.ts |
| Create | Create | collection-popover.test.ts, collections.test.ts, journey.test.ts |
| Delete | Delete | collections.test.ts, delete.test.ts, detail.test.ts, rating.test.ts |
| Delete collection | Delete collection | collections.test.ts |
| Discard | Discard | unsaved.test.ts |
| Discard changes? | Discard changes? | preview.test.ts, unsaved.test.ts |
| Keep editing | Keep editing | unsaved.test.ts |
| Edit | Edit | detail.test.ts |
| New collection | New collection | collection-popover.test.ts, collections.test.ts, journey.test.ts, type-scale.test.ts |
| Remove | Remove | settings.test.ts |
| Remove image | Remove image | entry-image.test.ts |
| Rename | Rename | collections.test.ts, type-scale.test.ts |
| Replace | Replace | settings.test.ts |
| Reset filters | Reset filters | list-filters.test.ts |
| Save | Save | artist-autofill.test.ts, artist-manual.test.ts, autofill.test.ts, collections.test.ts, entry-edit.test.ts, entry-form.test.ts, entry-image.test.ts, journey.test.ts, preview.test.ts, tags.test.ts, unsaved.test.ts |
| Mark as read | Mark as read | progress.test.ts |
| Mark as watched | Mark as watched | journey.test.ts, progress.test.ts |
| Unlink artist | Unlink artist | artist-manual.test.ts |
| Authors | Authors | autofill.test.ts, entry-edit.test.ts |
| Chapters | Chapters | autofill.test.ts, cards.test.ts, journey.test.ts, progress.test.ts |
| Chapters total | Chapters total | autofill.test.ts, entry-edit.test.ts |
| Volumes total | Volumes total | autofill.test.ts |
| Description | Description | preview.test.ts |
| Episodes | Episodes | autofill.test.ts, cards.test.ts, detail.test.ts, journey.test.ts, progress.test.ts, type-scale.test.ts |
| Instagram | Instagram | entry-edit.test.ts, entry-form.test.ts, handles.test.ts |
| TikTok | TikTok | entry-edit.test.ts, entry-form.test.ts, handles.test.ts |
| Website | Website | entry-edit.test.ts, entry-form.test.ts, handles.test.ts |
| Kind | Kind | entry-edit.test.ts |
| Name | Name | collection-popover.test.ts, collections.test.ts, entry-edit.test.ts, entry-form.test.ts, journey.test.ts, preview.test.ts, type-scale.test.ts |
| Note | Note | entry-edit.test.ts, unsaved.test.ts |
| Photo file | Photo file | entry-image.test.ts |
| Preview | Preview | entry-image.test.ts |
| Page URL | Page URL | handles.test.ts, journey.test.ts, preview.test.ts |
| Page preview | Page preview | handles.test.ts, journey.test.ts, preview.test.ts |
| Price | Price | entry-edit.test.ts, entry-form.test.ts |
| Rating | Rating | detail.test.ts, globals.test.ts, journey.test.ts, list-filters.test.ts, progress.test.ts, rating.test.ts, status.test.ts |
| Status | Status | entry-edit.test.ts, entry-form.test.ts, form-controls.test.ts, status.test.ts |
| Tags | Tags | journey.test.ts |
| Title | Title | artist-manual.test.ts, autofill-errors.test.ts, autofill.test.ts, entry-edit.test.ts, entry-form.test.ts, entry-image.test.ts, form-controls.test.ts, list-filters.test.ts, tags.test.ts, unsaved.test.ts |
| Tracks | Tracks | autofill.test.ts, entry-form.test.ts |
| Type | Type | autofill.test.ts, entry-form.test.ts |
| URL | URL | entry-edit.test.ts, entry-form.test.ts, preview.test.ts |
| Year | Year | autofill.test.ts, entry-edit.test.ts, entry-form.test.ts |
| Artist | Artist | artist-manual.test.ts, autofill.test.ts, form-controls.test.ts |
| Brand | Brand | domain-pages.test.ts, entry-edit.test.ts, entry-form.test.ts |
| Piece | Piece | collections.test.ts, domain-pages.test.ts |
| Album | Album | collections.test.ts |
| Albums | Albums | domain-pages.test.ts, lists.test.ts |
| Artists | Artists | domain-pages.test.ts |
| Songs | Songs | domain-pages.test.ts |
| Wardrobe | Wardrobe | domain-pages.test.ts, lists.test.ts |
| Selected tags | Selected tags | form-controls.test.ts, tags.test.ts |
| Tag suggestions | Tag suggestions | tags.test.ts |
| Search results | Search results | artist-autofill.test.ts, autofill.test.ts, journey.test.ts |
| Works | Works | artist-link.test.ts |
| In progress | In progress | cards.test.ts, home.test.ts, journey.test.ts |
| Want to listen | Want to listen | status.test.ts |
| Listened | Listened | journey.test.ts, list-filters.test.ts, rating.test.ts, status.test.ts |
| Watching | Watching | progress.test.ts, status.test.ts |
| Watched | Watched | journey.test.ts, progress.test.ts, status.test.ts |
| Reading | Reading | shelves.test.ts, status.test.ts |
| Read | Read | progress.test.ts, shelves.test.ts, status.test.ts |
| Wishlist | Wishlist | list-filters.test.ts, status.test.ts |
| Owned | Owned | detail.test.ts, journey.test.ts, status.test.ts |
| Dropped | Dropped | shelves.test.ts, status.test.ts |
| No status | No status | artist-autofill.test.ts, status.test.ts |
| Cover could not be downloaded | Cover could not be downloaded | autofill.test.ts |
| Couldn't save — try again | Couldn't save — try again | cards.test.ts, collection-popover.test.ts, status.test.ts |
| Deleted | Deleted | delete.test.ts, transitions.test.ts |
| Saved | Saved | entry-edit.test.ts, transitions.test.ts |
| Enter a valid http or https URL | Enter a valid http or https URL | entry-form.test.ts, preview.test.ts |
| Image is larger than 16 MB | Image is larger than 16 MB | entry-image.test.ts, settings.test.ts |
| Unsupported image type | Unsupported image type | entry-image.test.ts, placeholders.test.ts, settings.test.ts |
| Name is required | Name is required | entry-form.test.ts |
| Title is required | Title is required | entry-edit.test.ts, entry-form.test.ts, unsaved.test.ts |
| No preview found | No preview found | handles.test.ts, journey.test.ts, preview.test.ts |
| Nothing matches | Nothing matches | list-filters.test.ts |
| No photo yet | No photo yet | placeholders.test.ts, settings.test.ts |
| No results | No results | autofill-errors.test.ts |
| Search is unavailable right now | Search is unavailable right now | autofill-errors.test.ts |
| Already in your archive | Already in your archive | autofill.test.ts |
| <Label>: one less / <Label>: one more | same | cards.test.ts, progress.test.ts, helpers.ts |
| <Label> <current> of <total|unknown> (progress value button) | same | helpers.ts, progress.test.ts, cards.test.ts, autofill.test.ts |
| Status: <current label> (status control button) | same | status.test.ts, journey.test.ts, rating.test.ts, detail.test.ts |
| <n> of 10 (rating display name) | <n> of 10 | cards.test.ts |
| Brands & shops | Brands & shops | new (list name; no spec yet) |
| Remove <entry title> (remove-from-collection button) | same | collections.test.ts |
| <collection name> collage (image name) | same | home.test.ts, collections.test.ts |
| Add your first <type> (welcome link) | same | home.test.ts |

Strings fixed at gate 5 and shipped by the redesign (`src/lib/copy.ts`; "N" is the count and reads "1 entry" in the singular, `{status}` and `{domain}` are names):

| string | where |
|---|---|
| Select | list and collection: enter Select mode |
| Done | selection bar: leave Select mode |
| More | selection bar on the phone: the menu with the other actions |
| N selected | selection bar count (polite live region) |
| Set status | selection bar action (lists) |
| Add tag | selection bar action (lists) |
| Remove tag | selection bar action (lists) |
| Status set to {status} for N entries | toast after a bulk status change |
| Tag added to N entries | toast after a bulk tag add |
| Tag removed from N entries | toast after a bulk tag remove |
| Couldn't update N entries — try again | toast when a bulk action fails |
| Move to top | selection bar action (collection) |
| Move to bottom | selection bar action (collection) |
| Move before… | selection bar action (collection) |
| Remove from collection | selection bar action (collection) |
| N entries moved to the top | toast after Move to top |
| N entries moved to the bottom | toast after Move to bottom |
| N entries moved | toast after Move before… |
| N entries removed from this collection | toast after a bulk remove |
| This collection changed in another tab — reloaded | toast after a stale reorder (409) |
| Add to your archive | "+" sheet title on Home, Collections and Settings |
| Add to {domain} | "+" sheet and domain Add menu title inside a domain |
| Brand or shop | the one add item for brand and site |
| Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB. | Settings explanation (replaces the "Hero photos" explanation of 4.9) |
| No entries yet | domain tile with no entries |
| N entries | domain tile and collection count; a shelf's count when it gathers several types, or one type whose plural is its singular (Anime, Manga) |
| N {type} | a sub-type shelf's count in its own noun, `{type}` the lowercase singular for one and plural otherwise ("14 albums", "1 album"); gate 7 |
| {type} · {maker} | the meta line of a card on a shelf mixing types (Home and a domain's In progress), "Album · Frank Ocean"; the type alone without a maker; gate 7 |

## 7. Behavioral `data-*` allow-list

Only attributes that express state with no accessible equivalent. Everything else the e2e suite reads (`data-card`, `data-card-title`, `data-card-chip`, `data-shelf`, `data-shelf-row`, `data-shelf-head`, `data-count`, `data-cover-id`, `data-linked`, `data-status-label`, `data-fill`, `data-active`, `data-coverflow*`, `data-bento-card`, `data-collection-card`, `data-detail-panel`, `data-slot`, `data-tint`, `data-welcome*`, `data-type-chip`, `data-scheme`, `data-accent`, `data-prose`, `data-section-heading`, `data-reveal(ed)`, `data-font`, `data-pane`, `data-pairing`, `data-shot-bottom`, and the retired `data-hero-image`, `data-hero-gradient`, `data-column`, `data-page-header`) is NOT allow-listed: these are hooks on today's markup structure and theming, and they disappear with it. Tests must migrate to roles, labels, names, text or `aria-*` (for example: region names for shelves and settings slots, "Unlink artist" for a linked artist, aria-valuenow for rating, `aria-current` for the current carousel entry, image `src`/`alt` for covers).

| attribute | signals | why no role/label covers it |
|---|---|---|
| `html[data-hydrated]` | The client has hydrated; interactions (menus, forms, queued saves) are now live | A lifecycle fact, not a UI element; nothing in the accessibility tree reflects it, and e2e must not click before it is true |
| `data-world` (on the app root) | Which domain world is active: `music`, `animanga`, `books` or `fashion` (Home, Collections and Settings set none, fingerprint 2.1.0); it selects the world's night and veil | The world is the page's scope, not an element; the navigation's `aria-current` marks sections, not which world a page like Settings or an entry belongs to, and e2e asserts it |
| `data-stage` (on the app root) | `night`: the domain world's night banner (Rue, gate 7, 2026-11-17, direction B), always with `data-world` | A visual stage of the whole page with no element of its own; e2e asserts it on every world screen and its absence on Home |
| `data-backdrop` (on the app root) | The backdrop is in its fallback state, `field` (no hero photo is set for the world, so the page shows a plain colour field) | The absence of a photo has no accessible representation to query; the photo state is read through `data-hero-image` |
| `data-grip` (on a collection row's drag handle) | The handle exists (shown under `(pointer: fine)` only, hidden with a single entry) | The handle is a decorative, `aria-hidden` grip: keyboard and touch reorder through the Move buttons and the row menu, so it has no role or name to query |

## 8. Route coverage check

| Route file under `src/routes` | Contract section |
|---|---|
| `(app)/+page` (`/`) | 4.1 |
| `(app)/[domain]/+page` | 4.2 |
| `(app)/[domain]/[list]/+page` | 4.3 (including `/fashion/magazines`; `bulkStatus` and `bulkTag` in 4.10) |
| `(app)/add/[type]/+page` | 4.4 |
| `(app)/add/[type]/search/+server` | 4.4 (supporting) |
| `(app)/add/[type]/preview/+server` | 4.4 (supporting) |
| `(app)/entries/[id]/+page` | 4.5 |
| `(app)/entries/[id]/edit/+page` | 4.6 |
| `(app)/collections/+page` | 4.7 |
| `(app)/collections/[id]/+page` | 4.8 (Select mode, `removeMany` and `reorder` in 4.10) |
| `(app)/settings/+page` | 4.9 |
| `images/[id]/+server` | 4.10 |
| `healthz/+server` | 4.10 |
| `+layout`, `(app)/+layout` | section 5 |

User-facing page routes: 9 of 9 covered. Endpoint routes: 4 of 4 covered. Coverage: 100%. Excluded by instruction: `/__test/*`, `/__mockups/*`.

## 9. Graph notes

none. The graph (`graphify-out/graph.json`, 2081 nodes before this change) already held every route file, the four endpoint files and the shared components used above; there is no `.graphifyignore` and no node for deleted code. The `$types` nodes are SvelteKit's generated type modules (virtual, not files on disk) and are harmless. The graph was rebuilt after this contract and `PRODUCT.md` were added so both show up in it.

## 10. Gate-1 decisions

Rue answered the former open questions. Type: contract-only = no code change; server/data = code change before the redesign (OpenSpec change `gate-1-decisions`); UI = built in the redesign.

| # | question (short) | decision | type |
|---|---|---|---|
| 1 | Wardrobe "Add": Wishlist or Owned? | Add from Wardrobe creates an Owned piece, so it appears in Wardrobe. Wishlist stays for pieces that are cool to remember. Owned is preselected and the form's status stays editable. | server/data (done in 0.2.0) (`status` prefill on `/add/piece`); the Wardrobe Add link and the form are UI |
| 2 | Initial status on the media create form | The media create form offers an initial status (default No status); a non-none choice stores the first status event. | server/data (done in 0.2.0) (create accepts a status and writes the event); the field is UI |
| 3a | Brands and Shops/Sites: two lists or one | One combined list "Brands & shops" at `/fashion/brands-shops`, filtered by Kind (Brand, Shop, Site). Kind no longer moves an entry between lists. Merge at list level only, the two stored types stay; confirmed by Rue on 2026-11-13 (gate 1 / task 2.5). | server/data (done in 0.2.0) (list config, query, routes) |
| 3b | Old list URLs | `/fashion/brands` and `/fashion/shops` permanently redirect to the combined list (brands adds `kind=brand`). Confirmed by Rue on 2026-11-13 (gate 1 / task 2.5). | server/data (done in 0.2.0) |
| 4a | Artists: keep status and rating | Artists keep status and rating. | contract-only (no code change) |
| 4b | Rating scale | Rating everywhere is a number out of 10 with up to two decimals (0 to 10, 0 allowed and distinct from unrated). Existing star ratings convert to stars times 2 (4.5 stars becomes 9); old `rating=` URLs now mean the 0 to 10 scale. Confirmed by Rue on 2026-11-13 (gate 1 / task 2.5). | server/data (done in 0.2.0) (storage migration, validation, filters); rating control and display are UI |
| 5 | Collection order | Collection entries are manually reorderable; new entries go to the end; existing order kept. | server/data (done in 0.2.0) (order storage and reorder action); the reorder control is UI |
| 6 | Collection descriptions | Also shown on `/collections` (data is already loaded there). | UI |
| 7 | Error page | Keep SvelteKit's default error page; not part of the redesign. | contract-only (no code change) |
| 8 | HEIC uploads | `.heic` / `image/heic` is dropped; the six listed formats remain. | server/data (done in 0.2.0) (client and server validation); the upload copy is unchanged |
