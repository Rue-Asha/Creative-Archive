# Graph Report - Creative-Archive  (2026-11-05)

## Corpus Check
- 322 files · ~185,490 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .woff2 7, (none) 1, .css 1)

## Summary
- 2081 nodes · 4573 edges · 132 communities (110 shown, 22 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 286 edges (avg confidence: 0.89)
- Token cost: 672,740 input · 0 output

## Community Hubs (Navigation)
- UI Polish Audit Findings
- Entry Type Config and Derive
- Domains and Collection Cards
- Entry Save and Form Parsing
- Worlds and App Layout
- Menus and Dialogs
- Entry Detail Panel
- E2E Count-Up and Globals Tests
- Copy Strings and Delete Flow
- Tilt and Morph Motion
- E2E Artist and Domain Tests
- Safe Fetch Networking
- Server Hooks and Collections
- E2E Cards and Popover Tests
- Mockup Fixtures Data
- Design Tokens Module
- Entry Form Fields
- Coverflow and Form Submit
- AniList and Deezer Providers
- Package Dependencies
- Gate Workflow
- Image Storage with Sharp
- Artist Works and List Config
- Synthetic Mockup Images
- Design System Requirements
- Playwright Config and Packaging Tests
- Test-Only Routes
- App Nav and Buttons
- Fake Pages and Remote
- Drag Scroll Inertia
- Collections Spec
- Entry Hydration and Validation
- E2E Artist Manual and Delete
- Tags and Artist Field
- E2E Autofill Tests
- CI Workflow
- Shared UI Components Spec (archived)
- Add To Collection Popover
- SQLite Database and Migrations
- Autofill Provider Spec
- Harness Spec and Test Flag
- Image Field Upload
- Home Shelves Server
- Entry Detail Route
- Motion and Layout Design Decisions
- Entry Card
- E2E Journey Test
- Influencer Handle Prefill
- Motion Guard Tests
- Link Preview Server
- Contracts and E2E Isolation Design
- Archive Proposal and Scope
- SQL Schema Migrations
- Entries and Status Pill Spec
- E2E Mockups Tests
- Split-Off Changes and Non-Goals
- Domain and Home Page Specs
- Release Spec
- Provider Errors
- Entries Spec
- npm Scripts
- Progress Parsing and Control
- Status Pill Component
- E2E Back Morph Test
- Stock Mockup Photos
- Build Design Patterns
- Artist Matching on Autofill
- Artist Link and Collections Spec
- Domain Lists and Shelves Spec
- Domain Lists Spec
- Images Spec
- Toasts and Write Queue
- E2E Coverflow Test
- Dependabot Config
- Home and Collection Bento Spec
- Test-Mode Fakes and Fetch Errors
- Home Motion Spec
- Artist Link Spec
- Synthetic Photo Script
- Motion Test DOM Fakes
- Deezer Provider Tests
- E2E Harness Learnings
- Agent Instructions and Proof
- Release Runbook
- Release Workflow Steps
- Shared UI Components Spec
- CI and Release Pipeline Spec
- Font Licenses and Preloads
- Release Workflow Permissions
- Autofill Provider Design
- Build Change Flow State
- Autofill Fallback and Image Errors
- Tokens, Fonts and Contrast
- UI Polish Flow State
- OpenSpec Config
- Style Rules Guard
- Mockups Route Guard
- E2E Autofill Pick Test
- E2E Rating Test
- Release Bump Job
- Release Artifact Download
- TypeScript Config
- E2E List Filters Test
- Release Workflow Trigger
- Mockup Routes and Alignment Spec
- Tags and List Queries Spec
- Package Script
- E2E Design and Preview Tests
- Release Homelab Bump Inputs
- Release Check-Tag Job
- Test Flag and E2E Projects
- Mockup Credits Test
- E2E Handles Test
- E2E Home Test
- Release Publish Job
- Harness Declaration Spec
- Release Runbook Spec
- Floating Pill Navigation
- Health Check Route
- Cover Dusk Image
- Health Route Spec
- Migrations Spec
- App Type Declarations
- Artist on Manual Entry
- Entry Detail Requirement
- Unsaved Changes Guard

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 80 edges
2. `open()` - 55 edges
3. `@playwright/test` - 50 edges
4. `vitest` - 50 edges
5. `seed()` - 47 edges
6. `reset()` - 46 edges
7. `calm()` - 43 edges
8. `svelte` - 34 edges
9. `TYPES` - 29 edges
10. `reducedMotion()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Influencer handle prefill handlesFromUrl (S25)` --references--> `handlesFromUrl()`  [EXTRACTED]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md → src/lib/entries/handles.ts
- `Unsaved-changes guard (S26)` --references--> `guardUnsaved()`  [EXTRACTED]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md → src/lib/entries/unsaved.ts
- `Outro aria-hidden pattern (hideOnOutro)` --references--> `hideOnOutro()`  [EXTRACTED]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md → src/lib/motion.ts
- `Image pipeline (sharp -> WebP BLOB, 16 MiB)` --references--> `storeImage()`  [EXTRACTED]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md → src/lib/server/images.ts
- `SSRF guard safeFetch (src/lib/server/net.ts)` --references--> `safeFetch()`  [EXTRACTED]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md → src/lib/server/net.ts

## Import Cycles
- 2-file cycle: `src/lib/server/images.ts -> src/lib/server/remote.ts -> src/lib/server/images.ts`

## Hyperedges (group relationships)
- **Release pipeline: build once, tag, publish, bump Homelab** — claude_package_tarball, docs_release_ci_workflow, docs_release_release_workflow, docs_release_homelab_managment, docs_release_creative_archive_deploy [EXTRACTED 1.00]
- **Self-hosted fonts under SIL OFL 1.1** — static_fonts_bodonimoda_ofl_bodoni_moda, static_fonts_bricolagegrotesque_ofl_bricolage_grotesque, static_fonts_figtree_ofl_figtree, static_fonts_hankengrotesk_ofl_hanken_grotesk, static_fonts_manrope_ofl_manrope, static_fonts_syne_ofl_syne, static_fonts_bodonimoda_ofl_sil_open_font_license [EXTRACTED 1.00]
- **Test-mode infrastructure (flag, routes, fixtures, e2e)** — claude_test_mode_routes, readme_mockups_design_checkpoint, fixtures_mockups_credits_mockup_photos, claude_playwright_e2e_setup [INFERRED 0.85]
- **Safe remote fetch flow (SSRF guard, preview, providers, fake remote)** — openspec_changes_archive_2026_11_01_build_creative_archive_design_ssrf_guard, openspec_changes_archive_2026_11_01_build_creative_archive_design_url_preview, openspec_changes_archive_2026_11_01_build_creative_archive_design_provider_interface, openspec_changes_archive_2026_11_01_build_creative_archive_design_fake_remote, openspec_changes_archive_2026_11_01_build_creative_archive_design_test_mode_seams [EXTRACTED 1.00]
- **World theming: S5 checkpoint, mockups, world pick, tokens** — openspec_changes_archive_2026_11_01_build_creative_archive_scope_design_checkpoint_s5, openspec_changes_archive_2026_11_01_build_creative_archive_tasks_taste_stop, openspec_changes_archive_2026_11_01_build_creative_archive_design_world_pick, openspec_changes_archive_2026_11_01_build_creative_archive_design_worlds, openspec_changes_archive_2026_11_01_build_creative_archive_design_liquid_glass, openspec_changes_archive_2026_11_01_build_creative_archive_design_type_pairings [INFERRED 0.85]
- **OpenSpec change artifacts for build-creative-archive** — openspec_changes_archive_2026_11_01_build_creative_archive_explore_notes_explore_notes_doc, openspec_changes_archive_2026_11_01_build_creative_archive_scope_scope_doc, openspec_changes_archive_2026_11_01_build_creative_archive_proposal_proposal_doc, openspec_changes_archive_2026_11_01_build_creative_archive_design_design_doc, openspec_changes_archive_2026_11_01_build_creative_archive_tasks_tasks_doc, openspec_changes_archive_2026_11_01_build_creative_archive_verification_verification_doc [INFERRED 0.95]
- **Test-mode isolation: flag gates fake provider, fake remote, test routes and mockups** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_creative_archive_test_flag, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_providerfor_getremote, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_test_routes, openspec_changes_archive_2026_11_01_build_creative_archive_specs_design_system_spec_mockup_routes, openspec_changes_archive_2026_11_01_build_creative_archive_specs_autofill_spec_provider_interface [EXTRACTED 1.00]
- **Image pipeline: safeFetch download, sharp WebP conversion, SQLite BLOB, /images route** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_link_preview_spec_safefetch, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_storeimage, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_webp_sqlite_blob, openspec_changes_archive_2026_11_01_build_creative_archive_specs_images_spec_images_route, openspec_changes_archive_2026_11_01_build_creative_archive_specs_settings_spec_sethero_removehero [INFERRED 0.85]
- **CI to release flow: tarball built once in CI, published by release, pinned in homelab** — openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_ci_yml, openspec_changes_archive_2026_11_01_build_creative_archive_specs_harness_spec_release_tarball, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_release_yml, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_bump_pin, openspec_changes_archive_2026_11_01_build_creative_archive_specs_release_spec_homelab_managment [EXTRACTED 1.00]
- **Card-detail morph fix (forward shape, back landing, reveal hold)** — openspec_changes_archive_2026_11_02_ui_polish_scope_s3, openspec_changes_archive_2026_11_02_ui_polish_scope_s4, openspec_changes_archive_2026_11_02_ui_polish_design_morph_shape_via_pseudo_elements, openspec_changes_archive_2026_11_02_ui_polish_design_forward_morph_unhover, openspec_changes_archive_2026_11_02_ui_polish_design_back_morph_module_memory, openspec_changes_archive_2026_11_02_ui_polish_design_reveal_restoring_flag, openspec_changes_archive_2026_11_02_ui_polish_specs_motion_spec_page_transitions, openspec_changes_archive_2026_11_02_ui_polish_specs_motion_spec_data_morph_fade, openspec_changes_archive_2026_11_02_ui_polish_tasks_u3 [INFERRED 0.95]
- **Smooth fades and glows via eased alpha mask tokens** — openspec_changes_archive_2026_11_02_ui_polish_design_fade_down_token, openspec_changes_archive_2026_11_02_ui_polish_design_glow_mask_token, openspec_changes_archive_2026_11_02_ui_polish_design_fades_are_alpha_masks, openspec_changes_archive_2026_11_02_ui_polish_design_glow_from_one_cover, openspec_changes_archive_2026_11_02_ui_polish_design_ambient_fixed_layer, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_smooth_fades_glows, openspec_changes_archive_2026_11_02_ui_polish_audit_hero_fade_crease, openspec_changes_archive_2026_11_02_ui_polish_audit_patchy_glows [INFERRED 0.85]
- **Static style guards (colour and font-size bans) with migrations** — openspec_changes_archive_2026_11_02_ui_polish_design_style_rules_test, openspec_changes_archive_2026_11_02_ui_polish_design_motion_test_guard, openspec_changes_archive_2026_11_02_ui_polish_design_guards_land_with_migrations, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_tokens_and_worlds, openspec_changes_archive_2026_11_02_ui_polish_specs_design_system_spec_type_scale, openspec_changes_archive_2026_11_02_ui_polish_tasks_u1, openspec_changes_archive_2026_11_02_ui_polish_tasks_u7 [INFERRED 0.85]
- **Autofill providers implementing the Provider interface** — openspec_specs_autofill_spec_provider, openspec_specs_autofill_spec_deezer_provider, openspec_specs_autofill_spec_anilist_provider, openspec_specs_autofill_spec_open_library_provider [EXTRACTED 1.00]
- **User-supplied URL downloads through safeFetch into WebP image storage** — openspec_specs_link_preview_spec_safefetch, openspec_specs_images_spec_storeimagefromurl, openspec_specs_images_spec_storeimage, openspec_specs_autofill_spec_search_pick_and_prefill, openspec_specs_link_preview_spec_open_graph_preview [INFERRED 0.85]
- **Optimistic status/rating/progress saves with toast-on-failure** — openspec_specs_tracking_spec_setstatus, openspec_specs_tracking_spec_setrating, openspec_specs_tracking_spec_progress_functions, openspec_specs_tracking_spec_save_queue, openspec_specs_motion_spec_toast [INFERRED 0.85]

## Communities (132 total, 22 thin omitted)

### Community 0 - "UI Polish Audit Findings"
Cohesion: 0.05
Nodes (99): Finding 18: ambient background-attachment fixed repaints/ignored on iOS, Finding 1: back morph lands on hidden unrevealed card, Card-detail View Transition analysis (wrong shelf copy, aspect stretch), Finding 12: detail cover 300px on phone pushes title below fold, Finding 11: bento features empty first collection, Finding 16: global :focus-visible forces pill radius, Finding 3: forward morph starts from hovered/tilted card, Finding 5: hero fades end with a visible crease (2-stop masks) (+91 more)

### Community 1 - "Entry Type Config and Derive"
Cohesion: 0.08
Nodes (47): TypeConfig, atTotal(), domainOf(), isWardrobe(), labelSet(), listHref(), progressLabel(), ratingFromX2() (+39 more)

### Community 2 - "Domains and Collection Cards"
Cohesion: 0.06
Nodes (33): { collection }, Domain, DOMAIN_LABEL, DOMAINS, { domain }, toSearchParams(), { collections, countAction }, cover (+25 more)

### Community 3 - "Entry Save and Form Parsing"
Cohesion: 0.10
Nodes (45): artistToEnsure(), entryInputFromForm(), HANDLES, isHttpUrl(), Resolved, resolveImage(), saveFromForm(), SaveResult (+37 more)

### Community 4 - "Worlds and App Layout"
Cohesion: 0.07
Nodes (35): World, WORLD_NAMES, localError, message, pending, { world, label, image, error = '' }, activeSection(), Section (+27 more)

### Community 5 - "Menus and Dialogs"
Cohesion: 0.07
Nodes (31): close(), { domain }, menu, menuKeys(), open, outside(), root, { onkeep, ondiscard } (+23 more)

### Community 6 - "Entry Detail Panel"
Cohesion: 0.07
Nodes (28): svelte, config, {
		entry,
		controls,
		actions
	}, HANDLE_LABELS, Row, rows, attach, dismiss (+20 more)

### Community 7 - "E2E Count-Up and Globals Tests"
Cohesion: 0.07
Nodes (15): Samples, twelveInProgress(), seedChrome(), reset(), seed(), albums, entries, setup() (+7 more)

### Community 8 - "Copy Strings and Delete Flow"
Cohesion: 0.07
Nodes (29): COPY, MARK_DONE, STATUS_LABELS, close(), deleting, dialog, keys(), open (+21 more)

### Community 9 - "Tilt and Morph Motion"
Cohesion: 0.09
Nodes (24): atRest(), resting, coverName(), holdReveals(), inViewport(), backCover(), cardCover(), covers() (+16 more)

### Community 10 - "E2E Artist and Domain Tests"
Cohesion: 0.09
Nodes (8): slugs, TABS, calm(), ITEMS, @playwright/test, accents, schemes, WORLDS

### Community 11 - "Safe Fetch Networking"
Cohesion: 0.11
Nodes (23): FetchError, DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress(), parseIPv4(), parseIPv6(), quad(), readBody() (+15 more)

### Community 12 - "Server Hooks and Collections"
Cohesion: 0.15
Nodes (27): init(), count(), addToCollection(), collage(), collectionsOf(), createCollection(), deleteCollection(), getCollection() (+19 more)

### Community 13 - "E2E Cards and Popover Tests"
Cohesion: 0.09
Nodes (12): card(), fits(), inProgress(), inside(), transformOf(), csrf, countSaves(), editProgress() (+4 more)

### Community 14 - "Mockup Fixtures Data"
Cohesion: 0.08
Nodes (26): animanga, books, collagePhotos, collageSrc(), domains, fashion, home, MockDetail (+18 more)

### Community 15 - "Design Tokens Module"
Cohesion: 0.09
Nodes (28): accent(), ACCENT_TOKENS, AccentSet, AccentToken, FONT_TOKENS, fontLabels, FontToken, glassText (+20 more)

### Community 16 - "Entry Form Fields"
Cohesion: 0.09
Nodes (23): FieldDef, artistId, artistName, dismissed, fields, imagePicked, imageRemoved, initialFields() (+15 more)

### Community 17 - "Coverflow and Form Submit"
Cohesion: 0.11
Nodes (21): submit(), cancel(), click(), coverflowState(), current, dragPosition(), dx, { entries } (+13 more)

### Community 18 - "AniList and Deezer Providers"
Cohesion: 0.16
Nodes (17): AlMedia, createAniList(), DzAlbum, DzArtist, DzTrack, CANNED, fakeProviders, FRANK (+9 more)

### Community 19 - "Package Dependencies"
Cohesion: 0.09
Nodes (25): devDependencies, @playwright/test@^1.64.0, svelte@^5.57.2, svelte-check@^4.7.6, @sveltejs/adapter-node@^6.0.0, @sveltejs/kit@^3.0.1, @sveltejs/vite-plugin-svelte@^7.3.1, @types/node@^26.6.5 (+17 more)

### Community 20 - "Gate Workflow"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 21 - "Image Storage with Sharp"
Cohesion: 0.14
Nodes (17): dependencies, sharp@^0.35.5, sharp, ImageError, convert(), downscale(), FORMATS, getImage() (+9 more)

### Community 22 - "Artist Works and List Config"
Cohesion: 0.12
Nodes (19): { works }, altTitle, FieldInput, ListDef, LISTS, media, plain, siteFields (+11 more)

### Community 23 - "Synthetic Mockup Images"
Cohesion: 0.11
Nodes (23): Books Hero Mockup Photo, Books Domain Hero Image, Vintage Books on Wooden Shelf (warm tone), Cover Ember Mockup Image, Square cover-art placeholder (1000x1000), Ember gradient: dark brown to orange with warm yellow bloom (grain), Cover Moss Mockup Image, Square cover-art placeholder (1000x1000) (+15 more)

### Community 24 - "Design System Requirements"
Cohesion: 0.11
Nodes (21): design-system Specification, Requirement: Chrome cursor and focus rings, Requirement: Consistent control styles, --fade-down / --glow-mask eased masks, Requirement: Fonts, Requirement: Mockups and the world checkpoint, Shared .select style, Requirement: Smooth fades and glows (+13 more)

### Community 25 - "Playwright Config and Packaging Tests"
Cohesion: 0.12
Nodes (6): db, port, { version }, entry, dir, loadMigrations()

### Community 26 - "Test-Only Routes"
Cohesion: 0.21
Nodes (15): @sveltejs/kit, dataTables(), resetDb(), requireTestFlag(), SeedInput, testImageNamed(), GET(), GET() (+7 more)

### Community 27 - "App Nav and Buttons"
Cohesion: 0.11
Nodes (17): current, items, { section }, {
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
	}, Props, withArrow, IconName, {
		name,
		size = 20,
		stroke = 1.6,
		filled = false,
		label
	} (+9 more)

### Community 28 - "Fake Pages and Remote"
Cohesion: 0.13
Nodes (13): vitest, FAKE_PAGES, fakeRemote, parse(), MEDIA, providerFor(), charsetOf(), decode() (+5 more)

### Community 29 - "Drag Scroll Inertia"
Cohesion: 0.11
Nodes (13): dragScroll(), up(), inertiaSteps(), canNext, canPrev, cover, shape, { shelf, accent, countAction } (+5 more)

### Community 30 - "Collections Spec"
Cohesion: 0.13
Nodes (21): collections Specification, Add to collection popover, Collection collage (first three images), Requirement: Collection store, createCollection / addToCollection / deleteCollection / renameCollection / getCollection, Requirement: Collections pages and the add popover, Shelves view grouped by status, Requirement: Delete entries (+13 more)

### Community 31 - "Entry Hydration and Validation"
Cohesion: 0.21
Nodes (18): clampProgress(), ValidationError, hydrate(), loadTags(), nullable(), rowToEntry(), load(), lookup() (+10 more)

### Community 32 - "E2E Artist Manual and Delete"
Cohesion: 0.11
Nodes (5): counts(), photo(), brand(), upload(), TABLES

### Community 33 - "Tags and Artist Field"
Cohesion: 0.12
Nodes (13): active, {
		artists,
		name = $bindable(),
		id = $bindable(),
		ondirty
	}, choose(), input, matches, onKeydown(), open, shown (+5 more)

### Community 34 - "E2E Autofill Tests"
Cohesion: 0.15
Nodes (11): addByPick(), addManually(), offersManual(), searchbox(), open(), scrolled(), transform(), paste() (+3 more)

### Community 35 - "CI Workflow"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 36 - "Shared UI Components Spec (archived)"
Cohesion: 0.14
Nodes (18): Card (Swap pattern), ImagePlaceholder / initials, Requirement: Shared components, StarRating (half stars), StatusPill (split pill), Requirement: Entry detail, Requirement: Placeholder for entries without image, motion Specification (+10 more)

### Community 37 - "Add To Collection Popover"
Cohesion: 0.14
Nodes (16): close(), { collections, memberOf }, create(), creating, enqueue, error, flip(), keys() (+8 more)

### Community 38 - "SQLite Database and Migrations"
Cohesion: 0.20
Nodes (11): closeDb(), migrate(), Migration, openDb(), getHeroes(), removeHero(), setHero(), deleteImage() (+3 more)

### Community 39 - "Autofill Provider Spec"
Cohesion: 0.16
Nodes (16): AniList GraphQL provider (anime, manga), Deezer provider (albums, EPs, artists, tracks), Open Library provider (books), Provider interface, Requirement: Provider interface and parsers, ProviderError (failed, timeout), SearchResult, providerFor / getRemote (+8 more)

### Community 40 - "Harness Spec and Test Flag"
Cohesion: 0.13
Nodes (18): fixtures/mockups/CREDITS.txt (CC0 Openverse photos), Requirement: Mockup photos, harness Specification, CREATIVE_ARCHIVE_TEST=1 flag, Requirement: Database and migrations, Requirement: E2E projects and isolation, Requirement: Harness declaration, Requirement: Health route (+10 more)

### Community 41 - "Image Field Upload"
Cohesion: 0.15
Nodes (14): forget(), localError, message, MIME, objectUrl, onFile(), reject(), remove() (+6 more)

### Community 42 - "Home Shelves Server"
Cohesion: 0.28
Nodes (12): coverflowEntries(), domainShelves(), homeShelves(), hydrate(), inProgress(), ofTypes(), progressShelf(), recent() (+4 more)

### Community 43 - "Entry Detail Route"
Cohesion: 0.14
Nodes (16): config, { data }, enqueue, entry, finishing, local, moveProgress(), progress (+8 more)

### Community 45 - "Entry Card"
Cohesion: 0.12
Nodes (13): chip, current, enqueue, { entry, shape }, key, KIND_LABEL, local, meta (+5 more)

### Community 46 - "E2E Journey Test"
Cohesion: 0.23
Nodes (15): addByPick(), album(), animanga(), cells(), group(), homeAndWorlds(), manyAlbums(), morphAndReveal() (+7 more)

### Community 47 - "Influencer Handle Prefill"
Cohesion: 0.20
Nodes (13): handlesFromUrl(), host(), on(), profile(), fill(), image, invalid, isHttpUrl() (+5 more)

### Community 48 - "Motion Guard Tests"
Cohesion: 0.13
Nodes (12): animatedProperties(), Entry, files, inlineSizeExceptions, node, observers, primitives, sourceFiles() (+4 more)

### Community 49 - "Link Preview Server"
Cohesion: 0.24
Nodes (13): attributes(), decode(), downloadAsWebp(), NAMED, NOT_A_URL, parsePreview(), Preview, readPreview() (+5 more)

### Community 52 - "SQL Schema Migrations"
Cohesion: 0.25
Nodes (12): images, collection_entries, collections, entries, entries_external, entries_type_created, entries_updated, entry_tags (+4 more)

### Community 53 - "Entries and Status Pill Spec"
Cohesion: 0.16
Nodes (14): StatusPill (split pill), createEntry, entries table, EntryInput, Requirement: Brand and shop kinds, Requirement: Create entries, Requirement: Generic entry model and type config, TYPES per-type config (+6 more)

### Community 54 - "E2E Mockups Tests"
Cohesion: 0.15
Nodes (4): schemes, tokens, worlds, files

### Community 55 - "Split-Off Changes and Non-Goals"
Cohesion: 0.17
Nodes (3): creative-archive-deploy (split-off change), rediscovery (split-off change), Verification round 3b (verified-at 6ace36b)

### Community 56 - "Domain and Home Page Specs"
Cohesion: 0.18
Nodes (13): domain-pages Specification, Domain hero (photo or world gradient), Requirement: Domain landing pages, Requirement: Domain shelves, domainShelves, home Specification, coverflowEntries (20 newest with images), Empty-archive welcome (Add your first ...) (+5 more)

### Community 57 - "Release Spec"
Cohesion: 0.21
Nodes (12): release Specification, Rue-Asha/ci bump-pin.yml, Requirement: CI workflow, Cooking-Hub (reference repo for pins, ruleset, release), creative-archive-deploy change, Requirement: Dependabot, docs/release.md runbook, Homelab-Managment (+4 more)

### Community 58 - "Provider Errors"
Cohesion: 0.24
Nodes (4): anime(), ProviderError, search(), GET()

### Community 59 - "Entries Spec"
Cohesion: 0.23
Nodes (12): entries Specification, Requirement: Brand and shop kinds, Requirement: Create entries, createEntry, deleteEntry, Discard changes? dialog + beforeunload prompt, Requirement: Edit entries, entries table (+4 more)

### Community 60 - "npm Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, package, prepare, preview, proof (+4 more)

### Community 61 - "Progress Parsing and Control"
Cohesion: 0.24
Nodes (8): parseProgress(), atEnd, editing, finish(), keydown(), {
		label,
		current,
		total,
		onstep,
		onset,
		tone = 'surface'
	}, leave(), valueButton

### Community 62 - "Status Pill Component"
Cohesion: 0.21
Nodes (10): choose(), close(), current, {
		label,
		options,
		value,
		onchange,
		disabled = false
	}, menu, menuKeys(), open, outside() (+2 more)

### Community 63 - "E2E Back Morph Test"
Cohesion: 0.22
Nodes (8): back(), Box, Capture, Item, openCard(), Pseudo, watched(), Window

### Community 64 - "Stock Mockup Photos"
Cohesion: 0.18
Nodes (11): Mockup photo fixtures (CC0 credits), Openverse CC0 StockSnap source, Music Hero Mockup Photo, Music domain hero image, Concert photo: performer on stage under white spotlights, crowd silhouettes holding up phones, blue haze, Neon Mockup Photo, Neon-lit cover/hero test photo, Night street in Tokyo: Yodobashi Camera neon signs (orange/cyan), wet pavement, pedestrians with clear umbrellas (+3 more)

### Community 66 - "Artist Matching on Autofill"
Cohesion: 0.22
Nodes (11): "Add artist" checkbox, ensureArtist, Requirement: Artist matching on autofill, AniList GraphQL provider (anime, manga), Deezer provider (albums, artists, tracks), Recorded provider JSON fixtures, Open Library provider (books), Provider interface (+3 more)

### Community 67 - "Artist Link and Collections Spec"
Cohesion: 0.20
Nodes (10): artistId / artistName fields, Requirement: Album and song link to an artist, "Add to collection" popover, createCollection / addToCollection / deleteCollection / renameCollection, Requirement: Collection store, Requirement: Collections pages and the add popover, deleteEntry, Requirement: Delete entries (+2 more)

### Community 68 - "Domain Lists and Shelves Spec"
Cohesion: 0.18
Nodes (11): Requirement: Domain list pages, Shelves view grouped by status, toSearchParams / fromSearchParams, domainShelves, Requirement: Domain landing pages, Requirement: Domain shelves, Sub-type tabs per domain, typeBySlug / LISTS (+3 more)

### Community 69 - "Domain Lists Spec"
Cohesion: 0.22
Nodes (10): domain-lists Specification, Requirement: Domain list pages, listEntries, Requirement: Per-type list queries, toSearchParams / fromSearchParams (filter state in URL), typeBySlug / LISTS, tags Specification, Requirement: Global tags with Unicode-aware dedupe (+2 more)

### Community 70 - "Images Spec"
Cohesion: 0.24
Nodes (11): images Specification, Requirement: Image in the entry form, Requirement: Image storage, ImageError (not-image, too-large), /images/[id] route (immutable cache), storeImage, storeImageFromUrl, settings Specification (+3 more)

### Community 71 - "Toasts and Write Queue"
Cohesion: 0.27
Nodes (8): createToaster(), attach(), dismiss(), flush(), toast(), write(), TOAST_MS, createWriteQueue()

### Community 72 - "E2E Coverflow Test"
Cohesion: 0.33
Nodes (7): active(), counter(), flow(), next(), prev(), rotation(), swipeLeft()

### Community 73 - "Dependabot Config"
Cohesion: 0.20
Nodes (9): dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem, schedule (+1 more)

### Community 74 - "Home and Collection Bento Spec"
Cohesion: 0.20
Nodes (10): Collection collage (first three images), Requirement: Edit entries, updateEntry, Collections bento, Empty-archive welcome state, Requirement: Home page, Requirement: Image in the entry form, Requirement: Hero photo store (+2 more)

### Community 75 - "Test-Mode Fakes and Fetch Errors"
Cohesion: 0.20
Nodes (10): providerFor / getRemote, Requirement: Test-mode fakes, allowAddresses test exemption (127.0.0.2), FetchError (scheme, invalid-url, private-address, redirects, timeout, too-large), handlesFromUrl, parsePreview, Requirement: Influencer handle prefill, Requirement: Open Graph preview (+2 more)

### Community 76 - "Home Motion Spec"
Cohesion: 0.20
Nodes (9): coverflowEntries, Coverflow (coverflowState), inertiaSteps drag-scroll inertia, morphTarget, parallaxOffset, Requirement: Card interaction, Requirement: Page transitions, Requirement: Scroll motion (+1 more)

### Community 77 - "Artist Link Spec"
Cohesion: 0.24
Nodes (10): artist-link Specification, Requirement: Album and song link to an artist, Requirement: Artist matching on autofill, Requirement: Artist on manual entry, artistId / artistName fields, ensureArtist, autofill Specification, Already in your archive / Add manually fallback (+2 more)

### Community 78 - "Synthetic Photo Script"
Cohesion: 0.20
Nodes (7): [a, b], dir, height, [name, w, h, from = '#2a2622', to = '#c9b9a3', bloom], out, pixels, width

### Community 80 - "Deezer Provider Tests"
Cohesion: 0.20
Nodes (3): createDeezer(), years(), yearOf()

### Community 81 - "E2E Harness Learnings"
Cohesion: 0.31
Nodes (6): calm(page) reduced-motion test helper, Playwright e2e setup (phone/desktop projects), CREATIVE_ARCHIVE_TEST /__test/* routes and fakes, Homelab creative-archive-deploy live change, Production server environment variables, /__mockups design checkpoint

### Community 82 - "Agent Instructions and Proof"
Cohesion: 0.25
Nodes (6): Creative Archive (agent instructions), OpenSpec capability specs, Proof harness (proof / proof:full), Creative Archive README, GET /healthz, Node.js >= 22.18 for node:sqlite

### Community 83 - "Release Runbook"
Cohesion: 0.36
Nodes (9): npm run package release tarball, HOMELAB_BUMP_APP_ID / HOMELAB_BUMP_APP_KEY secrets, Register repo on check01 self-hosted runner, ci.yml push run and release-tarball artifact, Cutting a release (tag-based), Homelab-Managment repo, main branch ruleset (Cooking-Hub shape), release.yml (check-tag, publish, bump) (+1 more)

### Community 84 - "Release Workflow Steps"
Cohesion: 0.31
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 87 - "Shared UI Components Spec"
Cohesion: 0.22
Nodes (9): Card (Swap pattern), ImagePlaceholder (accent tint + initials), Requirement: Shared components, StarRating (half stars), src/lib/ui shared components, Requirement: Placeholder for entries without image, Requirement: Micro-interactions, Requirement: Rating (+1 more)

### Community 88 - "CI and Release Pipeline Spec"
Cohesion: 0.25
Nodes (9): dist/creative-archive-<version>.tgz + .sha256, ci.yml / gate.yml, Cooking-Hub (reference repo), release.yml (check-tag, publish, bump), Requirement: CI workflow, Requirement: Dependabot, Requirement: Release workflow, Requirement: Version 0.1.0 (+1 more)

### Community 89 - "Font Licenses and Preloads"
Cohesion: 0.25
Nodes (9): Bricolage Grotesque + Figtree font preloads, app.html document shell, Bodoni Moda font license, SIL Open Font License 1.1, Bricolage Grotesque font license, Figtree font license, Hanken Grotesk font license, Manrope font license (+1 more)

### Community 91 - "Release Workflow Permissions"
Cohesion: 0.29
Nodes (8): permissions, permissions, permissions, actions, attestations, contents, id-token, permissions

### Community 92 - "Autofill Provider Design"
Cohesion: 0.32
Nodes (3): AniList GraphQL, Deezer API, Open Library

### Community 93 - "Build Change Flow State"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 94 - "Autofill Fallback and Image Errors"
Cohesion: 0.25
Nodes (8): "Add manually" fallback, DuplicateError, Requirement: Search, pick and prefill, ImageError (not-image / too-large), GET /images/[id] immutable cache, Requirement: Image storage, storeImage / storeImageFromUrl, WebP BLOB in SQLite via sharp

### Community 95 - "Tokens, Fonts and Contrast"
Cohesion: 0.32
Nodes (7): Requirement: Fonts, Requirement: Tokens and worlds, Design tokens (tokens.css / tokens.ts), Type pairings a/b/c (Bricolage Grotesque + Figtree default), World attributes data-scheme / data-accent / data-font, worlds.ts world map (WORLDS / FONT), Requirement: Worlds per screen

### Community 96 - "UI Polish Flow State"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 97 - "OpenSpec Config"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 98 - "Style Rules Guard"
Cohesion: 0.29
Nodes (7): declarationValues(), files, namedColours, namedColoursIn(), sourceFiles(), srcDir, stylesDir

### Community 99 - "Mockups Route Guard"
Cohesion: 0.36
Nodes (5): load(), photo(), run(), GET(), photosDir()

### Community 100 - "E2E Autofill Pick Test"
Cohesion: 0.38
Nodes (3): pick(), results(), searchbox()

### Community 101 - "E2E Rating Test"
Cohesion: 0.38
Nodes (4): fills(), slider(), stars(), Window

### Community 102 - "Release Bump Job"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 103 - "Release Artifact Download"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 104 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 105 - "E2E List Filters Test"
Cohesion: 0.47
Nodes (3): bar(), chip(), select()

### Community 106 - "Release Workflow Trigger"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 107 - "Mockup Routes and Alignment Spec"
Cohesion: 0.33
Nodes (6): fixtures/mockups/CREDITS.txt, /__mockups/[world]/[scheme] routes, Requirement: Mockup photos, Requirement: Mockups and the world checkpoint, Requirement: Package script, Requirement: One alignment rule and desktop width

### Community 108 - "Tags and List Queries Spec"
Cohesion: 0.40
Nodes (6): listEntries, Requirement: Per-type list queries, Requirement: Global tags with Unicode-aware dedupe, Requirement: Tag input, setEntryTags / listTags, Unicode tag fold key

### Community 109 - "Package Script"
Cohesion: 0.33
Nodes (4): hash, root, staging, { version }

### Community 112 - "Release Homelab Bump Inputs"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 113 - "Release Check-Tag Job"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 115 - "Test Flag and E2E Projects"
Cohesion: 0.40
Nodes (5): CREATIVE_ARCHIVE_TEST flag, Playwright phone + desktop projects, Requirement: E2E projects and isolation, Requirement: Test-only routes, /__test/reset, seed, counts, image routes

### Community 116 - "Mockup Credits Test"
Cohesion: 0.40
Nodes (3): dir, files(), root

### Community 119 - "Release Publish Job"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 120 - "Harness Declaration Spec"
Cohesion: 0.50
Nodes (4): CLAUDE.md ## Harness section, npm run proof / proof:full, Requirement: Harness declaration, Requirement: Proof commands

### Community 121 - "Release Runbook Spec"
Cohesion: 0.50
Nodes (4): Rue-Asha/ci bump-pin.yml, Homelab-Managment (creative-archive-deploy), docs/release.md, Requirement: Release runbook

### Community 122 - "Floating Pill Navigation"
Cohesion: 0.67
Nodes (3): activeSection, Floating glass pill nav, Requirement: Navigation

## Ambiguous Edges - Review These
- `Copy contract (src/lib/copy.ts)` → `Missing error colour token`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-01-build-creative-archive/design.md · relation: conceptually_related_to

## Knowledge Gaps
- **119 isolated node(s):** `$app/tsconfig`, `Node.js >= 22.18 for node:sqlite`, `GET /healthz`, `app.html document shell`, `Bodoni Moda font license` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 821 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Requirement: Mockup photos` connect `Mockup Routes and Alignment Spec` to `Synthetic Photo Script`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Node.js >= 22.18 for node:sqlite`, `GET /healthz` to the rest of the system?**
  _119 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Polish Audit Findings` be split into smaller, more focused modules?**
  _Cohesion score 0.05297876726448155 - nodes in this community are weakly interconnected._
- **Why does `Requirement: Mockup photos` connect `Harness Spec and Test Flag` to `Design System Requirements`, `Synthetic Photo Script`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `Entry Type Config and Derive` be split into smaller, more focused modules?**
  _Cohesion score 0.07948568088836938 - nodes in this community are weakly interconnected._
- **Why does `design-system Specification` connect `Design System Requirements` to `Harness Spec and Test Flag`, `Shared UI Components Spec (archived)`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Copy contract (src/lib/copy.ts)` and `Missing error colour token`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._