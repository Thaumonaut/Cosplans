---
name: codevision-init
description: Initialize a CodeVision workspace by creating a minimal .cv/ structure and starter artifacts (contracts, registries, ledgers).
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

Read first:
- Check if `.cv/` exists. If it does, summarize what’s there and propose a non-destructive update.
- If it does not, propose creating the folder structure.

Default .cv/ skeleton (create if missing, do not overwrite without approval):
- `.cv/contracts/` (product, architecture, design, security)
- `.cv/components/registry.md`
- `.cv/variables/tokens.md` and `.cv/variables/naming.md`
- `.cv/spec/master.md` (empty starter)
- `.cv/ledger/decisions.md` and `.cv/ledger/changes.md`
- `.cv/tasks/backlog.md`
- `.cv/status.json` (minimal fields)

Output:
- A short plan of what you will create.
- Ask: “Want me to write these starter artifacts now?” and wait.
- After approval, write the files.

Safety:
- Never invent stack/library choices; if missing, ask in `$codevision-scaffold`.
