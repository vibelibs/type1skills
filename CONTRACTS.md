# Type1Skills Independence Contract

Type1Skills is a public product site and standalone Git repository. The
dataserver workspace may run local build, test, and deployment helpers against
this folder, but the site must remain releasable from this repo alone.

## Repository Boundary

- Canonical repo path in the dataserver workspace: `type1skills/`
- Public repository target: `https://github.com/vibelibs/type1skills`
- Package name: `type1skills`
- Site source: `src/`
- Build output: `dist/`
- Cloudflare Pages config: `wrangler.jsonc`
- Static Pages files: `public/_headers` and `public/_redirects`

The root dataserver repo must not track files inside `type1skills/`. It may keep
orchestration scripts that resolve and call the nested repo, similar to the
Datagrid and Dataplatform workspace contract.

## Cloudflare Pages Contract

- Pages project: `type1skills`
- Production domain: `www.type1skills.com`
- Build command: `pnpm run build`
- Build output directory: `dist`
- Production branch: `main`

After the first Pages project deploy, attach `www.type1skills.com` as the
production custom domain in Cloudflare Pages if it is not already attached.

## Local Commands

From this repo:

```bash
pnpm run dev
pnpm run typecheck
pnpm run build
pnpm run pages:deploy
```

From the dataserver workspace root:

```bash
npm run dev:type1skills
npm run typecheck:type1skills
npm run build:type1skills:site
npm run deploy:type1skills:pages
```

## Coupling Rules

- The public site must not import source files from dataserver, Dataplatform, or
  Datagrid.
- Shared product language should be copied into docs/tests intentionally, not
  imported at runtime.
- Domain, Pages, and static-asset config live in this repo.
- Dataserver tests may verify the boundary but should not make the site depend
  on private runtime services.
