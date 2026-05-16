---
name: ideas-radar
description: Map a repository's idea pipeline across accepted, incubating, inbox, and rejected ideas.
trigger: Use when the user asks for idea pipeline status, what is ready to promote, what is blocked, or how accepted ideas connect to TODOs and task capsules.
---

# Ideas Radar

The Ideas Radar plugin turns product thinking into a visible operating board.

Read the local snapshot first:

- `.type1skills/ideas-radar/snapshot.json`

If no snapshot exists, ask the harness to generate one from:

- `IDEAS.md` or `workflow/IDEAS.md`
- `TODO.md` or `workflow/TODO.md`
- idea docs under `workflow/docs/ideas/`
- task capsules under `workflow/docs/tasks/`

Report:

- accepted ideas and their linked TODOs
- incubating ideas with cook-session verdicts and blockers
- inbox ideas waiting for a cook session
- rejected ideas and their winning alternatives
- pipeline health and next action

Do not promote, reject, or edit ideas from this skill. It is a read-only radar.
