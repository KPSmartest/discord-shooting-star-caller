function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Discord application credentials.
export const APPLICATION_ID = required("APPLICATION_ID");
export const DISCORD_PUBLIC_KEY = required("DISCORD_PUBLIC_KEY");
export const DISCORD_BOT_TOKEN = required("DISCORD_BOT_TOKEN");

// The single server this private bot serves.
export const GUILD_ID = required("GUILD_ID");

// IANA timezone used to interpret wall-clock reminder times ("friday 2pm").
export const TIMEZONE = process.env.TIMEZONE || "Pacific/Auckland";

// SQLite database location. Defaults to a local file; production points at a Fly volume.
export const DATABASE_PATH = process.env.DATABASE_PATH || "./reminders.db";
