# /cv.replan

Purpose
- Light plan adjustment based on implementation learnings.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Summarize the mismatch.
- Ask one clarifying question.
- Propose the smallest spec/tasks change to fix it.
- Log a replan decision and recommend next steps.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


