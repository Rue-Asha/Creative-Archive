# release Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: CI workflow
`.github/workflows/ci.yml` SHALL run on pull requests and pushes to `main` with `contents: read` and call
`.github/workflows/gate.yml`: on `["self-hosted","homelab-check"]` for pull requests, on `ubuntu-24.04` for pushes to
`main`; a newer run for the same pull request SHALL cancel the one still running and push runs SHALL NOT be
cancelled. The gate SHALL run `npm ci`, install Playwright Chromium, run `npm run check`, `npm run package`,
`npm run test:unit`, verify the tarball's sha256, run the e2e suite against the unpacked tarball (`E2E_APP_DIR`) and
upload tarball and checksum as the `release-tarball` artifact, building the app exactly once. `ci.yml` SHALL call
`Rue-Asha/ci/.github/workflows/security-baseline.yml@7b49f3dcf37c61aea3722e68917bc06db507f386 # v1.1.0`. Every
`uses:` SHALL be pinned to a full commit SHA with the version in a comment (Cooking-Hub's pins), `actions/checkout`
SHALL use `persist-credentials: false`, and no dependency cache SHALL be used.

#### Scenario: Workflow actions are pinned to commit SHAs
- **WHEN** every workflow file under `.github/workflows/` is read
- **THEN** each `uses:` of a remote action or workflow ends in `@<40 hex chars> # v…`, each `actions/checkout` step sets `persist-credentials: false`, and no step uses a `cache:` input
- **proof:** unit

#### Scenario: CI is green on the change's PR
- **WHEN** the change's pull request is opened on GitHub
- **THEN** the `ci / ci` job and the `security-baseline` jobs pass and a `release-tarball` artifact is uploaded
- **proof:** manual (runs on GitHub; the repo is created at ship, the change's own PR shows the checks green)

#### Scenario: Push to main runs on a GitHub-hosted runner
- **WHEN** a commit is pushed to `main`
- **THEN** the `ci` job of its run reports the `ubuntu-24.04` runner and uploads `release-tarball`
- **proof:** manual (runs on GitHub after the merge; the run's job page shows the runner)

#### Scenario: Superseded PR run is cancelled
- **WHEN** a second commit is pushed to a pull request branch while its `ci` run is still running
- **THEN** the earlier run ends as cancelled and the new run starts
- **proof:** manual (runs on GitHub; seen when a fixer pushes to the change's PR, otherwise read from the concurrency block)

#### Scenario: E2E runs against the unpacked tarball
- **WHEN** the gate job runs
- **THEN** its log shows one `vite build`, the e2e step runs with `E2E_APP_DIR` set to the unpacked tarball, and the image tests pass there (sharp loads from the tarball's `node_modules`)
- **proof:** manual (runs on GitHub; read from the change's PR run log)

### Requirement: Dependabot
`.github/dependabot.yml` SHALL check `github-actions` and `npm` weekly and ignore semver-major updates of `typescript`
(as in Cooking-Hub).

#### Scenario: Dependabot config covers actions and npm
- **WHEN** `.github/dependabot.yml` is read
- **THEN** it lists both ecosystems with a weekly schedule and the `typescript` major ignore
- **proof:** manual (configuration; read at Gate 2, dependabot runs on GitHub)

### Requirement: Release workflow
`.github/workflows/release.yml` SHALL run on `v*` tags with the jobs `check-tag` (tag equals `v` + `package.json`
version, the `ci` push run on the tagged commit succeeded and its artifact has not expired), `publish` (download
`release-tarball`, verify the checksum, attest build provenance, `gh release create --generate-notes` with the tarball
and `.sha256`, no rebuild) and `bump` (`Rue-Asha/ci/.github/workflows/bump-pin.yml@7b49f3dcf37c61aea3722e68917bc06db507f386 # v1.1.0`
with `app: creative-archive`, `host_vars_path: ansible/inventory/host_vars/creative-archive01/vars.yml`,
`variable: creative_archive_version`, secrets `HOMELAB_BUMP_APP_ID` / `HOMELAB_BUMP_APP_KEY`), mirrored from
Cooking-Hub.

#### Scenario: Tag does not match the version
- **WHEN** a tag `v9.9.9` is pushed while `package.json` says `0.1.0`
- **THEN** the `check-tag` job fails and no release is published
- **proof:** manual (runs on GitHub on a tag push; not exercised by this change, read from the workflow at Gate 2)

#### Scenario: Release publishes the tested tarball
- **WHEN** tag `v0.1.0` is pushed on the merged `main` commit whose `ci` push run is green
- **THEN** the release holds `creative-archive-0.1.0.tgz` and its `.sha256` from that run's `release-tarball` artifact, and the release run contains no gate job
- **proof:** manual (runs on GitHub after the ship-time tag push)

#### Scenario: Bump fails until the deploy change exists
- **WHEN** `v0.1.0` is released before Homelab-Managment has `ansible/inventory/host_vars/creative-archive01/vars.yml`
- **THEN** the `publish` job succeeds and the `bump` job fails, which is accepted until `creative-archive-deploy` lands
- **proof:** manual (runs on GitHub after the ship-time tag push; the run page shows both results)

### Requirement: Release runbook
`docs/release.md` SHALL describe how a release is cut (bump version in the change, merge, tag `v<version>`, artifact
expiry after 90 days) and list every outward step this change needs at ship, in order, each marked ⚠ with its exact
command or setting: create the repo `Rue-Asha/Creative-Archive` and push the bootstrap `main`; register the repo in
Homelab-Managment's check runner (`check_runner_repos`) before the PR; secrets `HOMELAB_BUMP_APP_ID` /
`HOMELAB_BUMP_APP_KEY`; the `main` ruleset in Cooking-Hub shape (required `ci / ci` and
`security-baseline / {workflow-lint,secret-scan,dependency-review}`, no deletion, no non-fast-forward); push the
branch, PR, merge; tag `v0.1.0`; and a pointer to `creative-archive-deploy` (LXC, role, nginx
`client_max_body_size 17m`, `BODY_SIZE_LIMIT=17M`, sqlite backups). The README SHALL link to it.

#### Scenario: Runbook lists the outward steps
- **WHEN** `docs/release.md` is read
- **THEN** it lists each outward step above in order, each with ⚠ and the exact command or setting
- **proof:** manual (documentation; checked by reading the file at Gate 2)

### Requirement: Version 0.1.3
`package.json` and `package-lock.json` SHALL carry version 0.1.3. After the change is merged, flow's shipper SHALL push
tag `v0.1.3` so the release workflow publishes `creative-archive-0.1.3.tgz` with its sha256.

#### Scenario: Package and lockfile carry 0.1.3
- **WHEN** `package.json` and `package-lock.json` (root and `packages[""]`) are read
- **THEN** all three versions are "0.1.3"
- **proof:** unit

#### Scenario: Release v0.1.3 published
- **WHEN** tag `v0.1.3` is pushed on the merged `main`
- **THEN** the release workflow passes `check-tag` and a GitHub release v0.1.3 holds `creative-archive-0.1.3.tgz` and its `.sha256`
- **proof:** manual (runs on GitHub after the ship-time tag push)

