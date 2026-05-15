---
name: spark-to-ship
description: Orchestrates a generic project from idea discovery through review and release.
trigger: Use when a user asks to run the full idea-to-release workflow or ship all open project work.
---

# spark-to-ship

## Purpose

Run the complete DevOps loop for a project:
IDEAS -> INCUBATING -> APPROVING -> TODO -> DOING -> DONE.

This is the sole entry point for the skill pack. It delegates each stage to the
stage skill that owns the work.

## Inputs

- Project goal, product area, or open work queue.
- Repository status and branch policy.
- Existing idea, TODO, release, and review artifacts when the project has them.
- Verification commands that prove the changed behavior.

## Workflow

1. Start with `new-ideas` when the project needs fresh candidates.
2. Run `cook-idea` for each candidate that needs pressure testing.
3. Run `approve-incubating` for candidates that are ready to become tracked work.
4. Run `solve-next-todo` until actionable TODO work is complete or blocked.
5. Run `closeout-enforcer` after each implemented unit of work.
6. Run `review` before release handoff.
7. Run `release-enforcer` only after verification and review evidence are ready.

## Operating Rules

- Keep a visible stage ledger with current stage, artifacts changed, verification
  evidence, blocker state, and release state.
- Work in small units that can be reviewed and reverted independently.
- Do not continue across a risky boundary without an explicit owner, rollback
  path, and verification plan.
- Preserve user work in the repository. Do not reset or overwrite unrelated
  changes.

## Verification

Before reporting completion, list the commands or manual checks that prove the
implementation, documentation, review, and release handoff.

## Stop Conditions

- Repository state is dirty in a way that makes ownership unclear.
- A stage has two valid next moves and the choice changes scope or risk.
- Verification fails after focused repair attempts.
- Release credentials, approvals, or production access are missing.
