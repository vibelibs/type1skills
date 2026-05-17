# Type1Skills

Independent public website for `www.type1skills.com`.

This directory is a standalone Git repository inside the broader dataserver
workspace. Keep the public site, Cloudflare Pages config, and domain contract
here so Type1Skills can ship without coupling its release train to dataserver,
Dataplatform, or Datagrid.

Type1Skills presents the rebooted Type 1 risk harness for coding agents. The site frames the product around an extensible harness, Type1Skills extension packs, context engineering, model switching, steerable execution, tree history, and evidence gates for decisions that are expensive or impossible to reverse.

The site is intentionally static so it can deploy independently to Cloudflare Pages while the Dataplatform Growth route and workflow docs explain the same app from the product and persona side.

## Local Development

```bash
pnpm --dir type1skills run dev
```

## Build

```bash
pnpm --dir type1skills run build
```

The build output is written to `type1skills/dist`.

From inside this repo, the same command is:

```bash
pnpm run build
```

## Harness Review In Docker

Use the harness review container when you want to test Type1Skills as a fresh
CLI install without sharing local Codex, Claude, Copilot, npm, or shell state.
It packages the current repo, installs the `type1skills` command globally in a
clean Linux image, switches to an unprivileged user, disables runtime network,
and runs the install flow inside a disposable product-review project.

From inside this repo:

```bash
pnpm run docker:harness
```

Or with Docker Compose:

```bash
docker compose -f compose.harness.yml run --rm harness-review
```

The smoke review verifies:

- `type1skills --version`
- bundled plugin listing
- unknown package rejection
- `type1skills install @type1skills/spark`
- `type1skills install @type1skills/review`
- bundled plugin installation for Ideas Radar and Skill Matrix
- no `.codex`, `.claude`, or Copilot home configuration is visible in the clean
  container user

The JSON result is written to `.harness-review-results/harness-review.json`,
which is ignored by Git.

## Cloudflare Pages

```bash
npm run deploy:type1skills:pages
```

From inside this repo:

```bash
pnpm run pages:deploy
```

Defaults:

- Pages project: `type1skills`
- Production domain target: `www.type1skills.com`
- Build output: `type1skills/dist`
- Pages config: `type1skills/wrangler.jsonc`

Attach `www.type1skills.com` to the Cloudflare Pages project as a custom domain after the first project deploy if it is not already attached.

See `CONTRACTS.md` for the release, workspace, and domain boundary.
