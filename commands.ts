import {cancelReminder, createReminder, listPending, searchPending} from "./db";
import {mentionString} from "./discord";
import {discordTimestamp, formatInZone, parseWhen} from "./time";
import {
  AutocompleteChoice,
  CommandOption,
  EPHEMERAL,
  Interaction,
  InteractionResponseType,
  MentionType,
} from "./types";

type ResponseBody = {type: number; data?: Record<string, unknown>};

// Ephemeral (only the invoker sees it) and pings nothing — confirmations must never notify.
function ephemeral(content: string): ResponseBody {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {content, flags: EPHEMERAL, allowed_mentions: {parse: []}},
  };
}

function findOption(options: CommandOption[] | undefined, name: string): CommandOption | undefined {
  return (options ?? []).find((o) => o.name === name);
}

function creatorId(interaction: Interaction): string {
  return interaction.member?.user.id ?? interaction.user?.id ?? "";
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function handleCommand(interaction: Interaction): Promise<ResponseBody> {
  switch (interaction.data?.name) {
    case "remind":
      return handleRemind(interaction);
    case "reminders":
      return handleReminders(interaction);
    default:
      return ephemeral("Unknown command.");
  }
}

function handleRemind(interaction: Interaction): ResponseBody {
  const options = interaction.data?.options;
  const when = String(findOption(options, "when")?.value ?? "");
  const message = String(findOption(options, "message")?.value ?? "");
  const guildId = interaction.guild_id;
  const channelId = interaction.channel_id;

  if (!guildId || !channelId) {
    return ephemeral("⚠️ Reminders can only be set inside a server channel.");
  }
  if (message.length > 2000) {
    return ephemeral("⚠️ That message is too long (Discord's limit is 2000 characters).");
  }

  const parsed = parseWhen(when);
  if (!parsed.ok) {
    return ephemeral(`⚠️ ${parsed.error}`);
  }

  // Default the mention to the creator; otherwise resolve whether they picked a user or role.
  const creator = creatorId(interaction);
  let mentionType: MentionType = "user";
  let mentionId = creator;
  const picked = findOption(options, "mention");
  if (picked?.value) {
    mentionId = String(picked.value);
    mentionType = interaction.data?.resolved?.roles?.[mentionId] ? "role" : "user";
  }

  const reminder = createReminder({
    guildId,
    channelId,
    creatorId: creator,
    mentionType,
    mentionId,
    message,
    fireAt: parsed.fireAt,
  });

  const who = mentionString(guildId, mentionType, mentionId);
  return ephemeral(
    `✅ Reminder **#${reminder.id}** set for ${discordTimestamp(parsed.fireAt)} ` +
      `(${discordTimestamp(parsed.fireAt, "R")}). I'll ping ${who} in this channel.`
  );
}

function handleReminders(interaction: Interaction): ResponseBody {
  const sub = interaction.data?.options?.[0];
  switch (sub?.name) {
    case "list":
      return handleList(interaction);
    case "delete":
      return handleDelete(interaction, sub);
    default:
      return ephemeral("Unknown subcommand.");
  }
}

function handleList(interaction: Interaction): ResponseBody {
  const guildId = interaction.guild_id ?? "";
  const pending = listPending(guildId);
  if (!pending.length) {
    return ephemeral("No pending reminders. 🎉");
  }
  const lines = pending.map((r) => {
    const who = mentionString(guildId, r.mentionType, r.mentionId);
    return (
      `**#${r.id}** · ${discordTimestamp(r.fireAt)} (${discordTimestamp(r.fireAt, "R")}) · ` +
      `${who} · ${r.message} — set by <@${r.creatorId}>`
    );
  });
  return ephemeral(truncate(lines.join("\n"), 2000));
}

function handleDelete(interaction: Interaction, sub: CommandOption): ResponseBody {
  const guildId = interaction.guild_id ?? "";
  const id = parseInt(String(findOption(sub.options, "reminder")?.value ?? ""), 10);
  if (!Number.isInteger(id)) {
    return ephemeral("⚠️ Pick a reminder from the suggestions.");
  }
  const cancelled = cancelReminder(id, guildId);
  return ephemeral(
    cancelled ? `🗑️ Cancelled reminder **#${id}**.` : `⚠️ Reminder **#${id}** not found (already fired or cancelled?).`
  );
}

export function handleAutocomplete(interaction: Interaction): ResponseBody {
  const guildId = interaction.guild_id ?? "";
  const sub = interaction.data?.options?.[0];
  const focused = sub?.options?.find((o) => o.focused);
  const matches = searchPending(guildId, String(focused?.value ?? ""));
  const choices: AutocompleteChoice[] = matches.map((r) => ({
    name: truncate(`#${r.id} · ${formatInZone(r.fireAt)} · ${r.message}`, 100),
    value: String(r.id),
  }));
  return {type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, data: {choices}};
}
