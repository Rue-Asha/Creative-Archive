# UI audit — ui-polish (2026-11-02)

Screenshot-backed audit of origin/main at 1c6d84f, phone 390×844 and desktop 1280×800, with seeded data. Line numbers
refer to that commit. The scripts (seed/shots/morph/caret/taps .mjs) and the screenshots are in the session scratchpad
and are not committed. Findings, verbatim from the auditor:

## Findings
1. [high] Back morph (detail → list) lands on a card that is still hidden. reveal() remounts every list card with
   opacity:0 and translateY(28px). The morph group's end transform is 28px below the card's real top (504 vs 476
   desktop, 174 vs 146 phone), with the li at opacity 0 and no data-revealed. The bare image sits there while the chip,
   title and stars pop in late, and the whole list fades in again. · motion.ts:51-66, global.css:254-257, morph.ts:93-96
   · Fix: in pageTransition's update callback, after `after = cardCover(...)`, set
   `host = after?.closest('[data-reveal]')` and then `host.style.transition='none'` and
   `host.setAttribute('data-revealed','')`. Better: make reveal() mark nodes already in view as revealed at once when
   the navigation type is popstate.
2. [high] The morph snapshot has square corners in both directions. The named element `.media` has no radius; the 24px
   corners come from `.card{overflow:hidden}`, which is not part of the snapshot, so the shape snaps to rounded at the
   end. · Card.svelte:79-83 · Fix: `.media{border-radius:inherit;overflow:hidden}` (matches detail `.cover` at
   --r-card).
3. [high] The forward morph starts from a hovered card. The snapshot carries the tilt (matrix3d, rotate plus -4px lift)
   and `img scale(1.05)`, while the detail cover is at 1.0, so the image visibly jumps. The detail cover's
   --shadow-float pops in at the end. · tilt.ts:24, Card.svelte:220-228, morph.ts:72 · Fix: before name(before) in
   the forward branch, clear the card's inline transform and set `before.querySelector('img').style.transform='none'`.
   Give the group the shadow via `::view-transition-group(cover-*){box-shadow:var(--shadow-float);border-radius:var(--r-card)}`.
4. [high] Phone: the progress control in shelf cards (168px wide) overflows. The "+" is clipped by the card, and the
   steps and input shrink to 39×39, breaking the 44px rule. · Card.svelte:154-161, ProgressControl.svelte:100-120,
   Shelf.svelte:207 · Fix: under `@container (max-width:209px)` hide `.total` inside `.extra` (keep it in the
   aria-label) so 3×44 = 132px fits the 156px row, or make phone cards 184px.
5. [high] Hero fades end with a visible crease. Pixel samples on /music go 42→13 with the step size growing to 4 per
   6px, then go flat at the hero's bottom edge. Causes: 2-stop linear masks, `white 62%, transparent`, plus a scrim
   that darkens toward the same edge. · PhotoHero.svelte:70,102-105,136 · Fix: an eased mask token in tokens.css,
   e.g. `--fade-down: linear-gradient(180deg, rgb(0 0 0) 50%, rgb(0 0 0/.86) 62%, rgb(0 0 0/.62) 73%, rgb(0 0 0/.36) 83%, rgb(0 0 0/.14) 92%, rgb(0 0 0/0))`,
   used for .photo and .scrim.
6. [high] Shelf and bento glows look patchy and lopsided. They are a 4-column grid of hard-edged covers under
   blur(90px) saturate(1.8), so with fewer than 4 images the glow sits left (on /music "In progress": green out to
   x≈830, then flat ground). The `closest-side` ellipse on a ~1350×300 box with 2 stops gives a flat blob that fades
   in ~100px vertically against ~400px horizontally, and its top is cut hard by the sticky glass head bar. ·
   Shelf.svelte:78-94, CollectionsBento.svelte:49-65, [list]/+page.svelte:~115-130 · Fix: a single averaged source
   (first image, object-fit:cover, full box), saturate(1.2), `mask-image: radial-gradient(farthest-side, …eased 5-stop…)`,
   and inset -20% -4% so the vertical fade has room.
7. [med] Phone shelf headings use --t-display-2 (32px), so "Recently added · Music" wraps to 2 lines with the count
   pill floating mid-row. The bento heading on the same page uses display-3 (26px). · Shelf.svelte:102-104 vs
   CollectionsBento.svelte:166-169 · Fix: one section-heading size, display-3 below 1024px for both.
8. [med] Desktop sticky shelf-head glass bar: `inset:-8px -12px` puts it 12px outside the column (x=28 vs cards at
   40), and a 44px heading inside a ~60px pill leaves 8px vertical padding, which looks cramped. · Shelf.svelte:180-190
   · Fix: inset `-10px -16px` but pad the head with `padding-inline:16px` so the text stays on the column edge.
9. [med] The error colour is a raw named colour copied 5×: `color-mix(in srgb, var(--ink) 45%, tomato)`. There is no
   error token, and it slips past the motion.test hex/rgb regex. · collections/[id]/+page.svelte:213,
   collections/+page.svelte:119, AddToCollection.svelte:143, PreviewPanel.svelte:129, EntryForm.svelte:213 · Fix:
   `--error` per scheme in tokens.css/tokens.ts (dark ≈ #FF8A7A, light ≈ #B3261E, AA-checked), use var(--error).
10. [med] Inputs at 14-15px make iOS zoom on focus: progress input, every form .control, tag input, list filter search
    (14px). · ProgressControl:105, EntryForm:274, TagInput:171, collections pages:143/237, AddToCollection:168/213,
    FilterBar:106 · Fix: 16px (var(--t-body)) on every input, select and textarea.
11. [med] Home bento features the first collection even when it is empty ("Empty one" becomes a 2×2 tile of dark
    blocks plus an icon). · CollectionsBento.svelte:26 · Fix: feature the first collection with collage.length>0.
12. [med] Detail on phone: the cover is 300px wide on a 390 screen, so title and controls start below the fold. The
    "EPISODES" label lifts the progress control 10px off the status/stars row on desktop. Actions wrap with "Delete"
    alone on a second row. · entries/[id]/+page.svelte:172-174,206-218 · Fix: cover `min(100%,240px)` on phone; put
    the label inline or align the row on `end`; make Delete a quiet text button.
13. [low] Settings: Replace is outline and Remove is a filled glass pill, stacked; two button styles for one pair. The
    "No photo yet" radial glow has a visible ellipse rim. · HeroSlot.svelte:~100-130,116 · Fix: same variant side by
    side; eased stops.
14. [low] Phone tab bar labels are 10.5px; "Animanga" fills the active pill edge to edge and "Collections" nearly
    touches the bar edge. · PillNav.svelte:149 · Fix: 11px (--t-eyebrow), padding 0 4px, the active pill as a
    stadium min 64px.
15. [low] Caps labels use three trackings: eyebrow 0.2em/11-12px, TagInput 11px 0.06em, Counter 13px 0.08em. ·
    TagInput.svelte:137-140, Counter.svelte:13-15 · Fix: use Eyebrow tokens.
16. [low] Global `:focus-visible{border-radius:var(--r-pill)}` reshapes any focused element without its own radius
    (card title links, StarRating group). · global.css:210-213 · Fix: `outline: 2px solid var(--ink);
    outline-offset: 2px`, drop the radius override.
17. [low] The edit form's native `<select>` chevron doesn't match FilterBar's custom chevron. Artist token (solid
    accent) and tag tokens (dark brown) are two chip styles for the same role. · EntryForm/FieldInput, TagInput · Fix:
    reuse the FilterBar select style and one Chip tone.
18. [low] `[data-world]{background-attachment:fixed}` with --ambient repaints on scroll on Android, and iOS ignores
    fixed. · global.css:92-95 · Fix: a fixed pseudo-element layer (`position:fixed; inset:0; z-index:-1`).

## Caret
Cause: ProgressControl's value is a borderless, transparent `<input type="text" inputmode="numeric">` that reads as
static text ("3 / 28") (ProgressControl.svelte:39-46, 110-120). Click/tap focuses it (activeElement =
input[aria-label=Episodes], cursor:text), which draws a blinking caret plus the focus box; on phone the keyboard
opens. It shows on every in-progress card (Home "In progress", animanga lists; `.extra` is z-index 2 above the stretched
link) and on the detail page. Nothing else is editable: no contenteditable/caret-color/user-modify; tabindex=-1 only on
dialogs/menus; Kit's focus reset goes to body. Headings/paragraphs show the I-beam (cursor:auto) with an invisible
collapsed selection. Secondary fix: `cursor:default` on chrome text (nav, chips, counts, eyebrows, card overlays). A
caret blinking in plain headings would be F7 caret browsing in the browser, not the app.

## Type scale
Tokens: display-1 40→64, display-2 32→44, display-3 26→32, title 17, body 16, small 13, eyebrow 11→12
(tokens.css:34-41, 96-102). Off-scale:
- 15px ×13: Button:60, StatusPill:116,179, ProgressControl:105, Toast:37, Card:119, EntryForm:274, TagInput:171,
  AddMenu:81, AddToCollection:168,213, collections/+page:143, collections/[id]:237
- 14px ×12: PillNav:111, Chip:62, Shelf:138, CollectionsBento:94,163, Welcome:65,73, FilterBar:106, ArtistField:159,
  TagInput:131, entries/[id]:199, collections/[id]:292
- 12px Chip:103,115; 11px TagInput:137; 10.5px PillNav:149; 13px raw Counter:13; 18px DetailPanel:113; 21/22px
  AppNav:82,89; 22px CollectionsBento:143; 16px raw Card:191, CollectionCard:41, SearchPanel:159, PreviewPanel:150

## Gradients
- PhotoHero.svelte:70,102: mask `white 62%, transparent` is a 2-stop ramp with a crease at the hero edge. Home reuses
  it inside a rounded `.frame` (+page.svelte:6-10), so the framed hero bottom is a muddy fade.
- PhotoHero.svelte:104-105,136: the scrim is 2-stop linears that darken toward the same edge.
- PhotoHero.svelte:93-95: the gradient fallback is a 3-stop sRGB linear (accent-soft → surface-2 → ground) and bands
  on dark. Fix: `in oklab` plus grain.
- tokens.css:131,158: --ambient is a radial `transparent 70%` 2-stop at 0.26/0.12 alpha on #0D0D10, with 8-bit
  banding and fixed attachment.
- Shelf.svelte:78-88, CollectionsBento.svelte:49-59, [domain]/[list]/+page.svelte:121-124: a blurred 4-column image
  grid with saturate(1.8) and `closest-side white 40%, transparent` (see finding 6).
- entries/[id]/+page.svelte:149-158: backdrop blur(56px) plus an ::after `transparent 30%, var(--ground)` 2-stop,
  crease at min(90vh,820px).
- ImagePlaceholder.svelte:24-26, HeroSlot.svelte:116-117: radial `transparent 65%` 2-stop with a visible ellipse rim.
- tokens.css:130,157: --glass-sheen is fine.
- General fix: eased 5–6 stop ramps as tokens (`--fade-down`, `--glow-mask`), `in oklab` for colour-to-colour
  gradients, and a grain layer on large dark gradients.

## Card ↔ detail transition
Forward and back use View Transitions (morph.ts pageTransition; `.media[data-cover-id]` is named on the card and
`.cover` on the detail). Filmed at 0.25× via CDP playback rate at both viewports.
- Forward: square corners throughout, and the radius plus shadow snap in at the end (finding 2). The start state is
  tilted and zoomed when hovered (finding 3).
- Back: the group ends 28px below the card because the target li is unrevealed (finding 1). The bare square image
  sits there, then the card chrome pops in and all other cards fade-rise.
- On back, cardCover(id, null) ignores the clicked card (morph.ts:95). On Home the same entry can sit in two shelves
  ("In progress" and "Recently added"), and Kit does not restore shelf scrollLeft, so it can pick the wrong or an
  off-screen copy. Fix: store the clicked card's shelf key and index (in `history.state` via replaceState before
  navigating), restore the row's scrollLeft on back, and pass that element.
- The "Mixed shapes" shelf uses portrait 4/5 cards while manga/book detail is 2/3, so the default
  `::view-transition-old/new` (height:auto, top-aligned) stretches. Fix:
  `::view-transition-old(*), ::view-transition-new(*){height:100%;object-fit:cover}` for cover-* groups.
- Images are cached immutable, so lazy loading was not the cause.
