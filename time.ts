import * as chrono from "chrono-node";
import {DateTime} from "luxon";

import {TIMEZONE} from "./config";

export type ParseResult = {ok: true; fireAt: number} | {ok: false; error: string};

// Parse human time input into a UTC epoch (ms), interpreting bare wall-clock times in the
// configured server timezone.
export function parseWhen(text: string, now: Date = new Date()): ParseResult {
  const nowInZone = DateTime.fromJSDate(now).setZone(TIMEZONE);
  if (!nowInZone.isValid) {
    return {ok: false, error: `Server timezone "${TIMEZONE}" is not a valid IANA zone.`};
  }

  // Anchor chrono to the zone's current UTC offset so "friday 2pm" means 2pm here. This is
  // correct for all relative input and for absolute times within the current DST period —
  // i.e. effectively all real usage. An absolute time set across a DST boundary could be an
  // hour off; acceptable at this scale and documented in the README.
  const parsed = chrono.parseDate(text, {instant: now, timezone: nowInZone.offset});
  if (!parsed) {
    return {
      ok: false,
      error: `I couldn't read "${text}" as a time. Try "in 2h", "tomorrow 9am", or "2026-07-15 14:00".`,
    };
  }

  const fireAt = parsed.getTime();
  if (fireAt <= now.getTime()) {
    return {ok: false, error: "That time is in the past — give me a future time."};
  }

  return {ok: true, fireAt};
}

// Discord's native timestamp markdown, rendered in each viewer's own local timezone.
// Style "F" = full date/time, "R" = relative ("in 3 hours").
export function discordTimestamp(epochMs: number, style: "F" | "R" = "F"): string {
  return `<t:${Math.floor(epochMs / 1000)}:${style}>`;
}

// Plain-text time in the server zone, for contexts where Discord markdown is not rendered
// (e.g. autocomplete choice labels).
export function formatInZone(epochMs: number): string {
  return DateTime.fromMillis(epochMs).setZone(TIMEZONE).toFormat("ccc d LLL, h:mm a");
}
