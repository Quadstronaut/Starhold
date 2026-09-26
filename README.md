<div align="center">

# starhold-site

**Public web properties for Starhold Software — storefront, docs, and app launcher.**

[![Last Commit](https://img.shields.io/github/last-commit/Quadstronaut/Starhold?style=flat-square&logo=git&logoColor=white)](https://github.com/Quadstronaut/Starhold/commits/master)
[![Repo Size](https://img.shields.io/github/repo-size/Quadstronaut/Starhold?style=flat-square&logo=github)](https://github.com/Quadstronaut/Starhold)
[![Top Language](https://img.shields.io/github/languages/top/Quadstronaut/Starhold?style=flat-square)](https://github.com/Quadstronaut/Starhold)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-node_adapter-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Astro](https://img.shields.io/badge/Astro-Starlight-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

[![Storefront](https://img.shields.io/badge/storefront-apps%2Fstorefront-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](#-storefront)
[![Docs](https://img.shields.io/badge/docs-apps%2Fdocs-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](#-docs)
[![Hangar](https://img.shields.io/badge/hangar-apps%2Fhangar-4A90D9?style=for-the-badge&logo=html5&logoColor=white)](#-hangar)
[![Develop](https://img.shields.io/badge/develop-quickstart-22863A?style=for-the-badge&logo=terminal&logoColor=white)](#-develop)
[![Build](https://img.shields.io/badge/build-commands-0D1117?style=for-the-badge&logo=hammer&logoColor=white)](#-build)
[![Notes](https://img.shields.io/badge/notes-env%20%26%20secrets-D29922?style=for-the-badge&logo=keybase&logoColor=white)](#-notes)

</div>

---

## 🗺️ At a Glance

<a id="at-a-glance"></a>

| Path | Stack | Serves | Domains |
|------|-------|--------|---------|
| `apps/storefront` | SvelteKit (node adapter) | Store — catalog, configurator, cart, Stripe Checkout | `starhold.dev` / `.fyi` / `.app` |
| `apps/docs` | Astro Starlight | Documentation & knowledge site | `starhold.dev` / `.fyi` / `.app` |
| `apps/hangar` | Static HTML | Hosted-apps launcher | `starhold.dev` / `.fyi` / `.app` |

> Each app is self-contained — install and build from its own directory.

---

## 🏗️ Architecture

<a id="architecture"></a>

```mermaid
graph TD
    subgraph domains["starhold.dev · starhold.fyi · starhold.app"]
        SF["🛒 Storefront<br/>apps/storefront<br/>SvelteKit · node adapter"]
        DC["📚 Docs<br/>apps/docs<br/>Astro Starlight"]
        HG["🚀 Hangar<br/>apps/hangar<br/>Static HTML"]
    end

    SF --> STRIPE["Stripe Checkout"]
    SF --> DISC["Discord Webhooks<br/>(orders · intake)"]
    SF --> ENV["Runtime Secrets<br/>env vars at deploy time"]
    STRIPE --> ENV
    DISC --> ENV
```

---

## 🛒 Storefront

<a id="storefront"></a>

**`apps/storefront`** — SvelteKit (node adapter)

The store: product catalog, bot configurator, shopping cart, and Stripe Checkout integration. Discord webhooks notify on orders and intake submissions.

---

## 📚 Docs

<a id="docs"></a>

**`apps/docs`** — Astro Starlight

The documentation and knowledge site.

---

## 🚀 Hangar

<a id="hangar"></a>

**`apps/hangar`** — Static HTML

The hosted-apps launcher.

---

## 💻 Develop

<a id="develop"></a>

```sh
cd apps/storefront   # or apps/docs
npm install
npm run dev
```

---

## 🔨 Build

<a id="build"></a>

```sh
# SvelteKit → node server in build/
cd apps/storefront
npm run build
```

```sh
# Astro static site → dist/
cd apps/docs
npm run build
```

---

## 📋 Notes

<a id="notes"></a>

> [!IMPORTANT]
> Runtime secrets are supplied via environment variables at deploy time — **never committed.**

Required environment variables:

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API authentication |
| `STRIPE_PRICE_CUSTOM_BOT` | Custom bot product price ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `DISCORD_WEBHOOK_ORDERS` | Order notification webhook |
| `DISCORD_WEBHOOK_INTAKE` | Intake form submission webhook |

> [!NOTE]
> `.env.example` files are not yet present. The variables above are the full required set.

> [!NOTE]
> This repository holds the public site code only.
