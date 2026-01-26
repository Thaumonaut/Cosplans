# /cv.continue

Purpose
- Resume work after a pause or an unclean interruption.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Behavior
1) Rehydrate from `.cv/status.json`.
- If paused=true, restate the stored context.
- If not paused but work seems mid-flight, treat as “unclean stop” and propose options.

2) Ask one confirmation:
- “Still working on X, or did priorities change?”

3) Recommend the next command and why.

Unclean stop options (provide 2–3)
- Resume where we left off (My vote if scope unchanged)
- Replan before continuing (My vote if implementation revealed confusion)
- Park/rollback and pick a new scope

