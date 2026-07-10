// Slash-command schema sent to Discord at registration. Kept free of other imports so the
// registration script doesn't pull in the database or runtime config.

// Discord application command option types.
const SUB_COMMAND = 1;
const STRING = 3;
const MENTIONABLE = 9;

export const COMMANDS = [
  {
    name: "remind",
    description: "Set a one-off reminder in this channel",
    options: [
      {
        name: "when",
        description: 'When to fire — e.g. "in 2h", "tomorrow 9am", "2026-07-15 14:00"',
        type: STRING,
        required: true,
      },
      {name: "message", description: "What to be reminded about", type: STRING, required: true},
      {name: "mention", description: "Who to ping when it fires (defaults to you)", type: MENTIONABLE, required: false},
    ],
  },
  {
    name: "reminders",
    description: "View or cancel pending reminders",
    options: [
      {name: "list", description: "List this server's pending reminders", type: SUB_COMMAND},
      {
        name: "delete",
        description: "Cancel a pending reminder",
        type: SUB_COMMAND,
        options: [
          {
            name: "reminder",
            description: "Start typing to pick a reminder",
            type: STRING,
            required: true,
            autocomplete: true,
          },
        ],
      },
    ],
  },
];
