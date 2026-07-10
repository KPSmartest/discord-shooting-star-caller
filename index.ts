import fastify from "fastify";

import {handleAutocomplete, handleCommand} from "./commands";
import {PORT} from "./config";
import {verifyRequest} from "./discord";
import {startScheduler} from "./scheduler";
import {Interaction, InteractionResponseType, InteractionType} from "./types";

const server = fastify();

// Discord's signature is over the raw request body, so keep JSON as a string rather than
// letting Fastify parse it before we've verified it.
server.addContentTypeParser("application/json", {parseAs: "string"}, (_req, body, done) => {
  done(null, body);
});

server.get("/", async (_request, reply) => {
  reply.send({status: "ok"});
});

server.post("/interactions", async (request, reply) => {
  const rawBody = request.body as string;
  const signature = request.headers["x-signature-ed25519"] as string | undefined;
  const timestamp = request.headers["x-signature-timestamp"] as string | undefined;

  if (!verifyRequest(rawBody, signature, timestamp)) {
    return reply.code(401).send("invalid request signature");
  }

  const interaction = JSON.parse(rawBody) as Interaction;

  switch (interaction.type) {
    case InteractionType.PING:
      return reply.send({type: InteractionResponseType.PONG});
    case InteractionType.APPLICATION_COMMAND:
      return reply.send(await handleCommand(interaction));
    case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
      return reply.send(handleAutocomplete(interaction));
    default:
      return reply.code(400).send("unhandled interaction type");
  }
});

server.listen({port: PORT, host: "::"}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
  startScheduler();
  console.log(`Reminder scheduler started (polling every ${30}s)`);
});
