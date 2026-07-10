import Database from "better-sqlite3";

import {DATABASE_PATH} from "./config";
import {NewReminder, Reminder} from "./types";

const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id      TEXT NOT NULL,
    channel_id    TEXT NOT NULL,
    creator_id    TEXT NOT NULL,
    mention_type  TEXT NOT NULL,
    mention_id    TEXT NOT NULL,
    message       TEXT NOT NULL,
    fire_at       INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    created_at    INTEGER NOT NULL,
    fired_at      INTEGER
  );
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders (status, fire_at);`);

// Alias snake_case columns to the camelCase shape of the Reminder type.
const COLUMNS = `
  id,
  guild_id AS guildId,
  channel_id AS channelId,
  creator_id AS creatorId,
  mention_type AS mentionType,
  mention_id AS mentionId,
  message,
  fire_at AS fireAt,
  status,
  created_at AS createdAt,
  fired_at AS firedAt
`;

export function getReminder(id: number): Reminder | undefined {
  return db.prepare(`SELECT ${COLUMNS} FROM reminders WHERE id = ?`).get(id) as Reminder | undefined;
}

export function createReminder(r: NewReminder): Reminder {
  const info = db
    .prepare(
      `INSERT INTO reminders (guild_id, channel_id, creator_id, mention_type, mention_id, message, fire_at, status, created_at)
       VALUES (@guildId, @channelId, @creatorId, @mentionType, @mentionId, @message, @fireAt, 'pending', @createdAt)`
    )
    .run({...r, createdAt: Date.now()});
  return getReminder(Number(info.lastInsertRowid)) as Reminder;
}

// Pending reminders whose time has arrived (or passed, while we were down).
export function dueReminders(now: number): Reminder[] {
  return db
    .prepare(`SELECT ${COLUMNS} FROM reminders WHERE status = 'pending' AND fire_at <= ? ORDER BY fire_at ASC`)
    .all(now) as Reminder[];
}

export function listPending(guildId: string): Reminder[] {
  return db
    .prepare(`SELECT ${COLUMNS} FROM reminders WHERE status = 'pending' AND guild_id = ? ORDER BY fire_at ASC`)
    .all(guildId) as Reminder[];
}

export function searchPending(guildId: string, query: string, limit = 25): Reminder[] {
  return db
    .prepare(
      `SELECT ${COLUMNS} FROM reminders
       WHERE status = 'pending' AND guild_id = ? AND message LIKE ?
       ORDER BY fire_at ASC LIMIT ?`
    )
    .all(guildId, `%${query}%`, limit) as Reminder[];
}

export function markFired(id: number, firedAt: number): void {
  db.prepare(`UPDATE reminders SET status = 'fired', fired_at = ? WHERE id = ?`).run(firedAt, id);
}

export function markFailed(id: number): void {
  db.prepare(`UPDATE reminders SET status = 'failed' WHERE id = ?`).run(id);
}

// Cancel a pending reminder. Returns true if one was actually cancelled.
// Shared scope: any member of the guild may cancel any of the guild's reminders.
export function cancelReminder(id: number, guildId: string): boolean {
  const info = db
    .prepare(`UPDATE reminders SET status = 'cancelled' WHERE id = ? AND guild_id = ? AND status = 'pending'`)
    .run(id, guildId);
  return info.changes > 0;
}
