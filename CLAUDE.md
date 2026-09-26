# STOP — this repo is a generated mirror. Do not build here.

**`starhold-site` (remote `Quadstronaut/Starhold`, public) is a scrubbed, generated
mirror of `apps/` from `starhold-ops`. It is an output, not a source.**

| | |
|---|---|
| **Source of truth** | `Quadstronaut/starhold-ops` (private) — local clone `G:\Documents\GIT\BUSINESS-pursuits\Starhold` |
| **What deploys** | ops → `/srv/starhold-ops` on `starhold-vps` → podman image → `starhold.dev` |
| **What this repo does** | receives `apps/**` from ops via `.github/workflows/mirror-public.yml` |

## Before you touch anything

Work on the storefront, docs, or hangar belongs in **`Starhold/` (ops)**, not here.

```sh
cd G:/Documents/GIT/BUSINESS-pursuits/Starhold      # ops = source of truth
```

Confirm what the real state is before planning — this mirror runs behind ops:

```sh
diff -rq Starhold/apps/storefront/src starhold-site/apps/storefront/src
```

## Why this file exists

On 2026-08-24 an entire storefront redesign was built in this repo. It could
never have deployed, and the next ops push to `apps/**` would have overwritten
it. Worse, ops was ahead in 11 files — the Ops Pack tier, `/services/fullstack`,
`/api/handoff`, a `cookie` security override — so shipping the mirror's version
would have **deleted live product work**.

The redesign also invented a capability ("Integration work") that Starhold does
not sell and omitted **Full Stack Solutions**, which it does, purely because this
mirror's `products.json` was stale. All of it had to be hand-merged afterwards
while the owner waited to see a deploy.

**Never point a subagent, council, or workflow at this directory as its working
tree.** A spec built on this repo is built on stale facts.

This repo being public is **by design** — that is what a public mirror is for.
It is not a leak; do not "fix" it by making it private.
