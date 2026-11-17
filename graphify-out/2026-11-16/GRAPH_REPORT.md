# Graph Report - redesign  (2026-11-16)

## Corpus Check
- 610 files · ~346,659 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .css 9, .woff2 6, (none) 2)

## Summary
- 4256 nodes · 8540 edges · 218 communities (199 shown, 19 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 501 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3e40940`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Polish Audit Findings
- vitest
- svelte
- [list]/+page.svelte
- Worlds and App Layout
- [type]/+page.svelte
- reset
- save.ts
- Button.svelte
- images.ts
- E2E Artist and Domain Tests
- wire/add/states/+page.svelte
- config.ts
- parts/EntryCard.svelte
- hifi/shell/Shelf.svelte
- Design Tokens Module
- hifi/shell/data.ts
- Requirement: Rating
- dataFor
- Package Dependencies
- collections.ts
- Contracts
- FormCard.svelte
- Synthetic Mockup Images
- open
- Playwright Config and Packaging Tests
- Scope: fashion-magazines
- select/TagPicker.svelte
- parts/EntryMain.svelte
- redesign/tasks.md
- list/data.ts
- migrate
- E2E Artist Manual and Delete
- settings.test.ts
- E2E Autofill Tests
- Scope: build-creative-archive (Gate 0)
- Shared UI Components Spec (archived)
- Add To Collection Popover
- entry/EntryMain.svelte
- (app)/+layout.svelte
- PreviewPanel.svelte
- parts/ListBody.svelte
- errors.ts
- release Specification
- RowMenu.svelte
- Requirement: Grouped sub-type tabs
- E2E Journey Test
- Design: build-creative-archive
- Motion Guard Tests
- Link Preview Server
- Requirement: Select mode in a list
- ref_app
- home.ts
- Verification round 3b (verified-at 6ace36b)
- entry-edit.test.ts
- Split-Off Changes and Non-Goals
- Domain and Home Page Specs
- Release Spec
- hifi/collection/CollectionBody.svelte
- Entries Spec
- collections/[id]/+page.svelte
- settings/states/+page.svelte
- TagInput.svelte
- E2E Back Morph Test
- EntryForm.svelte
- Build Design Patterns
- redesign/fixtures.ts
- Gate-1 decisions table
- wire/entry/overlays/+page.svelte
- Domain Lists Spec
- Tasks: build-creative-archive
- E2E Coverflow Test
- Dependabot Config
- hifi/overlays/Icon.svelte
- Requirement: Domain list pages
- Requirement: Image storage
- Requirement: Collection order
- [type]/+page.svelte
- ReorderList.svelte
- Deezer Provider Tests
- E2E Harness Learnings
- FormFields.svelte
- Requirement: Home page
- Requirement: Bulk list actions
- Data Model and Contracts
- World Pick and Type Pairings
- collection-select.test.ts
- CI and Release Pipeline Spec
- RatingField.svelte
- Requirement: Domain list pages
- preview.ts
- Autofill Provider Design
- Build Change Flow State
- Autofill Fallback and Image Errors
- Tokens, Fonts and Contrast
- UI Polish Flow State
- Bricolage Grotesque + Figtree font preloads
- entries Specification
- Requirement: Main navigation
- Requirement: Collections pages and the add popover
- E2E Rating Test
- Release Artifact Download
- TypeScript Config
- E2E List Filters Test
- Release Workflow Trigger
- Mockup Routes and Alignment Spec
- Requirement: Entry detail
- 2026-11-02-fashion-magazines/proposal.md
- E2E Design and Preview Tests
- E2E Reveal Test
- Requirement: Media status with dated events
- Release Check-Tag Job
- Frame.svelte
- toast.svelte.ts
- Mockup Credits Test
- Requirement: Domain list pages
- Design fingerprint: reference
- Release Publish Job
- Harness Declaration Spec
- Banned patterns
- Floating Pill Navigation
- Health Check Route
- Requirement: Select mode in a collection
- Copy Contract
- Health Route Spec
- App Type Declarations
- Artist on Manual Entry
- Entry Detail Requirement
- Unsaved Changes Guard
- Requirement: Entry detail
- Requirement: Unsaved-changes guard
- WireFrame.svelte
- 2026-11-02-fashion-magazines/flow.yaml
- a11y-floor.test.ts
- wire/list/states/+page.svelte
- Requirement: Version 0.1.2
- wire/collection/CollectionBody.svelte
- 2026-11-02-fashion-magazines/design.md
- @playwright/test
- Requirement: Magazine type
- lib/select/SelectionBar.svelte
- 2026-11-02-fashion-magazines/verification.md
- wire/home/HomeBody.svelte
- lib/types.ts
- entries/[id]/+page.svelte
- hifi/overlays/+page.svelte
- hifi/select/SelectionBar.svelte
- ADDED Requirements
- cards.test.ts
- Requirement: Domain list pages
- Requirement: Grouped sub-type tabs
- redesign/verification.md
- check-slop.mjs
- wire/shell/data.ts
- wire/settings/+page.svelte
- Design System: Design fingerprint
- Requirement: Micro-interactions
- hifi/overlays/toasts/+page.svelte
- Requirement: Provider interface and parsers
- wire/domain/data.ts
- MODIFIED Requirements
- Scope: redesign
- wire/overlays/+page.svelte
- entries/ImageField.svelte
- wire/domain/AddMenu.svelte
- Requirement: Collections pages and the add popover
- Requirement: Home page
- apply
- list-filters.test.ts
- wire/domain/+page.svelte
- Requirement: Domain landing pages
- icon/+page.svelte
- wire/collections/CollectionsBody.svelte
- dialogs.test.ts
- Requirement: Brand and shop kinds
- redesign/design.md
- Requirement: Settings page
- Requirement: Rating
- Explore notes: redesign (gate 3), running log
- redesign/proposal.md
- package.mjs
- ArtistField.svelte
- wire/home/+page.svelte
- wire/overlays/Icon.svelte
- 2026-11-15-gate-1-decisions/proposal.md
- Requirement: Image in the entry form
- Requirement: App icon
- 2026-11-15-gate-1-decisions/flow.yaml
- Verification (round 3)
- reorder
- redesign-shots.test.ts
- DetailPanel.svelte
- Requirement: Proof commands
- Requirement: Mockup photos
- Requirement: Version 0.2.0
- Redesign references — Creative Archive
- Requirement: Version 0.3.0
- list-select.test.ts
- wire/select/states/+page.svelte
- input
- Btn.svelte
- overlays/copy.ts
- collection-reorder.test.ts
- ADDED Requirements
- Requirement: Accessibility floor
- Requirement: Redesign mockups
- layout Specification
- parts/Icon.svelte
- CREATIVE_ARCHIVE_TEST flag
- REMOVED Requirements
- Requirement: Shared dialogs, menus, selection bar and toasts
- Panel.svelte
- Requirement: Contract states and English copy

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 90 edges
2. `open()` - 69 edges
3. `vitest` - 65 edges
4. `MockData` - 62 edges
5. `@playwright/test` - 62 edges
6. `reset()` - 59 edges
7. `calm()` - 58 edges
8. `seed()` - 56 edges
9. `svelte` - 55 edges
10. `TYPES` - 32 edges

## Surprising Connections (you probably didn't know these)
- `Contracts` --references--> `ids()`  [INFERRED]
  openspec/changes/redesign/design.md → src/lib/select/selection.test.ts
- `Scenario: A move's toast waits for its save` --references--> `reorder()`  [INFERRED]
  openspec/changes/redesign/specs/collections/spec.md → src/routes/(app)/collections/[id]/+page.svelte
- `Scenario: Move several to the top keeps their order` --references--> `reorder()`  [INFERRED]
  openspec/changes/redesign/specs/collections/spec.md → src/routes/(app)/collections/[id]/+page.svelte
- `Scenario: Reorder action saves the order` --references--> `reorder()`  [INFERRED]
  openspec/changes/redesign/specs/collections/spec.md → src/routes/(app)/collections/[id]/+page.svelte
- `Scenario: Reorder action tells a stale order from a malformed one` --references--> `reorder()`  [INFERRED]
  openspec/changes/redesign/specs/collections/spec.md → src/routes/(app)/collections/[id]/+page.svelte

## Import Cycles
- 2-file cycle: `src/lib/server/images.ts -> src/lib/server/remote.ts -> src/lib/server/images.ts`

## Hyperedges (group relationships)
- **Autofill providers implementing the Provider interface** — openspec_specs_autofill_spec_provider, openspec_specs_autofill_spec_deezer_provider, openspec_specs_autofill_spec_anilist_provider, openspec_specs_autofill_spec_open_library_provider [EXTRACTED 1.00]
- **CI to release flow: tarball built once in CI, published by release, pinned in homelab** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_ci_yml, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_release_tarball, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_release_yml, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_bump_pin, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_homelab_managment [EXTRACTED 1.00]
- **Test-mode isolation: flag gates fake provider, fake remote, test routes and mockups** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_creative_archive_test_flag, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_providerfor_getremote, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_test_routes, openspec_changes_archive_2026_11_01_build_creative_archive_specs_design_system_spec_mockup_routes, openspec_changes_archive_2026_11_01_build_creative_archive_specs_autofill_spec_provider_interface [EXTRACTED 1.00]
- **Release pipeline: build once, tag, publish, bump Homelab** — claude_package_tarball, docs_release_ci_workflow, docs_release_release_workflow, docs_release_homelab_managment, docs_release_creative_archive_deploy [EXTRACTED 1.00]
- **Safe remote fetch flow (SSRF guard, preview, providers, fake remote)** — openspec_changes_archive_2026_11_01_build_creative_archive_design_ssrf_guard, openspec_changes_archive_2026_11_01_build_creative_archive_design_url_preview, openspec_changes_archive_2026_11_01_build_creative_archive_design_provider_interface, openspec_changes_archive_2026_11_01_build_creative_archive_design_fake_remote, openspec_changes_archive_2026_11_01_build_creative_archive_design_test_mode_seams [EXTRACTED 1.00]
- **Image pipeline: safeFetch download, sharp WebP conversion, SQLite BLOB, /images route** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_link_preview_spec_safefetch, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_storeimage, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_webp_sqlite_blob, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_images_route, openspec_changes_archive_2026_11_01_build_creative_archive_specs_settings_spec_sethero_removehero [INFERRED 0.85]
- **Smooth fades and glows via eased alpha mask tokens** — openspec_changes_archive_2026_11_02_ui_polish_design_fade_down_token, openspec_changes_archive_2026_11_02_ui_polish_design_glow_mask_token, openspec_changes_archive_2026_11_02_ui_polish_design_fades_are_alpha_masks, openspec_changes_archive_2026_11_02_ui_polish_design_glow_from_one_cover, openspec_changes_archive_2026_11_02_ui_polish_design_ambient_fixed_layer, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_smooth_fades_glows, openspec_changes_archive_2026_11_02_ui_polish_audit_hero_fade_crease, openspec_changes_archive_2026_11_02_ui_polish_audit_patchy_glows [INFERRED 0.85]
- **Static style guards (colour and font-size bans) with migrations** — openspec_changes_archive_2026_11_02_ui_polish_design_style_rules_test, openspec_changes_archive_2026_11_02_ui_polish_design_motion_test_guard, openspec_changes_archive_2026_11_02_ui_polish_design_guards_land_with_migrations, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_tokens_and_worlds, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_type_scale, openspec_changes_archive_2026_11_02_ui_polish_tasks_u1, openspec_changes_archive_2026_11_02_ui_polish_tasks_u7 [INFERRED 0.85]
- **Optimistic status/rating/progress saves with toast-on-failure** — openspec_specs_tracking_spec_setstatus, openspec_specs_tracking_spec_setrating, openspec_specs_tracking_spec_progress_functions, openspec_specs_tracking_spec_save_queue, openspec_specs_motion_spec_toast [INFERRED 0.85]
- **User-supplied URL downloads through safeFetch into WebP image storage** — openspec_specs_link_preview_spec_safefetch, openspec_specs_images_spec_storeimagefromurl, openspec_specs_images_spec_storeimage, openspec_specs_autofill_spec_search_pick_and_prefill, openspec_specs_link_preview_spec_open_graph_preview [INFERRED 0.85]
- **Test-mode infrastructure (flag, routes, fixtures, e2e)** — claude_test_mode_routes, readme_mockups_design_checkpoint, fixtures_mockups_credits_mockup_photos, claude_playwright_e2e_setup [INFERRED 0.85]
- **World theming: S5 checkpoint, mockups, world pick, tokens** — openspec_changes_archive_2026_11_01_build_creative_archive_scope_design_checkpoint_s5, openspec_changes_archive_2026_11_01_build_creative_archive_tasks_taste_stop, openspec_changes_archive_2026_11_01_build_creative_archive_design_world_pick, openspec_changes_archive_2026_11_01_build_creative_archive_design_worlds, openspec_changes_archive_2026_11_01_build_creative_archive_design_liquid_glass, openspec_changes_archive_2026_11_01_build_creative_archive_design_type_pairings [INFERRED 0.85]
- **Card-detail morph fix (forward shape, back landing, reveal hold)** — openspec_changes_archive_2026_11_02_ui_polish_scope_s3, openspec_changes_archive_2026_11_02_ui_polish_scope_s4, openspec_changes_archive_2026_11_02_ui_polish_design_morph_shape_via_pseudo_elements, openspec_changes_archive_2026_11_02_ui_polish_design_forward_morph_unhover, openspec_changes_archive_2026_11_02_ui_polish_design_back_morph_module_memory, openspec_changes_archive_2026_11_02_ui_polish_design_reveal_restoring_flag, openspec_changes_archive_2026_11_02_ui_polish_specs_motion_spec_page_transitions, openspec_changes_archive_2026_11_02_ui_polish_specs_motion_spec_data_morph_fade, openspec_changes_archive_2026_11_02_ui_polish_tasks_u3 [INFERRED 0.95]
- **OpenSpec change artifacts for build-creative-archive** — openspec_changes_archive_2026_11_01_build_creative_archive_explore_notes_explore_notes_doc, openspec_changes_archive_2026_11_01_build_creative_archive_scope_scope_doc, openspec_changes_archive_2026_11_01_build_creative_archive_proposal_proposal_doc, openspec_changes_archive_2026_11_01_build_creative_archive_design_design_doc, openspec_changes_archive_2026_11_01_build_creative_archive_tasks_tasks_doc, openspec_changes_archive_2026_11_01_build_creative_archive_verification_verification_doc [INFERRED 0.95]

## Communities (218 total, 19 thin omitted)

### Community 0 - "UI Polish Audit Findings"
Cohesion: 0.05
Nodes (99): Finding 18: ambient background-attachment fixed repaints/ignored on iOS, Finding 1: back morph lands on hidden unrevealed card, Card-detail View Transition analysis (wrong shelf copy, aspect stretch), Finding 12: detail cover 300px on phone pushes title below fold, Finding 11: bento features empty first collection, Finding 16: global :focus-visible forces pill radius, Finding 3: forward morph starts from hovered/tilted card, Finding 5: hero fades end with a visible crease (2-stop masks) (+91 more)

### Community 1 - "vitest"
Cohesion: 0.07
Nodes (24): 1. Fashion magazines and grouped tabs, sharp, vitest, contract, product, root, { version }, entry (+16 more)

### Community 2 - "svelte"
Cohesion: 0.06
Nodes (27): svelte, Props, { title, body, heading = 'h2', action }, ariaCurrent, Props, selectable, { title, meta, value, href, onclick, current = false, selected, leading, action }, describedby (+19 more)

### Community 3 - "[list]/+page.svelte"
Cohesion: 0.05
Nodes (38): {
		config,
		state,
		tags,
		fixedStatus = false,
		onchange,
		addHref = null,
		selecting = false,
		onselect
	}, isSite, kinds, pill(), ratingOptions, ratings, sorts, statuses (+30 more)

### Community 4 - "Worlds and App Layout"
Cohesion: 0.06
Nodes (38): dependencies, sharp@^0.35.5, devDependencies, @playwright/test@^1.64.0, svelte@^5.57.2, svelte-check@^4.7.6, @sveltejs/adapter-node@^6.0.0, @sveltejs/kit@^3.0.1 (+30 more)

### Community 5 - "[type]/+page.svelte"
Cohesion: 0.07
Nodes (28): Settings route contract (/settings), COPY, MARK_DONE, STATUS_LABELS, contract, copyList, gate5, deleting (+20 more)

### Community 6 - "reset"
Cohesion: 0.13
Nodes (13): seedChrome(), cards(), cardTitles(), openSection(), plus(), posture(), reset(), seed() (+5 more)

### Community 7 - "save.ts"
Cohesion: 0.13
Nodes (25): Decisions, Scenario: Create an entry of each type, Scenario: Create and update accept the full rating range, 3. Initial status on create, Scenario: Create and update accept the full rating range, artistToEnsure(), entryInputFromForm(), HANDLES (+17 more)

### Community 8 - "Button.svelte"
Cohesion: 0.10
Nodes (16): Collections index route contract (/collections), descriptionValue, { heading, note, action, submit, name = '', description = '', error, oncancel, onsaved }, id, nameValue, Props, dark, inert (+8 more)

### Community 9 - "images.ts"
Cohesion: 0.10
Nodes (29): Requirement: Image storage, Scenario: Each listed format is accepted, Scenario: HEIC is rejected by the server, Scenario: Image from a URL is stored, Scenario: Image is served with caching headers, Scenario: Image over 16 MB is rejected by the server, Scenario: Unsupported file is rejected by the server, Scenario: Uploaded image is stored as WebP (+21 more)

### Community 10 - "E2E Artist and Domain Tests"
Cohesion: 0.10
Nodes (26): @sveltejs/kit, dataTables(), resetDb(), snapshot(), requireTestFlag(), SeedInput, SeedResult, testImageNamed() (+18 more)

### Community 11 - "wire/add/states/+page.svelte"
Cohesion: 0.11
Nodes (15): fx, long, artist, bare, fx, magazine, { domain, list, word, lede }, Props (+7 more)

### Community 12 - "config.ts"
Cohesion: 0.06
Nodes (40): { domain }, id, open, Domain, DOMAIN_LABEL, DOMAINS, { domain }, groups (+32 more)

### Community 13 - "parts/EntryCard.svelte"
Cohesion: 0.14
Nodes (14): line, { noun, mode = 'results', query = '', results = [], tone = 'square' }, Props, Result, { title, cover, tone = 'square', big = false }, entryHref, initials(), Tone (+6 more)

### Community 14 - "hifi/shell/Shelf.svelte"
Cohesion: 0.10
Nodes (13): NOUN, Props, singular, { view, settle = false }, data, oneEmpty, worst, atEnd (+5 more)

### Community 15 - "Design Tokens Module"
Cohesion: 0.13
Nodes (18): DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress(), parseIPv4(), parseIPv6(), quad(), readBody(), REDIRECTS (+10 more)

### Community 16 - "hifi/shell/data.ts"
Cohesion: 0.04
Nodes (69): COVERS, id, line, { noun, type = 'album', mode = 'results', query = '', results = [], worst = false, ratio = '1 / 1' }, Props, Result, close(), create() (+61 more)

### Community 17 - "Requirement: Rating"
Cohesion: 0.12
Nodes (15): MODIFIED Requirements, Requirement: Rating, Scenario: Clear the rating, Scenario: Clearing keeps 0 distinct from unrated, Scenario: Migration converts star ratings, Scenario: No star adapter is left, Scenario: Rated entries show their rating on cards, Scenario: Rating accepts 0 to 10 with two decimals (+7 more)

### Community 18 - "dataFor"
Cohesion: 0.09
Nodes (22): fx, fx, results, fx, entry, fx, entry, fx (+14 more)

### Community 19 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): labelSet(), statusLabel(), chip, chipState, current, enqueue, {
		entry,
		shape,
		level = 3,
		selectable
	}, key (+20 more)

### Community 20 - "collections.ts"
Cohesion: 0.07
Nodes (68): What Changes, Requirement: Collection order, Requirement: Collection store, Scenario: A migrated database matches a fresh one at head, Scenario: Collage uses the first three images in collection order, Scenario: Collection requires a name, Scenario: Deleting a collection keeps its entries, Scenario: Migration preserves the existing order (+60 more)

### Community 21 - "Contracts"
Cohesion: 0.08
Nodes (13): Creative Archive, Design fingerprint, Harness, Learnings, Specs, csrf, countSaves(), recordSaves() (+5 more)

### Community 22 - "FormCard.svelte"
Cohesion: 0.04
Nodes (64): Domain, info, { kind, last, lastHref, worst = false, head, word, lede, lang }, Props, asType(), FormKind, LONG, MEDIA (+56 more)

### Community 23 - "Synthetic Mockup Images"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 24 - "open"
Cohesion: 0.09
Nodes (13): addByPick(), addManually(), offersManual(), searchbox(), pick(), results(), searchbox(), counts() (+5 more)

### Community 25 - "Playwright Config and Packaging Tests"
Cohesion: 0.11
Nodes (23): Books Hero Mockup Photo, Books Domain Hero Image, Vintage Books on Wooden Shelf (warm tone), Cover Ember Mockup Image, Square cover-art placeholder (1000x1000), Ember gradient: dark brown to orange with warm yellow bloom (grain), Cover Moss Mockup Image, Square cover-art placeholder (1000x1000) (+15 more)

### Community 26 - "Scope: fashion-magazines"
Cohesion: 0.18
Nodes (10): Codebase touchpoints, Decisions, Done when, Flows, In scope, Non-goals, Problem, Risks (+2 more)

### Community 27 - "select/TagPicker.svelte"
Cohesion: 0.13
Nodes (12): closing, { open = $bindable(false), title, kicker, mode = 'sheet', alert = false, closeLabel = 'Close', onclose, children, actions }, Props, uid, exact, pick(), Props, query (+4 more)

### Community 28 - "parts/EntryMain.svelte"
Cohesion: 0.07
Nodes (38): PieceStatus, Status, brandKinds, dirOf(), EntryInfo, entryInfo, EntryKey, fmtRating() (+30 more)

### Community 29 - "redesign/tasks.md"
Cohesion: 0.11
Nodes (18): 10. Gate 5 hi-fi: list and Select, add, entry, edit, 11. Gate 5 hi-fi: collections, collection, dialogs and toasts, 12. ⛔ Gate 5 review and sign-off (human stop), 13. ⛔ Build preconditions (human stop, orchestrator), 16. Dialogs, menus, selection bar and toasts, 18. Home, 19. Domain pages and Settings, 1. Vendor fingerprint 1.0.0, slop baseline and the redesign mockup scaffold (+10 more)

### Community 30 - "list/data.ts"
Cohesion: 0.04
Nodes (66): data, list, asList(), COVERS, domainName(), ListDef, listEntries(), ListEntry (+58 more)

### Community 31 - "migrate"
Cohesion: 0.12
Nodes (15): ADDED Requirements, MODIFIED Requirements, Requirement: Database and migrations, Requirement: Entries table accepts magazines, Scenario: Database accepts a magazine only without a status, Scenario: Existing database migrates without loss, Scenario: Failing migration stops the server, Scenario: Foreign keys are on after migrating (+7 more)

### Community 32 - "E2E Artist Manual and Delete"
Cohesion: 0.08
Nodes (43): progress(), main(), anime(), 1. Rating 0 to 10, 5. Combined brands-and-shops list, 6. Release, proof and docs, Planning decisions (planner, 2026-11-15), 17. Cards, shelves, progress and collages (+35 more)

### Community 33 - "settings.test.ts"
Cohesion: 0.13
Nodes (4): photo(), paste(), urlField(), upload()

### Community 34 - "E2E Autofill Tests"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 36 - "Shared UI Components Spec (archived)"
Cohesion: 0.13
Nodes (19): Card (Swap pattern), ImagePlaceholder / initials, Requirement: Shared components, StarRating (half stars), StatusPill (split pill), Requirement: Entry detail, images Specification, Requirement: Placeholder for entries without image (+11 more)

### Community 37 - "Add To Collection Popover"
Cohesion: 0.17
Nodes (13): { collections, memberOf }, create(), creating, enqueue, error, flip(), id, local (+5 more)

### Community 38 - "entry/EntryMain.svelte"
Cohesion: 0.04
Nodes (56): data, entry, data, entry, asKey(), entryFor(), EntryKey, INFO (+48 more)

### Community 39 - "(app)/+layout.svelte"
Cohesion: 0.06
Nodes (32): Scenario: Active section is derived for sub-routes, WORLD_NAMES, bar, current, dock, marked, { part, section, plus = 'shown', expanded = false, onplus }, pill() (+24 more)

### Community 40 - "PreviewPanel.svelte"
Cohesion: 0.16
Nodes (13): describedby, {
		label,
		value = $bindable(''),
		hint,
		error,
		variant = 'pill',
		type = 'text',
		prefix,
		suffix,
		hideLabel = false,
		id = uid,
		...rest
	}, Props, uid, fill(), image, invalid, isHttpUrl() (+5 more)

### Community 41 - "parts/ListBody.svelte"
Cohesion: 0.09
Nodes (22): data, fx, data, fx, data, fx, isWorstTitle(), listFor() (+14 more)

### Community 42 - "errors.ts"
Cohesion: 0.05
Nodes (50): FetchError, ImageError, ProviderError, FAKE_PAGES, fakeRemote, parse(), toWebpDataUrl(), SafeFetchOptions (+42 more)

### Community 43 - "release Specification"
Cohesion: 0.21
Nodes (12): release Specification, Rue-Asha/ci bump-pin.yml, Requirement: CI workflow, Cooking-Hub (reference repo for pins, ruleset, release), creative-archive-deploy change, Requirement: Dependabot, docs/release.md runbook, Homelab-Managment (+4 more)

### Community 44 - "RowMenu.svelte"
Cohesion: 0.17
Nodes (11): Item, { name, items, mode = 'item', maxBlock }, role, button, buttons(), Entry, id, menu (+3 more)

### Community 45 - "Requirement: Grouped sub-type tabs"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, Requirement: Domain landing pages, Requirement: Domain shelves, Requirement: Grouped sub-type tabs, Scenario: Add offers the domain's types, Scenario: Domain page shows its hero photo, Scenario: Domain shelves group recent entries by type (+13 more)

### Community 48 - "Motion Guard Tests"
Cohesion: 0.12
Nodes (19): fixtures/mockups/CREDITS.txt (CC0 Openverse photos), Requirement: Mockup photos, Requirement: Mockups and the world checkpoint, harness Specification, CREATIVE_ARCHIVE_TEST=1 flag, Requirement: Database and migrations, Requirement: E2E projects and isolation, Requirement: Harness declaration (+11 more)

### Community 49 - "Link Preview Server"
Cohesion: 0.17
Nodes (16): cover(), addByPick(), album(), animanga(), brand(), cells(), group(), manyAlbums() (+8 more)

### Community 50 - "Requirement: Select mode in a list"
Cohesion: 0.14
Nodes (14): Requirement: Select mode in a list, Scenario: A filter drops the picks it hides, Scenario: Add and remove a tag on several entries, Scenario: Another list leaves Select mode, Scenario: Escape and Done leave Select mode by keyboard, Scenario: Failed bulk action keeps every value, Scenario: Focused card clears the docked bar, Scenario: Nothing selected disables the actions (+6 more)

### Community 51 - "ref_app"
Cohesion: 0.04
Nodes (62): Kind, MockCollection, asDomain(), DomainView, domainView(), LEDE, Shelf, SUBS (+54 more)

### Community 52 - "home.ts"
Cohesion: 0.31
Nodes (12): coverflowEntries(), domainShelves(), homeShelves(), hydrate(), inProgress(), ofTypes(), progressShelf(), recent() (+4 more)

### Community 53 - "Verification round 3b (verified-at 6ace36b)"
Cohesion: 0.17
Nodes (3): creative-archive-deploy (split-off change), rediscovery (split-off change), Verification round 3b (verified-at 6ace36b)

### Community 54 - "entry-edit.test.ts"
Cohesion: 0.13
Nodes (4): expectCurrent(), expectWorld(), homeAndWorlds(), ITEMS

### Community 55 - "Split-Off Changes and Non-Goals"
Cohesion: 0.16
Nodes (17): images, collection_entries, collections, entries, entries_external, entries_type_created, entries_updated, entry_tags (+9 more)

### Community 56 - "Domain and Home Page Specs"
Cohesion: 0.18
Nodes (13): domain-pages Specification, Domain hero (photo or world gradient), Requirement: Domain landing pages, Requirement: Domain shelves, domainShelves, home Specification, coverflowEntries (20 newest with images), Empty-archive welcome (Add your first ...) (+5 more)

### Community 57 - "Release Spec"
Cohesion: 0.16
Nodes (13): design-system Specification, Requirement: Chrome cursor and focus rings, Requirement: Consistent control styles, --fade-down / --glow-mask eased masks, Requirement: Fonts, Shared .select style, Requirement: Smooth fades and glows, Type scale tokens (--t-display-1 .. --t-initials) (+5 more)

### Community 58 - "hifi/collection/CollectionBody.svelte"
Cohesion: 0.03
Nodes (46): asking, base, c, chooserOn, choosing, confirmOn, data, description (+38 more)

### Community 59 - "Entries Spec"
Cohesion: 0.24
Nodes (10): createEntry, EntryInput, Requirement: Brand and shop kinds, Requirement: Create entries, TYPES per-type config, ValidationError, stepProgress / setProgress / progressLabel, Requirement: Media status with dated events (+2 more)

### Community 60 - "collections/[id]/+page.svelte"
Cohesion: 0.07
Nodes (34): moveSelection(), MoveTarget, [A, B, C, D, E], order, withCount(), submit(), toast, createWriteQueue() (+26 more)

### Community 61 - "settings/states/+page.svelte"
Cohesion: 0.13
Nodes (20): MockData, PhotoWorld, COPY, MESSAGES, ORDER, Slot, slots(), SlotState (+12 more)

### Community 62 - "TagInput.svelte"
Cohesion: 0.24
Nodes (8): Scenario: Bulk actions answer the list page, add(), isNew(), known, onInput(), onKeydown(), suggestions, {
		tags,
		selected = $bindable(),
		pending = $bindable()
	}

### Community 63 - "E2E Back Morph Test"
Cohesion: 0.29
Nodes (7): declarationValues(), files, namedColours, namedColoursIn(), sourceFiles(), srcDir, stylesDir

### Community 64 - "EntryForm.svelte"
Cohesion: 0.06
Nodes (32): Entry edit route contract (/entries/[id]/edit), { onkeep, ondiscard }, open, artistId, artistName, dismissed, fields, imagePicked (+24 more)

### Community 65 - "Build Design Patterns"
Cohesion: 0.20
Nodes (7): [a, b], dir, height, [name, w, h, from = '#2a2622', to = '#c9b9a3', bloom], out, pixels, width

### Community 66 - "redesign/fixtures.ts"
Cohesion: 0.14
Nodes (21): collection(), cover(), covers, entries(), entry(), mockData(), MockEntry, MockEntryFull (+13 more)

### Community 67 - "Gate-1 decisions table"
Cohesion: 0.09
Nodes (28): Gate-1 decisions table, Decision: artists keep status and rating; default error page kept, Decision: combined Brands & shops list /fashion/brands-shops, old URLs redirect, Decision: collection entries manually reorderable, Decision: HEIC uploads dropped, Decision: initial status on media create form; Wardrobe Add creates Owned, Decision: rating out of 10 with two decimals (stars x2 migration), collections Specification (+20 more)

### Community 68 - "wire/entry/overlays/+page.svelte"
Cohesion: 0.15
Nodes (11): plural(), Props, { title, alert = false, mode = 'dialog', children, actions }, exact, { mode, tags, selected, noun, query = '' }, Props, shown, title (+3 more)

### Community 69 - "Domain Lists Spec"
Cohesion: 0.18
Nodes (11): Mockup photo fixtures (CC0 credits), Openverse CC0 StockSnap source, Music Hero Mockup Photo, Music domain hero image, Concert photo: performer on stage under white spotlights, crowd silhouettes holding up phones, blue haze, Neon Mockup Photo, Neon-lit cover/hero test photo, Night street in Tokyo: Yodobashi Camera neon signs (orange/cyan), wet pavement, pedestrians with clear umbrellas (+3 more)

### Community 72 - "E2E Coverflow Test"
Cohesion: 0.22
Nodes (11): "Add artist" checkbox, ensureArtist, Requirement: Artist matching on autofill, AniList GraphQL provider (anime, manga), Deezer provider (albums, artists, tracks), Recorded provider JSON fixtures, Open Library provider (books), Provider interface (+3 more)

### Community 73 - "Dependabot Config"
Cohesion: 0.15
Nodes (13): artistId / artistName fields, Requirement: Album and song link to an artist, "Add to collection" popover, Collection collage (first three images), createCollection / addToCollection / deleteCollection / renameCollection, Requirement: Collection store, Requirement: Collections pages and the add popover, deleteEntry (+5 more)

### Community 74 - "hifi/overlays/Icon.svelte"
Cohesion: 0.20
Nodes (7): Extra, extra, { name, size = 18 }, dialog, Props, { title, kicker, open = $bindable(false), inline = false, alert = false, mode = 'sheet', describedby, closeLabel = 'Close', onclose, children, actions }, uid

### Community 75 - "Requirement: Domain list pages"
Cohesion: 0.22
Nodes (10): domain-lists Specification, Requirement: Domain list pages, listEntries, Requirement: Per-type list queries, toSearchParams / fromSearchParams (filter state in URL), typeBySlug / LISTS, tags Specification, Requirement: Global tags with Unicode-aware dedupe (+2 more)

### Community 76 - "Requirement: Image storage"
Cohesion: 0.28
Nodes (9): Requirement: Image storage, ImageError (not-image, too-large), /images/[id] route (immutable cache), storeImage, storeImageFromUrl, settings Specification, Requirement: Hero photo store, setHero / removeHero / getHeroes (+1 more)

### Community 77 - "Requirement: Collection order"
Cohesion: 0.22
Nodes (9): Requirement: Collection order, Scenario: A migrated database matches a fresh one at head, Scenario: Migration preserves the existing order, Scenario: Remove-many action removes the given entries, Scenario: Remove several keeps the rest in order, Scenario: Removing keeps the order of the rest, Scenario: Reorder action saves the order, Scenario: Reorder action tells a stale order from a malformed one (+1 more)

### Community 78 - "[type]/+page.svelte"
Cohesion: 0.08
Nodes (21): Creative Archive functional contract, Behavioral data-* allow-list, English copy list from e2e, Entry, status, progress, rating, tag, collection entities, Jobs-to-be-done J1-J15, Add entry route contract (/add/[type]), Collection page route contract (/collections/[id]), Entry detail route contract (/entries/[id]) (+13 more)

### Community 79 - "ReorderList.svelte"
Cohesion: 0.06
Nodes (22): announce(), digits, dragFrom, dragTo, drop(), dy, { entries, typeLabels, selection, onmove, onremove }, maker() (+14 more)

### Community 80 - "Deezer Provider Tests"
Cohesion: 0.20
Nodes (9): dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem, schedule (+1 more)

### Community 81 - "E2E Harness Learnings"
Cohesion: 0.32
Nodes (3): AniList GraphQL, Deezer API, Open Library

### Community 82 - "FormFields.svelte"
Cohesion: 0.09
Nodes (17): fx, long, entry, fx, FormKind, handles, hasStatus, { kind, mode = 'add', prefix = 'f', title = '', status, errors = {}, tags = ['favourite', 'autumn'], image = 'none', saving = false, artistLinked = false, preview = false, compact = false } (+9 more)

### Community 83 - "Requirement: Home page"
Cohesion: 0.11
Nodes (19): domainShelves, Requirement: Domain landing pages, Requirement: Domain shelves, Sub-type tabs per domain, Requirement: Edit entries, updateEntry, coverflowEntries, Empty-archive welcome state (+11 more)

### Community 84 - "Requirement: Bulk list actions"
Cohesion: 0.22
Nodes (8): ADDED Requirements, MODIFIED Requirements, Requirement: Bulk list actions, Scenario: Bulk status sets every entry and records events, Scenario: Bulk tag reuses and prunes tags, Scenario: Empty id list is a no-op, Scenario: Invalid status for a type is rejected, Scenario: Unknown id changes nothing

### Community 85 - "Data Model and Contracts"
Cohesion: 0.20
Nodes (10): providerFor / getRemote, Requirement: Test-mode fakes, allowAddresses test exemption (127.0.0.2), FetchError (scheme, invalid-url, private-address, redirects, timeout, too-large), handlesFromUrl, parsePreview, Requirement: Influencer handle prefill, Requirement: Open Graph preview (+2 more)

### Community 86 - "World Pick and Type Pairings"
Cohesion: 0.13
Nodes (16): fixtures/mockups/CREDITS.txt, Requirement: Mockup photos, dist/creative-archive-<version>.tgz + .sha256, Requirement: Package script, Rue-Asha/ci bump-pin.yml, ci.yml / gate.yml, Cooking-Hub (reference repo), Homelab-Managment (creative-archive-deploy) (+8 more)

### Community 87 - "collection-select.test.ts"
Cohesion: 0.36
Nodes (5): bar(), enter(), reloaded(), rows(), run()

### Community 88 - "CI and Release Pipeline Spec"
Cohesion: 0.24
Nodes (10): artist-link Specification, Requirement: Album and song link to an artist, Requirement: Artist matching on autofill, Requirement: Artist on manual entry, artistId / artistName fields, ensureArtist, autofill Specification, Already in your archive / Add manually fallback (+2 more)

### Community 89 - "RatingField.svelte"
Cohesion: 0.19
Nodes (16): formatRating(), ParsedRating, parseRating(), RATING_STEP, stepRating(), commit(), confirmed, confirmLine() (+8 more)

### Community 90 - "Requirement: Domain list pages"
Cohesion: 0.11
Nodes (19): Requirement: Domain list pages, Scenario: Add shows only when the list has entries, Scenario: Empty list offers Add, Scenario: Filter brands and shops by kind, Scenario: Filter by minimum rating, Scenario: Filter by tag, Scenario: Filter media by status, Scenario: Filter pieces by status (+11 more)

### Community 91 - "preview.ts"
Cohesion: 0.06
Nodes (39): MODIFIED Requirements, Requirement: Influencer handle prefill, Requirement: Open Graph preview, Scenario: A typed handle is not overwritten, Scenario: A typed URL is not overwritten by the preview URL, Scenario: Blocked site keeps the form usable, Scenario: Existing name is not overwritten by the preview, Scenario: Icon is used when there is no og:image (+31 more)

### Community 92 - "Autofill Provider Design"
Cohesion: 0.31
Nodes (6): calm(page) reduced-motion test helper, Playwright e2e setup (phone/desktop projects), CREATIVE_ARCHIVE_TEST /__test/* routes and fakes, Homelab creative-archive-deploy live change, Production server environment variables, /__mockups design checkpoint

### Community 93 - "Build Change Flow State"
Cohesion: 0.25
Nodes (6): Creative Archive (agent instructions), OpenSpec capability specs, Proof harness (proof / proof:full), Creative Archive README, GET /healthz, Node.js >= 22.18 for node:sqlite

### Community 94 - "Autofill Fallback and Image Errors"
Cohesion: 0.36
Nodes (9): npm run package release tarball, HOMELAB_BUMP_APP_ID / HOMELAB_BUMP_APP_KEY secrets, Register repo on check01 self-hosted runner, ci.yml push run and release-tarball artifact, Cutting a release (tag-based), Homelab-Managment repo, main branch ruleset (Cooking-Hub shape), release.yml (check-tag, publish, bump) (+1 more)

### Community 95 - "Tokens, Fonts and Contrast"
Cohesion: 0.31
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 96 - "UI Polish Flow State"
Cohesion: 0.13
Nodes (15): Card (Swap pattern), ImagePlaceholder (accent tint + initials), Requirement: Shared components, StarRating (half stars), StatusPill (split pill), src/lib/ui shared components, Requirement: Placeholder for entries without image, morphTarget (+7 more)

### Community 98 - "entries Specification"
Cohesion: 0.21
Nodes (13): entries Specification, Requirement: Brand and shop kinds, Requirement: Create entries, createEntry, deleteEntry, Discard changes? dialog + beforeunload prompt, Requirement: Edit entries, entries table (+5 more)

### Community 99 - "Requirement: Main navigation"
Cohesion: 0.05
Nodes (40): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Compact top bar on scroll, Requirement: Context add button, Requirement: Desktop top bar, Requirement: Main navigation, Requirement: Navigation (+32 more)

### Community 100 - "Requirement: Collections pages and the add popover"
Cohesion: 0.18
Nodes (11): Requirement: Collections pages and the add popover, Scenario: Add an entry from its detail page, Scenario: Adding an entry twice from the popover keeps one, Scenario: Collection page lists mixed entries in order, Scenario: Create a collection from the index, Scenario: Create a collection from the popover, Scenario: Deleting a collection asks first, Scenario: Failed save in the popover shows a toast and reverts (+3 more)

### Community 101 - "E2E Rating Test"
Cohesion: 0.29
Nodes (8): permissions, permissions, permissions, actions, attestations, contents, id-token, permissions

### Community 103 - "Release Artifact Download"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 104 - "TypeScript Config"
Cohesion: 0.25
Nodes (8): "Add manually" fallback, DuplicateError, Requirement: Search, pick and prefill, ImageError (not-image / too-large), GET /images/[id] immutable cache, Requirement: Image storage, storeImage / storeImageFromUrl, WebP BLOB in SQLite via sharp

### Community 105 - "E2E List Filters Test"
Cohesion: 0.32
Nodes (7): Requirement: Fonts, Requirement: Tokens and worlds, Design tokens (tokens.css / tokens.ts), Type pairings a/b/c (Bricolage Grotesque + Figtree default), World attributes data-scheme / data-accent / data-font, worlds.ts world map (WORLDS / FONT), Requirement: Worlds per screen

### Community 106 - "Release Workflow Trigger"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 107 - "Mockup Routes and Alignment Spec"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 108 - "Requirement: Entry detail"
Cohesion: 0.06
Nodes (31): ADDED Requirements, MODIFIED Requirements, Requirement: Add flow on the fingerprint, Requirement: Edit form for every type, Requirement: Entry detail, Requirement: Magazines in the functional contract, Requirement: Prefill status on the add route, Scenario: Add form looks like the signed-off hi-fi (+23 more)

### Community 109 - "2026-11-02-fashion-magazines/proposal.md"
Cohesion: 0.20
Nodes (9): Capabilities, Decisions, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 110 - "E2E Design and Preview Tests"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 111 - "E2E Reveal Test"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 112 - "Requirement: Media status with dated events"
Cohesion: 0.15
Nodes (12): MODIFIED Requirements, Requirement: Media status with dated events, Scenario: Changing status stores a dated event, Scenario: Fashion entries without status or rating show no controls, Scenario: Invalid status for a type is rejected, Scenario: New entry with a status stores its first event, Scenario: Set a piece status from the detail page, Scenario: Set status from the detail page (+4 more)

### Community 113 - "Release Check-Tag Job"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 114 - "Frame.svelte"
Cohesion: 0.06
Nodes (37): Section, field, mood, phoneCurrent, Props, scope, sheet, src (+29 more)

### Community 115 - "toast.svelte.ts"
Cohesion: 0.20
Nodes (14): dismiss(), DURATION, pause(), resume(), start(), timers, Toast, toast() (+6 more)

### Community 116 - "Mockup Credits Test"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 117 - "Requirement: Domain list pages"
Cohesion: 0.18
Nodes (12): listEntries, Requirement: Domain list pages, Requirement: Per-type list queries, Shelves view grouped by status, toSearchParams / fromSearchParams, entries table, Requirement: Generic entry model and type config, typeBySlug / LISTS (+4 more)

### Community 118 - "Design fingerprint: reference"
Cohesion: 0.06
Nodes (36): Accent sets, Accessibility, App icons, Buttons, Cards, rows, toasts, Colour tokens, Components, Composition tokens (`tokens.css`, "Composition (layout.css)") (+28 more)

### Community 119 - "Release Publish Job"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 120 - "Harness Declaration Spec"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 121 - "Banned patterns"
Cohesion: 0.07
Nodes (26): accent-word-overuse, animated-blur, avatar-stack, Banned patterns, chunky-display, cream-paper, emoji-icons, explore-showreel-pair (+18 more)

### Community 122 - "Floating Pill Navigation"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 123 - "Health Check Route"
Cohesion: 0.50
Nodes (4): CLAUDE.md ## Harness section, npm run proof / proof:full, Requirement: Harness declaration, Requirement: Proof commands

### Community 124 - "Requirement: Select mode in a collection"
Cohesion: 0.25
Nodes (8): Requirement: Select mode in a collection, Scenario: A move's toast waits for its save, Scenario: Move order is computed for any selection, Scenario: Move several before another entry, Scenario: Move several to the top keeps their order, Scenario: Move to bottom with everything selected, Scenario: Remove several from the collection, Scenario: Select mode in a collection moves focus in and back out

### Community 125 - "Copy Contract"
Cohesion: 0.67
Nodes (3): activeSection, Floating glass pill nav, Requirement: Navigation

### Community 134 - "WireFrame.svelte"
Cohesion: 0.08
Nodes (26): phoneCurrent, posture, Props, scope, sheet, typing, { world, section, children, plus = 'shown', list }, worst (+18 more)

### Community 135 - "2026-11-02-fashion-magazines/flow.yaml"
Cohesion: 0.29
Nodes (6): base, gate1, gate2, learnings, track, triage

### Community 136 - "a11y-floor.test.ts"
Cohesion: 0.13
Nodes (7): albums, entries, setup(), Small, widths, Row, ROWS

### Community 137 - "wire/list/states/+page.svelte"
Cohesion: 0.08
Nodes (22): ListDef, ListEntry, titleSamples(), { def, entries, total, view = 'grid', state = 'normal', selectable = false, selected = [], hint = true }, lower, Props, scale, shelves (+14 more)

### Community 138 - "Requirement: Version 0.1.2"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.1.2, Scenario: Package and lockfile carry 0.1.2, Scenario: Release v0.1.2 published

### Community 139 - "wire/collection/CollectionBody.svelte"
Cohesion: 0.08
Nodes (14): c, data, digits, draftName, entries, kindLabel, { mode = 'view', pick = 'range', drag = false, extra = false, toast, chooser = false, note }, picked (+6 more)

### Community 140 - "2026-11-02-fashion-magazines/design.md"
Cohesion: 0.33
Nodes (5): Context, Contracts, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 141 - "@playwright/test"
Cohesion: 0.09
Nodes (14): slugs, TABS, tokens, expectHandles(), handle(), calm(), PILLS, captions() (+6 more)

### Community 142 - "Requirement: Magazine type"
Cohesion: 0.17
Nodes (11): ADDED Requirements, MODIFIED Requirements, Requirement: Generic entry model and type config, Requirement: Magazine type, Scenario: Create a magazine from the Add menu, Scenario: Each list slug resolves to its type, Scenario: Empty magazines list offers Add, Scenario: Every type has a complete config (+3 more)

### Community 144 - "lib/select/SelectionBar.svelte"
Cohesion: 0.08
Nodes (27): portal(), Action, dock, dockHeight, id, leave(), main, more (+19 more)

### Community 145 - "2026-11-02-fashion-magazines/verification.md"
Cohesion: 0.29
Nodes (6): Diffstat, Layer 1: npm run proof:full (green, 674 passed, 52 skipped, 5.1m; round 2 after review fixes 5af0e25, ac54508), Layer 2 coverage, Manual checklist, Review, Screenshots (test-results/shots/)

### Community 146 - "wire/home/HomeBody.svelte"
Cohesion: 0.09
Nodes (21): empty, Props, singular, { view, part = 'all' }, active, Part, picked, Props (+13 more)

### Community 147 - "lib/types.ts"
Cohesion: 0.05
Nodes (72): Decisions, Scenario: List query round-trips through the URL, Scenario: List query round-trips through the URL, { collection }, { works }, altTitle, BRANDS_SHOPS, FieldDef (+64 more)

### Community 148 - "entries/[id]/+page.svelte"
Cohesion: 0.06
Nodes (31): anchor, { id, name, open = $bindable(false), align = 'start', children }, items(), menu, onkeydown(), ontoggle(), Props, current (+23 more)

### Community 149 - "hifi/overlays/+page.svelte"
Cohesion: 0.08
Nodes (23): album, brand, collection, collectionItems, collectionMore, data, fashionAdd, firstRow (+15 more)

### Community 150 - "hifi/select/SelectionBar.svelte"
Cohesion: 0.06
Nodes (38): statusSet(), barActions(), TAGS, data, def, doneHref, last, list (+30 more)

### Community 151 - "ADDED Requirements"
Cohesion: 0.29
Nodes (6): ADDED Requirements, MODIFIED Requirements, Requirement: Collections index with descriptions, Scenario: Index shows descriptions, Scenario: Long description and no images stay inside the card, Scenario: No collections yet

### Community 152 - "cards.test.ts"
Cohesion: 0.24
Nodes (8): fits(), inProgress(), inside(), transformOf(), cardOf(), editProgress(), progressGroup(), progressValue()

### Community 153 - "Requirement: Domain list pages"
Cohesion: 0.09
Nodes (22): MODIFIED Requirements, Requirement: Domain list pages, Requirement: Per-type list queries, Scenario: Combined brands-and-shops query spans both stored types, Scenario: Empty list offers Add, Scenario: Filter brands and shops by kind, Scenario: Filter by minimum rating, Scenario: Filter by tag (+14 more)

### Community 154 - "Requirement: Grouped sub-type tabs"
Cohesion: 0.09
Nodes (21): MODIFIED Requirements, Requirement: Domain landing pages, Requirement: Domain shelves, Requirement: Grouped sub-type tabs, Scenario: Add offers the domain's types, Scenario: Domain page shows its hero photo, Scenario: Domain shelves group recent entries by type, Scenario: Domain shelves show its entries (+13 more)

### Community 155 - "redesign/verification.md"
Cohesion: 0.33
Nodes (5): Diffstat, Layer 1: proof:full, Layer 2: spec coverage, Manual checklist (start: `npm run dev` -> http://localhost:5173), Screenshots

### Community 156 - "check-slop.mjs"
Cohesion: 0.10
Nodes (15): file(), args, banned, bannedPath, baselineFlag, checkDecl(), explicitBanned, files (+7 more)

### Community 157 - "wire/shell/data.ts"
Cohesion: 0.12
Nodes (17): { name, covers }, shown, { title, image = true }, AddItem, initials(), ITEMS, KIND_LABEL, kindLabel() (+9 more)

### Community 158 - "wire/settings/+page.svelte"
Cohesion: 0.15
Nodes (16): COPY, MESSAGES, ORDER, Slot, slots(), SlotState, busy, id (+8 more)

### Community 159 - "Design System: Design fingerprint"
Cohesion: 0.10
Nodes (20): Accent: one per app, Accessibility, Colors, Components, Design System: Design fingerprint, Do:, Do's and Don'ts, Don't: (+12 more)

### Community 160 - "Requirement: Micro-interactions"
Cohesion: 0.06
Nodes (34): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Card interaction, Requirement: Micro-interactions, Requirement: Page transitions, Requirement: Scroll motion, Requirement: Shelf drag-scroll and card hover (+26 more)

### Community 161 - "hifi/overlays/toasts/+page.svelte"
Cohesion: 0.12
Nodes (13): portal(), errors, info, Props, ToastItem, { toasts, inline = false, ondismiss, hidden = [], lift }, bulk, data (+5 more)

### Community 162 - "Requirement: Provider interface and parsers"
Cohesion: 0.16
Nodes (16): AniList GraphQL provider (anime, manga), Deezer provider (albums, EPs, artists, tracks), Open Library provider (books), Provider interface, Requirement: Provider interface and parsers, ProviderError (failed, timeout), SearchResult, providerFor / getRemote (+8 more)

### Community 163 - "wire/domain/data.ts"
Cohesion: 0.17
Nodes (17): asDomain(), DomainView, domainView(), LEDE, Shelf, SUBS, SubType, COUNTS (+9 more)

### Community 164 - "MODIFIED Requirements"
Cohesion: 0.17
Nodes (12): MODIFIED Requirements, Requirement: Chrome cursor and focus rings, Requirement: Consistent control styles, Requirement: Fonts, Scenario: Artist and tag tokens share one tone, Scenario: Chrome text shows the default cursor, Scenario: Display and text fonts load from the app, Scenario: Focus ring follows the element's own radius (+4 more)

### Community 165 - "Scope: redesign"
Cohesion: 0.12
Nodes (15): Codebase touchpoints, Decisions, Done when, Entities (contract §3, confirm at Gate 0), Flows, Gate 1 answers (Rue, 2026-11-15), Gate 4 additions (Rue, 2026-11-15), In scope (+7 more)

### Community 166 - "wire/overlays/+page.svelte"
Cohesion: 0.12
Nodes (14): album, brand, collection, collectionItems, data, emptyCollections, fashionAdd, mediaStatus (+6 more)

### Community 167 - "entries/ImageField.svelte"
Cohesion: 0.21
Nodes (11): forget(), {
		imageId = null,
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		ondirty
	}, localError, message, objectUrl, onFile(), reject(), remove() (+3 more)

### Community 168 - "wire/domain/AddMenu.svelte"
Cohesion: 0.14
Nodes (14): { domain, open = false, inline = false }, id, label, Props, shown, addGroups(), addItems(), base (+6 more)

### Community 169 - "Requirement: Collections pages and the add popover"
Cohesion: 0.14
Nodes (13): ADDED Requirements, MODIFIED Requirements, Requirement: Collections pages and the add popover, Scenario: Add an entry from its detail page, Scenario: Adding an entry twice from the popover keeps one, Scenario: Collection page shows mixed cards, Scenario: Create a collection from the index, Scenario: Create a collection from the popover (+5 more)

### Community 170 - "Requirement: Home page"
Cohesion: 0.14
Nodes (13): MODIFIED Requirements, Requirement: Home page, Scenario: Collections section shows collages, Scenario: Empty archive shows a welcome per domain, Scenario: Home head offers Add on the desktop only, Scenario: Home looks like the signed-off hi-fi, Scenario: Home shows the sections in order, Scenario: In progress shelf lists media in progress (+5 more)

### Community 171 - "apply"
Cohesion: 0.18
Nodes (10): apply(), barActions, before(), endRename(), removeOne(), removeSelected(), saveRename(), say() (+2 more)

### Community 172 - "list-filters.test.ts"
Cohesion: 0.60
Nodes (3): bar(), pick(), select()

### Community 173 - "wire/domain/+page.svelte"
Cohesion: 0.17
Nodes (10): facts, { view, menu = false }, d, data, empty, noHero, oneEmpty, others (+2 more)

### Community 174 - "Requirement: Domain landing pages"
Cohesion: 0.08
Nodes (24): MODIFIED Requirements, Requirement: Domain landing pages, Requirement: Domain shelves, Requirement: Grouped sub-type tabs, Scenario: Add offers the domain's types, Scenario: Domain page looks like the signed-off hi-fi, Scenario: Domain page shows its hero photo, Scenario: Domain shelves group recent entries by type (+16 more)

### Community 175 - "icon/+page.svelte"
Cohesion: 0.17
Nodes (5): family, grounds, small, variants, worst

### Community 176 - "wire/collections/CollectionsBody.svelte"
Cohesion: 0.17
Nodes (7): data, draftDescription, entries, { mode }, q, shown, worst

### Community 177 - "dialogs.test.ts"
Cohesion: 0.20
Nodes (3): insideDialog(), trapsFocus(), openEntryMenu()

### Community 178 - "Requirement: Brand and shop kinds"
Cohesion: 0.10
Nodes (19): ADDED Requirements, MODIFIED Requirements, Requirement: Brand and shop kinds, Requirement: Create entries, Requirement: Prefill status on the add route, Scenario: Both add routes open the combined form, Scenario: Changing the kind keeps the entry in the combined list, Scenario: Create a media entry with an initial status (+11 more)

### Community 179 - "redesign/design.md"
Cohesion: 0.14
Nodes (12): sheet(), Context, Decisions, Design-System requests (for the ecosystem orchestrator to file), Family moves per surface (brief for every hi-fi and build unit), From scope (gate 3, Rue), Gate log, Goals / Non-Goals (+4 more)

### Community 180 - "Requirement: Settings page"
Cohesion: 0.18
Nodes (10): MODIFIED Requirements, Requirement: Settings page, Scenario: Oversize hero file shows an inline error, Scenario: Remove a hero photo, Scenario: Replace a domain hero photo, Scenario: Replace and Remove are equal choices, Scenario: Settings explanation matches the contract, Scenario: Slots come in world order (+2 more)

### Community 181 - "Requirement: Rating"
Cohesion: 0.17
Nodes (11): MODIFIED Requirements, Requirement: Rating, Scenario: Clear the rating, Scenario: Clearing keeps 0 distinct from unrated, Scenario: Keyboard rates with arrow keys through the adapter, Scenario: Migration converts star ratings, Scenario: Rate in half stars through the adapter, Scenario: Rated entries show their rating on cards (+3 more)

### Community 182 - "Explore notes: redesign (gate 3), running log"
Cohesion: 0.20
Nodes (9): Decisions (Rue, 2026-11-14), Explore notes: redesign (gate 3), running log, Explorer findings, Round 2 (Rue, 2026-11-14), Round 3 (Rue, 2026-11-14), Round 4 (Rue, 2026-11-14), Round 5 (Rue, 2026-11-14), Round 6 (Rue, 2026-11-14) (+1 more)

### Community 183 - "redesign/proposal.md"
Cohesion: 0.20
Nodes (9): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 184 - "package.mjs"
Cohesion: 0.18
Nodes (8): lock, lockPath, problems, root, hash, root, staging, { version }

### Community 185 - "ArtistField.svelte"
Cohesion: 0.20
Nodes (8): active, {
		artists,
		name = $bindable(),
		id = $bindable(),
		ondirty
	}, choose(), input, matches, onKeydown(), open, shown

### Community 186 - "wire/home/+page.svelte"
Cohesion: 0.17
Nodes (9): data, facts, noCollections, nothing, stressed, view, { kicker, title, lede, hero = false, facts, actions, corner }, Props (+1 more)

### Community 187 - "wire/overlays/Icon.svelte"
Cohesion: 0.20
Nodes (7): Name, { name, size = 20 }, paths, Item, { name, items, mode = 'item', maxBlock }, role, { message, action, quiet = false }

### Community 188 - "2026-11-15-gate-1-decisions/proposal.md"
Cohesion: 0.22
Nodes (8): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, Why

### Community 189 - "Requirement: Image in the entry form"
Cohesion: 0.22
Nodes (8): MODIFIED Requirements, Requirement: Image in the entry form, Scenario: A .heic file is refused in the browser, Scenario: Oversize file shows an inline error, Scenario: Replacing an image removes the old row, Scenario: Unsupported file shows an inline error, Scenario: Upload an image in the form, Scenario: Uploading replaces the current image

### Community 190 - "Requirement: App icon"
Cohesion: 0.40
Nodes (5): name(), Requirement: App icon, Scenario: Head carries the icon links, Scenario: Icon files are served, Scenario: Icon reads at small sizes

### Community 191 - "2026-11-15-gate-1-decisions/flow.yaml"
Cohesion: 0.25
Nodes (7): adopted, base, gate1, gate2, learnings, track, triage

### Community 192 - "Verification (round 3)"
Cohesion: 0.25
Nodes (7): Diffstat, Layer 1: `PORT=4731 npm run proof:full` green, Layer 2: spec coverage (100 scenarios), Manual checklist, Review, Screenshots, Verification (round 3)

### Community 193 - "reorder"
Cohesion: 0.18
Nodes (14): Requirement: Reorder on the collection page, Scenario: A failed removal drops the moves queued behind it, Scenario: A hundred entries stay usable, Scenario: A move is announced, Scenario: Changed elsewhere reloads politely, Scenario: Drag reorders on the desktop, Scenario: Failed reorder restores the order, Scenario: Move up and down reorder by keyboard and touch (+6 more)

### Community 194 - "redesign-shots.test.ts"
Cohesion: 0.29
Nodes (3): screens(), slugs, widths

### Community 195 - "DetailPanel.svelte"
Cohesion: 0.18
Nodes (10): config, {
		entry,
		controls
	}, HANDLE_LABELS, ratio, Row, rows, tags, tagsId (+2 more)

### Community 196 - "Requirement: Proof commands"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Proof commands, Requirement: Test-only routes, Scenario: Proof fails on a failing check, Scenario: Proof prints test names and passes, Scenario: Proof runs the fingerprint guards, Scenario: Reset empties the archive, Scenario: Seed returns the ids of what it inserted (+1 more)

### Community 197 - "Requirement: Mockup photos"
Cohesion: 0.50
Nodes (4): Requirement: Mockup photos, Scenario: Every mockup photo is credited, Scenario: Missing photo shape is generated, Scenario: Mockup photos stay out of the product

### Community 199 - "Requirement: Version 0.2.0"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.2.0, Scenario: Package and lockfile carry 0.2.0, Scenario: Release v0.2.0 published

### Community 200 - "Redesign references — Creative Archive"
Cohesion: 0.33
Nodes (5): A1 Home: domain tiles + "in progress" shelf + "recently added", A2 Multi-select in a list/collection + desktop drag reorder, A3 Quick capture via context "+" (type picker sheet) + catalogue search, A4 Rating control 0-10 / detailed rating on a media detail page, Redesign references — Creative Archive

### Community 201 - "Requirement: Version 0.3.0"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.3.0, Scenario: Package and lockfile carry 0.3.0, Scenario: Release v0.3.0 published

### Community 202 - "list-select.test.ts"
Cohesion: 0.29
Nodes (5): bar(), enter(), offered(), run(), select()

### Community 203 - "wire/select/states/+page.svelte"
Cohesion: 0.20
Nodes (7): { count, canStatus = true, canRemoveTag = true, open = null }, none, Props, albums, brands, fx, wardrobe

### Community 204 - "input"
Cohesion: 0.67
Nodes (3): input(), Requirement: Type scale, Scenario: Inputs do not zoom on phone

### Community 207 - "collection-reorder.test.ts"
Cohesion: 0.32
Nodes (6): csrf, move(), order(), rows(), seedAbc(), wide()

### Community 208 - "ADDED Requirements"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: No old styling, Requirement: Vendored fingerprint, Scenario: App pages load nothing from other origins, Scenario: App renders with the accent, Scenario: Old style files are gone, Scenario: Proof runs check-slop without a baseline, Scenario: Vendored files match the lock

### Community 209 - "Requirement: Accessibility floor"
Cohesion: 0.29
Nodes (7): Requirement: Accessibility floor, Scenario: Controls meet the target sizes, Scenario: Desktop uses its width, Scenario: Focus is visible and not obscured, Scenario: No horizontal page scroll from 320 to 1920, Scenario: Reduced motion removes movement, Scenario: WCAG 2.2 AA review passes

### Community 210 - "Requirement: Redesign mockups"
Cohesion: 0.29
Nodes (7): Requirement: Redesign mockups, Scenario: Every mockup screen is shot at three widths, Scenario: Every world has a mood photo, Scenario: Mockup routes are hidden without the test flag, Scenario: Redesign mockups are hidden without the test flag, Scenario: Rue signs off wireframes and hi-fi, Scenario: Worst-case data switches the fixtures

### Community 211 - "layout Specification"
Cohesion: 0.29
Nodes (7): layout Specification, activeSection, Centred <=1200 px content column alignment rule, Requirement: Navigation, Requirement: One alignment rule and desktop width, Floating glass pill nav (top from 1024 px, bottom below), Requirement: Worlds per screen

### Community 212 - "parts/Icon.svelte"
Cohesion: 0.13
Nodes (11): fx, title, Name, { name, size = 18 }, paths, { label, current, total, mode = 'view', typed = '' }, of, Props (+3 more)

### Community 215 - "CREATIVE_ARCHIVE_TEST flag"
Cohesion: 0.25
Nodes (8): /__mockups/[world]/[scheme] routes, Requirement: Mockups and the world checkpoint, CREATIVE_ARCHIVE_TEST flag, Playwright phone + desktop projects, Requirement: E2E projects and isolation, Requirement: Test-only routes, /__test/reset, seed, counts, image routes, Requirement: One alignment rule and desktop width

### Community 216 - "REMOVED Requirements"
Cohesion: 0.40
Nodes (5): REMOVED Requirements, Requirement: Mockups and the world checkpoint, Requirement: Shared components, Requirement: Smooth fades and glows, Requirement: Tokens and worlds

### Community 218 - "Requirement: Shared dialogs, menus, selection bar and toasts"
Cohesion: 0.40
Nodes (5): Requirement: Shared dialogs, menus, selection bar and toasts, Scenario: Every dialog traps focus and returns it, Scenario: Menus keep the keyboard model, Scenario: Selection bar announces the count, Scenario: Toasts are announced without taking focus

### Community 219 - "Panel.svelte"
Cohesion: 0.13
Nodes (10): fx, kinds, fx, title, Props, { title, note, children, wide = false }, num, Props (+2 more)

### Community 220 - "Requirement: Contract states and English copy"
Cohesion: 0.50
Nodes (4): Requirement: Contract states and English copy, Scenario: Contract strings stay, Scenario: Every route renders its contract states, Scenario: New strings are in the contract

## Ambiguous Edges - Review These
- `Copy contract (src/lib/copy.ts)` → `Missing error colour token`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md · relation: conceptually_related_to

## Knowledge Gaps
- **126 isolated node(s):** `$app/tsconfig`, `Card material: flat translucent fill, radius 20-24px, 1px border`, `Chips/filters: ~36px pills with >=44px touch target`, `Gate 2 manual checklist`, `proof:full green (652 passed, 382 vitest tests)` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2293 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MockData` connect `settings/states/+page.svelte` to `E2E Artist and Domain Tests`, `wire/collection/CollectionBody.svelte`, `hifi/shell/Shelf.svelte`, `hifi/shell/data.ts`, `Contracts`, `FormCard.svelte`, `hifi/overlays/+page.svelte`, `hifi/select/SelectionBar.svelte`, `parts/EntryMain.svelte`, `list/data.ts`, `wire/settings/+page.svelte`, `hifi/overlays/toasts/+page.svelte`, `wire/domain/data.ts`, `entry/EntryMain.svelte`, `wire/overlays/+page.svelte`, `wire/domain/+page.svelte`, `icon/+page.svelte`, `wire/collections/CollectionsBody.svelte`, `ref_app`, `hifi/collection/CollectionBody.svelte`, `wire/home/+page.svelte`, `redesign-shots.test.ts`, `redesign/fixtures.ts`, `Frame.svelte`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Card material: flat translucent fill, radius 20-24px, 1px border`, `Chips/filters: ~36px pills with >=44px touch target` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Polish Audit Findings` be split into smaller, more focused modules?**
  _Cohesion score 0.05297876726448155 - nodes in this community are weakly interconnected._
- **Why does `svelte` connect `svelte` to `[list]/+page.svelte`, `Worlds and App Layout`, `[type]/+page.svelte`, `WireFrame.svelte`, `Button.svelte`, `lib/select/SelectionBar.svelte`, `hifi/shell/data.ts`, `entries/[id]/+page.svelte`, `hifi/select/SelectionBar.svelte`, `select/TagPicker.svelte`, `list/data.ts`, `Add To Collection Popover`, `entry/EntryMain.svelte`, `entries/ImageField.svelte`, `PreviewPanel.svelte`, `(app)/+layout.svelte`, `ref_app`, `ArtistField.svelte`, `hifi/collection/CollectionBody.svelte`, `wire/home/+page.svelte`, `collections/[id]/+page.svelte`, `EntryForm.svelte`, `DetailPanel.svelte`, `wire/entry/overlays/+page.svelte`, `hifi/overlays/Icon.svelte`, `Btn.svelte`, `ReorderList.svelte`, `RatingField.svelte`, `Panel.svelte`, `Frame.svelte`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.07139079851930195 - nodes in this community are weakly interconnected._
- **Why does `Contracts` connect `Contracts` to `reorder`, `redesign/fixtures.ts`, `[list]/+page.svelte`, `reset`, `(app)/+layout.svelte`, `E2E Artist and Domain Tests`, `@playwright/test`, `redesign/design.md`, `collections.ts`, `settings/states/+page.svelte`, `TagInput.svelte`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Copy contract (src/lib/copy.ts)` and `Missing error colour token`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._