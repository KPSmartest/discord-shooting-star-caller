// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

export type MentionType = "user" | "role";

export type ReminderStatus = "pending" | "fired" | "failed" | "cancelled";

export type Reminder = {
  id: number;
  guildId: string;
  channelId: string;
  creatorId: string;
  mentionType: MentionType;
  mentionId: string;
  message: string;
  fireAt: number; // UTC epoch ms — the source of truth for timing
  status: ReminderStatus;
  createdAt: number; // UTC epoch ms
  firedAt: number | null; // UTC epoch ms, set when delivered
};

export type NewReminder = Omit<Reminder, "id" | "status" | "createdAt" | "firedAt">;

// ---------------------------------------------------------------------------
// Discord interactions (only the fields we use)
// ---------------------------------------------------------------------------

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
} as const;

// Ephemeral message flag (1 << 6).
export const EPHEMERAL = 64;

export type CommandOption = {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: CommandOption[]; // present on subcommands
  focused?: boolean; // present during autocomplete
};

export type ResolvedData = {
  users?: Record<string, {id: string}>;
  roles?: Record<string, {id: string}>;
};

export type Interaction = {
  id: string;
  type: number;
  application_id: string;
  token: string;
  guild_id?: string;
  channel_id?: string;
  member?: {user: {id: string; username: string}};
  user?: {id: string; username: string};
  data?: {
    id: string;
    name: string;
    options?: CommandOption[];
    resolved?: ResolvedData;
  };
};

export type AutocompleteChoice = {name: string; value: string};
