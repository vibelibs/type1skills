---
name: closeout-enforcer
description: Completes the verification, documentation, and hygiene checks after implementation.
trigger: Use after an implementation task passes its first targeted verification.
---

# closeout-enforcer

## Purpose

Make completion trustworthy by checking behavior, documentation, repository
hygiene, and handoff evidence before a task is called done.

## Inputs

- Implemented TODO or change summary.
- Changed files and verification commands.
- Documentation, tests, release notes, or runbook surfaces affected by the work.

## Workflow

1. Recheck the task acceptance criteria against the actual diff.
2. Run targeted tests and any required documentation validation.
3. Decide whether docs, examples, changelog, or operator notes must change.
4. Record residual risk, skipped checks, and any external blockers.
5. Mark the task ready for review only after evidence is complete.
6. Hand the work to `review`.

## Verification

Closeout evidence must include what changed, what passed, what was not run, and
why the remaining risk is acceptable or blocked.

## Stop Conditions

- A required verification command fails.
- Documentation and behavior disagree.
- The implementation solved a different problem than the TODO requested.
