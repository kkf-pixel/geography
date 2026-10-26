<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloud Agent

`npm ci` installs dependencies. `npm run lint` and `npm run build` are the checks.

On boot, the dev server listens on port 3000. Open it at [http://localhost:3000](http://localhost:3000). Next.js development mode allows `localhost` and blocks other hostnames, including `127.0.0.1`. Pages opened from a blocked host render, but client interactions such as the map game and theme toggle do not run.
