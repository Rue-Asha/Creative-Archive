# Product

<!-- impeccable:product-schema 1 -->

Derived from `docs/functional-contract.md` (the source of truth for behavior). No interview was held: every fact below is taken from the repository, README, OpenSpec specs and e2e tests, and is marked as confirmed-by-repo or open.

## Platform

web

## Users

One person, Rue: the owner and only user. No accounts, sharing or roles. Uses the app on a phone and on a desktop browser, often in short moments: right after discovering something worth keeping, while consuming it (bumping an episode or chapter), or when deciding what to pick next. A self-hosted private tool, not a public product.

## Product Purpose

A private archive for music, anime and manga, books and fashion. It answers four questions: what do I want next, what am I in the middle of, what did I finish, and which brands, shops, influencers, pieces and looks are worth remembering. Success is that adding an item takes seconds, that status and progress stay current with one tap, and that the archive can be browsed back by domain, status, tag, rating and collection without friction or lost work.

## Positioning

One personal archive across consumption domains and fashion references, with a single shared model: any item can be tagged, rated (media), grouped into mixed-type collections, and found again from one place. A neighbouring catalogue or tracker app is either media-only or public and account-based; this one is private, single-user and keeps fashion items (brands, shops, influencers, pieces, looks) next to what is watched, read and listened to.

## Operating Context

- Self-hosted Node server with a local SQLite file; images stored in it as WebP. Run behind a proxy or directly; health check at `/healthz`.
- Online catalogues used while adding, all keyless: Deezer (albums, artists, songs), AniList (anime, manga), Open Library (books). Web pages are read for Open Graph previews of fashion URLs. Any of these can fail or time out; manual entry is always available.
- Instagram and similar pages usually give no preview; upload stays possible.
- Used on phone and desktop viewports; e2e covers both.
- UI language: English.

## Capabilities and Constraints

- Ten item types in four domains: Music (Album, Artist, Song), Animanga (Anime, Manga), Books (Book), Fashion (Brand/Shop/Site as one type with a Kind and one combined list, Influencer, Piece, Look).
- Create by catalogue search and pick (media), by URL preview (fashion), or by hand (all). Edit and delete with confirmation.
- Status: media has none, want, in progress, done, dropped (labels per domain: listen, watch, read), and can be given an initial status when added; pieces have wishlist (cool pieces worth remembering), owned (the Wardrobe), gone. Adding from Wardrobe creates an Owned piece. Status changes keep a dated history.
- Progress: anime episodes, manga chapters and volumes, totals may be unknown ("n / ?"); typed or stepped; reaching the total offers "Mark as watched" / "Mark as read".
- Rating: media only (artists included), a number out of 10 with up to two decimals (e.g. 8.75), clearable; former star ratings were converted by doubling.
- Tags: free, global, case- and accent-insensitive dedupe. Collections: named, mixed types, no duplicates, entries manually reorderable (new ones go last); descriptions show on the collections index too.
- Artists link to albums and songs; an artist page lists its works.
- Lists per type with status, kind, tag and minimum-rating filters, sorting, and a status-grouped view; the state lives in the URL. Brands and shops are one list filtered by Kind; the old Brands and Shops URLs redirect to it.
- Images: jpeg, png, webp, gif, avif, heif up to 16 MB (no HEIC), converted to WebP; placeholder with title initials when absent. One hero photo per world (Home and each domain), configured in Settings.
- Writes are optimistic with a background queue; failures revert and show "Couldn't save — try again". Unsaved form changes prompt "Discard changes?".
- Constraints: single user, no authentication, no pagination, English copy, accessibility-first interaction (see below). Server fetches of user URLs are restricted to public http(s) hosts.
- Terminology: entry, domain, list, shelf (a named group of entries with a count and a link to the full set), collection, hero photo, status, progress, world (Home or a domain, as the scope that decides which navigation section is current).
- Decided at gate 1 (see the contract's Gate-1 decisions): initial status at creation, Wardrobe add creates Owned, one combined Brands & shops list, artists keep status and rating, ratings out of 10, reorderable collections, descriptions on the collections index, SvelteKit's default error page kept, no HEIC. Nothing is left undecided.

## Brand Commitments

Name: Creative Archive. Copy is English only. Title pattern `<Page> · Creative Archive`. No logo or voice rules are confirmed beyond the name; visual direction comes from the shared design system later.

## Evidence on Hand

- `README.md`, `openspec/specs/*` (behavior), `e2e/*` (executable behavior), `docs/functional-contract.md` (consolidated contract), `fixtures/mockups` (CC0 photos for tests).
- No testimonials, customers, benchmarks, pricing or analytics exist; do not invent any.

## Product Principles

1. Capture first: adding an item must be quick, and a failed catalogue or preview never blocks adding by hand.
2. Keep state honest: status, progress and rating show their change at once and tell the truth when a save fails.
3. Never lose work: confirm destructive actions, guard unsaved forms, keep entries when collections go.
4. One model for all domains: shared behavior (tags, collections, images) everywhere, with per-domain differences only where the data demands them (progress, status labels, fashion without rating).
5. Text is untrusted length: long titles, any script and missing images must always render sensibly.

## Accessibility & Inclusion

Interaction must stay operable by keyboard and by touch: roles and accessible names for status, rating (slider or spin button), progress (group and buttons), menus, dialogs, toolbar, combobox and carousel; focus managed in dialogs and on the first invalid field; status and errors announced; targets at least 44 px on phone; no horizontal page scroll on phone; reduced-motion respected. No formal standard has been stated; treat WCAG 2.2 AA as the working target (open).
