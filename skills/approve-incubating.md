---
name: approve-incubating
description: Promotes a ready idea into explicit TODO work with acceptance criteria.
trigger: Use when an incubating idea has a ready verdict and needs implementation tasks.
---

# approve-incubating

## Purpose

Convert a ready idea into actionable work that an implementation agent can
execute without rediscovering scope.

## Inputs

- Ready idea and cook-session verdict.
- Architecture notes, ownership boundaries, and existing roadmap.
- Verification commands or acceptance checks.

## Workflow

1. Confirm the idea has a ready verdict and a named proof slice.
2. Write the accepted idea summary with scope, non-goals, risks, and artifacts.
3. Break the work into ordered TODOs with prerequisites.
4. Add acceptance criteria and verification for each TODO.
5. Route blocked tasks to an operator queue instead of pretending they are
   actionable.
6. Hand the first actionable TODO to `solve-next-todo`.

## Verification

Each TODO must have a clear owner surface, reason to do it now, acceptance
criteria, and a verification command or manual proof.

## Stop Conditions

- The idea lacks a ready verdict.
- The work requires a product decision that changes project direction.
- A TODO cannot be verified with available tooling or a named manual check.
