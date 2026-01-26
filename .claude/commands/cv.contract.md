# /cv.contract

Purpose
- Propose and record a change to a contract (constitution).

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Identify the contract file(s).
- Ask for rationale and exact requested change (one question).
- Explain impact briefly.
- Propose FILE updates.
- Require explicit user approval before treating it as active.
- Log decision/approval.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


