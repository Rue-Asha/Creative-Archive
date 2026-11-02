## RENAMED Requirements

- FROM: `### Requirement: Version 0.1.0`
- TO: `### Requirement: Version 0.1.1`

## MODIFIED Requirements

### Requirement: Version 0.1.1
`package.json` and `package-lock.json` SHALL carry version 0.1.1. After the change is merged, flow's shipper SHALL push
tag `v0.1.1` so the release workflow publishes `creative-archive-0.1.1.tgz` with its sha256.

#### Scenario: Package and lockfile carry 0.1.1
- **WHEN** `package.json` and `package-lock.json` (root and `packages[""]`) are read
- **THEN** all three versions are "0.1.1"
- **proof:** unit

#### Scenario: Release v0.1.1 published
- **WHEN** tag `v0.1.1` is pushed on the merged `main`
- **THEN** the release workflow passes `check-tag` and a GitHub release v0.1.1 holds `creative-archive-0.1.1.tgz` and its `.sha256`
- **proof:** manual (runs on GitHub after the ship-time tag push)
