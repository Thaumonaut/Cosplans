# /cv.vars

Purpose
- Update shared tokens/naming rules for consistency.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Ask what to add/change (one question).
- Propose additions with clear names and intended use.
- Update `.cv/variables/tokens.md` and/or `.cv/variables/naming.md`.
- If code needs updating, recommend /cv.replan or /cv.tasks.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


