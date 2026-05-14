# Type1Skills

Independent public website for `www.type1skills.com`.

This directory is a standalone Git repository inside the broader dataserver
workspace. Keep the public site, Cloudflare Pages config, and domain contract
here so Type1Skills can ship without coupling its release train to dataserver,
Dataplatform, or Datagrid.

Type1Skills presents the rebooted Type 1 risk harness for coding agents. The site frames the product around an extensible harness, Pi packages, context engineering, model switching, steerable execution, tree history, and evidence gates for decisions that are expensive or impossible to reverse.

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
