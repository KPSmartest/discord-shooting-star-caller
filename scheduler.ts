import {dueReminders, markFailed, markFired} from "./db";
import {sendReminder} from "./discord";

const POLL_INTERVAL_MS = 30_000;

let running = false;

async function tick(): Promise<void> {
  // Guard against a slow tick overlapping the next one.
  if (running) {
    return;
  }
  running = true;
  try {
    const due = dueReminders(Date.now());
    for (const reminder of due) {
      try {
        await sendReminder(reminder);
        markFired(reminder.id, Date.now());
      } catch (err) {
        // Delivery genuinely failed (channel gone, bot kicked, missing perms). No retry.
        console.error(`Failed to deliver reminder #${reminder.id}:`, err);
        markFailed(reminder.id);
      }
    }
  } finally {
    running = false;
  }
}

// Poll for due reminders forever. Restart-safe: all state lives in SQLite, so a redeploy
// just resumes polling and any reminder that came due meanwhile fires on the next tick.
export function startScheduler(): void {
  const run = () => {
    tick().catch((err) => console.error("Scheduler tick error:", err));
  };
  run();
  setInterval(run, POLL_INTERVAL_MS);
}
