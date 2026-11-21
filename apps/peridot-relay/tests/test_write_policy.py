"""Tests for write-policy.py (PERI-14). Shapes mirror the Peridot app's own event builders (Period repo, origin/master
e1eb7be): cycle_sync_broadcaster, heartbeat_service, relay_wipe, circle_consent_transport, circle_invite_service,
circle_key_service, data_deletion_service, report_sender, relay_pool (probe) and tool/relay_probe.dart."""
import importlib.util
import io
import json
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("write_policy", HERE / "write-policy.py")
wp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wp)

ME = "a" * 64
OTHER = "b" * 64
CIRCLE = "0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0"


def ev(kind, tags, pubkey=ME, eid="1" * 64):
    return {"id": eid, "pubkey": pubkey, "created_at": 1, "kind": kind, "tags": tags, "content": "", "sig": "0" * 128}


PERIDOT_EVENTS = {
    "entry": ev(30078, [["h", CIRCLE], ["circle", CIRCLE], ["d", "peridot:e:" + "c" * 64]]),
    "legacy entry tag": ev(30078, [["h", CIRCLE], ["d", "peridot:entry:x"]]),
    "heartbeat": ev(30078, [["d", "peridot:heartbeat:" + CIRCLE], ["h", CIRCLE], ["circle", CIRCLE], ["t", "heartbeat"]]),
    "wipe marker": ev(30078, [["d", "peridot:wiped"]]),
    "relay_probe.dart": ev(30078, [["d", "peridot:probe:1700000000000"], ["circle", "probe"], ["p", ME]]),
    "problem report": ev(30078, [["d", "9f" * 16], ["p", wp.REPORT_PUBKEY], ["expiration", "1"], ["nonce", "5", "12"]]),
    "vote": ev(30402, [["d", "peridot:vote:x"], ["consent", "x"], ["h", CIRCLE], ["circle", CIRCLE], ["vote", "approve"],
                       ["b", "e" * 64], ["p", OTHER]]),
    "accept": ev(30402, [["e", "f" * 64], ["h", CIRCLE], ["circle", CIRCLE], ["p", OTHER]]),
    "member list": ev(30403, [["d", "peridot:circle:" + CIRCLE], ["h", CIRCLE], ["circle", CIRCLE]]),
    "join request": ev(30404, [["p", OTHER], ["h", CIRCLE], ["circle", CIRCLE]]),
    "approval request": ev(30405, [["d", "peridot:consent:x"], ["h", CIRCLE], ["circle", CIRCLE], ["p", OTHER]]),
    "leave": ev(30406, [["d", "peridot:leave:" + CIRCLE], ["h", CIRCLE], ["circle", CIRCLE]]),
    "key delivery": ev(1059, [["p", OTHER], ["h", CIRCLE], ["circle", CIRCLE], ["sender", ME], ["name", "zz"]]),
    "delete all data": ev(5, [["a", f"30078:{ME}:peridot:e:{'c' * 64}"], ["a", f"30403:{ME}:peridot:circle:{CIRCLE}"],
                              ["k", "30078"], ["k", "30403"]]),
    "delete by id": ev(5, [["e", "f" * 64]]),
    "test relay": ev(27078, [["t", "peridot-probe"]]),
}

NOT_PERIDOT = {
    "text note": ev(1, []),
    "metadata": ev(0, []),
    "dm": ev(4, [["p", OTHER]]),
    "30078 of another app": ev(30078, [["d", "someapp:settings"]]),
    "30078 without d": ev(30078, []),
    "30078 report to another key": ev(30078, [["d", "x"], ["p", OTHER]]),
    "circle kind without h": ev(30403, [["d", "peridot:circle:x"]]),
    "circle kind with empty h": ev(30404, [["h", ""], ["p", OTHER]]),
    "gift wrap without h": ev(1059, [["p", OTHER]]),
    "gift wrap with bad p": ev(1059, [["p", "nothex"], ["h", CIRCLE]]),
    "delete naming kind 1": ev(5, [["a", f"1:{ME}:x"]]),
    "delete naming another author": ev(5, [["a", f"30078:{OTHER}:peridot:e:x"]]),
    "delete with other tags": ev(5, [["e", "f" * 64], ["p", OTHER]]),
    "delete with no target": ev(5, [["k", "30078"]]),
    "delete with k of kind 1": ev(5, [["e", "f" * 64], ["k", "1"]]),
    "other ephemeral": ev(27078, [["t", "other"]]),
    "kind as string": ev("30078", [["d", "peridot:e:x"]]),
    "kind as bool": ev(True, [["d", "peridot:e:x"]]),
    "malformed tags": ev(30078, ["d", 7, None, ["d"]]),
}


def unlimited():
    return wp.Limiter(key_burst=1e9, key_rate=1e9, all_burst=1e9, all_rate=1e9)


@pytest.mark.parametrize("name", PERIDOT_EVENTS)
def test_peridot_shapes_are_accepted(name):
    assert wp.decide({"type": "new", "event": PERIDOT_EVENTS[name]}, unlimited(), 0.0) == ("accept", "")


@pytest.mark.parametrize("name", NOT_PERIDOT)
def test_everything_else_is_rejected(name):
    action, msg = wp.decide({"type": "new", "event": NOT_PERIDOT[name]}, unlimited(), 0.0)
    assert action == "reject" and msg.startswith("blocked:")


def test_unknown_request_type_is_rejected():
    assert wp.decide({"type": "other", "event": PERIDOT_EVENTS["entry"]}, unlimited(), 0.0)[0] == "reject"


def test_per_key_bucket_then_refill():
    lim = wp.Limiter(key_burst=3, key_rate=1.0, all_burst=1e9, all_rate=1e9)
    assert [lim.allow(ME, 0.0) for _ in range(4)] == [True, True, True, False]
    assert lim.allow(OTHER, 0.0)  # another key is not affected
    assert lim.allow(ME, 1.0) and not lim.allow(ME, 1.0)


def test_shared_bucket_caps_many_keys():
    lim = wp.Limiter(key_burst=10, key_rate=1.0, all_burst=5, all_rate=0.0)
    results = [lim.allow(f"{i:064x}", 0.0) for i in range(7)]
    assert results == [True] * 5 + [False, False]


def test_tracked_key_table_is_bounded_and_fails_closed():
    lim = wp.Limiter(key_burst=2, key_rate=0.001, all_burst=1e9, all_rate=1e9, max_keys=3)
    for i in range(3):
        assert lim.allow(f"{i:064x}", 0.0)
    assert not lim.allow("f" * 64, 1.0)  # table full and nothing has aged out: new keys are refused
    assert lim.allow("f" * 64, 10_000.0)  # the old buckets are full again, so they are forgotten


def test_rate_limit_message():
    lim = wp.Limiter(key_burst=1, key_rate=0.0, all_burst=1e9, all_rate=1e9)
    e = {"type": "new", "event": PERIDOT_EVENTS["entry"]}
    assert wp.decide(e, lim, 0.0) == ("accept", "")
    assert wp.decide(e, lim, 0.0) == ("reject", wp.REJECT_RATE)


def test_main_answers_each_line_with_the_event_id():
    lines = [json.dumps({"type": "new", "event": PERIDOT_EVENTS["entry"] | {"id": "2" * 64}}),
             "not json",  # no answer: strfry times out and rejects
             json.dumps({"type": "new", "event": NOT_PERIDOT["text note"] | {"id": "3" * 64}})]
    out = io.StringIO()
    wp.main(stdin=io.StringIO("\n".join(lines) + "\n"), stdout=out, clock=lambda: 0.0)
    answers = [json.loads(x) for x in out.getvalue().splitlines()]
    assert answers == [{"id": "2" * 64, "action": "accept", "msg": ""},
                       {"id": "3" * 64, "action": "reject", "msg": wp.REJECT_KIND}]


def test_a_bug_in_decide_rejects(monkeypatch):
    def boom(*_a, **_k):
        raise RuntimeError("bug")
    monkeypatch.setattr(wp, "decide", boom)
    out = io.StringIO()
    wp.main(stdin=io.StringIO(json.dumps({"type": "new", "event": PERIDOT_EVENTS["entry"]}) + "\n"), stdout=out,
            clock=lambda: 0.0)
    assert json.loads(out.getvalue())["action"] == "reject"


def test_policy_never_writes_to_stderr(capsys):
    wp.main(stdin=io.StringIO(json.dumps({"type": "new", "event": PERIDOT_EVENTS["entry"]}) + "\n"),
            stdout=io.StringIO(), clock=lambda: 0.0)
    assert capsys.readouterr().err == ""


def test_report_key_matches_the_collector_readme():
    readme = (HERE.parents[1] / "ops/peridot-feedback/README.md")
    if not readme.exists():  # the public mirror carries apps/ only
        pytest.skip("ops/ is not in this checkout")
    assert wp.REPORT_PUBKEY in readme.read_text(encoding="utf-8")
