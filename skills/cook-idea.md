---
name: cook-idea
description: Pressure-tests an incubating idea before it becomes committed work.
trigger: Use when an idea exists but needs feasibility, risk, and value scrutiny.
---

# cook-idea

## Purpose

Turn an interesting idea into a clear readiness verdict: ready, needs work, or
not worth pursuing now.

## Inputs

- Incubating idea document or summary.
- Evidence about users, technical dependencies, cost, and operational risk.
- Current project constraints and release priorities.

## Workflow

1. Restate the idea as a falsifiable product and engineering claim.
2. List the strongest case for shipping it.
3. List the strongest case against shipping it.
4. Identify missing evidence, high-risk assumptions, and cheaper alternatives.
5. Assign a verdict: `READY`, `NEEDS_WORK`, or `REJECT`.
6. If ready, write the handoff notes for `approve-incubating`.

## Verification

The verdict must name the evidence used, the unresolved assumptions, and the
smallest implementation slice that could prove the idea.

## Stop Conditions

- The idea cannot be evaluated without private business data the user has not
  provided.
- The implementation path depends on manual approval or external setup.
- The value proposition is still ambiguous after one clarification pass.
