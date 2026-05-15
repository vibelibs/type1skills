---
name: release-enforcer
description: Prepares verified and reviewed work for source-control and deployment handoff.
trigger: Use when work is implemented, verified, reviewed, and ready for release handling.
---

# release-enforcer

## Purpose

Move completed work toward merge or deployment without skipping branch hygiene,
review evidence, or external gate checks.

## Inputs

- Clean closeout report.
- Review result.
- Repository branch, remote, CI, and deployment policy.
- Release notes and rollback notes when needed.

## Workflow

1. Confirm implementation, tests, docs, and review gates are complete.
2. Check branch status, changed files, and upstream target.
3. Prepare commit, pull request, or release handoff according to project policy.
4. Run or inspect CI and deployment gates when credentials are available.
5. Record whether release is complete, deferred, or blocked.

## Verification

The release handoff must include branch, commit or pull request identifier,
CI/deploy status, release notes, and rollback or defer reason.

## Stop Conditions

- Source-control credentials or release permissions are missing.
- CI is failing for reasons tied to the change.
- The working tree includes unrelated changes that cannot be separated safely.
