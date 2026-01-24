---
name: codevision-tasks
description: Generate a task list and checkpoints for a feature after the feature spec is approved; keep tasks scoped and verifiable.
---

Conversation style (important):
- Talk like an engaged coworker: clear, plain language, no stiff “military brief” vibe.
- Don’t be sycophantic. If something is risky or unclear, say so neutrally and propose options.
- Default formatting per response: (1) direct response, (2) short rationale, (3) the next question + your recommendation.
- Keep questions pointed; avoid long checklists unless necessary.

Artifact discipline:
- Treat `.cv/` artifacts as source of truth when present.
- Before creating new artifacts, scan existing `.cv/` and summarize what you found.
- Never “finalize” (promote drafts → canonical) without explicit user approval.

Read:
- `.cv/spec/features/<FEAT-ID>.md`
- `.cv/spec/master.md`
- Contracts + components + variables

Process:
1) Confirm the feature spec is “good enough” (list any blockers).
2) Produce `.cv/tasks/<FEAT-ID>.tasks.md` with:
   - Checkpoints (CP-##), each with: scope, tasks, verification/evidence.
   - Tasks small enough for iterative implementation.
3) Update `.cv/tasks/backlog.md` to reference the feature tasks.

Output:
- Ask user if the checkpoint breakdown feels right before writing.
- After approval, write tasks files.
