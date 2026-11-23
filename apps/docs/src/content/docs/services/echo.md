---
title: Echo
description: Free answers about your own connection. No account, no cookies, HTTPS only.
sidebar:
  order: 6
---

**What the internet sees when you connect.** Echo tells you your public IP address, your user agent, your request headers, how your connection was encrypted, and a few helpers. It is free for everyone, with no account and no keys. It sets no cookies, shows no adverts. Echo itself does not store your address (see Privacy below for the one exception: the web server's error log).

- **State:** Open · free.
- **Availability:** Open: free, no account.
- **Where:** [echo.starhold.app](https://echo.starhold.app)

Echo only answers questions about your own connection. It never looks anything up about another address or host, and it never connects to anyone else. There is nothing to sign in to, so there is no export or delete: Echo keeps nothing about you.
## Use it from a browser

Open [echo.starhold.app/ip](https://echo.starhold.app/ip). You get a page with your answer and the commands to ask for it from a script.

## Use it from a script

Always use `https://`. A request over plain HTTP gets a redirect to the same `https://` address and no answer: a privacy-focused service does not send your diagnostic details in clear text.

In Windows PowerShell 5.1 the word curl is an alias for a different command (Invoke-WebRequest), which is why a PowerShell line is given; curl.exe is the real curl, where it is installed.

### `/ip`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/ip/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/ip/plain
```

**One JSON field**

**Shell (curl)**

```sh
curl https://echo.starhold.app/ip/json
```

**PowerShell**

```powershell
(Invoke-RestMethod https://echo.starhold.app/ip/json).ip
```

### `/ua`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/ua/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/ua/plain
```

**One JSON field**

**Shell (curl)**

```sh
curl https://echo.starhold.app/ua/json
```

**PowerShell**

```powershell
(Invoke-RestMethod https://echo.starhold.app/ua/json).user_agent
```

### `/headers`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/headers/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/headers/plain
```

### `/tls`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/tls/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/tls/plain
```

### `/time`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/time/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/time/plain
```

**One JSON field**

**Shell (curl)**

```sh
curl https://echo.starhold.app/time/json
```

**PowerShell**

```powershell
(Invoke-RestMethod https://echo.starhold.app/time/json).unix
```

### `/uuid`

**Plain text**

**Shell (curl)**

```sh
curl https://echo.starhold.app/uuid/plain
```

**PowerShell**

```powershell
Invoke-RestMethod https://echo.starhold.app/uuid/plain
```

**One JSON field**

**Shell (curl)**

```sh
curl https://echo.starhold.app/uuid/json
```

**PowerShell**

```powershell
(Invoke-RestMethod https://echo.starhold.app/uuid/json).uuid
```

### `/status/<code>`

**Print the status code**

**Shell (curl)**

```sh
curl -s -o /dev/null -w '%{http_code}' https://echo.starhold.app/status/503/plain
```

**PowerShell**

```powershell
try { Invoke-RestMethod https://echo.starhold.app/status/503/plain } catch { $_.Exception.Response.StatusCode.value__ }
```


## What each service answers

| Service | Answers |
|---|---|
| `/ip` | Your public IP address. JSON also says whether it is IPv4 or IPv6 |
| `/ua` | Your user agent |
| `/headers` | The request headers Echo received. The values of `Cookie` and `Authorization` are hidden, and headers that Starhold's own server adds for Echo (names starting `X-Echo-`) are left out |
| `/tls` | TLS version, cipher, protocol and HTTP version of your connection |
| `/time` | Current UTC time. JSON adds Unix seconds and milliseconds |
| `/uuid` | A fresh random version 4 UUID |
| `/status/<code>` | Answers with that HTTP status, to test how a client handles errors. Safe codes only (200 to 204, 400 to 406, 408 to 410, 418, 422, 429, 451, 500 to 504). It never redirects |

Each service has three forms: `/ip` (a page in a browser, plain text in a program), `/ip/plain` (plain text, one line, ending in a newline) and `/ip/json` (one JSON object). A program that asks for `/ip` with no `/plain` still gets plain text, because only browsers ask for a web page. Use the explicit `/plain` and `/json` forms in scripts.

## Limits

Each address (one IPv4 address, or one IPv6 /64 network) may make 60 requests a minute for plain text and JSON (a burst of 30 at once), and 30 a minute for pages (a burst of 15). Over the limit, Echo answers `429` with a `Retry-After` header. Pages do not need scripts, and other websites may ask Echo for their own visitor's address (plain and JSON answers allow cross-site reads, without credentials).

## Errors

The HTTP status is the same in every form. Plain text says `error: ` and a reason. JSON says `{"error": {"status": 404, "message": "not found"}}`.

## Privacy

Echo answers from what your request carries and keeps none of it: the app writes no request log and has no database. It sets no cookies, loads nothing from other sites and shows no adverts. Two things exist besides the answer: a request counter for your address (or IPv6 /64) in the app's memory, which is never written anywhere, is lost when Echo restarts, and drops an idle entry once that limiter (pages, or plain text and JSON) has seen 512 requests, so a quiet service can keep an idle entry until then or until a restart; and Starhold's web server's anonymous daily tally of method, host, path and status, which holds no address and no headers. Separately, when the web server itself logs an error, that error log can hold an address for up to 30 days. See the [Privacy Policy](https://starhold.dev/legal/privacy) for how Starhold handles data in general.
