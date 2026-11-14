---
title: Render
description: OG image, PDF and screenshot API. Open, paid plans.
sidebar:
  order: 4
---

**An API that turns a page or HTML into an OG image, a PDF or a screenshot.**

- **State:** Open · paid plans.
- **Availability:** Open: free tier; Hobby $5, Pro $19, Scale $49 a month.
- **Where:** [render.starhold.app](https://render.starhold.app)

## How to get in

Sign in with your [Starhold Account](https://starship.starhold.app), then use the API on the free tier or buy a paid plan. The four plans are Free, Hobby $5, Pro $19 and Scale $49 a month, on the [pricing page](https://render.starhold.app/pricing); Free is 50 renders a month with a small watermark. Paid plans are on sale. These rules apply to every purchase.

## Using the API

1. Sign in, then create an API key on your dashboard. The key is shown once.
2. Send a `POST` with `Authorization: Bearer YOUR_API_KEY` and a JSON body to `https://render.starhold.app/v1/og`, `/v1/pdf` or `/v1/screenshot`. The file comes back as the response body.
3. Errors come back as JSON with a code. Use a client timeout of 35 seconds: a render may wait up to 10 seconds for a free slot and then run for up to 20.

The full reference is at [render.starhold.app/docs](https://render.starhold.app/docs).

## Plans and limits

| | Free | Hobby | Pro | Scale |
|---|---|---|---|---|
| Price | $0 | $5 a month | $19 a month | $49 a month |
| Renders a month | 50 | 1,000 | 10,000 | 50,000 |
| Renders a minute | 10 | 20 | 60 | 120 |
| Renders at once | 1 | 1 | 2 | 2 |
| Watermark | Yes | No | No | No |

A cache hit and a failed request are not counted. Allowances reset on the first of each month, 00:00 UTC. At your allowance renders stop with a 402 error that says how many you used and when it resets.

## Fair terms and privacy defaults

- **Your content is not kept:** the pages, HTML and images you render live in a cache for at most 24 hours. Logs hold no page content, URL paths, queries or parameter values.
- **No trackers.**
- **Export and delete:** from your [Starhold Account](https://starship.starhold.app): sign in, then export your data or delete your account.
- **Hard limits, clear errors:** over a limit you get a 4xx with the limit named. No plan jumps the queue; plans differ in how many renders run at once.
- **No surprise charges:** at your allowance renders stop; nothing upgrades without your click.

## Cancel any time

- **Cancel with a prorated refund** through the Polar customer portal. The [refund terms](https://starhold.dev/legal/refunds) apply.
