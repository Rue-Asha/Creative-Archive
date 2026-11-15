# Graph Report - gate-1-decisions  (2026-11-14)

## Corpus Check
- 347 files · ~222,319 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .woff2 7, (none) 2, .heic 1)

## Summary
- 2431 nodes · 5195 edges · 151 communities (131 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 382 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `727984fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Polish Audit Findings
- ref_node_fs
- svelte
- Entry Save and Form Parsing
- Worlds and App Layout
- #lib
- @playwright/test
- entries.ts
- [scheme]/+page.svelte
- images.ts
- E2E Artist and Domain Tests
- config.ts
- lib/types.ts
- (app)/+layout.svelte
- Mockup Fixtures Data
- Design Tokens Module
- [type]/+page.server.ts
- Coverflow and Form Submit
- Shelf.svelte
- Package Dependencies
- Gate Workflow
- e2e/progress.test.ts
- fake.test.ts
- Synthetic Mockup Images
- open
- Playwright Config and Packaging Tests
- Scope: fashion-magazines
- morph.ts
- Fake Pages and Remote
- getDb
- Requirement: Domain list pages
- Requirement: Database and migrations
- E2E Artist Manual and Delete
- entry-image.test.ts
- E2E Autofill Tests
- CI Workflow
- Shared UI Components Spec (archived)
- Add To Collection Popover
- AddMenu.svelte
- shell/morph.test.ts
- index.ts
- toast.ts
- index.ts
- release Specification
- motion.ts
- Requirement: Grouped sub-type tabs
- E2E Journey Test
- Influencer Handle Prefill
- Motion Guard Tests
- Link Preview Server
- Contracts and E2E Isolation Design
- Archive Proposal and Scope
- SQL Schema Migrations
- Entries and Status Pill Spec
- helpers.ts
- Split-Off Changes and Non-Goals
- Domain and Home Page Specs
- Release Spec
- vitest
- Entries Spec
- npm Scripts
- Progress Parsing and Control
- Requirement: Grouped sub-type tabs
- E2E Back Morph Test
- [type]/+page.svelte
- Build Design Patterns
- Artist Matching on Autofill
- Artist Link and Collections Spec
- Domain Lists and Shelves Spec
- Domain Lists Spec
- E2E Coverflow Test
- Dependabot Config
- Home and Collection Bento Spec
- Requirement: Global tags with Unicode-aware dedupe
- Home Motion Spec
- entries/[id]/+page.svelte
- SearchPanel.svelte
- Motion Test DOM Fakes
- Deezer Provider Tests
- E2E Harness Learnings
- Agent Instructions and Proof
- Release Runbook
- Requirement: Mockup photos
- Data Model and Contracts
- World Pick and Type Pairings
- Shared UI Components Spec
- CI and Release Pipeline Spec
- Font Licenses and Preloads
- Requirement: Collections pages and the add popover
- Requirement: Open Graph preview
- Autofill Provider Design
- Build Change Flow State
- Autofill Fallback and Image Errors
- Tokens, Fonts and Contrast
- UI Polish Flow State
- OpenSpec Config
- entries Specification
- Requirement: Rating
- E2E Rating Test
- Release Artifact Download
- TypeScript Config
- E2E List Filters Test
- Release Workflow Trigger
- Mockup Routes and Alignment Spec
- Tags and List Queries Spec
- proposal.md
- E2E Design and Preview Tests
- E2E Reveal Test
- Requirement: Media status with dated events
- Release Check-Tag Job
- Optimistic Save Write Queue
- seed
- Mockup Credits Test
- E2E Handles Test
- StarRating.svelte
- Release Publish Job
- Harness Declaration Spec
- Requirement: Image in the entry form
- Floating Pill Navigation
- Health Check Route
- Cover Dusk Image
- Copy Contract
- Health Route Spec
- App Type Declarations
- Artist on Manual Entry
- Entry Detail Requirement
- Unsaved Changes Guard
- Requirement: Entry detail
- Requirement: Unsaved-changes guard
- server/remote.ts
- 2026-11-02-fashion-magazines/flow.yaml
- verification.md
- anilist.test.ts
- Requirement: Version 0.1.2
- Requirement: Version 0.2.0
- design.md
- e2e/handles.test.ts
- Requirement: Generic entry model and type config
- Requirement: Magazine type
- Requirement: Entries table accepts magazines
- gate-1-decisions/verification.md
- tilt.ts
- CREATIVE_ARCHIVE_TEST flag
- initials.ts
- playwright.config.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 82 edges
2. `open()` - 61 edges
3. `vitest` - 57 edges
4. `@playwright/test` - 54 edges
5. `reset()` - 51 edges
6. `calm()` - 49 edges
7. `seed()` - 49 edges
8. `svelte` - 34 edges
9. `TYPES` - 30 edges
10. `reducedMotion()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Scenario: New entry with a status stores its first event` --references--> `createEntry()`  [INFERRED]
  openspec/changes/archive/2026-11-02-fashion-magazines/specs/tracking/spec.md → src/lib/server/entries.ts
- `Scenario: Kind decides the brand or site type` --references--> `createEntry()`  [INFERRED]
  openspec/changes/gate-1-decisions/specs/entries/spec.md → src/lib/server/entries.ts
- `Scenario: Replacing an image removes the old row` --references--> `updateEntry()`  [INFERRED]
  openspec/changes/gate-1-decisions/specs/images/spec.md → src/lib/server/entries.ts
- `Scenario: Clearing keeps 0 distinct from unrated` --references--> `getEntry()`  [INFERRED]
  openspec/changes/gate-1-decisions/specs/tracking/spec.md → src/lib/server/entries.ts
- `Scenario: Migration converts star ratings` --references--> `getEntry()`  [INFERRED]
  openspec/changes/gate-1-decisions/specs/tracking/spec.md → src/lib/server/entries.ts

## Import Cycles
- 2-file cycle: `src/lib/server/images.ts -> src/lib/server/remote.ts -> src/lib/server/images.ts`

## Hyperedges (group relationships)
- **Autofill providers implementing the Provider interface** — openspec_specs_autofill_spec_provider, openspec_specs_autofill_spec_deezer_provider, openspec_specs_autofill_spec_anilist_provider, openspec_specs_autofill_spec_open_library_provider [EXTRACTED 1.00]
- **Self-hosted fonts under SIL OFL 1.1** — static_fonts_bodonimoda_ofl_bodoni_moda, static_fonts_bricolagegrotesque_ofl_bricolage_grotesque, static_fonts_figtree_ofl_figtree, static_fonts_hankengrotesk_ofl_hanken_grotesk, static_fonts_manrope_ofl_manrope, static_fonts_syne_ofl_syne, static_fonts_bodonimoda_ofl_sil_open_font_license [EXTRACTED 1.00]
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

## Communities (151 total, 20 thin omitted)

### Community 0 - "UI Polish Audit Findings"
Cohesion: 0.05
Nodes (99): Finding 18: ambient background-attachment fixed repaints/ignored on iOS, Finding 1: back morph lands on hidden unrevealed card, Card-detail View Transition analysis (wrong shelf copy, aspect stretch), Finding 12: detail cover 300px on phone pushes title below fold, Finding 11: bento features empty first collection, Finding 16: global :focus-visible forces pill radius, Finding 3: forward morph starts from hovered/tilted card, Finding 5: hero fades end with a visible crease (2-stop masks) (+91 more)

### Community 1 - "ref_node_fs"
Cohesion: 0.08
Nodes (17): 1. Fashion magazines and grouped tabs, hash, root, staging, { version }, { version }, entry, dir (+9 more)

### Community 2 - "svelte"
Cohesion: 0.13
Nodes (14): icon, iconSize, {
		label,
		href,
		variant = 'solid',
		direction = 'right',
		size = 'md',
		decorative = false,
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}, Props, {
		children,
		href,
		variant = 'primary',
		arrow,
		icon,
		type = 'button',
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}, Props, withArrow, {
		label,
		active = false,
		count,
		icon,
		static: isStatic = false,
		href,
		size = 'md',
		tone = 'line',
		onclick,
		class: cls = '',
		...rest
	} (+6 more)

### Community 3 - "Entry Save and Form Parsing"
Cohesion: 0.09
Nodes (28): accent(), ACCENT_TOKENS, AccentSet, AccentToken, FONT_TOKENS, fontLabels, FontToken, glassText (+20 more)

### Community 4 - "Worlds and App Layout"
Cohesion: 0.06
Nodes (39): dependencies, sharp@^0.35.5, devDependencies, @playwright/test@^1.64.0, svelte@^5.57.2, svelte-check@^4.7.6, @sveltejs/adapter-node@^6.0.0, @sveltejs/kit@^3.0.1 (+31 more)

### Community 5 - "#lib"
Cohesion: 0.06
Nodes (39): Creative Archive functional contract, Behavioral data-* allow-list, English copy list from e2e, Entry, status, progress, rating, tag, collection entities, Jobs-to-be-done J1-J15, Add entry route contract (/add/[type]), Collection page route contract (/collections/[id]), Entry detail route contract (/entries/[id]) (+31 more)

### Community 6 - "@playwright/test"
Cohesion: 0.12
Nodes (10): csrf, pairings, calm(), cardTitles(), reset(), shelfWithManyCards(), captions(), tabs() (+2 more)

### Community 7 - "entries.ts"
Cohesion: 0.10
Nodes (35): Requirement: Create entries, Scenario: Create a media entry with an initial status, Scenario: Create an album manually from the form, Scenario: Create an entry of each type, Scenario: Double submit creates one entry, Scenario: Empty title is not saved, Scenario: Fields of another type are ignored, Scenario: Form shows the fields of its type (+27 more)

### Community 8 - "[scheme]/+page.svelte"
Cohesion: 0.05
Nodes (49): World, animanga, books, collagePhotos, collageSrc(), domains, fashion, home (+41 more)

### Community 9 - "images.ts"
Cohesion: 0.12
Nodes (24): Requirement: Image storage, Scenario: Each listed format is accepted, Scenario: HEIC is rejected by the server, Scenario: Image from a URL is stored, Scenario: Image is served with caching headers, Scenario: Image over 16 MB is rejected by the server, Scenario: Unsupported file is rejected by the server, Scenario: Uploaded image is stored as WebP (+16 more)

### Community 10 - "E2E Artist and Domain Tests"
Cohesion: 0.14
Nodes (21): name(), @sveltejs/kit, dataTables(), resetDb(), requireTestFlag(), SeedInput, SeedResult, testImageNamed() (+13 more)

### Community 11 - "config.ts"
Cohesion: 0.12
Nodes (21): altTitle, BRANDS_SHOPS, FieldInput, flat(), LIST_GROUPS, ListDef, ListGroup, listOf() (+13 more)

### Community 12 - "lib/types.ts"
Cohesion: 0.09
Nodes (31): Scenario: List query round-trips through the URL, RETIRED_LISTS, {
		config,
		state,
		tags,
		fixedStatus = false,
		onchange
	}, hasChips, kinds, ratings, statuses, fromSearchParams() (+23 more)

### Community 13 - "(app)/+layout.svelte"
Cohesion: 0.11
Nodes (16): WORLD_NAMES, current, items, { section }, activeSection(), Section, worldAttrs(), current (+8 more)

### Community 14 - "Mockup Fixtures Data"
Cohesion: 0.18
Nodes (13): collections Specification, Add to collection popover, Collection collage (first three images), Requirement: Collection store, createCollection / addToCollection / deleteCollection / renameCollection / getCollection, Requirement: Collections pages and the add popover, Collections bento, Toast (Saved / Deleted) (+5 more)

### Community 15 - "Design Tokens Module"
Cohesion: 0.13
Nodes (18): DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress(), parseIPv4(), parseIPv6(), quad(), readBody(), REDIRECTS (+10 more)

### Community 16 - "[type]/+page.server.ts"
Cohesion: 0.18
Nodes (15): MEDIA_STATUSES, PIECE_STATUSES, listArtists(), collator, listTags(), Tag, actions, initialStatus() (+7 more)

### Community 17 - "Coverflow and Form Submit"
Cohesion: 0.12
Nodes (13): active, {
		artists,
		name = $bindable(),
		id = $bindable(),
		ondirty
	}, choose(), input, matches, onKeydown(), open, shown (+5 more)

### Community 18 - "Shelf.svelte"
Cohesion: 0.15
Nodes (9): dragScroll(), up(), inertiaSteps(), canNext, canPrev, cover, page(), shape (+1 more)

### Community 19 - "Package Dependencies"
Cohesion: 0.10
Nodes (21): chip, current, enqueue, { entry, shape }, key, KIND_LABEL, local, meta (+13 more)

### Community 20 - "Gate Workflow"
Cohesion: 0.10
Nodes (37): ADDED Requirements, MODIFIED Requirements, Requirement: Collection order, Requirement: Collection store, Scenario: A migrated database matches a fresh one at head, Scenario: Collage uses the first three images in collection order, Scenario: Collection requires a name, Scenario: Deleting a collection keeps its entries (+29 more)

### Community 21 - "e2e/progress.test.ts"
Cohesion: 0.08
Nodes (15): Creative Archive, Harness, Learnings, Specs, fits(), inProgress(), inside(), transformOf() (+7 more)

### Community 22 - "fake.test.ts"
Cohesion: 0.22
Nodes (8): ProviderError, CANNED, fakeProviders, FRANK, MEDIA, search(), safeRemote, GET()

### Community 23 - "Synthetic Mockup Images"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 24 - "open"
Cohesion: 0.23
Nodes (9): addByPick(), addManually(), offersManual(), searchbox(), open(), scrolled(), transform(), paste() (+1 more)

### Community 25 - "Playwright Config and Packaging Tests"
Cohesion: 0.11
Nodes (23): Books Hero Mockup Photo, Books Domain Hero Image, Vintage Books on Wooden Shelf (warm tone), Cover Ember Mockup Image, Square cover-art placeholder (1000x1000), Ember gradient: dark brown to orange with warm yellow bloom (grain), Cover Moss Mockup Image, Square cover-art placeholder (1000x1000) (+15 more)

### Community 26 - "Scope: fashion-magazines"
Cohesion: 0.20
Nodes (11): entries(), Codebase touchpoints, Decisions, Done when, Flows, In scope, Non-goals, Problem (+3 more)

### Community 27 - "morph.ts"
Cohesion: 0.20
Nodes (18): coverName(), holdReveals(), inViewport(), backCover(), cardCover(), covers(), inView(), listKey() (+10 more)

### Community 28 - "Fake Pages and Remote"
Cohesion: 0.11
Nodes (21): submit(), cancel(), click(), coverflowState(), current, dragPosition(), dx, { entries } (+13 more)

### Community 29 - "getDb"
Cohesion: 0.18
Nodes (20): init(), count(), getDb(), addEvent(), deleteEntry(), dropImage(), updateEntry(), getHeroes() (+12 more)

### Community 30 - "Requirement: Domain list pages"
Cohesion: 0.06
Nodes (33): MODIFIED Requirements, Requirement: Domain list pages, Requirement: Per-type list queries, Scenario: Combined brands-and-shops query spans both stored types, Scenario: Empty list offers Add, Scenario: Filter brands and shops by kind, Scenario: Filter by minimum rating, Scenario: Filter by tag (+25 more)

### Community 31 - "Requirement: Database and migrations"
Cohesion: 0.20
Nodes (9): ADDED Requirements, MODIFIED Requirements, Requirement: Database and migrations, Scenario: Failing migration stops the server, Scenario: Foreign keys are on after migrating, Scenario: Fresh database gets the schema, Scenario: Migration that breaks a foreign key is rolled back, Scenario: Only new migrations run on an existing database (+1 more)

### Community 32 - "E2E Artist Manual and Delete"
Cohesion: 0.16
Nodes (26): ratingFromX100(), ValidationError, artistWorks(), fail(), hydrate(), loadTags(), nullable(), rowToEntry() (+18 more)

### Community 34 - "E2E Autofill Tests"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 35 - "CI Workflow"
Cohesion: 0.13
Nodes (4): creative-archive-deploy (split-off change), rediscovery (split-off change), Proposal: build-creative-archive, Scope: build-creative-archive (Gate 0)

### Community 36 - "Shared UI Components Spec (archived)"
Cohesion: 0.14
Nodes (18): Card (Swap pattern), ImagePlaceholder / initials, Requirement: Shared components, StarRating (half stars), StatusPill (split pill), Requirement: Entry detail, Requirement: Placeholder for entries without image, motion Specification (+10 more)

### Community 37 - "Add To Collection Popover"
Cohesion: 0.14
Nodes (16): close(), { collections, memberOf }, create(), creating, enqueue, error, flip(), keys() (+8 more)

### Community 38 - "AddMenu.svelte"
Cohesion: 0.28
Nodes (7): close(), { domain }, menu, menuKeys(), open, outside(), root

### Community 39 - "shell/morph.test.ts"
Cohesion: 0.14
Nodes (4): MorphTarget, morphTarget(), FakeEl, setup()

### Community 40 - "index.ts"
Cohesion: 0.21
Nodes (11): FetchError, createDeezer(), years(), yearOf(), createFetchJson(), fetchJson, providerFor(), real (+3 more)

### Community 41 - "toast.ts"
Cohesion: 0.13
Nodes (15): Window, attach, createToaster(), attach(), dismiss(), flush(), toast(), write() (+7 more)

### Community 42 - "index.ts"
Cohesion: 0.15
Nodes (11): AlMedia, DzAlbum, DzArtist, DzTrack, createOpenLibrary(), OlDoc, FetchJson, Provider (+3 more)

### Community 43 - "release Specification"
Cohesion: 0.21
Nodes (12): release Specification, Rue-Asha/ci bump-pin.yml, Requirement: CI workflow, Cooking-Hub (reference repo for pins, ruleset, release), creative-archive-deploy change, Requirement: Dependabot, docs/release.md runbook, Homelab-Managment (+4 more)

### Community 44 - "motion.ts"
Cohesion: 0.07
Nodes (35): svelte, { onkeep, ondiscard }, scrim(), forget(), localError, message, objectUrl, onFile() (+27 more)

### Community 45 - "Requirement: Grouped sub-type tabs"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, Requirement: Domain landing pages, Requirement: Domain shelves, Requirement: Grouped sub-type tabs, Scenario: Add offers the domain's types, Scenario: Domain page shows its hero photo, Scenario: Domain shelves group recent entries by type (+13 more)

### Community 47 - "Influencer Handle Prefill"
Cohesion: 0.17
Nodes (3): Design: build-creative-archive, Rues-Cooking-Hub (reference repo), guardUnsaved()

### Community 48 - "Motion Guard Tests"
Cohesion: 0.15
Nodes (16): harness Specification, CREATIVE_ARCHIVE_TEST=1 flag, Requirement: Database and migrations, Requirement: E2E projects and isolation, Requirement: Harness declaration, Requirement: Health route, GET /healthz, Requirement: Package script (+8 more)

### Community 49 - "Link Preview Server"
Cohesion: 0.14
Nodes (19): cards(), cover(), rate(), addByPick(), album(), animanga(), brand(), cells() (+11 more)

### Community 50 - "Contracts and E2E Isolation Design"
Cohesion: 0.10
Nodes (24): MODIFIED Requirements, Requirement: Influencer handle prefill, Scenario: A typed handle is not overwritten, Scenario: Pasting a magazine's site fills name, image and website, Scenario: Pasting a post URL fills no handle, Scenario: Pasting a profile on a magazine fills the handle, Scenario: Pasting an Instagram profile fills the handle, Scenario: Pasting another site fills the website field (+16 more)

### Community 51 - "Archive Proposal and Scope"
Cohesion: 0.13
Nodes (12): animatedProperties(), Entry, files, inlineSizeExceptions, node, observers, primitives, sourceFiles() (+4 more)

### Community 52 - "SQL Schema Migrations"
Cohesion: 0.37
Nodes (11): listHref(), domainShelves(), homeShelves(), hydrate(), inProgress(), ofTypes(), progressShelf(), recent() (+3 more)

### Community 53 - "Entries and Status Pill Spec"
Cohesion: 0.15
Nodes (18): ImageError, FAKE_PAGES, fakeRemote, parse(), attributes(), decode(), downloadAsWebp(), NAMED (+10 more)

### Community 54 - "helpers.ts"
Cohesion: 0.08
Nodes (11): slugs, TABS, counts(), expectCurrent(), expectWorld(), colorSchemes, worlds, ITEMS (+3 more)

### Community 55 - "Split-Off Changes and Non-Goals"
Cohesion: 0.16
Nodes (17): images, collection_entries, collections, entries, entries_external, entries_type_created, entries_updated, entry_tags (+9 more)

### Community 56 - "Domain and Home Page Specs"
Cohesion: 0.20
Nodes (12): domain-pages Specification, Requirement: Domain landing pages, Requirement: Domain shelves, domainShelves, home Specification, coverflowEntries (20 newest with images), Empty-archive welcome (Add your first ...), Requirement: Home page (+4 more)

### Community 57 - "Release Spec"
Cohesion: 0.11
Nodes (21): design-system Specification, Requirement: Chrome cursor and focus rings, Requirement: Consistent control styles, --fade-down / --glow-mask eased masks, Requirement: Fonts, Requirement: Mockups and the world checkpoint, Shared .select style, Requirement: Smooth fades and glows (+13 more)

### Community 58 - "vitest"
Cohesion: 0.20
Nodes (11): vitest, Field, closeDb(), Migration, entryColumns(), insertEntryRow(), insertTestImage(), png() (+3 more)

### Community 59 - "Entries Spec"
Cohesion: 0.16
Nodes (14): StatusPill (split pill), createEntry, entries table, EntryInput, Requirement: Brand and shop kinds, Requirement: Create entries, Requirement: Generic entry model and type config, TYPES per-type config (+6 more)

### Community 60 - "npm Scripts"
Cohesion: 0.15
Nodes (10): cancelDelete(), collection, confirming, { data, form }, deleting, dialog, dialogKeys(), error (+2 more)

### Community 61 - "Progress Parsing and Control"
Cohesion: 0.09
Nodes (15): Collections index route contract (/collections), { collection }, { collections, countAction }, cover, featured, tiles, Collection, {
		images,
		label,
		src = (id: number) => `/images/${id}`
	} (+7 more)

### Community 62 - "Requirement: Grouped sub-type tabs"
Cohesion: 0.09
Nodes (21): MODIFIED Requirements, Requirement: Domain landing pages, Requirement: Domain shelves, Requirement: Grouped sub-type tabs, Scenario: Add offers the domain's types, Scenario: Domain page shows its hero photo, Scenario: Domain shelves group recent entries by type, Scenario: Domain shelves show its entries (+13 more)

### Community 63 - "E2E Back Morph Test"
Cohesion: 0.17
Nodes (10): dir, files(), root, declarationValues(), files, namedColours, namedColoursIn(), sourceFiles() (+2 more)

### Community 64 - "[type]/+page.svelte"
Cohesion: 0.05
Nodes (44): COPY, STATUS_LABELS, FieldDef, close(), deleting, dialog, keys(), open (+36 more)

### Community 65 - "Build Design Patterns"
Cohesion: 0.17
Nodes (9): fixtures/mockups/CREDITS.txt (CC0 Openverse photos), Requirement: Mockup photos, [a, b], dir, height, [name, w, h, from = '#2a2622', to = '#c9b9a3', bloom], out, pixels (+1 more)

### Community 66 - "Artist Matching on Autofill"
Cohesion: 0.21
Nodes (10): choose(), close(), current, {
		label,
		options,
		value,
		onchange,
		disabled = false
	}, menu, menuKeys(), open, outside() (+2 more)

### Community 67 - "Artist Link and Collections Spec"
Cohesion: 0.23
Nodes (12): Gate-1 decisions table, Decision: artists keep status and rating; default error page kept, Decision: combined Brands & shops list /fashion/brands-shops, old URLs redirect, Decision: collection entries manually reorderable, Decision: HEIC uploads dropped, Decision: initial status on media create form; Wardrobe Add creates Owned, Decision: rating out of 10 with two decimals (stars x2 migration), OpenSpec change gate-1-decisions (server/data work before redesign) (+4 more)

### Community 68 - "Domain Lists and Shelves Spec"
Cohesion: 0.12
Nodes (11): back(), Box, Capture, Item, openCard(), Pseudo, watched(), Window (+3 more)

### Community 69 - "Domain Lists Spec"
Cohesion: 0.18
Nodes (11): Mockup photo fixtures (CC0 credits), Openverse CC0 StockSnap source, Music Hero Mockup Photo, Music domain hero image, Concert photo: performer on stage under white spotlights, crowd silhouettes holding up phones, blue haze, Neon Mockup Photo, Neon-lit cover/hero test photo, Night street in Tokyo: Yodobashi Camera neon signs (orange/cyan), wet pavement, pedestrians with clear umbrellas (+3 more)

### Community 72 - "E2E Coverflow Test"
Cohesion: 0.22
Nodes (11): "Add artist" checkbox, ensureArtist, Requirement: Artist matching on autofill, AniList GraphQL provider (anime, manga), Deezer provider (albums, artists, tracks), Recorded provider JSON fixtures, Open Library provider (books), Provider interface (+3 more)

### Community 73 - "Dependabot Config"
Cohesion: 0.20
Nodes (10): artistId / artistName fields, Requirement: Album and song link to an artist, "Add to collection" popover, createCollection / addToCollection / deleteCollection / renameCollection, Requirement: Collection store, Requirement: Collections pages and the add popover, deleteEntry, Requirement: Delete entries (+2 more)

### Community 74 - "Home and Collection Bento Spec"
Cohesion: 0.18
Nodes (11): Requirement: Domain list pages, Shelves view grouped by status, toSearchParams / fromSearchParams, domainShelves, Requirement: Domain landing pages, Requirement: Domain shelves, Sub-type tabs per domain, typeBySlug / LISTS (+3 more)

### Community 75 - "Requirement: Global tags with Unicode-aware dedupe"
Cohesion: 0.50
Nodes (4): tags Specification, Requirement: Global tags with Unicode-aware dedupe, setEntryTags / listTags, Requirement: Tag input

### Community 76 - "Home Motion Spec"
Cohesion: 0.11
Nodes (21): ProviderError (failed, timeout), Domain hero (photo or world gradient), images Specification, Requirement: Image in the entry form, Requirement: Image storage, ImageError (not-image, too-large), /images/[id] route (immutable cache), storeImage (+13 more)

### Community 77 - "entries/[id]/+page.svelte"
Cohesion: 0.10
Nodes (28): MARK_DONE, { works }, TYPES, atTotal(), domainOf(), isValidRating(), isWardrobe(), labelSet() (+20 more)

### Community 78 - "SearchPanel.svelte"
Cohesion: 0.22
Nodes (10): change(), config, manualHref, now(), phase, query, results, run() (+2 more)

### Community 79 - "Motion Test DOM Fakes"
Cohesion: 0.33
Nodes (9): active(), counter(), flow(), next(), prev(), rotation(), slides(), stage() (+1 more)

### Community 80 - "Deezer Provider Tests"
Cohesion: 0.20
Nodes (9): dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem, schedule (+1 more)

### Community 81 - "E2E Harness Learnings"
Cohesion: 0.27
Nodes (3): AniList GraphQL, Deezer API, Open Library

### Community 83 - "Release Runbook"
Cohesion: 0.20
Nodes (10): Collection collage (first three images), Requirement: Edit entries, updateEntry, Collections bento, Empty-archive welcome state, Requirement: Home page, Requirement: Image in the entry form, Requirement: Hero photo store (+2 more)

### Community 84 - "Requirement: Mockup photos"
Cohesion: 0.33
Nodes (6): fixtures/mockups/CREDITS.txt, /__mockups/[world]/[scheme] routes, Requirement: Mockup photos, Requirement: Mockups and the world checkpoint, Requirement: Package script, Requirement: One alignment rule and desktop width

### Community 85 - "Data Model and Contracts"
Cohesion: 0.20
Nodes (10): providerFor / getRemote, Requirement: Test-mode fakes, allowAddresses test exemption (127.0.0.2), FetchError (scheme, invalid-url, private-address, redirects, timeout, too-large), handlesFromUrl, parsePreview, Requirement: Influencer handle prefill, Requirement: Open Graph preview (+2 more)

### Community 86 - "World Pick and Type Pairings"
Cohesion: 0.25
Nodes (9): dist/creative-archive-<version>.tgz + .sha256, ci.yml / gate.yml, Cooking-Hub (reference repo), release.yml (check-tag, publish, bump), Requirement: CI workflow, Requirement: Dependabot, Requirement: Release workflow, Requirement: Version 0.1.0 (+1 more)

### Community 87 - "Shared UI Components Spec"
Cohesion: 0.20
Nodes (9): coverflowEntries, Coverflow (coverflowState), inertiaSteps drag-scroll inertia, morphTarget, parallaxOffset, Requirement: Card interaction, Requirement: Page transitions, Requirement: Scroll motion (+1 more)

### Community 88 - "CI and Release Pipeline Spec"
Cohesion: 0.17
Nodes (17): artist-link Specification, Requirement: Album and song link to an artist, Requirement: Artist matching on autofill, Requirement: Artist on manual entry, artistId / artistName fields, ensureArtist, autofill Specification, Already in your archive / Add manually fallback (+9 more)

### Community 90 - "Requirement: Collections pages and the add popover"
Cohesion: 0.18
Nodes (11): Requirement: Collections pages and the add popover, Scenario: Add an entry from its detail page, Scenario: Adding an entry twice from the popover keeps one, Scenario: Collection page shows mixed cards, Scenario: Create a collection from the index, Scenario: Create a collection from the popover, Scenario: Deleting a collection asks first, Scenario: Failed save in the popover shows a toast and reverts (+3 more)

### Community 91 - "Requirement: Open Graph preview"
Cohesion: 0.12
Nodes (17): Requirement: Open Graph preview, Scenario: A typed URL is not overwritten by the preview URL, Scenario: Blocked site keeps the form usable, Scenario: Existing name is not overwritten by the preview, Scenario: Icon is used when there is no og:image, Scenario: Invalid URL shows an inline error, Scenario: JS-only shell shows No preview found, Scenario: Login wall shows No preview found (+9 more)

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
Cohesion: 0.22
Nodes (9): Card (Swap pattern), ImagePlaceholder (accent tint + initials), Requirement: Shared components, StarRating (half stars), src/lib/ui shared components, Requirement: Placeholder for entries without image, Requirement: Micro-interactions, Requirement: Rating (+1 more)

### Community 97 - "OpenSpec Config"
Cohesion: 0.25
Nodes (9): Bricolage Grotesque + Figtree font preloads, app.html document shell, Bodoni Moda font license, SIL Open Font License 1.1, Bricolage Grotesque font license, Figtree font license, Hanken Grotesk font license, Manrope font license (+1 more)

### Community 98 - "entries Specification"
Cohesion: 0.12
Nodes (24): domain-lists Specification, Requirement: Domain list pages, listEntries, Requirement: Per-type list queries, Shelves view grouped by status, toSearchParams / fromSearchParams (filter state in URL), entries Specification, Requirement: Brand and shop kinds (+16 more)

### Community 99 - "Requirement: Rating"
Cohesion: 0.15
Nodes (12): MODIFIED Requirements, Requirement: Rating, Scenario: Clear the rating, Scenario: Clearing keeps 0 distinct from unrated, Scenario: Create and update accept the full rating range, Scenario: Keyboard rates with arrow keys through the adapter, Scenario: Migration converts star ratings, Scenario: Rate in half stars through the adapter (+4 more)

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

### Community 108 - "Tags and List Queries Spec"
Cohesion: 0.38
Nodes (3): pick(), results(), searchbox()

### Community 109 - "proposal.md"
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

### Community 114 - "Optimistic Save Write Queue"
Cohesion: 0.60
Nodes (3): bar(), chip(), select()

### Community 115 - "seed"
Cohesion: 0.08
Nodes (13): count(), Samples, twelveInProgress(), seedChrome(), seed(), shelf(), Halfway, Named (+5 more)

### Community 116 - "Mockup Credits Test"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 117 - "E2E Handles Test"
Cohesion: 0.40
Nodes (6): listEntries, Requirement: Per-type list queries, Requirement: Global tags with Unicode-aware dedupe, Requirement: Tag input, setEntryTags / listTags, Unicode tag fold key

### Community 118 - "StarRating.svelte"
Cohesion: 0.22
Nodes (5): fills, icons, name, text, {
		value,
		mode,
		onchange,
		label,
		size = 'md',
		tone = 'accent'
	}

### Community 119 - "Release Publish Job"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 120 - "Harness Declaration Spec"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 121 - "Requirement: Image in the entry form"
Cohesion: 0.22
Nodes (8): MODIFIED Requirements, Requirement: Image in the entry form, Scenario: A .heic file is refused in the browser, Scenario: Oversize file shows an inline error, Scenario: Replacing an image removes the old row, Scenario: Unsupported file shows an inline error, Scenario: Upload an image in the form, Scenario: Uploading replaces the current image

### Community 122 - "Floating Pill Navigation"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 123 - "Health Check Route"
Cohesion: 0.50
Nodes (4): CLAUDE.md ## Harness section, npm run proof / proof:full, Requirement: Harness declaration, Requirement: Proof commands

### Community 124 - "Cover Dusk Image"
Cohesion: 0.50
Nodes (4): Rue-Asha/ci bump-pin.yml, Homelab-Managment (creative-archive-deploy), docs/release.md, Requirement: Release runbook

### Community 125 - "Copy Contract"
Cohesion: 0.67
Nodes (3): activeSection, Floating glass pill nav, Requirement: Navigation

### Community 134 - "server/remote.ts"
Cohesion: 0.29
Nodes (5): SafeFetchOptions, charsetOf(), decode(), MAX_PAGE_BYTES, Remote

### Community 135 - "2026-11-02-fashion-magazines/flow.yaml"
Cohesion: 0.29
Nodes (6): base, gate1, gate2, learnings, track, triage

### Community 136 - "verification.md"
Cohesion: 0.29
Nodes (6): Diffstat, Layer 1: npm run proof:full (green, 674 passed, 52 skipped, 5.1m; round 2 after review fixes 5af0e25, ac54508), Layer 2 coverage, Manual checklist, Review, Screenshots (test-results/shots/)

### Community 138 - "Requirement: Version 0.1.2"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.1.2, Scenario: Package and lockfile carry 0.1.2, Scenario: Release v0.1.2 published

### Community 139 - "Requirement: Version 0.2.0"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.2.0, Scenario: Package and lockfile carry 0.2.0, Scenario: Release v0.2.0 published

### Community 140 - "design.md"
Cohesion: 0.29
Nodes (6): Context, Contracts, Decisions, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 142 - "Requirement: Generic entry model and type config"
Cohesion: 0.33
Nodes (5): ADDED Requirements, MODIFIED Requirements, Requirement: Generic entry model and type config, Scenario: Each list slug resolves to its type, Scenario: Every type has a complete config

### Community 144 - "Requirement: Magazine type"
Cohesion: 0.33
Nodes (6): Requirement: Magazine type, Scenario: Create a magazine from the Add menu, Scenario: Empty magazines list offers Add, Scenario: Fashion welcome names magazines, Scenario: Magazine form shows the influencer fields, Scenario: Magazine joins a collection

### Community 145 - "Requirement: Entries table accepts magazines"
Cohesion: 0.33
Nodes (6): Requirement: Entries table accepts magazines, Scenario: Database accepts a magazine only without a status, Scenario: Existing database migrates without loss, Scenario: Foreign keys still bind after the rebuild, Scenario: Fresh and migrated databases share one schema, Scenario: Migration 0003 runs once

### Community 146 - "gate-1-decisions/verification.md"
Cohesion: 0.33
Nodes (5): Diffstat, Layer 1: `PORT=4731 npm run proof:full` green, Layer 2: spec coverage (97 scenarios), Manual checklist, Screenshots

### Community 147 - "tilt.ts"
Cohesion: 0.33
Nodes (3): atRest(), resting, tilt()

### Community 148 - "CREATIVE_ARCHIVE_TEST flag"
Cohesion: 0.40
Nodes (5): CREATIVE_ARCHIVE_TEST flag, Playwright phone + desktop projects, Requirement: E2E projects and isolation, Requirement: Test-only routes, /__test/reset, seed, counts, image routes

### Community 149 - "initials.ts"
Cohesion: 0.60
Nodes (3): graphemes(), initials(), segmenter

## Ambiguous Edges - Review These
- `Copy contract (src/lib/copy.ts)` → `Missing error colour token`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md · relation: conceptually_related_to

## Knowledge Gaps
- **126 isolated node(s):** `$app/tsconfig`, `Card material: flat translucent fill, radius 20-24px, 1px border`, `Chips/filters: ~36px pills with >=44px touch target`, `Gate 2 manual checklist`, `proof:full green (652 passed, 382 vitest tests)` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 989 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Requirement: Mockup photos` connect `Requirement: Mockup photos` to `Build Design Patterns`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Card material: flat translucent fill, radius 20-24px, 1px border`, `Chips/filters: ~36px pills with >=44px touch target` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Polish Audit Findings` be split into smaller, more focused modules?**
  _Cohesion score 0.05297876726448155 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `ref_node_fs`, `Entry Save and Form Parsing`, `Worlds and App Layout`, `entries.ts`, `images.ts`, `anilist.test.ts`, `config.ts`, `lib/types.ts`, `(app)/+layout.svelte`, `E2E Artist and Domain Tests`, `Design Tokens Module`, `Coverflow and Form Submit`, `Shelf.svelte`, `Package Dependencies`, `Gate Workflow`, `initials.ts`, `fake.test.ts`, `Fake Pages and Remote`, `E2E Artist Manual and Delete`, `shell/morph.test.ts`, `index.ts`, `toast.ts`, `index.ts`, `motion.ts`, `Contracts and E2E Isolation Design`, `Archive Proposal and Scope`, `Entries and Status Pill Spec`, `E2E Back Morph Test`, `entries/[id]/+page.svelte`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `ref_node_fs` be split into smaller, more focused modules?**
  _Cohesion score 0.08383838383838384 - nodes in this community are weakly interconnected._
- **Why does `/__mockups/[world]/[scheme] routes` connect `Requirement: Mockup photos` to `CREATIVE_ARCHIVE_TEST flag`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Copy contract (src/lib/copy.ts)` and `Missing error colour token`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._