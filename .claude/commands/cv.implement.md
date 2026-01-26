# /cv.implement [FEAT-###]

Purpose
- Implement the next ready task(s) from tasks, staying inside approved scope.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Rules
- No silent scope change.
- If spec gaps appear, recommend `/cv.replan` or `/cv.respec` and stop.

Behavior
- Pick the next task.
- Propose a small slice.
- Output code changes as FILE blocks.
- Recommend `/cv.review` when verification is ready.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


