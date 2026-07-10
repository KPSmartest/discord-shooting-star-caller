# Discord Reminder Bot

A Discord bot that lets users schedule messages to be posted back to a channel at a
future date/time. A repurposing of the former "shooting star caller" webhook relay.

## Language

**Reminder**:
A one-off scheduled message that the bot posts to a Discord channel at a specific
future date/time, then never fires again.
_Avoid_: Alert, notification, timer (a "timer" is a distinct reminder-bot feature we are not building).

**Creator**:
The Discord user who ran the `/remind` command that created a **Reminder**. The default
**Mention** target.
_Avoid_: Owner, author.

**Mention**:
Who the **Reminder** pings when it fires. Defaults to the **Creator**; can be overridden
per-reminder to a role (including `@everyone`) or another user. (`@here` is not supported —
it cannot be expressed as a Discord "mentionable".)
_Avoid_: Target, ping, recipient.

**Fire**:
The act of the bot posting a **Reminder** into its channel at (or after) its scheduled
time. A **Reminder** fires exactly once.
_Avoid_: Trigger, send, dispatch.

## Reminder lifecycle

A **Reminder** is always in one of four states:

- **pending** — scheduled, not yet fired.
- **fired** — successfully posted to the channel.
- **failed** — its scheduled time arrived but delivery failed (channel gone, bot kicked,
  missing permission). Not retried.
- **cancelled** — deleted by a user before it fired.

A **Reminder** whose time passed while the bot was offline still **fires** late once the
bot returns; it is not counted as **failed**.

## Relationships

- A **Reminder** is delivered to exactly one Discord channel (the one it was created in).
- A **Reminder** has exactly one **Creator** and exactly one **Mention** target.
- Reminders are **shared**: any member of the server can list or cancel any **Reminder**.

## Example dialogue

> **Dev:** "If I set a **Reminder** for `@everyone`, who's the **Creator**?"
> **Domain expert:** "You are — the **Creator** is whoever ran `/remind`. The **Mention**
> is separate: that's who gets pinged when it **fires**. They're only the same when you
> leave **Mention** at its default."
>
> **Dev:** "And if the bot's redeploying at the exact minute it's due?"
> **Domain expert:** "It still **fires** — late, on the next poll after it's back. That's
> not a **failed** **Reminder**; failed means the time came and delivery genuinely broke."

## Flagged ambiguities

- ~~"ping the channel" vs "ping the user"~~ — resolved: a **Reminder** posts to its
  channel and pings its **Mention** target, which defaults to the **Creator**.
