#!/usr/bin/python3 -IB
"""Write policy for the Starhold Peridot relay (strfry plugin, PERI-14).

strfry starts this once and keeps it running. For every event a client tries to store it writes one JSON line to our
stdin ({"type": "new", "event": {...}, ...}) and waits for one JSON line back: {"id", "action", "msg"}. strfry treats
a crash, a bad answer or no answer within relay.writePolicy.timeoutSeconds as "reject" ("error: internal error"), so
every failure here ends in a rejected event: the policy fails closed.

What is accepted: only the event shapes the Peridot app sends (read from the Peridot source, PERI-14 comment 2).
Everything else is rejected, so this never becomes a general-purpose public relay.

  kind 30078  "d" tag starting "peridot:" (entries, heartbeats, the wipe marker, the relay probe),
              or a "p" tag equal to Starhold's problem-report key (reports use a random "d")
  kind 30402-30406  votes/accepts, member lists, join requests, approval requests, leave notices: an "h" tag
  kind 1059   circle key delivery: a "p" and an "h" tag
  kind 5      deletion request: only "a"/"e"/"k" tags, every "a" names a Peridot kind and the author's own key
  kind 27078  the app's "Test relay" message (ephemeral): tag "t" = "peridot-probe"

Limits: a token bucket per public key and one shared by everyone. The relay never sees client IP addresses (Caddy
does not pass them on and strfry's realIpHeader is empty), so there are no per-IP limits. Sizes and tag counts are
capped by strfry itself (strfry.conf, events.*).

Nothing is logged. stderr would land in strfry's log, so this file never prints keys, tags or content.
"""
import json
import os
import sys
import time

# Starhold's problem-report public key (ops/peridot-feedback README; the app's PERIDOT_REPORT_PUBKEY). Public by design.
REPORT_PUBKEY = "3dfe894f845dd804cb8c1b0df0a5eec80fbc147cf0a21affa423633758d8606a"
CIRCLE_KINDS = frozenset({30402, 30403, 30404, 30405, 30406})
# Kinds a Peridot deletion request may name (in "a" addresses and "k" tags).
DELETABLE_KINDS = frozenset({30078, 1059}) | CIRCLE_KINDS
PROBE_KIND = 27078
HEX = frozenset("0123456789abcdef")

REJECT_KIND = "blocked: this relay accepts only Peridot circle events"
REJECT_RATE = "rate-limited: slow down"


def _env_float(name, default):
    try:
        return float(os.environ.get(name, default))
    except ValueError:
        return float(default)


# Per key: a full bucket of 10,000 lets the one-time upgrade re-send every entry of a heavy user (about 1,500
# entries in 3 circles) in one go; after that 1 event per second (86,400 a day) is far above normal use.
KEY_BURST = _env_float("PERIDOT_RELAY_KEY_BURST", 10000)
KEY_RATE = _env_float("PERIDOT_RELAY_KEY_RATE", 1.0)
# Everyone together: a ceiling for a flood from many fresh keys. strfry's dbParams.mapsize caps the disk as well.
ALL_BURST = _env_float("PERIDOT_RELAY_ALL_BURST", 50000)
ALL_RATE = _env_float("PERIDOT_RELAY_ALL_RATE", 100.0)
MAX_TRACKED_KEYS = 200000


def _tags(event, name):
    return [t[1] for t in event.get("tags", []) if isinstance(t, list) and len(t) >= 2 and t[0] == name
            and isinstance(t[1], str)]


def _is_hex64(s):
    return isinstance(s, str) and len(s) == 64 and set(s) <= HEX


def shape_ok(event):
    """True if the event has one of the shapes Peridot sends."""
    kind = event.get("kind")
    if not isinstance(kind, int) or isinstance(kind, bool):
        return False
    if kind == 30078:
        if any(d.startswith("peridot:") for d in _tags(event, "d")):
            return True
        return REPORT_PUBKEY in _tags(event, "p")
    if kind in CIRCLE_KINDS:
        return any(h for h in _tags(event, "h"))
    if kind == 1059:
        return any(_is_hex64(p) for p in _tags(event, "p")) and any(h for h in _tags(event, "h"))
    if kind == 5:
        names = [t[0] for t in event.get("tags", []) if isinstance(t, list) and t and isinstance(t[0], str)]
        if not names or any(n not in ("a", "e", "k") for n in names):
            return False
        addresses, ids = _tags(event, "a"), _tags(event, "e")
        if not addresses and not ids:
            return False
        for a in addresses:
            parts = a.split(":", 2)
            if len(parts) != 3 or not parts[0].isdigit() or int(parts[0]) not in DELETABLE_KINDS:
                return False
            if parts[1] != event.get("pubkey"):
                return False
        return all(k.isdigit() and int(k) in DELETABLE_KINDS for k in _tags(event, "k"))
    if kind == PROBE_KIND:
        return "peridot-probe" in _tags(event, "t")
    return False


class Bucket:
    __slots__ = ("tokens", "stamp")

    def __init__(self, tokens, stamp):
        self.tokens = tokens
        self.stamp = stamp


class Limiter:
    """Token buckets: one per public key plus one shared. Memory only; a restart forgets everything."""

    def __init__(self, key_burst=KEY_BURST, key_rate=KEY_RATE, all_burst=ALL_BURST, all_rate=ALL_RATE,
                 max_keys=MAX_TRACKED_KEYS):
        self.key_burst, self.key_rate = key_burst, key_rate
        self.all_burst, self.all_rate = all_burst, all_rate
        self.max_keys = max_keys
        self.keys = {}
        self.everyone = None

    @staticmethod
    def _take(bucket, burst, rate, now):
        bucket.tokens = min(burst, bucket.tokens + (now - bucket.stamp) * rate)
        bucket.stamp = now
        if bucket.tokens >= 1:
            bucket.tokens -= 1
            return True
        return False

    def _prune(self, now):
        # Drop keys whose bucket would be full again by now: forgetting them changes nothing.
        full_after = self.key_burst / self.key_rate if self.key_rate > 0 else float("inf")
        self.keys = {k: b for k, b in self.keys.items() if now - b.stamp < full_after}
        if len(self.keys) >= self.max_keys:  # still too many: refuse new keys until they age out (fails closed)
            return False
        return True

    def allow(self, pubkey, now):
        if self.everyone is None:
            self.everyone = Bucket(self.all_burst, now)
        bucket = self.keys.get(pubkey)
        if bucket is None:
            if len(self.keys) >= self.max_keys and not self._prune(now):
                return False
            bucket = self.keys[pubkey] = Bucket(self.key_burst, now)
        # The per-key bucket is checked first so one noisy key cannot drain the shared one.
        if not self._take(bucket, self.key_burst, self.key_rate, now):
            return False
        return self._take(self.everyone, self.all_burst, self.all_rate, now)


def decide(request, limiter, now):
    """Return (action, msg) for one strfry request. Any surprise is a rejection."""
    event = request.get("event")
    if request.get("type") != "new" or not isinstance(event, dict):
        return "reject", REJECT_KIND
    if not shape_ok(event):
        return "reject", REJECT_KIND
    if not limiter.allow(event.get("pubkey"), now):
        return "reject", REJECT_RATE
    return "accept", ""


def main(stdin=sys.stdin, stdout=sys.stdout, clock=time.monotonic):
    limiter = Limiter()
    for line in stdin:
        try:
            request = json.loads(line)
            event_id = request["event"]["id"]
        except (ValueError, KeyError, TypeError):
            # No id to answer with: strfry times out and rejects the event (fail closed).
            continue
        try:
            action, msg = decide(request, limiter, clock())
        except Exception:  # noqa: BLE001 - any bug must reject, never accept
            action, msg = "reject", "error: policy failure"
        stdout.write(json.dumps({"id": event_id, "action": action, "msg": msg}, separators=(",", ":")) + "\n")
        stdout.flush()


if __name__ == "__main__":
    main()
