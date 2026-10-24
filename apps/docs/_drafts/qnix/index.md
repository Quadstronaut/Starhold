---
title: What is QNix
description: Design notes for QNix, the encrypted, multi-tenant Kubernetes platform Starhold has in development. Work on it is paused.
sidebar:
  order: 1
---

**QNix is a private, encrypted, multi-tenant Kubernetes platform** — built from scratch by Quadstronaut over sixteen weeks and ~1,080 commits. It exists because Starhold needed infrastructure that takes privacy seriously at every layer, not as an afterthought.

## Paused

QNix is in development, and work on it is paused while the hosted services come first. These pages are its design notes. It is not open to anyone yet. The architecture, tenancy and security pages describe how it is meant to work; the build chronicle covers how it got this far.

## What it's built to do

- **Encryption everywhere.** Traffic between users and the cluster is TLS-terminated. Traffic between nodes is kernel-level WireGuard — no plaintext leaves the box. Data at rest uses per-tenant keys the platform itself cannot read.
- **Hard tenant isolation.** Each tenant runs in its own Kubernetes control plane (vCluster). Your environment cannot touch another's, and the platform cannot decrypt your data.
- **Sleep-wake economics.** Apps scale to zero when idle and wake on the first request — with a real progress bar, not a 5xx. Reserved capacity only when you need it.

## Not open yet

QNix is not taking sign-ups while it is paused. To ask about it, use the contact form at [starhold.dev/contact](https://starhold.dev/contact) or write to [hello@starhold.dev](mailto:hello@starhold.dev).
