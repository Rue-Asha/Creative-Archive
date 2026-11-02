## Context

`entries.type` is a CHECK in `migrations/0002_core.sql`, so a new type needs a table rebuild. `migrate()` in
`src/lib/server/db.ts` runs every migration inside `BEGIN … COMMIT` on a connection opened with
`PRAGMA foreign_keys = ON`, and that pragma is a no-op inside a transaction. With foreign keys on, `DROP TABLE entries`
runs an implicit `DELETE FROM entries`, which fires `ON DELETE CASCADE` on `entry_tags`, `status_events` and
`collection_entries` and `SET NULL` on `artist_id`. Checked on a scratch database with SQLite 3.54 (node 26): the
rebuild under today's runner keeps every entry but deletes every tag link and nulls every artist link; with foreign
keys off the same SQL keeps all of them, and the child tables' `REFERENCES entries(id)` bind to the rebuilt table.
The sub-tab bar (`SubTabs.svelte`) renders `LISTS[domain]` as glass chips inside the domain hero's actions row, next
to `AddMenu`; it never marks a tab active (the tabs only live on the landing page).

## Goals / Non-Goals

**Goals:** magazine as a full Fashion type, a lossless 0003, grouped Fashion tabs, the other domains unchanged.

**Non-Goals:** see proposal → Non-Goals.

## Decisions

- **Runner runs every migration with foreign keys off** and checks `PRAGMA foreign_key_check` before `COMMIT` (the
  SQLite 12-step table-rebuild procedure). Alternatives: a per-migration opt-in marker (more code for no case that
  needs foreign keys on during a migration); `PRAGMA writable_schema` to edit the CHECK text in place (no rebuild, but
  fragile and blocked under defensive mode). The smaller design is all migrations; the bigger one would have bought
  migrations that rely on cascades firing, of which there are none.
- **0003 is a straight rebuild**: `CREATE TABLE entries_new` (0002's columns in the same order, `type` CHECK plus
  `'magazine'`, status CHECK with `magazine` in the null-status group, `artist_id REFERENCES entries(id)`),
  `INSERT INTO entries_new (<all columns>) SELECT <all columns> FROM entries`, `DROP TABLE entries`,
  `ALTER TABLE entries_new RENAME TO entries`, then the three indexes again. Ids are copied, so every link stays valid.
- **Type order vs tab order.** `TYPES_BY_DOMAIN.fashion` becomes brand, site, influencer, magazine, piece, look: the
  Add menu and the domain shelves keep today's order with Magazine after Influencer (non-goal: no change to the landing
  layout). Only the tab bar uses the grouped order (Wardrobe, Pieces, Looks | Brands, Shops, Influencers, Magazines).
  The Domain shelves requirement now says "type order" instead of "tab order", which it no longer is for Fashion.
  Alternative: reorder `TYPES_BY_DOMAIN` into the groups, which would also reorder the Fashion shelves and Add menu.
- **Groups live in the list config** as `LIST_GROUPS`; `LISTS` stays the flat list every other consumer uses
  (`[list]` route, `typeBySlug`) and is derived from it, so the two cannot drift.
- **Caption beside its tabs, sentence case, `--t-small`**, weight 600, colour `--on-photo` (like the hero eyebrow it
  sits under). Beside rather than above keeps one 40 px row on desktop, so Add stays centred on the tabs without
  touching the domain page's `.actions`; sentence case because the type-scale requirement puts every all-caps label on
  `--t-eyebrow`, and the scope asks for `--t-small`. Alternative for the gate: an all-caps eyebrow caption (11/12 px).
- **Divider by breakpoint**: below 1024 px the groups stack and a horizontal hairline sits between them (a vertical
  rule would dangle at a wrap point); from 1024 px the groups sit in one row with a 1 px vertical rule. Drawn in
  `currentColor` (`--on-photo`) at reduced opacity, as the Eyebrow's dash.
- **Handle prefill** keys on the type having a `handles` field instead of `type === 'influencer'`.
- Fit estimate (13 px chips, 16 px padding): phone 390 — "My things" row ≈ 322 px of 358; "Discover" wraps once
  (Magazines on its second line); the bar grows from ≈ 88 px to ≈ 145 px. Desktop 1280 — both groups plus Add
  ≈ 950 px of the 1200 px column, one row.

## Contracts

```ts
// src/lib/types.ts
export type EntryType = … | 'influencer' | 'magazine' | 'piece' | 'look';

// src/lib/entries/config.ts
TYPES.magazine = { ...plain, type: 'magazine', domain: 'fashion', label: 'Magazine', plural: 'Magazines',
  slug: 'magazines', titleLabel: 'Name', fields: <influencer's handles field>, preview: true };
TYPES_BY_DOMAIN.fashion = ['brand', 'site', 'influencer', 'magazine', 'piece', 'look'];
export interface ListGroup { label: string | null; lists: ListDef[] }
export const LIST_GROUPS: Record<Domain, ListGroup[]>; // music/animanga/books: [{ label: null, lists }]
export const LISTS: Record<Domain, ListDef[]>;           // LIST_GROUPS[d].flatMap((g) => g.lists)

// src/lib/server/db.ts — signature unchanged
export function migrate(db: DatabaseSync, migrations?: Migration[]): void;
// per pending migration: PRAGMA foreign_keys = OFF → BEGIN → sql → foreign_key_check must be empty → record →
// COMMIT; on error ROLLBACK and throw `Migration <name> failed: …`; PRAGMA foreign_keys = ON in every case
```

SubTabs DOM (the e2e hooks): flat domains render the chips as direct children of
`<nav class="tabs" aria-label="Sub-types">`, unchanged. Grouped domains render, in order,
`<div role="group" aria-labelledby="subtabs-<domain>-<i>" data-tab-group>` holding
`<span id="subtabs-<domain>-<i>" data-tab-caption>` and the chips, with `<span data-tab-divider aria-hidden="true">`
between groups. The caption is a `span`, not a heading, so the alignment rule in `e2e/layout.test.ts` (h1/h2 only) is
unaffected.

Test owners: the single unit owns every file in its list, including the existing tests it edits.

## Risks / Trade-offs

- [Rebuild loses links] → foreign keys off plus `foreign_key_check`, proven by a seeded-DB migration test that
  compares every data table and then exercises the cascades on the rebuilt table.
- [Phone hero grows ≈ 57 px] → accepted as the cost of captions; Rue judges at Gate 2 ("Grouped tabs read well").
- [Group wording is taste, R3] → "My things" / "Discover", judged at Gate 2.
- [Static mockups keep the old flat Fashion tabs] → they are design references, not app screens; unchanged.

## Migration Plan

0003 applies itself at server start like 0001/0002, in one transaction; a failure rolls back and stops the server
with the migration named (existing behaviour). Rollback after a successful 0003 means restoring the pre-deploy
database backup; nothing in this change reads or writes the old schema.
