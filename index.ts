import fastify from "fastify";
import fetch from "node-fetch";

import {DISCORD_WEBHOOK_URL, DISCORD_UPDATE_WEBHOOK_URL, PORT} from "./config";
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

type AnnouncerProfile = {
  username: string;
  avatar_url: string;
};

const announcers: Record<string, AnnouncerProfile> = {
  aaronGilmore: {
    username: "Aaron Gilmore",
    avatar_url:
      "https://res.cloudinary.com/djboxbtij/image/upload/v1668370414/discord-shooting-star-caller/aaron_x1xgrd.jpg",
  },
  samUffindell: {
    username: "Sam Uffindell",
    avatar_url:
      "https://res.cloudinary.com/djboxbtij/image/upload/v1668370418/discord-shooting-star-caller/sam_fzdb6t.jpg",
  },
} as const;

function getAnnouncer(): AnnouncerProfile {
  const randomInt = Math.floor(1 + Math.random() * (10 - 1 + 1));

  if (randomInt >= 3) {
    return announcers.samUffindell;
  }

  return announcers.aaronGilmore;
}

type SendMessageParams = {
  webhookUrl: string;
  data: StarData;
};

function sendMessage({webhookUrl, data}: SendMessageParams) {
  const {sender, world, tier, location} = data;

  const announcer = getAnnouncer();

  const messageConfig = {
    ...announcer,
    content: `🌏 W${world}    ${tierToEmoji[tier]} T${tier}    🗺 ${location}    🗣 ${sender}`,
  };

  fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify(messageConfig),
    headers: {"Content-Type": "application/json"},
  });
}

const server = fastify();

server.get("/", async (_request, reply) => {
  reply.send({hello: "world"});
});

server.post<{Body: StarData}>("/shooting-star", async (request) => {
  sendMessage({webhookUrl: DISCORD_WEBHOOK_URL, data: request.body});
});

server.post<{Body: StarData}>("/shooting-star-update", async (request) => {
  sendMessage({webhookUrl: DISCORD_UPDATE_WEBHOOK_URL, data: request.body});
});

server.listen({port: PORT, host: "::"}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
