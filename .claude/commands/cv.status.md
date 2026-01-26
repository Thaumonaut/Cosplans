# /cv.status

Purpose
- Rehydrate and summarize current project truth from `.cv/` artifacts.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Summarize: phase, active scope, what’s approved, what’s in progress, and what’s blocked.
- If status.json is missing/outdated, propose a minimal update to align it with spec/tasks.
- End with 2–3 recommended next commands, and “My vote:” for the best one.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


