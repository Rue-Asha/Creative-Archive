# Scope: fashion-magazines

Triage: tweak — one new Fashion type (magazine, with migration) plus grouped Fashion sub-tabs, one session. Appetite: one evening.

## Problem
Rue's Fashion world has no place for fashion magazines and blogs that are themselves niche influencers or brands, and its sub-tabs (Brands, Shops, Influencers, Pieces, Wardrobe, Looks) are one flat row although Wardrobe, Pieces and Looks are her own things and the rest is stuff to discover.

## Flows
- Add a magazine: Fashion → Add menu → Magazine → fill form (or paste URL, link preview fills) → save → appears in `/fashion/magazines`.
- Browse: Fashion landing → sub-tab bar shows two labelled groups → tap a tab → `/fashion/<slug>`.

## In scope
- **S1** A new entry type `magazine` (domain fashion, slug `magazines`, plural label `Magazines`, singular `Magazine`) exists. It has the same fields, status behaviour and link-preview (incl. handle prefill from URL) as `influencer`, appears in the Fashion Add menu, on `/fashion/magazines`, in search/collections/home shelves via the generic `TYPES` config.
  - edges: empty list → the generic empty state of domain lists; existing data (all current entries, tags, status events, collection links) survives the migration unchanged; handle prefill from a URL works as for influencers.
- **S2** Migration `0003` rebuilds `entries` so its `type` CHECK allows `magazine`, keeping every row and every foreign-key relation (`entry_tags`, `status_events`, `collection_entries`, …).
  - edges: a database with existing entries of every type migrates without loss; the migration runs once on an already migrated DB (idempotent via the migration ledger); fresh DB gets the same schema.
- **S3** The Fashion sub-tab bar renders two labelled groups in one bar, separated by a divider: "My things" = Wardrobe, Pieces, Looks; "Discover" = Brands, Shops, Influencers, Magazines (the group label is a small caption above or beside its tabs, not a tab).
  - edges: phone 390px → each group wraps within itself, no horizontal page overflow, tap targets stay ≥ 40px; desktop 1280px → both groups sit in one row next to Add, or wrap cleanly; the active tab keeps its current active styling; the nav keeps `aria-label="Sub-types"`, each group is labelled for assistive tech.
- **S3b** Music, Animanga and Books keep their current flat sub-tab bar with no group captions (groups are optional per domain in the config).
  - edges: none (config default = a single unlabelled group).
- **S4** The Fashion Welcome blurb and the specs/tests that list Fashion types or tabs name Magazines and the groups (`domain-pages`, `entries`, `link-preview`, `tracking` specs, the "Sub-type tabs per domain" e2e, unit tests that hardcode the type list).
  - edges: tests hardcoding "11 types" become 12.

## Non-goals
- Grouping or restructuring anything beyond the sub-tab bar (no change to the global PillNav, domain landing layout, home page, list pages) — Rue said only the tabs at the top.
- Group tabs for Music, Animanga, Books — only Fashion has unrelated categories.
- A dedicated `kind` for magazine vs blog (no separate "blog" type or sub-filter) — one `magazine` type covers magazines and blogs.
- Per-tab icons — the bar stays label-only.
- A two-level (group chip → sub-tabs) navigation — rejected for the extra tap.

## Codebase touchpoints
- `migrations/0003_*.sql` — rebuild `entries` with the new CHECK (explorer: category is the `entries.type` CHECK, migrations/0002_core.sql:3; FK tables entry_tags, status_events, collection_entries).
- `src/lib/types.ts:4-15` — `EntryType` union gets `magazine`.
- `src/lib/entries/config.ts` — `TYPES.magazine`, `TYPES_BY_DOMAIN.fashion` (~209), `LISTS.fashion` (219-231) reordered into groups; group metadata added to the list config.
- `src/lib/domains/SubTabs.svelte` — renders groups (labels, divider); shared with all four domains.
- `src/lib/entries/PreviewPanel.svelte:46` — handle prefill `type === 'influencer'` extended to magazine.
- `src/lib/shell/Welcome.svelte:14` — Fashion blurb copy.
- Auto-pickup via `TYPES`: AddMenu, SearchPanel, EntryForm, DetailPanel, EntryCard, derive.ts, save.ts, home.ts, `[domain]/[list]`, `add/[type]`, collections.
- Unit tests that hardcode types: `src/lib/entries/config.test.ts`, `src/lib/server/entries.test.ts`, `save.test.ts`, `schema.test.ts`, `rows.test.ts`.
- e2e: `e2e/domain-pages.test.ts` (Sub-type tabs per domain, Add menu), plus layout/lists/preview/handles files that list fashion types; computed-style e2e for the group captions (design guard: no raw colours, `--t-small` caption size check).
- Specs: `openspec/specs/domain-pages` (tab list, Add menu), `entries` ("All 11 types", create entries), `link-preview` (influencer handle prefill, lines 55/143), `tracking` (no-status types).

## Risks
- R1 Rebuilding `entries` loses FK rows or breaks ordering → accepted: S2 has a scenario that migrates a seeded DB with all types and compares row counts and FK links before/after; the migration is one transaction.
- R2 Group captions overflow on 390px or conflict with the 40px chip height → resolved: S3 edge asks a computed-style/overflow e2e in both projects.
- R3 Group label wording is taste → accepted: "My things" / "Discover" proposed, Rue judges at the gate.

## Decisions
- Magazine mirrors influencer (fields, status, link-preview, handles) — Rue's choice.
- Grouping = two labelled groups in one bar, Fashion only — Rue's choice; UI copy in English, as the app.
- Keep tweak despite the migration — Rue's choice.
- A1 accepted at the gate: `migrate()` in `src/lib/server/db.ts` runs migrations with foreign keys off and checks `foreign_key_check` before commit (otherwise the entries rebuild cascades and deletes child rows).
- Wardrobe stays the pseudo-list (`piece` + status owned); it only moves into the "My things" group.

## Done when
- Fashion → Add → Magazine can create a magazine that shows under `/fashion/magazines` and on the Home Fashion shelf.
- The Fashion tabs show "My things: Wardrobe, Pieces, Looks" and "Discover: Brands, Shops, Influencers, Magazines" on phone and desktop; the other domains look unchanged.
- An existing database migrates without losing entries; `proof:full` is green.

## Split off
- none
