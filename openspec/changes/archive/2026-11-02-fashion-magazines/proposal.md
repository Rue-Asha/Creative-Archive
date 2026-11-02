## Why

Rue's Fashion world has no place for fashion magazines and blogs that are themselves niche influencers or brands, and
its sub-tabs (Brands, Shops, Influencers, Pieces, Wardrobe, Looks) are one flat row although Wardrobe, Pieces and Looks
are her own things and the rest is stuff to discover.

Appetite: one evening. Exceeding it means renegotiating scope.

## What Changes

- New entry type `magazine` (Fashion, list `/fashion/magazines`, labels Magazine / Magazines) that mirrors
  `influencer`: name + handles, no status, rating or progress, URL preview with handle prefill. It shows in the Fashion
  Add menu (after Influencer), on its list, on the Fashion domain shelves (after Influencers), on the Home Fashion shelf
  and in collections through the generic `TYPES` config (S1).
- Migration `0003` rebuilds `entries` so its `type` CHECK (and the no-status CHECK) allows `magazine`, keeping every
  row, every index and every foreign-key relation. The migration runner runs each migration with foreign keys off and
  refuses to commit one that leaves a `foreign_key_check` violation, because a rebuild with foreign keys on cascades
  the drop of `entries` into `entry_tags`, `status_events` and `collection_entries` (S2).
- The Fashion sub-tab bar renders two labelled groups in one bar with a divider: "My things" = Wardrobe, Pieces,
  Looks; "Discover" = Brands, Shops, Influencers, Magazines. Each caption sits beside its tabs, is not a tab, and names
  its group for assistive tech (S3).
- Music, Animanga and Books keep their flat sub-tab bar: groups are optional per domain in the list config, the
  default is one unlabelled group (S3b).
- The Fashion welcome line, the specs and the tests that list Fashion types or tabs name Magazines and the groups;
  tests hardcoding 11 types expect 12 (S4).
- Release 0.1.2 (patch, tweak track).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `entries`: 12 types in the type config; the magazine type and where it appears (S1, S4).
- `harness`: migrations run with foreign keys off plus a foreign-key check; migration 0003 widens the `entries` type
  CHECK without loss (S2).
- `domain-pages`: Fashion tabs in two labelled groups, the other domains flat; the Add menu and shelves include
  Magazine; shelves follow the domain's type order (S1, S3, S3b, S4).
- `link-preview`: Open Graph preview and handle prefill cover magazines (S1, S4).
- `tracking`: magazines have no status (S1, S4).
- `release`: version 0.1.2.

## Non-Goals

- Grouping or restructuring anything beyond the sub-tab bar (no change to the global PillNav, domain landing layout,
  home page, list pages) — Rue said only the tabs at the top.
- Group tabs for Music, Animanga, Books — only Fashion has unrelated categories.
- A dedicated `kind` for magazine vs blog (no separate "blog" type or sub-filter) — one `magazine` type covers
  magazines and blogs.
- Per-tab icons — the bar stays label-only.
- A two-level (group chip → sub-tabs) navigation — rejected for the extra tap.

## Decisions

- Magazine mirrors influencer (fields, status, link-preview, handles) — Rue's choice.
- Grouping = two labelled groups in one bar, Fashion only — Rue's choice; UI copy in English, as the app.
- Keep tweak despite the migration — Rue's choice.
- Wardrobe stays the pseudo-list (`piece` + status owned); it only moves into the "My things" group.

## Done criteria

- [ ] Fashion → Add → Magazine can create a magazine that shows under `/fashion/magazines` and on the Home Fashion shelf.
- [ ] The Fashion tabs show "My things: Wardrobe, Pieces, Looks" and "Discover: Brands, Shops, Influencers, Magazines"
      on phone and desktop; the other domains look unchanged.
- [ ] An existing database migrates without losing entries, tags, status events, collection links or artist links.
- [ ] `package.json` and `package-lock.json` carry 0.1.2.
- [ ] `npm run proof:full` is green.

## Impact

- Schema: new `migrations/0003_magazine.sql`; `src/lib/server/db.ts` (runner: foreign keys off per migration,
  `foreign_key_check` before commit).
- Types and config: `src/lib/types.ts`, `src/lib/entries/config.ts` (`TYPES.magazine`, `TYPES_BY_DOMAIN.fashion`,
  `LIST_GROUPS`, `LISTS` derived from it).
- UI: `src/lib/domains/SubTabs.svelte`, `src/lib/entries/PreviewPanel.svelte` (handle prefill),
  `src/lib/home/Welcome.svelte` (Fashion line). AddMenu, EntryForm, DetailPanel, EntryCard, list, add and collection
  routes pick the type up from `TYPES` unchanged.
- Tests: `config.test.ts`, `entries.test.ts`, `schema.test.ts`, `db.test.ts`, `tracking.test.ts`, `home.test.ts`,
  `collections.test.ts`, new `migrate-0003.test.ts`; e2e `domain-pages`, `detail`, `handles`, new `magazines` and
  `subtabs`; `scripts/version.test.ts`.
- Release: `package.json`, `package-lock.json`.
- No new dependency, route shape or API change. The static mockups (`src/lib/mockups/fixtures.ts`) keep their old tab
  list.
