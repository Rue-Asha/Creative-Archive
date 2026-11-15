verified-at: 9c1c6c0

# Verification (round 3)

## Layer 1: `PORT=4731 npm run proof:full` green

```
  ✓  739 [desktop] › e2e/worlds.test.ts:23:1 › Scenario: Home, collections and settings use the home world (267ms)
  ✓  740 [desktop] › e2e/worlds.test.ts:31:1 › a list page uses its domain's world before the list names one (107ms)

  52 skipped
  688 passed (4.9m)
```
check + build + vitest: 54 files, 419 tests passed, none skipped. The 52 skipped are Playwright project-specific skips (pre-existing).

## Layer 2: spec coverage (100 scenarios)

98 scenarios: proof unit/e2e, test named `Scenario: <title>` found as passed in the verbose proof output (round 3 re-checked every title against the log).

| Scenario | proof | Evidence |
|---|---|---|
| Release v0.2.0 published (release) | manual (runs on GitHub after the ship-time tag push) | Gate 2 checklist |
| Grouped tabs read well (domain-pages) | manual (wording and look are taste, risk R3; judged at Gate 2) | Gate 2 checklist |

Gaps: none.

## Manual checklist
- After the ship-time tag push, confirm the GitHub release v0.2.0 is published.
- `npm run dev` (http://localhost:5173), open a domain page: check the grouped tabs wording and look.

## Diffstat
187 files changed, 5866 insertions(+), 168 deletions(-) (origin/main...flow/gate-1-decisions)

## Screenshots
Only `test-results/shots/mockups/*.png` in the worktree; the e2e run wrote no change-specific shots.

## Review

Fresh-context review, round 1 (diff origin/main...flow/gate-1-decisions):
1. [correctness] createEntry/updateEntry validated ratings on the old 0.5–5 scale → fixed in e0b64c1 (isValidRating; "Scenario: Create and update accept the full rating range", red before: "Rating must be 0.5 to 5 in half steps").
2. [spec mismatch] initialStatus loaded but unused → fixed in 0cfbde7 (piece form preselects; "Scenario: Status prefill reaches the piece form", red before: Expected "owned", Received "wishlist").
3. [weak test] "Both add routes open the combined form" pinned only the load result → fixed in 727984f (e2e pins Kind and the label list).
4. [weakened, justified] 0003 tests stop at 0003; no head-schema check → added in 727984f ("Scenario: A migrated database matches a fresh one at head").

Scoped review of the fix commits, round 2:
1. [weakened] Page URL visibility dropped → restored in 5b1ef76.
2. [weak test] media add form "no status field" not asserted → added in 5b1ef76 (mutation red: Expected 0, Received 1).
3. [spec mismatch] requirement text promised media prefill in the form → narrowed in 9c1c6c0 (piece form preselects; media form has no status field until the redesign).

Scoped review of round-2 commits, round 3: no findings.
