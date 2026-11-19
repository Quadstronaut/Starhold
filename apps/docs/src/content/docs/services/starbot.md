---
title: Starbot
description: One bot, run by Starhold. Add it to your Discord server in one click. Not open yet.
sidebar:
  order: 6
---

**Starbot is one bot, run by Starhold. Add it to your Discord server in one click.**

- **State:** In development.
- **Availability:** Not open yet.
- **Where:** [dash.starhold.app](https://dash.starhold.app)

## How to add it

The Add button on [dash.starhold.app](https://dash.starhold.app) is disabled until Starbot opens. After that, click **Add Starbot to your server**, pick the server on Discord's own screen, and you are done. You need the Manage Server permission on that server. You never use a developer portal, and Starbot never asks for your bot token.

## Plans

A plan covers one Discord server. You can move a plan to another server in the dashboard, once a day. <!-- assumed: A1 plan unit, A2 move once a day -->

| Plan | Price | What it is |
|---|---|---|
| Free | $0 | Moderation (kick, ban, timeout, warn), Welcome (greetings, auto-role, reaction and button roles), Suggestions, Giveaways. <!-- assumed: A6 free split --> |
| Starbot Plus | $5 a month | Everything in Free, plus Leveling, Logging (joins, leaves, bans, role changes, and that a message was edited or deleted, without its text), Scheduled posts, Forms and tickets, Approvals, Custom commands, GitHub feed, Integration relays, Alerts and on-call, and Data sync. <!-- assumed: A6 free split, A10 plan name --> |
| Starbot Pro | $19 a month | Everything in Plus, and the Ops Pack: Server monitoring, App monitoring, and Page and API watch. <!-- assumed: A10 plan name --> |

Adding Starbot is free and includes the free modules. A paid plan unlocks the rest on one server. The free experience has no ads, and Starbot posts no upsell messages in your server. <!-- assumed: A6 -->

You can buy a plan on starhold.app (Starhold Account, payment by Polar, our merchant of record) and inside Discord, at the same price. The [Starhold Suite](/services/) ($49 a month) includes Starbot for one server, with no separate checkout. Plans renew monthly until cancelled. Cancel a plan bought on the dashboard from its Manage billing link, which opens Polar's customer portal. Cancel a Suite on your Starhold Account page. Refunds are paid less the payment processing cost. Full details in the [Refund Policy](https://starhold.dev/legal/refunds).

## What it asks for

Starbot asks only for the permissions your chosen modules need. It never asks for Administrator. <!-- assumed: A3 -->

- Always: View Channels, Send Messages, Send Messages in Threads, Embed Links, Read Message History, and Change Nickname.
- Moderation adds Kick Members, Ban Members, Timeout Members, and Manage Messages.
- Welcome and Leveling add Manage Roles.
- Giveaways, Welcome and Suggestions add Add Reactions.
- Forms and tickets adds Create Public Threads, Create Private Threads, and Manage Threads.
- Turning on a new module later may ask you to approve one extra permission.

Starbot uses Discord's Server Members intent, which powers welcome messages, auto-roles, and member join, leave and role logs. It does not use the Message Content intent: Starbot does not read what people write. It does not use the Presence intent. <!-- assumed: A4 -->

## Your name and avatar

You set Starbot's nickname, avatar, banner and bio for your server. Outside your server it shows as Starbot. <!-- assumed: A5 -->

## What Starbot keeps and deletes

**Kept:** your server's settings and the data your modules need, for example XP counts, tickets, giveaway entries, scheduled posts and webhook settings. Each server's data is stored in its own separate database file. Discord user, channel and role IDs are kept where a module needs them. Starbot keeps no message text. Secrets you give modules (webhook keys, API keys) are stored encrypted. We never sell data, never use it for ads, and never use it to train AI.

**Deleted:** if Starbot is removed from your server, that server's data is deleted 48 hours later, so an accidental removal can be undone. <!-- assumed: A8 --> You can delete it immediately in the dashboard, and export it at any time. When a paid plan ends, paid modules switch off at the end of the paid period, and their data is deleted when the payment grace period ends. Free modules keep working. <!-- assumed: A9 --> Deleted data also leaves our backups: the server's backup copy is deleted with it, and small control backups (server ID, nickname, avatar link) expire within 15 days. The [privacy policy](https://starhold.dev/legal/privacy) says the same.

Questions about what Starbot holds: use the [contact form](https://starhold.dev/contact) or write to [hello@starhold.dev](mailto:hello@starhold.dev).

## Not in the first version

Features that read message text (message-text logging, keyword filtering by the bot), Slack, Teams, and a personal (user-installed) app.
