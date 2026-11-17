# Explore notes: redesign (gate 3), running log

Decisions from the explore dialogue with Rue, recorded as they are made. scope.md is written from this.

## Usage (Rue, 2026-11-14)
- Phone: quick capture (add an album, anime, book, piece… on the go) and looking things up (ratings, lists, collections).
- Desktop: curating (collections, lists, photos, upkeep) and browsing through domains and entries.
- Main entry: Home (in progress + recently added is the start; domains are secondary).
- Biggest pain apart from the look: collections and lists, specifically ordering/upkeep inside a collection is tedious.

## Decisions (Rue, 2026-11-14)
- No global search in this redesign: per-list filters are enough.
- Keep the per-domain colour worlds (`data-world`), inside the fingerprint's frame.

## Explorer findings
- Contract (on flow/gate-1-decisions, not yet on main; lands with 0.2.0): 15 jobs (J1–J15), routes /, /[domain], /[domain]/[list], /add/[type], /entries/[id](/edit), /collections(/[id]), /settings.
- Nav today: ≥1024 fixed top bar (brand "ca", pill nav Home · Music · Animanga · Books · Fashion · Collections, Settings icon); <1024 floating bottom tab bar, Settings as a top-right icon that scrolls away.
- UI the redesign owes from gate-1-decisions: 0..10 rating control (spin button), initial-status field on the media add form, Wardrobe Add link (/add/piece?status=owned), Kind filter wording, collection reorder control, collection descriptions on /collections, one merged "Brand or shop" Add item; remove the thin adapters (stars = value/2, combined tabs).
- Allow-listed data-*: data-column, data-page-header, html[data-hydrated], data-hero-image, data-hero-gradient.
- Open: magazine is missing from the contract's valid list pairs and add types (§4.3/§4.4).

## Round 2 (Rue, 2026-11-14)
- Collection ordering: drag on desktop (with a keyboard alternative, contract requires non-drag reorder) and multi-select (add, move, remove several entries at once).
- Phone nav like Notes: pills for Home + domains, a round "+" for quick capture; Collections and Settings reached via Home.

## Round 3 (Rue, 2026-11-14)
- Home shows first: domain tiles (way into Music/Animanga/Books/Fashion), In progress, Recently added.
- Multi-select wanted: inside a collection (move/remove several) and in lists (set status or tags on several entries).

## Round 4 (Rue, 2026-11-14)
- Bulk actions go INTO the redesign: Rue relaxes the "server/load/actions/migrations untouched" rule (ecosystem task 11.1) for Creative; small bulk endpoints (status, tags on several list entries; move/remove several in a collection) get their own server unit.
- Phone round "+" is context-dependent: inside a domain it offers that domain's types, on Home all types.

## Round 5 (Rue, 2026-11-14)
- Phone: Collections are a section on Home with "All collections"; Settings is an icon in the Home header.

## Round 6 (Rue, 2026-11-14)
- Magazines become a full type: their own list and /add/magazine like every other Fashion type (contract §4.3/§4.4 updated).
- Rating on the phone: type the number (numeric keypad, e.g. 8.75) plus +/– steps.
- Appetite: like Notes, several sessions in phases (gate 4 wireframes, gate 5 hi-fi, then the build in waves).
