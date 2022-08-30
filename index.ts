import fastify from "fastify";
import fetch from "node-fetch";
import { StarData } from "./types";

const tierToEmoji = {
  0: "💀",
  1: "💩",
  2: "😕",
  3: "🌝",
  4: "👀",
  5: "👯‍♂️",
  6: "🕺",
  7: "🤌",
  8: "💪",
  9: "🦧",
};

const server = fastify();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.get("/", async (request, reply) => {
  reply.send({ hello: "world" });
});

server.post<{ Body: StarData }>("/shooting-star", async (request) => {
  const { sender, world, tier, location } = request.body;

  const messageConfig = {
    username: "Sam Uffindell",
    content: `🌏 W${world} 💪 T${tierToEmoji[tier]} 🗺 ${location} 🗣 ${sender}`,
  };

  fetch(
    "https://discord.com/api/webhooks/1013941731378614473/TRsrmHLDzCdPx6fJixAp5J-b_ideHeXOZZx7sRlzWxXufNMxlx9RicIvDU0fDnBJLbb0",
    {
      method: "POST",
      body: JSON.stringify(messageConfig),
      headers: { "Content-Type": "application/json" },
    }
  );
});

server.listen({ port, host: "::" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
