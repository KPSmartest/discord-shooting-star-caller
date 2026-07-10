# discord-reminder-bot

A small, private Discord bot for **one-off reminders**. Set a reminder with a slash
command and the bot posts it back into the channel at the time you chose, pinging whoever
you specify.

```
/remind when:"tomorrow 9am" message:"stand-up" mention:@everyone
/reminders list
/reminders delete reminder:<pick from autocomplete>
```

It's built as a **Discord HTTP interactions** endpoint (not a gateway bot), stores
reminders in **SQLite**, and fires them from an **in-process polling loop**. See
[`CONTEXT.md`](./CONTEXT.md) for the domain language and [`docs/adr/`](./docs/adr) for the
architectural decisions behind those choices.

## How it works

- Discord POSTs each slash command to `POST /interactions`; the request's Ed25519
  signature is verified before anything runs.
- `/remind` parses the time (via `chrono-node`, interpreted in the server timezone with
  `luxon`), stores a reminder as a UTC epoch, and replies with an ephemeral confirmation.
- A loop polls SQLite every ~30s for due reminders and delivers them via the Discord REST
  API. Reminders that came due while the bot was down fire late on the next poll rather
  than being dropped.

## Setup

### 1. Create the Discord application

In the [Developer Portal](https://discord.com/developers/applications): create an
application, add a **Bot**, and copy the **Application ID**, **Public Key**, and **Bot
Token**. Invite the bot to your server with the `applications.commands` and `bot` scopes
and permission to **View Channels** and **Send Messages** (and **Mention @everyone** if you
want `@everyone` reminders).

### 2. Configure environment

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

| Variable | What it is |
| --- | --- |
| `APPLICATION_ID` | Your application's ID |
| `DISCORD_PUBLIC_KEY` | Used to verify inbound interactions |
| `DISCORD_BOT_TOKEN` | Used to post reminders |
| `GUILD_ID` | The one server this bot serves |
| `TIMEZONE` | IANA zone for wall-clock times, e.g. `Pacific/Auckland` |
| `DATABASE_PATH` | SQLite file path (local default: `./reminders.db`) |

### 3. Install, register commands, run

```bash
yarn install
yarn register   # push slash commands to your guild (instant)
yarn dev        # build + run locally
```

To receive interactions, Discord needs a public HTTPS URL. `yarn dev` listens on port
3000, so expose it with a tunnel. Cloudflare Tunnel is the least hassle (free, no account):

```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

It prints a URL like `https://<random>.trycloudflare.com`. Set the **Interactions Endpoint
URL** in the Developer Portal to that URL + `/interactions`, e.g.
`https://<random>.trycloudflare.com/interactions`. (ngrok works too: `ngrok http 3000`.)

> **Gotcha:** your server *and* the tunnel must be running when you click **Save** —
> Discord immediately sends a signed PING and rejects the URL unless it gets a valid PONG.
> The quick-tunnel URL also changes on every restart, so you'll re-paste it each session.

For anything beyond local iteration, skip the tunnel: deploy to Fly (below) and point the
portal at the permanent `https://<your-app>.fly.dev/interactions` URL instead.

## Deploying (Fly.io)

The bot runs as a single always-on machine with a persistent volume for SQLite.

```bash
# once: create the volume in the app's region
fly volumes create reminder_data --size 1 --region syd

# once: set the only real secret (the bot token)
fly secrets set DISCORD_BOT_TOKEN=<your-bot-token>

fly deploy
```

`APPLICATION_ID`, `GUILD_ID`, `DISCORD_PUBLIC_KEY`, `TIMEZONE`, `DATABASE_PATH`, and `PORT`
are all set in `fly.toml` (they're identifiers / config, not secrets). Only the bot token is
a secret. Pushing to `main` also deploys via the existing GitHub Action. After deploying, set
the Interactions Endpoint URL to `https://<your-app>.fly.dev/interactions`.

## Notes / limitations (v1)

- **One-off reminders only** — no recurring reminders, timers, or todo lists.
- **Single server timezone.** `@here` isn't supported (Discord can't offer it as a
  mentionable); use `@everyone` instead.
- **DST edge:** an absolute time set on the far side of a daylight-saving transition may be
  an hour off. Relative times (`in 2h`) are always exact.
- **Shared scope:** anyone in the server can list or cancel any reminder.
