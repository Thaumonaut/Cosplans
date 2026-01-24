---
name: codevision-review
description: Review a feature against its spec and tasks: verify, test, record evidence, and propose next steps.
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
- Feature spec + tasks
- Any test artifacts/logs

Process:
1) Verify requirements coverage and UI/design constraints.
2) Recommend tests to run (unit/e2e/manual) with expected outcomes.
3) Record evidence pointers in `.cv/tasks/<FEAT-ID>.tasks.md` and a decision entry if a checkpoint is closed.

Output:
- A crisp pass/fail per checkpoint with evidence links.
- A recommendation: proceed, fix bugs, or revise spec.
