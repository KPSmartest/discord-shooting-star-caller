# Host on Fly.io with SQLite-on-volume and an in-process scheduler

We host the bot as a single always-on Fly.io machine, persist reminders in SQLite on a
Fly volume (`better-sqlite3`), and fire reminders with an in-process polling loop
(`setInterval` ~30s querying `WHERE fire_at <= now`).

## Context / trade-off

We seriously considered the serverless alternative — Cloudflare Workers + D1 + Cron
Triggers — which fits the HTTP-interactions model (see ADR 0001) and is free. It was
rejected because the existing Fly org is grandfathered on the old free allowance (3×
shared-cpu-1x-256MB + 3GB volume), so Fly is *also* $0/mo here, and Fly keeps the
familiar platform plus the existing GitHub Actions deploy pipeline. Local dev is also
simpler (plain `node` + `better-sqlite3`, no `wrangler`/`miniflare` emulator).

## Consequences

- The machine must stay always-on (`min_machines_running = 1`, no auto-stop) — you
  cannot both scale-to-zero and run an in-process scheduler.
- Single machine only: SQLite lives on one volume, so no horizontal scaling. Fine at
  the expected scale (~3 users). Scaling out later would force a move to Postgres/libSQL.
- Reminders due while the machine is down (deploys, crashes) fire late on the next poll
  rather than being dropped — an accepted property of the due-or-overdue query.
