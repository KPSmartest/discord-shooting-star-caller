// Registers the slash commands to the single guild this bot serves. Guild-scoped commands
// appear (and update) instantly. Run with: yarn register
import {COMMANDS} from "./command-defs";

const APPLICATION_ID = process.env.APPLICATION_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function main(): Promise<void> {
  if (!APPLICATION_ID || !GUILD_ID || !DISCORD_BOT_TOKEN) {
    throw new Error("APPLICATION_ID, GUILD_ID and DISCORD_BOT_TOKEN must all be set (see .env.example).");
  }

  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(COMMANDS),
  });

  if (!res.ok) {
    throw new Error(`Registration failed ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as Array<{name: string}>;
  console.log(`Registered ${data.length} commands to guild ${GUILD_ID}: ${data.map((c) => c.name).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
