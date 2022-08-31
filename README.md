# discord-shooting-star-caller

A server with an endpoint that receives data from the [star-calling-assist-plugin](https://github.com/zodaz/star-calling-assist) and posts it in a Discord channel using a [webhook](https://discord.com/developers/docs/resources/webhook). This example uses [Fly.io](https://fly.io/) for hosting.

## Installation

```bash
npm install
```

## Project config

You will need to make a copy of the `.env.example` file and name it `.env`. In `.env` you will need to provide your Discord channel's webhook url. Find out how to get this url by reading Discord's [Intro to Webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).

```bash
DISCORD_WEBHOOK_URL=your-webhook-url-goes-here
```

## Building the app

```bash
npm run build
```

## Running the app

```bash
npm run start
```

## Hosting your app

We recommend following this [deployment guide](https://fly.io/docs/getting-started/node/) from Fly.io.
