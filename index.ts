import fastify from "fastify";
import fetch from "node-fetch";

import {DISCORD_WEBHOOK_URL, PORT} from "./config";
import {StarData} from "./types";

const tierToEmoji = {
  0: "💀",
  1: "💩",
  2: "😕",
  3: "🌝",
  4: "👀",
  5: "🕺",
  6: "👯‍♂️",
  7: "🦾",
  8: "💪",
  9: "🦧",
};

const server = fastify();

server.get("/", async (_request, reply) => {
  reply.send({hello: "world"});
});

server.post<{Body: StarData}>("/shooting-star", async (request) => {
  const {sender, world, tier, location} = request.body;

  const messageConfig = {
    content: `🌏 W${world}    ${tierToEmoji[tier]} T${tier}    🗺 ${location}    🗣 ${sender}`,
  };

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify(messageConfig),
    headers: {"Content-Type": "application/json"},
  });
});

server.listen({port: PORT, host: "::"}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
