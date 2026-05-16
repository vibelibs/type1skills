---
name: skill-matrix
description: Audit Type1Skills skill usage, usefulness, runtime pressure, and token consumption so teams know which skills to protect, tune, trim, or keep on demand.
trigger: Use when the user asks which skills are expensive, which skills consume the most tokens, which workflows are worth keeping, or how to optimize the Type1Skills operating lane.
---

# Skill Matrix

The Skill Matrix plugin turns skill telemetry into an operating dashboard.

Read the local snapshot first:

- `.type1skills/skill-matrix/snapshot.json`
- `memory/skill-radar/latest.json`

If no snapshot exists, ask the harness to generate one from:

- `.type1skills/metrics/skill-runs.jsonl` or `memory/skill-history/runs.jsonl`
- `.type1skills/metrics/skill-budget/*.jsonl` or `memory/skill-budget/*.jsonl`
- `.type1skills/skills/**/*.md`

Report each skill with:

- usage count and actor attribution
- helpful, neutral, and costly outcomes
- average runtime and wall-clock pressure
- input, output, total, and average tokens
- budget class distribution
- recommendation: protect, optimize, tune, trim, or on-demand

Do not treat token totals as exact billing unless provider pricing is also present.
Use token metrics as directional pressure: high token use plus high importance means
optimize the skill, not remove it.
