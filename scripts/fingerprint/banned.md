# Banned patterns

One `## <id>` section per pattern. `Reason:` is one line. A fenced `regex` block (JS regex, flags `gmu`, matched against a whole `.svelte` or `.css` file under `src/`) makes the pattern machine-checked; without it the pattern is review-only and goes to the visual reviewer (`check-slop --list-review`). Colour literals, raw shadows, radii, font families and motion timing are already checked by `check-slop` itself and are not repeated here. Glass (`backdrop-filter`), pills, the display serif with one accent word, round buttons and emoji as user content are part of the approved direction and are not banned.

## gradient-text
Reason: gradient fill on text is the default AI hero look.

```regex
background-clip\s*:\s*text
```

## animated-blur
Reason: transitioning or keyframing `filter` or `backdrop-filter` is janky and slow; glass is static.

```regex
transition(?:-property)?\s*:[^;{}]*\b(?:backdrop-)?filter\b|@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*?[^{}]*\{[^{}]*?\b(?:backdrop-)?filter\s*:
```

## transition-all
Reason: `transition: all` animates properties nobody chose; name them.

```regex
transition(?:-property)?\s*:(?:[^;{}]*,)?\s*all\b
```

## important-flag
Reason: `!important` outside the fingerprint files hides a specificity problem.

```regex
!\s*important\b|\|important\b
```

## zoom-lock
Reason: blocking pinch zoom fails WCAG 2.2 AA (1.4.4).

```regex
user-scalable\s*=\s*(?:no|0)\b|maximum-scale\s*=\s*1(?:\.0)?\b
```

## placeholder-copy
Reason: placeholder text must not ship.

```regex
\b[Ll]orem\s+[Ii]psum\b
```

## outline-removed
Reason: the focus ring is always visible (DECISION.md, accessibility); `outline: none` needs a replacement ring.

## faux-bold-display
Reason: Gilda Display has one weight, so any bold on the display face is synthesised (DECISION.md, "never faux bold").

## stat-tile-row
Reason: a row of big numbers with labels ("250+ Projects") is a hero cliché (Rue, round 4 brief).

## explore-showreel-pair
Reason: the "Explore our work" plus "Watch showreel" button pair is a hero cliché (Rue, round 4 brief).

## avatar-stack
Reason: overlapping avatar circles as social proof is a hero cliché (Rue, round 4 brief).

## cream-paper
Reason: warm off-white, flat, paper-like surfaces with no depth is the "Anthropic style" Rue rejected (aesthetics brief, "Not this").

## minimalism
Reason: Rue rejected minimalism, and grey-on-white SaaS sterility with it (aesthetics brief; round 1, "too sterile, too clean").

## organic-natural
Reason: organic blobs, pebbles, grain and earthy "natural" styling were rejected after round 2.

## chunky-display
Reason: chunky or rounded display faces (Caprasimo, Gloock) were rejected; the display face is thin Gilda (Rue, round 1).

## warm-accent
Reason: orange, ember and amber accents are out; one accent per app from rosemary, slate, heather or lagoon (Rue, round 1).

## text-on-busy-glass
Reason: text on glass over a busy photo needs a solid or near-opaque surface to hold AA (aesthetics brief).

## photo-in-card
Reason: a screen's main photo boxed small in a card breaks frame-over-photo; the photo runs full-bleed behind the frame (round 4).

## accent-word-overuse
Reason: one accent word per screen title only; none on list items, labels or buttons (DECISION.md).

## mesh-placeholder
Reason: mesh-gradient stand-ins for images read as AI filler; use a real photo or the blurred colour field.

## generic-feature-grid
Reason: three equal cards with icon, title and sentence read as a template.

## gradient-blob-background
Reason: floating gradient blobs behind content are generic and clash with photo-led depth.

## hover-only-affordance
Reason: actions or information revealed only on hover do not exist on touch or keyboard.

## rating-slider
Reason: the rating is a typed figure; sliders and `type="number"` spin arrows stay banned. Round −/+ icon buttons (step 0.25) beside the typed figure are allowed, for a rating only (Rue, Creative gate 4).

## emoji-icons
Reason: emoji used as UI icons instead of the icon set; emoji as user content (Notes page icons, tags) is fine.
