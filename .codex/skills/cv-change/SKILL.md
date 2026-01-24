---
name: codevision-change
description: Handle a requirements change mid-stream: pause implementation, update specs, re-scope tasks, and log decisions.
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

Process:
1) Summarize the requested change and which artifacts it affects.
2) Update the relevant feature spec (or master spec) draft first.
3) Recalculate tasks/checkpoints impacted and mark what becomes obsolete.
4) Log the decision in `.cv/ledger/decisions.md` after approval.

Output:
- Clear “what changes now / what stays” summary.
- Recommend next: `$codevision-tasks` or `$codevision-implement`.
