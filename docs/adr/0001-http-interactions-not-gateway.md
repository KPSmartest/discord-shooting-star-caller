# Receive commands via HTTP Interactions, not a gateway connection

We build the bot as an HTTP Interactions endpoint (Discord POSTs signed slash-command
payloads to our Fastify server, verified via Ed25519) rather than as a persistent
gateway (WebSocket) bot using discord.js.

A reminder bot needs no gateway events — only to receive slash commands and to send
messages on a schedule. The interactions model reuses the existing Fastify + Fly.io
HTTP infrastructure, avoids babysitting a WebSocket across Fly restarts, and is
stateless-friendly. Proactive reminder delivery is done separately via Discord's REST API.

## Consequences

- We cannot listen to raw gateway events (message creates, reactions, presence). This
  is acceptable — a reminder bot never needs them. Adding such a feature later would
  require introducing a gateway connection.
- Interaction handlers must respond within Discord's 3-second window.
