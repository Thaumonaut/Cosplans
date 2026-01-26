# /cv.bug

Purpose
- Debug and fix a bug with minimal scope change.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
- Ask for repro steps + expected vs actual + error logs.
- Propose a hypothesis and a narrow fix.
- Implement as FILE blocks.
- Add/adjust a test when reasonable.
- Recommend `/cv.review`.

Rule
- If this is actually a spec gap, recommend `/cv.replan` instead.

