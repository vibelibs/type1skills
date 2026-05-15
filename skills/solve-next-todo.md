---
name: solve-next-todo
description: Implements the next actionable TODO with focused verification.
trigger: Use when the project has open TODO work that can be completed by editing the repository.
---

# solve-next-todo

## Purpose

Pick the next actionable TODO, implement it, verify it, and prepare it for
closeout.

## Inputs

- Ordered TODO list or issue queue.
- Task capsule, acceptance criteria, and code anchors.
- Repository status and test commands.

## Workflow

1. Choose the highest-priority unblocked TODO.
2. Confirm prerequisites, current behavior, and affected files.
3. Make the smallest coherent implementation change.
4. Add or update focused tests when behavior changes.
5. Run the narrowest useful verification command.
6. Pass the result to `closeout-enforcer` with changed files and evidence.

## Verification

Report the exact command outputs that prove the TODO is done, including any
remaining risk or skipped check.

## Stop Conditions

- The TODO is blocked by missing credentials, manual setup, or product approval.
- The repository has unrelated edits that overlap the same files.
- The acceptance criteria conflict with current architecture or tests.
