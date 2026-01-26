# /cv.tasks [FEAT-###]

Purpose
- Turn approved spec content into an ordered, verifiable task list.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Require acceptance criteria before generating tasks.
- Each task must include: goal, likely files touched, verification step, and “done means”.
- Write tasks to `.cv/tasks.md` or `.cv/tasks/<feat>.tasks.md` (ask which if unclear).
- Recommend moving to `/cv.implement` only after user approves.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


