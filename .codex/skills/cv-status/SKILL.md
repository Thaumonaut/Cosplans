---
name: codevision-status
description: Rehydrate the project state from .cv/ artifacts and summarize what is true, what is next, and what is blocked.
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
- `.cv/status.json` if present
- `.cv/spec/master.md`, recent decisions, tasks files

Process:
1) Summarize: current phase, active work, open blockers, next recommended action.
2) If artifacts contradict, point it out and recommend the safest resolution (do not guess).

Output:
- A short “current state” recap and one recommended next skill.
