# /cv.review [FEAT-###]

Purpose
- Verify implementation against acceptance criteria and record results.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- List acceptance criteria being checked.
- Propose verification steps and expected outcomes.
- Ask the user to run tests if you can’t.
- Record results in tasks and decisions.
- If failures: recommend `/cv.bug` (implementation issue) or `/cv.replan` (spec issue).

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


