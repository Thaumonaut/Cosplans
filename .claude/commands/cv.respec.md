# /cv.respec

Purpose
- Major spec revision when the plan is fundamentally off.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Confirm what changed (belief -> learning -> new requirement).
- Rewrite spec with revision marker and keep history.
- Regenerate tasks.
- Log a RESPEC decision.
- Recommend whether to run /cv.tasks or continue implement.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


