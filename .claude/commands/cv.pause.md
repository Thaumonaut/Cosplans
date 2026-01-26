# /cv.pause

Purpose
- Mark the current work as intentionally paused so we can resume deterministically.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Briefly summarize what we were doing and what remains.
- Propose an update to `.cv/status.json` setting `paused=true` with a `pause` object.
- Append a PAUSE entry to `.cv/ledger/decisions.md`.
- Ask at most one question: the pause reason (if unknown).

Recommended status.json pause shape
```json
{
  "paused": true,
  "pause": {
    "timestamp_utc": "<ISO8601>",
    "reason": "<short>",
    "last_command": "/cv.*",
    "active_scope": "<project|FEAT-###|bug>",
    "last_focus": "<1 sentence>",
    "next_step": "<1 sentence>"
  }
}
```

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


