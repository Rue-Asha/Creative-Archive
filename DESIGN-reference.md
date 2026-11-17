# Design fingerprint: reference

The exact values and snippets behind `DESIGN.md`: full token tables, the screen skeleton and the markup of every signature part, per-primitive detail, motion tokens, the full worst-case list, the icon spec, the full accessibility, voice and consumption rules, and the full token frontmatter. `DESIGN.md` holds the rules and is what `impeccable context` loads, so it stays inside a tested size budget (`tests/design-budget.test.mjs`); detail that would push it over lands here. Read this file when you need a value or a snippet. Both are vendored to the app root by `scripts/sync.sh` and drift-checked. `tokens.css` is the source of every value here; if the two ever disagree, `tokens.css` wins and this file is the bug.

## Colour tokens

### Surfaces

| Role | Token | Use |
|---|---|---|
| Page | `--surface-page` | `body` behind everything |
| Backdrop | `--surface-backdrop`, `--surface-field`, `--veil-backdrop` | Behind the frame; the field for Notes |
| Frame | `--surface-frame`, `--surface-frame-strong` | The frame; `-strong` over a colour field |
| Glass | `--surface-glass` | Chrome on the frame or a scrim: nav capsule, rail, glass buttons |
| Glass, strong | `--surface-glass-strong` | Chrome over bare photo: seg bar, facts card, secondary buttons |
| Card | `--surface-card` | Reading surfaces over the photo (near-opaque) |
| Raised | `--surface-raised` | Fields, menus, solid cards, button hover |
| Sunken | `--surface-sunken` | Rows and tiles inside a card, callouts |
| Tint | `--surface-tint`, `--surface-tint-strong` | Quiet fills (`.kicker-more`, disabled, plate initials) |
| Hover | `--surface-hover` | Hover on glass items and rail items |
| Control on solid | `--surface-control-solid`, `--surface-control-solid-hover` | Secondary buttons inside `[data-surface="solid"]` |
| Cover plate | `--surface-plate-1`, `--surface-plate-2`, `--surface-plate-3`, `--surface-inverse-raised`, `--edge-plate`, `--edge-plate-on-inverse` | Initials placeholder for an entry with no image; the title picks the plate, so it keeps it everywhere |
| Inverse | `--surface-inverse`, `--surface-inverse-raised`, `--surface-inverse-hover`, `--surface-inverse-tint`, `--surface-inverse-tint-strong` | Charcoal: the key-facts card, current item, primary pill, toasts, code block. In a world, the world's night (World sets below) |
| Scrim | `--scrim`, `--scrim-strong`, `--scrim-text`, `--scrim-soft`, `--scrim-clear` | Warm haze for text on a photo; `--scrim-text` is the floor under any line. On the night stage the world's veil (Night stage below) |

### Ink, edges and states

| Role | Token | Use |
|---|---|---|
| Ink | `--ink`, `--ink-secondary`, `--ink-muted` | Text; muted only for placeholders and tertiary text on solid surfaces |
| Ink on inverse | `--ink-on-inverse`, `--ink-on-inverse-secondary`, `--ink-on-inverse-muted` | Text on charcoal |
| Control edge | `--edge-control`, `--edge-control-on-inverse` | The 3:1 boundary of fields, steppers, outlined buttons |
| Decorative | `--hairline`, `--hairline-on-inverse`, `--rim` | Dividers and the glass rim; never carry meaning alone |
| Focus | `--focus-ring` (= `--ink`), `--focus-ring-on-inverse` (white), `--focus-width` 3px, `--focus-offset` 2px | See Accessibility below |
| Selection | `--selection` (= `--accent-soft`), `--selection-ink`, `--selection-on-inverse` | Text selection |
| Danger | `--danger`, `--danger-soft`, `--danger-on-inverse` | Errors, destructive buttons, late due labels |
| Disabled | `--disabled-opacity` (0.55) | Disabled controls fade as a whole |
| Scroll | `--scroll-shade`, `--scroll-shade-on-inverse`, `--scroll-fade` (56px), `--scroll-cue-size` (7px) | Edge shade of sideways scrollers (tables, code, phone rail); the fade and chevron of a glass bar that scrolls |

### Accent sets

`<html data-accent="…">` picks a set; without it rosemary applies (a stale name such as `berry`, `cobalt` or `moss` is unset, so it falls back to rosemary too). `--accent-ink` is `#FFFFFF` in every set.

| `data-accent` | `--accent` | `--accent-text` | `--accent-soft` | `--accent-on-inverse` | App (confirmed at each app's gate 5) |
|---|---|---|---|---|---|
| `rosemary` (default) | `#527752` | `#3D5A3E` | `#D8EDD8` | `#759475` | Rues-Cooking-Hub |
| `slate` | `#626D92` | `#4B5370` | `#DDE5FF` | `#838CAC` | Notes-Archive |
| `heather` | `#7B5890` | `#5D426E` | `#EEE0F8` | `#9F81B1` | Creative-Archive |
| `lagoon` | `#007C8E` | `#005C6A` | `#D3EDF0` | `#3899A7` | Life-Manager |

| Role | Use |
|---|---|
| `--accent` | Fills (accent fills, rating fill, selected ring), the accent word at display size. As text only at large sizes |
| `--accent-ink` | Text and icons on `--accent` |
| `--accent-text` | The accent as text below display size, on light grounds |
| `--accent-soft` | Selection, current rows; `--accent-text` and `--ink` read on it |
| `--accent-on-inverse` | The accent on charcoal (the rating line, `--syntax-keyword`) |
| `--surface-selected` + `--ring-selected` | A picked option in a set of toggles: tint inside an accent ring, plus a filled check |

### World sets (2.1.0)

An app with worlds sets `data-world="…"` on `.app` (any element works; the tokens follow the attribute). Each world defines eight tokens; the four shared mappings below apply in every world. No `data-world` (Creative's Home) keeps charcoal and the light stage.

| `data-world` | `--world-night` | `--world-night-raised` | `--world-night-hover` | `--world-glow` | `--world-veil-strong` / `--world-veil` / `--world-veil-soft` (alpha of the night) |
|---|---|---|---|---|---|
| `music` | `#2A191C` | `#443537` | `#190F11` | `#F2A3AF` | 0.84 / 0.76 / 0.34 |
| `animanga` | `#11142B` | `#2E3044` | `#0A0C1A` | `#AEB4FF` | 0.90 / 0.84 / 0.46 |
| `books` | `#16252A` | `#323F44` | `#0D1619` | `#8FD0BD` | 0.84 / 0.76 / 0.32 |
| `fashion` | `#29211D` | `#433C38` | `#191411` | `#D6C7BC` | 0.84 / 0.76 / 0.32 |

`--world-veil-clear` is the night at 0. In every world: `--surface-inverse` = `--world-night`, `--surface-inverse-raised` = `--world-night-raised`, `--surface-inverse-hover` = `--world-night-hover`, `--accent-on-inverse` = `--world-glow`. So every charcoal surface in the world (the current pill in nav, rail and dock, the primary pill, the dock add button, the key-facts card, the rating card, menus' checked item, toasts) takes the world's night, and the rating line takes its glow. The accent roles on light (`--accent`, `--accent-text`, `--accent-soft`) stay the app's: heather in Creative.

**Veil strength.** `--world-veil` is the floor under every line of type on the night stage; the contrast check lays it over a white pixel (the worst under light type). The floor that keeps `--ink-on-inverse-secondary` at 4.5:1 is about 0.72 in every world; Books and Fashion (light library and hanger photos) sit near it so the photo stays bright, Music a step deeper, Animanga (a neon night photo) deep for the mood. `-strong` starts the wide haze at the frame edge; `-soft` and `-clear` fade it out at the light scrim's stops.

### Content palettes (not UI colour)

- **Text colours** (Notes' text-colour mark, stored by name): `--text-stone`, `--text-clay`, `--text-ochre`, `--text-moss`, `--text-sea`, `--text-plum`. Each keeps 4.5:1 on the editor card and a callout.
- **Aspect colours** (Life-Manager, 8, stored by name): `--aspect-sage`, `--aspect-sky`, `--aspect-lavender`, `--aspect-ochre`, `--aspect-berry`, `--aspect-lagoon`, `--aspect-tangerine` (the custom-aspect default), `--aspect-slate`; the icon on a chip is `--aspect-ink`. Each keeps 4.5:1 under `--aspect-ink` and 3:1 as a mark on the card, the sunken card and the charcoal card. Always shown with the aspect's name or icon. Ochre and tangerine (an orange) are category colours, not app accents: the no-orange/amber rule covers app accents only (Rue's decision).
- **Syntax** on the charcoal code block: `--syntax-comment`, `--syntax-keyword` (the app's `--accent-on-inverse`), `--syntax-string`, `--syntax-number`.

## Type

Every role is a token set (`--type-<role>-size`, `-line`, and where it exists `-tracking` / `-weight`) and a class in `base.css` (`.type-<role>`).

| Role | Font | Size | Line | Tracking / weight | Where |
|---|---|---|---|---|---|
| `display-xl` | Gilda | clamp(42px, 5.8vw, 86px) | 1.02 | −0.018em | The one screen title on the photo (`h1` default) |
| `display-l` | Gilda | clamp(32px, 3.4vw, 46px) | 1.1 | −0.012em | A long screen title (`h1[data-long]`), Notes' note title on the editor card, big counts and cover initials |
| `display-m` | Gilda | clamp(28px, 2.8vw, 38px) | 1.08 | −0.01em | Card heads (`h2` default): "Recipes", "Backlog" |
| `display-s` | Gilda | clamp(22px, 2vw, 28px) | 1.2 | −0.005em | Card heads on phones, sheet and empty-state titles, column counts, day numbers, a long note title |
| `figure` | Gilda | clamp(64px, 6.4vw, 92px) | 1 | −0.02em, `--numeric-figures` | The big number: rating, time |
| `title` | DM Sans | 14.5px | 1.3 | `--type-title-weight` (600) | Row and card titles |
| `body` | DM Sans | 16px | 1.55 | 400 | Running text, ledes; max `--measure` (68ch) |
| `body-s` | DM Sans | 14px | 1.45 | 400 | The working UI default (`body`) |
| `label` | DM Sans | 14px | 1.2 | `--type-label-weight` (500) | Buttons, nav, field labels |
| `caption` | DM Sans | 12.5px | 1.4 | 400 | Meta lines, card notes, seg values |
| `code` | `--font-mono` | 13px (`--type-code-size`) | 1.6 (`--type-code-line`) | 400 | Code blocks on the charcoal card |
| `kicker` | DM Sans | 11.5px | 1.4 | 0.26em, 500, uppercase | Kicker above the title |
| `overline` | DM Sans | 11px | 1.6 | 0.22em, 600, uppercase | Ruled section heads and count lists |
| `brand` | DM Sans | 12px | — | 0.3em, 600, uppercase | App name beside the round mark (`--brand-mark-size` 40px, letter `--type-brand-mark-size` 22px in Gilda) |

Weights for DM Sans: `--weight-regular`, `--weight-medium`, `--weight-semibold`, `--weight-bold`; Gilda only `--weight-display`. Numbers in data use `--numeric-figures` (`.figures`). On phones the screen title is capped at `--type-display-xl-size-compact` (clamp(38px, 11.5vw, 46px)) so a long title doesn't fill the first screen.

## Layout

**Widths** (`layout.css`): wide ≥1100 px, tablet 768–1099 px, phone <768 px (`max-width: 767px`). The dock is the exception: it applies below 1024 px (`max-width: 1023px`), so 768–1023 px has the tablet layout with the dock instead of the nav. Sheets switch from bottom sheet to centred dialog at the same 768 px. Custom properties can't drive media queries, so app CSS writes these values out.

**Frame grid.** Rows `bar / rail / head / body`. Columns: `main`, plus a `--rail-width` (60px) `rail` column when a rail exists. Column gap `--space-7` (28px); frame padding `--frame-pad-block` (22px) block, `--space-7` inline (`--space-3-5`, 14px, on phones).

| Width | What changes |
|---|---|
| Wide | App bar is three columns (brand, centred nav, actions). Rail is vertical and sticky beside the head. Facts card sits top right beside the lead (lead keeps `--facts-lead-min`, card stops at `--facts-max`). Scrim is a band behind the bar plus a haze from the left |
| Tablet | From 1024 px the bar stays one row (mark left, nav centred, actions right) and the wordmark is visually hidden until 1100, kept as the link's name (`.brand-name`, no markup change). Below 1024 the nav moves to its own row and scrolls sideways inside its capsule. Scrim follows the head's type. Seg bar spans the head |
| Phone | Frame `--radius-frame-compact`, 8 px of photo around it. Brand name goes visually hidden (mark stays). Rail turns horizontal on the photo's lower edge, solid, scrolling with edge shades. Seg bar stacks its cells (`--rule-above` between them, `--radius-bar-compact`), its action goes full width. Facts card goes full width under the lead. Title capped at `--type-display-xl-size-compact`. Toasts add `--toast-clearance` at the page end |

### Composition tokens (`tokens.css`, "Composition (layout.css)")

`layout.css` takes every size from these. The frame's local knobs (`--pad-block`, `--pad-inline`, `--gutter`, `--overlap`, `--bar-h`, `--photo-gap`) are set from them per width; an app may override a knob on its own `.frame` (Notes tightens `--pad-block`, `--pad-inline` and `--gutter`).

| Token | Value | Use |
|---|---|---|
| `--frame-max-width` | 1360px | The frame stops here on wide screens, centred |
| `--frame-pad-block` | 22px | The frame's top padding; the app bar's band (`--bar-h`) is this plus `--target-touch` |
| `--rail-width` | 60px | The rail column beside the head |
| `--stage-overlap` / `--stage-overlap-compact` | 100px / 76px | How far the stage runs under the body (wide and tablet / phone) |
| `--stage-fade` | 120px | The stage's photo fades out over its last 120px |
| `--stage-photo-gap-compact` | 112px | Phone: clear photo between the nav and the head (or the rail) |
| `--stage-crop-x` / `--stage-crop-y` | 70% / 40% | Default crop of the stage photo; an app sets `--photo-x` / `--photo-y` on `.app` |
| `--scrim-bar-soft` / `--scrim-bar-clear` | 24px / 80px | Wide: below the app bar the band is soft by this and clear by that |
| `--scrim-reach` | 56% | Wide: the haze from the left holds `--scrim-text` this far; the head's type stays inside it |
| `--scrim-reach-soft` / `--scrim-reach-clear` | 10% / 22% | Wide: past `--scrim-reach` the haze is soft, then clear |
| `--scrim-head-text` / `--scrim-head-soft` / `--scrim-head-clear` | 54px / 84px / 140px | Tablet: one band over the bar and the head, its stops measured below the bar |
| `--scrim-compact-soft` / `--scrim-compact-clear` | 70px / 130px | Phone: the band is soft by 70px and gone by the end of the nav |
| `--haze-bleed-block-start` / `--haze-bleed-block-end` | 44px / 30px | Tablet and phone: the haze behind the head's lead bleeds past its box and fades in over these |
| `--haze-bleed-inline-start` / `--haze-bleed-inline-end` | 116px / 140px | Tablet: the haze's side bleeds (phone: the frame's inline padding) |
| `--haze-fade` | 160px | The haze fades out over its last 160px |
| `--lead-max` / `--title-max` / `--lede-max` | 34rem / 9em / 42ch | The head's lead column, its title, its lede |
| `--facts-max` / `--facts-lead-min` | 15rem / 16rem | The ruled facts card's cap; the lead's minimum beside it |
| `--seg-height` | 50px | Minimum height of a segmented-bar cell |
| `--thumb-size` | 36px | Default thumb (`.thumb`); an app sets `--thumb` |

### Night stage (2.1.0)

`.app[data-world="…"][data-stage="night"]` turns the stage into the world's banner. Markup stays the skeleton's; the variant is CSS only.

```html
<div class="app" data-world="books" data-stage="night" data-photo="/worlds/books.jpg">
  <div class="frame">
    <figure class="stage" aria-hidden="true"><img class="stage-photo" src="/worlds/books.jpg" alt=""></figure>
    <header class="app-bar">…</header>
    <main class="screen">
      <div class="screen-head">
        <div class="screen-lead">
          <ul class="kicker"><li>Books 18</li></ul>
          <h1><em class="accent-word">Books</em></h1>
          <p class="lede">The shelf you are in the middle of, and the one waiting.</p>
          <!-- Button variant="primary" arrow: white on the night -->
        </div>
        <ul class="screen-facts" data-surface="inverse">…</ul>
      </div>
      <div class="screen-body" data-settle>…</div>
    </main>
  </div>
</div>
```

| Part | On the night stage |
|---|---|
| Scrim | Every stop maps to the world's veil on `.stage` and `.screen-lead`: `--scrim` → `--world-night`, `--scrim-strong` → `--world-veil-strong`, `--scrim-text` → `--world-veil`, `--scrim-soft` → `--world-veil-soft`, `--scrim-clear` → `--world-veil-clear`. The light scrim's geometry stays: wide, a band behind the bar plus the haze from the left to `--scrim-reach`; tablet and phone, the band plus a feathered plate behind the lead, the photo clear above it |
| Type | `.screen-lead` `h1`, `.kicker`, `.lede` and the bar's `.brand` take `--ink-on-inverse` / `--ink-on-inverse-secondary`; the accent word takes `--world-glow`; `.kicker-more` the inverse tints. Other text in the head belongs on glass or a card |
| Focus | White ring (`--focus-ring-on-inverse`) in the lead, on the brand and on the bar's actions; inside a seg bar, card or `[data-surface="solid"]` in the lead it is ink again |
| Primary pill | In the lead or the bar's actions, outside a seg bar, card or `[data-surface]`: `--surface-raised` with `--world-night` ink, the arrow's circle in the night; hover `--surface-sunken`. The scrolled capsule (wide) turns it back to the night pill |
| Chrome | `--surface-glass` is `--surface-glass-strong` in the bar and the head (plain glass turns grey on the night) |
| Facts card | The night on the night: `--ring-on-inverse` plus `--shadow-lift` keeps its edge; `.brand-mark` gets the same hairline |
| No hero | A frame without `figure.stage` gets a flat `--world-night` band from the bar to the head, running half of `--overlap` under the body so the first cards overlap it, like the photo. Never a gradient |

`data-stage="night"` without `data-world` has no veil: always set both. Specimen: `specimen/creative-worlds.html` (four worlds, `?state=nohero`).

**Spacing.** A 4 px grid with half steps: `--space-0-5` (2) … `--space-16` (64); see the frontmatter. Around the frame: `--space-frame-block`, `--space-frame-inline`. Running text: `--measure`. Inside cards: `--space-4`–`--space-6`; between head and body: `--space-9`.

**Layers.** `--z-backdrop`, `--z-veil`, `--z-base`, `--z-raised`, `--z-rail`, `--z-menu`, `--z-sheet`, `--z-toast`. Menus are popovers in the top layer; sheets are modal `<dialog>`s.

**Targets.** `--target-min` (24px), `--target-touch` (44px), `--target` (24px, 44px under `pointer: coarse`); `--control-height` (44px), `--control-height-s` (40px), `--control-height-xs` (30px, 44px on touch).

**Sticky bars.** An app with a sticky bar sets `--sticky-block-start` / `--sticky-block-end` (a `base.css` hook) so focused elements never scroll under it.

## Elevation and glass

| Token | Value | Use |
|---|---|---|
| `--shadow-rim` / `--elevation-glass` | inset 1px `--rim` | Every glass surface's edge |
| `--shadow-lift` | `0 24px 60px -28px rgba(24, 20, 16, 0.42)` | A card or menu over the frame; the charcoal card alone |
| `--shadow-frame` | `0 40px 90px -40px rgba(20, 16, 12, 0.55)` | The frame over the photo |
| `--elevation-card` | lift + rim | Cards, seg bar |
| `--elevation-menu` | lift + `--ring-hairline` | A white menu over a white card |
| `--elevation-frame` | frame + rim | The frame |
| `--ring-control`, `--ring-control-on-inverse` | inset 1px edge-control | 3:1 field and outline boundaries |
| `--ring-hairline`, `--ring-on-inverse`, `--ring-danger` | inset 1px | Quiet edges, error edge |
| `--rule-start`, `--rule-start-on-inverse` | inset `--stroke-rule` left | The left rule of count lists and section heads |
| `--rule-below`, `--rule-above`, `--rule-below-on-inverse`, `--rule-beside` | inset 1px | Row dividers, seg-bar cell dividers |
| `--rule-below-control` | inset `--stroke-rule` below | A select drawn as a line only |
| `--focus-halo` | `0 0 0 5px var(--ink)` | Ink halo around the white ring on dark controls |

**Glass:** `--glass-filter` = blur(`--glass-blur`) saturate(`--glass-saturate`). Backdrops: `--backdrop-photo-filter`, `--backdrop-field-filter`. Lines: `--stroke-hairline`, `--stroke-rule`, `--stroke-strong`. Sheet footer: `--sheet-footer-rule`, `--sheet-footer-padding-block-start`, `--sheet-footer-padding-block-end`, `--sheet-footer-padding-inline`, `--sheet-footer-padding-inline-wide`.

## Shapes

| Token | Value | Use |
|---|---|---|
| `--radius-frame` / `--radius-frame-compact` | 34 / 26px | The frame (wide / phone) |
| `--radius-card` / `--radius-card-s` | 28 / 24px | Cards, sheets, empty state |
| `--radius-panel` | 20px | Facts card, rows, menus, toasts |
| `--radius-item` | 16px | Menu items, small tiles |
| `--radius-text` | 6px | Inline code, text highlights |
| `--radius-pill` | 999px | Nav, capsules, pills |
| `--radius-control` | = `--radius-pill` | Buttons and fields are pills |
| `--radius-round` | 50% | Icon buttons, brand mark, thumbs, arrow circle |
| `--radius-bar` / `--radius-bar-compact` | 34 / 26px | Seg bar: a pill on one row, a soft card once it wraps |

## Components

### Screen skeleton

```html
<html lang="en" data-accent="rosemary">
<div class="app" data-photo="/img/pesto-pasta.jpg">       <!-- Notes: data-backdrop="field" -->
  <div class="frame">
    <figure class="stage" aria-hidden="true"><img class="stage-photo" src="/img/pesto-pasta.jpg" alt=""></figure>
    <header class="app-bar">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">R</span><span class="brand-name">Rues Cooking Hub</span></a>
      <nav class="app-nav" aria-label="Main"><ul data-pill>
        <li><a href="/">Home</a></li><li><a href="/plan" aria-current="page">Plan</a></li>
      </ul></nav>
      <div class="app-actions"><!-- round search button, primary arrow pill --></div>
    </header>
    <div class="rail" role="group" aria-label="Jump to a day"><!-- .btn.quiet.icon[data-press="round"], one [aria-current] --></div>
    <main class="screen">
      <div class="screen-head">
        <div class="screen-lead">
          <ul class="kicker"><li>Meal plan</li><li>Week 46</li><li>9 – 15 November</li></ul>
          <h1>This <em class="accent-word">week</em></h1>
          <p class="lede">…</p>
        </div>
        <div class="seg-bar"><!-- .seg cells + .seg-actions --></div>
        <ul class="screen-facts" aria-label="Meals this week"><li><span class="n">4</span>Breakfast</li></ul>
      </div>
      <div class="screen-body" data-settle><!-- .card …, one .card[data-surface="inverse"] --></div>
    </main>
  </div>
</div>
```

The shell parts (`.app`, `.frame`, `.stage`, `.app-bar`, `.rail`, `.screen-*`, `.kicker`, `.screen-facts`, `.position`, `.seg-bar`, `.card`, `.ruled`, `.thumb`) are `layout.css`, vendored with the runtime and never edited in an app. Its header lists the markup and attribute hooks and the behaviour an app scripts itself: `--photo` from `data-photo`, the pill glide, and the scroll cue (`data-fade-start` / `-end` on a sideways-scrolling track, `data-more-start` / `-end` on its host; `data-fade-below` on a list that scrolls down, `data-more-below` on its host; the copy-in `scroll-cue` primitive sets them). `.scroll-x` (also `layout.css`) puts the edge shade on a table or code block that scrolls sideways in a card; on the charcoal card set `--bg: var(--surface-inverse); --shade: var(--scroll-shade-on-inverse)`. Callout, task row and switch stay app-local in Notes. The specimen's `shell.js` (`ui.*`, `pill()`, `edges()`) is the reference. The menu is not in `layout.css` (see Menu below).

### Signature parts

| Part | Markup | Rules |
|---|---|---|
| **Dark pill with arrow** | `<a class="btn primary arrow" data-press data-focus="halo">Add recipe<span class="circle" aria-hidden="true"><svg data-nudge …/></span></a>` | The primary action, at most one per view. `--surface-inverse`, white circle (`--surface-raised`) of control height − 12 px holding the arrow. Arrow nudges `--nudge` on fine-pointer hover; `data-nudge="out"` for a link out |
| **Round icon button** | `<button class="btn icon" aria-label="Search" data-press="round">…</button>` | Always has an accessible name. `--radius-round`, size `max(--control-height, --target)` |
| **Glass capsule nav** | `nav.app-nav > ul[data-pill] > li > a[aria-current="page"]` | Glass capsule, charcoal current pill that glides. Scrolls sideways with an edge fade and chevron when it doesn't fit |
| **Segmented glass bar** | `.seg-bar > .seg (+ .seg) … + .seg-actions` | travel-hero's search bar: cells of at least `--seg-height` split by `--rule-beside`, primary action at the end. Filters, week stepper + Copy week, servings + plan, view switch (`[aria-pressed]` items in a `[data-pill]` track) |
| **Rail** | `.rail > .btn.quiet.icon[aria-current]` (or `nav.rail`); in Svelte `<Button variant="quiet" icon aria-current=…>` | Vertical glass pill beside the head on wide/tablet, sticky; horizontal and solid on the photo's lower edge on phones, scrolling with edge shades. Badges sit inside the scroll box. Items are quiet buttons so the Button draws them clear; `layout.css` adds the charcoal current pill and the `--surface-hover` hover at a higher specificity than the Button's scoped rules (its header explains) |
| **"01 / 06" position** | `<span class="position"><span class="sr-only">Album </span>01<span class="of"><span class="sr-only"> of </span><span aria-hidden="true"> / </span>16</span></span>` | Zero-padded to the total's digits (min two). The total steps back (`--ink-secondary`). Inside a kicker: "Day 04 / 07" |
| **Left-ruled count list** | `ul.screen-facts > li > span.n + label`; inverse: `ul.screen-facts[data-surface="inverse"]`; caption `li.facts-caption` | Overline type, each row ruled with `--rule-start`. The counts share one `auto` column (`column-gap: --space-3`, no min width on `.n`), so the widest ("1,285", five digits or more) sets it for every row; the labels sit in the rest. Max `--facts-max`; labels break inside it, never widen it. Caption says what is counted when a filter narrows the list ("Whole list · 240 albums") |
| **Ruled section head** | `<h3 class="ruled">Produce</h3><span class="card-note">4 items</span>` | Overline with left rule |
| **Kicker with em-dashes** | `ul.kicker > li` (breadcrumb: `ol.kicker` of links, current `[aria-current]`, middle parts behind `button.kicker-more` "…") | See The Kicker Rule |
| **Accent word** | `<h1>This <em class="accent-word">week</em></h1>`; a count title: `<h1>Albums <em class="accent-word">240 titles</em></h1>` | See The Accent Word Rule |
| **Charcoal key-facts card** | `.card[data-surface="inverse"]` or `ul.screen-facts[data-surface="inverse"]` | One per screen. Inside it controls use the on-inverse variants automatically (focus ring, selection) |
| **Cover plate** | `<span class="thumb plate" role="img" aria-label="No photo yet">K</span>` | Initials on a plate when there is no image; never a gradient. Size `--thumb` (default `--thumb-size`) |
| **Menu** | `<Menu name="Sort by" items={…} radio />` (`primitives/menu`) in a popover or anchored wrapper, trigger `button[aria-haspopup="menu"]` | White, `--elevation-menu`, anchored, flips above. Checked item charcoal with a visible check. See Menu below |
| **Listbox** | `[role="listbox"] > [role="option"][aria-selected]` (slash menu, command palette, combobox lists) | White panel like the menu. The active option is the charcoal pill: `--surface-inverse` / `--ink-on-inverse`, secondary text `--ink-on-inverse-secondary`, the same as a checked menu item (the family rule, Notes' slash menu and command palette). Hover on the rest is `--surface-sunken` |

### Phone dock, scrolled bar, detail actions

**Phone dock** (`.dock`, `layout.css`, below 1024 px). Last child of `.app`, after `.frame`. It replaces the app nav below 1024 px (`.app:has(> .dock) .app-nav` is hidden); from 1024 px the app shows its top bar with the nav, and from 1100 px the scrolled capsule. Sticky at `max(--space-3, env(safe-area-inset-bottom))`, 30 rem wide at most, surface `--surface-card` with `--elevation-card`. Inline inset: `--space-3-5` (14 px), the frame's `--pad-inline` at phone widths, so the dock lines up with the frame's content and not with the screen edge (the specimen shows no reason for the old 8 px). Tabs size to their label (flex `1 1 auto`, `--space-1` inline padding inside the 44 px minimum so the current pill doesn't hug its label, no gap; a 3-tab dock has wider pills, left as is), so a long label borrows room from the short ones: Home, Music, Animanga, Books, Fashion show in full from 360 px. A label that still does not fit is cut with an ellipsis, never dropped. Below 360 px the tabs are icon only: the `<span>` stays in the DOM, visually hidden, as the accessible name, tabs stay 44 px or more wide (five tabs plus the add button fit at 320 px, where the dock drops the 14 px inset to make room). The pill glide works on `ul.dock-tabs[data-pill]`.

```html
<nav class="dock" aria-label="Main tabs">
  <ul class="dock-tabs" data-pill>
    <li><a href="/" data-press><svg aria-hidden="true">…</svg><span>Home</span></a></li>
    <li><a href="/music" aria-current="page" data-press><svg aria-hidden="true">…</svg><span>Music</span></a></li>
  </ul>
  <button type="button" class="dock-add" aria-label="Add" aria-haspopup="dialog" data-press="round" data-focus="halo"><svg aria-hidden="true">…</svg></button>
</nav>
```

**Typing.** The dock is never removed from the DOM while a field has focus; `.dock[data-hidden]` fades and slides it out (transform and opacity; exit `--motion-quick`, return `--motion-glide`, both `--ease-out`; instant under `prefers-reduced-motion`), then `visibility: hidden` takes it out of the tab order and the accessibility tree. The copy-in `hideOnType` action in `primitives/scroll-cue/cue.ts` sets it while a text input, textarea or contenteditable has focus on a coarse pointer: `<nav class="dock" use:hideOnType>`.

**Specimen and galleries.** `.dock[data-specimen]` applies the dock (and hides the app nav) at any window width, so a shell gallery shows the phone dock on a desktop screen. Specimen pages take it with `?dock=phone`; apps set it only on gallery pages, never in the product.

On a form the add button stays and goes `aria-disabled="true"` (dimmed, opens nothing). Icons are 20 px, the plus 24 px. Reference: `ui.dock` in `specimen/shell.js`.

**Scrolled bar** (`.app-bar[data-scrolled]`, 1100 px and up). The bar becomes a sticky capsule at `--space-3` from the top: brand mark only, nav, actions, on `--surface-raised` (solid; glass lets the list read through). A secondary Button inside it takes `--ring-control` (`--edge-control` on raised is in `contrast-pairs.json`, 3:1), because its solid fill would blend into the capsule. It spans the frame's rows to stay sticky, and the bar row keeps its height, so nothing jumps. A fade-in on arrival, none under `prefers-reduced-motion`. The app sets the attribute; the copy-in `scrolled` action in `primitives/scroll-cue/cue.ts` does it:

```svelte
<header class="app-bar" use:scrolled>…</header>
```

It appends a sentinel as tall as `--bar-h` at the frame's top and toggles `data-scrolled` from an IntersectionObserver (no scroll listener). Below 1100 px the attribute changes nothing.

**Detail actions** (`.detail-actions`). The top-right pill of a note or entry: a status label plus one ··· button that opens the Menu primitive. Delete is the last Menu item, `danger`, after a separator. No other action buttons on the screen's top bar. When saving fails, the status is the danger retry button (`.btn.danger` in the pill drops the left padding).

```html
<div class="detail-actions">
  <p class="detail-status"><svg aria-hidden="true">…</svg>Saved</p>
  <!-- <Button variant="quiet" icon label="Note menu" aria-haspopup="menu"><Icon name="more" /></Button> -->
</div>
```

### Buttons

- **Shape:** pill (`--radius-control`), height `max(--control-height, --target)` (44 px), `s` size `--control-height-s` (40 px).
- **Primary:** charcoal `--surface-inverse` / `--ink-on-inverse`; hover `--surface-inverse-hover`; focus white ring + `--focus-halo` (`data-focus="halo"`).
- **Secondary (default):** `--surface-glass-strong` + `--shadow-rim`; hover `--surface-raised`. On a solid surface: `--surface-control-solid`, no rim. That is inside a `.card` that is not `[data-surface="inverse"]`, inside a `dialog`, inside `[data-surface="solid"]`, or the button itself carrying `data-surface="solid"`. A label with an icon (`<Button><Icon/>Label</Button>`) gets a `--space-2` gap.
- **Glass:** `--surface-glass` + `--glass-filter`, for chrome on the photo.
- **Quiet:** transparent, hover `--surface-tint` (on inverse `--surface-inverse-tint-strong`). Rail items are quiet icon buttons. A quiet menu trigger (`aria-haspopup`, `aria-expanded="true"`) holds `--surface-tint-strong` while its menu is open.
- **Sizes:** `m` 44 px, `s` 40 px, `xs` 30 px (`--control-height-xs`; 44 px on touch, so `xs` never undercuts `--target`). The secondary default stays glass.
- **Danger:** `--danger-soft`, `--ring-danger`, `--danger` text, with a leading trash icon. Never primary.
- **Disabled:** `--surface-tint`, `--ink-secondary`, `--disabled-opacity`; press scale off.
- **Loading:** the spinner turns at `--motion-spin` (`--ease-spin`); `loadingLabel` names it; under reduced motion it pulses to `--spinner-pulse-opacity`.

### Fields

- **Pill (default):** `--surface-raised`, `--ring-control`, pill, 44 px. Label above (`label` role), hint below in caption, error below with an alert icon and `aria-invalid` + `aria-describedby`.
- **Line:** an underline only (`--rule-below-control`) for bars.
- **Figure:** the typed rating. `variant="figure" inputmode="decimal" suffix="/ 10"`, Gilda `figure` size, on the charcoal card; empty shows "–" so "/ 10" never stands alone. Numbers are typed text, never `type="number"`. No slider, no spin arrows. A rating may carry round −/+ icon buttons (step 0.25, `aria-label`ed, 44 px on touch) beside the typed figure, for a rating only (Creative gate 4); the figure stays typed.
- **Select:** a native `<select>` in a pill with a chevron.

### Cards, rows, toasts

- **Card:** `--surface-card`, `--radius-card`, `--elevation-card`. Head: `.card-head` (Gilda `display-m` + `.card-note` caption).
- **Row (`ListRow`):** `--radius-panel`, 44 px min, sunken fill; current = charcoal pill + `aria-current`; selectable rows show a check in a circle. Below 22rem the trailing value drops under the title.
- **Toast:** charcoal pill-card at the bottom; message, optional action, dismiss. One visible per region, older ones peek at `--toast-stack-scale`; on phones the page gains `--toast-clearance` while one is up.

### Menu

`primitives/menu/Menu.svelte`: `<Menu name="Sort by" items={[{ label: 'Newest', checked: true }, { label: 'Oldest' }, { label: 'Delete all', danger: true, separator: true }]} radio onselect={pick} />`. Props: `name` (accessible name), `items`, `radio` (`menuitemradio` with a check; else `menuitem`), `icon` (a snippet that draws the item's leading icon, since primitives import no icon set; a danger item gets the trash icon there), `onselect`. Item fields: `label`, `checked`, `danger`, `disabled`, `separator` (a hairline above), `hint` (a secondary word), `kbd` (a shortcut, hidden on phones and touch). A checked item is the charcoal pill with a check. Up/Down/Home/End move between items. The panel does not position itself, open, close or trap focus: the app puts it in a popover (top layer, `--z-menu`) and handles Escape. `specimen/shell.css` "Menu" and `ui.menu` stay the plain-HTML reference.

### Primitives

| Primitive | For | Use when | Not for |
|---|---|---|---|
| `button` | Every action: primary arrow pill, secondary, glass, quiet, danger, round icon | Any click target that does something | Navigation lists (use `list-row`) |
| `field` | Text input: `pill`, `line` (in a bar), `figure` (the rating) | Typed values, search, quick add | Choosing from a fixed set |
| `select` | A native select in the fingerprint | A choice from a known list (course, sort) | Two to four options always visible (use a `[data-pill]` seg group) |
| `sheet` | Modal dialog: bottom sheet on phones, centred from 768 px; `mode="dialog"` centred everywhere | Short forms (Add from plan), confirmations | Long editing (give it a screen) |
| `list-row` | One row in a list: title, meta, trailing value, leading thumb, one action; current and selectable | Recipes, todos, tags, any list | Grid tiles |
| `empty-state` | Title, one sentence, one action on a solid surface | A list or screen with nothing in it, or no matches | Errors |
| `menu` | A white panel of actions or one choice (`radio`): checked charcoal pill, danger, separator, hint, kbd | Sort, view and row actions behind a button | Navigation (use the nav) or a form choice (use `select`) |
| `scroll-cue` | `cue` / `cueY` / `hideOnType` actions that set the `data-fade-*` / `data-more-*` hooks `layout.css` draws | A track that scrolls sideways or a list that scrolls down | Anything that fits |
| `toast` | `toast()` + `<Toaster />` once in the root layout | Feedback after an action, with Undo when reversible; errors that need no field | Validation of a field (use `field` error) |

## Motion

| Token | Value | Use |
|---|---|---|
| `--motion-quick` | 160ms | Press, hover colour, arrow nudge, fade-outs |
| `--motion-glide` | 260ms | The pill travelling; the rating line drawing |
| `--motion-settle` | 420ms | First-load settle |
| `--motion-stagger` | 60ms | Between settling cards |
| `--motion-hold` | 700ms | How long the rating line holds |
| `--ease-out` | cubic-bezier(0.23, 1, 0.32, 1) | Anything entering, pressing, responding |
| `--ease-in-out` | cubic-bezier(0.77, 0, 0.175, 1) | The pill crossing the screen |
| `--motion-spin`, `--ease-spin` | 800ms, linear | Busy spinner |
| `--spinner-pulse-opacity` | 0.4 | Spinner under reduced motion (pulses instead) |
| `--press-scale`, `--press-scale-round` | 0.97, 0.95 | Press |
| `--nudge` | 3px | Arrow nudge |
| `--settle-rise` | 12px | Settle distance |
| `--toast-stack-scale` | 0.94 | Older toasts peeking behind |

| Move | Hook | Behaviour |
|---|---|---|
| **1. Press** | `data-press` on pills, `data-press="round"` on icon buttons; `data-nudge` (or `="out"`) on the arrow svg | Scale to 0.97 / 0.95 while pressed. The arrow moves 3 px inside its circle on fine-pointer hover; the circle stays |
| **2. The pill glides** | `data-pill` on the track (`ul` or group) holding `a[aria-current]` or `button[aria-pressed]` | A script lays an inert, `aria-hidden` charcoal copy of the track over it (`data-pill-host`, `-track`, `-ghost`, `-item`) clipped to the current item through `--pill-clip`, so labels change colour exactly under the pill. Interrupting retargets. The specimen's `pill()` in `shell.js` is the reference script; without it the static charcoal pill stays |
| **3. The cards settle** | `data-settle` on the parent of the cards overlapping the photo | Rise 12 px and fade in, 60 ms apart, on a full page load only; never on in-app navigation or refresh; never blocks input |
| **4. The rating is confirmed** | `data-confirm-line` on the field wrapper; script sets `data-confirmed` (and `--confirm-x`, `--confirm-w`, `--confirm-bottom`) | When a typed rating is committed (Enter or blur) and differs from the saved one, an accent line draws under the number, holds 700 ms, fades. On charcoal it uses `--accent-on-inverse` |

Hover colour changes use `data-hover` (`--motion-quick`). Under `prefers-reduced-motion: reduce` `base.css` floors every app rule to colour, background colour and opacity: press and nudge are gone, the pill jumps, the settle becomes a fade in place, the rating line fades in and out, the spinner pulses.

## Worst-case data

Every screen ships with a worst-case data set and is looked at in it at 375, 768 and 1280 px. The specimen's sets are the floor:

| Case | Specimen example | Rule |
|---|---|---|
| Very long title | A three-line German note title; a 140-character todo | Wraps and hyphenates (`lang`); never truncated on its own page. Past a length the title steps down one role (`h1[data-long]` → `display-l`; the specimen uses > 60 characters, > 28 for a folder name). Phone title capped in size, not cut |
| Unbreakable word | "Donaudampfschifffahrtsgesellschaftskapitänslieder", "GESUNDHEITSVORSORGEUNTERSUCHUNGSTERMINE" in tracked caps | `min-inline-size: 0`, `overflow-wrap`, `hyphens: auto`; a card never widens into its neighbour (facts stop at `--facts-max`) |
| Mixed scripts | Japanese titles, a Hebrew tag, emoji in tags and page icons | `lang` on the element; layout holds RTL text inside an LTR row |
| Deep nesting | A note twelve folders deep | Indent caps; the breadcrumb collapses its middle into "…" (a real button) |
| Huge counts | 240 albums, 503 pantry items, 40 todos | Render the first N under the true count; numbers formatted en-GB ("1,093") |
| Zero | Empty folder, empty week, no matches | `EmptyState` with title, one line, one action. "0 titles" keeps a caption over the facts ("Whole list · 240 albums") so counts never contradict |
| Missing image or field | Album with no cover, untitled note, unrated entry, item with no quantity | Initials plate, "Untitled", "–" in the figure, empty value cell; never a gradient or a dangling "/ 10" |
| Long values | "2 × 400 g tins + 1 jar (680 g)", "125–150 ml" | Row value drops under the title below 22rem |
| Singular and plural | "1 serving", "1 aspect" | Always a plural helper; "1 servings" is a bug |
| Many and long tags | 14 tags, 40-character tags | Wrap; each × keeps a 24/44 px hit area |
| Overflowing bars | Nav with 8 items at 375, rail with 7 aspects | Scroll sideways inside the capsule; edge with more fades and shows a chevron; current item starts in view; badges never clipped |
| Stacked toasts | Three upload errors | One visible per region, older ones peek; toasts never cover the only actions (`--toast-clearance`) |

## Icons

### UI icons

Line icons on a 24 viewBox, `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"`, 18 px by default (14–20 px), `aria-hidden="true"`, inlined. The specimen's `PATHS` in `shell.js` is the current set. Emoji are content (Notes page icons, tags), never UI icons.

### App icons

Every app has one icon from one family. The full rules, the construction grid and the review checklist are in `icons/TEMPLATE.md`; start each master from `icons/TEMPLATE.svg`.

- One master per app, `icons/<App>/icon.svg` in Design-System, 512 × 512. `scripts/build-icons.mjs` generates every size; nothing is exported by hand.
- The field is a circle in the app's accent (Rues-Arcade: charcoal, `--surface-inverse`). Home screens get the OS shape, filled to full bleed by the build.
- The glyph is a white line drawing: one stroke of 32 at 512 (1 px at 16 px), round caps and joins, at most one solid white shape. Two colours only, glyph against field at least 3:1.
- The glyph's main body sits on a keyline and stays inside the live area (circle r 192), which keeps it clear of every mask, including the maskable safe zone.
- The glyph says the app's main job. No letters, no text, no stock metaphors. Each glyph is designed at the app's gate 5 and reviewed with all the others at 16, 32, 180 and 512 px.
- When an app's accent changes, change the field hex in its `icon.svg` and rerun `build-icons`.

## Accessibility

**Target: WCAG 2.2 AA** in every app.

- **Contrast against the worst pixel.** `contrast-pairs.json` lays translucent surfaces over black; text ≥4.5:1, large text and UI ≥3:1, every accent and every world (`check-contrast.mjs`). Night-stage pairs (`"world": true`) lay the world's veil over white, the worst pixel under light type.
- **Targets.** `--target`: 24 px, 44 px on coarse pointers; small visuals grow their hit area with `.hit`.
- **Focus always visible.** `--focus-width` outline in `--focus-ring`, white under `[data-surface="inverse"]`; dark controls use `data-focus="halo"`.
- **Never colour alone.** Current = charcoal + `aria-current`; selected = tint + ring + check; errors = icon + text + `aria-invalid`; aspects come with name or icon.
- **Structure.** One `h1`; toasts in `role="status"` / `role="alert"`; confirmations are `role="alertdialog"` focused on Cancel; mixed-language content carries `lang`. Zoom never locked.

## Voice and copy

English, UK spelling, plain and short. A calm tool: no exclamation marks, no "Oops", no jokes in errors.

- **Case:** sentence case everywhere; uppercase only through kicker, overline and brand styles.
- **Buttons:** a verb plus the object when needed: "Add recipe", "Copy week", "Delete todo". No "Submit", "OK" or "Yes".
- **Errors** (inline and toast): what failed, then what to do, joined by a spaced em-dash: "Couldn't save — try again". Specific causes stand alone: "That file isn't an image". Field errors state the rule: "Choose a start and an end date". Errors stay until dismissed.
- **Empty states:** a title, one sentence on how to fill it, one action: "No albums yet" / "Add the first one to start the list."
- **Toasts:** past tense, optional undo: "Saved", "Removed “Evening run” from the sprint" + "Undo". Info toasts leave after 5 s (8 s with an action).
- **Confirmations:** the title asks with the object ("Delete this album?"), the body gives the consequence, then "Cancel" (focused) and the verb as `danger`.
- **Quotes and dashes:** user content in curly quotes; en-dash ranges, spaced between dates ("9 – 15 November"), unspaced between times ("07:30–08:30").
- **Numbers and dates:** en-GB ("1,093"), a space before units ("400 g"), ratings "8.75 / 10", positions "01 / 16"; "Thu 8 Oct", 24-hour "14:05"; "Today", "2d late".

## How apps consume it

- **Vendored, never edited.** `scripts/sync.sh <app-path>` copies `sync.manifest`: `tokens.css`, `base.css`, `motion.css`, `layout.css`, `fonts.css` to `src/lib/styles/fingerprint/`; `DESIGN.md`, `DESIGN-reference.md`, `DESIGN.json` to the app root; `banned.md` and the guards to `scripts/fingerprint/`; fonts to `static/`; `gitleaks.toml` to `.gitleaks.toml` (the gitleaks defaults plus one allowlisted path, `^fingerprint\.lock$`, whose SHA-256 hashes trip `generic-api-key`; Rue approved the exception on 2026-11-17). `check-drift` in `proof` fails on any edit.
- **Load order:** `fonts.css`, `tokens.css`, `base.css`, `motion.css`, `layout.css`, then app CSS. Set `<html lang="en" data-accent="…">`.
- **Requests go upstream** to Design-System `requests.md`; the change lands here, `VERSION` bumps, `sync.sh` runs per app.
- **Primitives are copied in.** `sync.sh <app-path> --primitive <name>` copies `primitives/<name>/`; the app owns and restyles the copy with tokens only. Good patterns are promoted here, never copied app to app.

## Kept out

`banned.md` is the list; `check-slop` enforces it in `proof`: gradient text, animated blur, `transition: all`, `!important`, zoom lock, lorem ipsum, literals outside tokens. Also out: grey-on-white SaaS, cream paper, blobs, chunky display faces, warm accents, stat tiles, avatar stacks, emoji as UI icons.

`check-slop --baseline <file>` tolerates problems an app has recorded: one line per problem, `file rule message` without the line number (the message is the text `check-slop` prints after `file:line rule`). Each line is a count budget, so a problem beyond its recorded count, or a new kind, still fails, and a moved line does not. Exit 2 if the file is missing. A comma-joined token list (`box-shadow: var(--a), var(--b)`, nested fallbacks included) is not `shadow-raw`.

## Token frontmatter

`DESIGN.md` keeps a trimmed frontmatter (name, description, the core colour roles, the two type families, the main radii) so it fits the `impeccable context` budget. This is the full token frontmatter as it stood before the trim: normative values for the remaining colours, every type role, every radius, the spacing scale and the component specs. `tokens.css` still wins.

```yaml
name: Design fingerprint
description: One rounded glass frame over a full-bleed photo; a thin serif title with one accent word; charcoal for the current thing and the key facts.
colors:
  surface-page: "#E7E2DC"
  surface-backdrop: "#CFC7BD"
  veil-backdrop: "rgba(236, 231, 225, 0.22)"
  surface-frame: "rgba(248, 246, 243, 0.62)"
  surface-frame-strong: "rgba(248, 246, 243, 0.78)"
  surface-glass: "rgba(255, 255, 255, 0.58)"
  surface-glass-strong: "rgba(255, 255, 255, 0.82)"
  surface-card: "rgba(255, 255, 255, 0.93)"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F4F1ED"
  surface-tint: "rgba(29, 29, 31, 0.06)"
  surface-tint-strong: "rgba(29, 29, 31, 0.12)"
  surface-hover: "rgba(255, 255, 255, 0.75)"
  surface-control-solid: "rgba(29, 29, 31, 0.07)"
  surface-control-solid-hover: "rgba(29, 29, 31, 0.12)"
  surface-plate-1: "#EFEAE3"
  surface-plate-2: "#DDD4C9"
  surface-plate-3: "#CFD3C6"
  edge-plate: "rgba(29, 29, 31, 0.28)"
  edge-plate-on-inverse: "rgba(255, 255, 255, 0.3)"
  surface-inverse: "#1D1D1F"
  surface-inverse-raised: "#2C2B2A"
  surface-inverse-hover: "#000000"
  surface-inverse-tint: "rgba(255, 255, 255, 0.08)"
  surface-inverse-tint-strong: "rgba(255, 255, 255, 0.14)"
  scrim: "#F6F3EF"
  scrim-strong: "rgba(246, 243, 239, 0.95)"
  scrim-text: "rgba(246, 243, 239, 0.84)"
  scrim-soft: "rgba(246, 243, 239, 0.5)"
  scrim-clear: "rgba(246, 243, 239, 0)"
  ink: "#1D1D1F"
  ink-secondary: "#423E3A"
  ink-muted: "#6B655F"
  ink-on-inverse: "#FFFFFF"
  ink-on-inverse-secondary: "rgba(255, 255, 255, 0.78)"
  ink-on-inverse-muted: "rgba(255, 255, 255, 0.62)"
  edge-control: "#86807A"
  edge-control-on-inverse: "rgba(255, 255, 255, 0.6)"
  hairline: "rgba(29, 29, 31, 0.12)"
  hairline-on-inverse: "rgba(255, 255, 255, 0.2)"
  rim: "rgba(255, 255, 255, 0.65)"
  selection-on-inverse: "rgba(255, 255, 255, 0.28)"
  danger: "#B42318"
  danger-soft: "#FDECEA"
  danger-on-inverse: "#FFB4A9"
  scroll-shade: "rgba(29, 29, 31, 0.22)"
  scroll-shade-on-inverse: "rgba(255, 255, 255, 0.34)"
  accent: "#527752"
  accent-ink: "#FFFFFF"
  accent-text: "#3D5A3E"
  accent-soft: "#D8EDD8"
  accent-on-inverse: "#759475"
typography:
  display-xl:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(42px, 5.8vw, 86px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.018em"
  display-l:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(32px, 3.4vw, 46px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.012em"
  display-m:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(28px, 2.8vw, 38px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  display-s:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(22px, 2vw, 28px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  figure:
    fontFamily: "Gilda Display, Georgia, serif"
    fontSize: "clamp(64px, 6.4vw, 92px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "lnum, tnum"
  title:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-s:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.2
  caption:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.4
  kicker:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.26em"
  overline:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.22em"
  brand:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.3em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  frame: "34px"
  frame-compact: "26px"
  card: "28px"
  card-s: "24px"
  panel: "20px"
  item: "16px"
  text: "6px"
  pill: "999px"
  round: "50%"
  bar: "34px"
  bar-compact: "26px"
spacing:
  "0-5": "2px"
  "1": "4px"
  "1-5": "6px"
  "2": "8px"
  "2-5": "10px"
  "3": "12px"
  "3-5": "14px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "9": "36px"
  "10": "40px"
  "12": "48px"
  "14": "56px"
  "16": "64px"
  frame-block: "clamp(10px, 4.4vw, 60px)"
  frame-inline: "clamp(8px, 4.4vw, 64px)"
components:
  frame:
    backgroundColor: "{colors.surface-frame}"
    rounded: "{rounded.frame}"
    padding: "22px 28px 32px"
  nav-item-current:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-on-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 16px"
  button-primary:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-on-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  button-primary-arrow:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-on-inverse}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "6px 6px 6px 20px"
  button-secondary:
    backgroundColor: "{colors.surface-glass-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  button-quiet:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  button-icon:
    backgroundColor: "{colors.surface-glass-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "44px"
  field-pill:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-s}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  card-inverse:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-on-inverse}"
    rounded: "{rounded.card}"
  facts:
    backgroundColor: "{colors.surface-glass-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.overline}"
    rounded: "{rounded.panel}"
    padding: "14px 20px 14px 16px"
  seg-bar:
    backgroundColor: "{colors.surface-glass-strong}"
    rounded: "{rounded.bar}"
    padding: "8px 8px 8px 10px"
  list-row:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    height: "44px"
    padding: "12px 16px"
  toast:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-on-inverse}"
    rounded: "{rounded.panel}"
    height: "44px"
    padding: "6px 6px 6px 16px"
  menu:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "6px"
```
