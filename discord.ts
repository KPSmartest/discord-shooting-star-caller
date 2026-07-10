import {verifyKey} from "discord-interactions";

import {DISCORD_BOT_TOKEN, DISCORD_PUBLIC_KEY} from "./config";
import {MentionType, Reminder} from "./types";

const API = "https://discord.com/api/v10";

type AllowedMentions = {parse: string[]; users?: string[]; roles?: string[]};

// Verify a request genuinely came from Discord (Ed25519 signature over timestamp + body).
export function verifyRequest(rawBody: string, signature?: string, timestamp?: string): boolean {
  if (!signature || !timestamp) {
    return false;
  }
  return verifyKey(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY);
}

// The mention markdown that pings the target. @everyone is the role whose id == guild id.
export function mentionString(guildId: string, type: MentionType, id: string): string {
  if (type === "role") {
    return id === guildId ? "@everyone" : `<@&${id}>`;
  }
  return `<@${id}>`;
}

// allowed_mentions must explicitly permit the ping or Discord silently suppresses it.
function allowedMentions(guildId: string, type: MentionType, id: string): AllowedMentions {
  if (type === "role") {
    return id === guildId ? {parse: ["everyone"]} : {parse: [], roles: [id]};
  }
  return {parse: [], users: [id]};
}

// Post the reminder into its channel via the bot token. Throws on a non-2xx response.
export async function sendReminder(reminder: Reminder): Promise<void> {
  const mention = mentionString(reminder.guildId, reminder.mentionType, reminder.mentionId);
  const res = await fetch(`${API}/channels/${reminder.channelId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      content: `🔔 ${mention} ${reminder.message}`,
      allowed_mentions: allowedMentions(reminder.guildId, reminder.mentionType, reminder.mentionId),
    }),
  });
  if (!res.ok) {
    throw new Error(`Discord API ${res.status}: ${await res.text()}`);
  }
}
