# /cv.change

Purpose
- Declare an intentional change of direction so we don’t drift silently.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Ask what changed and why (one question).
- Classify: task tweak | replan | respec | contract change.
- Recommend the next command (“My vote: …”) and why.
- Append a change record to `.cv/ledger/changes.md` (create if missing).

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


