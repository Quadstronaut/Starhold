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

Each paid subscription covers **two** Discord servers. You choose both in the dashboard, and you can change either one once a day. A third server needs another subscription, and one account can hold several. <!-- ruled 2026-11-19: two servers per subscription; assumed: A2 change once a day per server -->

| Plan | Price | What it is |
|---|---|---|
| Free | $0 | Moderation (kick, ban, timeout, warn), Welcome (greetings, auto-role, reaction and button roles), Suggestions, Giveaways. <!-- ruled 2026-11-19 --> |
| Plus | $5 a month, two servers | Everything in Free, plus Leveling, Logging (joins, leaves, bans, role changes, and that a message was edited or deleted, without its text), Scheduled posts, Forms and tickets, Approvals, Custom commands, GitHub feed, Integration relays, Alerts and on-call, and Data sync. <!-- ruled 2026-11-19 --> |
| Pro | $19 a month, two servers | Everything in Plus, and Server monitoring, App monitoring, and Page and API watch. <!-- ruled 2026-11-19 --> |

Adding Starbot is free and includes the free modules. A paid plan unlocks the rest on the two servers you choose. The free experience has no ads, and Starbot posts no upsell messages in your server. <!-- ruled 2026-11-19 -->

You can buy a plan on starhold.app (Starhold Account, payment by Polar, the seller and merchant of record, which uses Stripe to process cards; Starhold never sees card numbers) or inside Discord, at the same price and for the same two servers. If you buy in Discord, sign in to the dashboard with the same Discord account to choose its servers. The [Starhold Suite](/services/) ($49 a month) includes Starbot Pro for two servers, with no separate checkout. Plans renew monthly until cancelled. Cancel a plan bought on the dashboard from its Manage billing link, which opens Polar's customer portal. Cancel a plan bought in Discord in Discord. Cancel a Suite on your Starhold Account page. Refunds are paid less the payment processing cost. Full details in the [Refund Policy](https://starhold.dev/legal/refunds).

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

**Deleted:** if Starbot is removed from your server, that server's data is deleted right away, with no grace period. <!-- ruled 2026-11-19 --> The plan's place for that server becomes free, so you can choose another server for it. The plan keeps running and billing, and is not cancelled or refunded automatically. If a paid plan is on no server, the dashboard says so, and if your Starhold Account has your email address (you chose to share it at sign-in) it also emails you a service message about it after 24 hours, and a reminder 3 days before a renewal where we know the date. <!-- ruled 2026-11-19 --> You can also delete it yourself in the dashboard, and export it at any time. When a paid plan ends, paid modules switch off at the end of the paid period, and their data is deleted when the payment grace period ends. Free modules keep working. <!-- assumed: A9 --> Deleted data also leaves our backups: the server's backup copy is deleted with it, and small control backups (server ID, nickname, avatar link) expire within 15 days. The [privacy policy](https://starhold.dev/legal/privacy) says the same.

Questions about what Starbot holds: use the [contact form](https://starhold.dev/contact) or write to [hello@starhold.dev](mailto:hello@starhold.dev).

## Not in the first version

Features that read message text (message-text logging, keyword filtering by the bot), Slack, Teams, and a personal (user-installed) app.

On the roadmap, with no date: an AI support module that answers questions from your own documents. It will use an API key you bring from your own AI provider.
