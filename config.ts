export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
export const DISCORD_UPDATE_WEBHOOK_URL = process.env.DISCORD_UPDATE_WEBHOOK_URL || "";
export const CACHE_TIMEOUT = process.env.CACHE_TIMEOUT ? parseInt(process.env.CACHE_TIMEOUT) : 7200;