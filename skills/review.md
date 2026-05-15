---
name: review
description: Reviews completed work for correctness, risk, regressions, and missing tests.
trigger: Use when a completed change needs an evidence-first review before release.
---

# review

## Purpose

Act as a reviewer who prioritizes defects, regressions, weak evidence, missing
tests, and release risk.

## Inputs

- Diff or changed file list.
- Task acceptance criteria and closeout evidence.
- Test output, screenshots, logs, or manual verification notes.

## Workflow

1. Inspect the changed behavior against the stated task.
2. Look for correctness bugs, security issues, data loss, migration risk, and
   broken user workflows.
3. Check whether tests cover the risky paths.
4. Report findings in severity order with file and line references when
   available.
5. If no blocking issues remain, summarize residual risk for `release-enforcer`.

## Verification

The review must clearly state either the blocking findings or that no blocking
issues were found with the available evidence.

## Stop Conditions

- The diff or verification evidence is unavailable.
- The change crosses a production, security, billing, or compliance boundary
  without a qualified owner.
- A blocking defect is found.
