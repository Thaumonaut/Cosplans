# /cv.component

Purpose
- Add or revise a reusable component deliberately to prevent UI drift.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Confirm reuse goal and proposed API.
- Update `.cv/components/registry.md` with purpose + usage examples + constraints.
- Recommend whether to create tasks for implementation.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


