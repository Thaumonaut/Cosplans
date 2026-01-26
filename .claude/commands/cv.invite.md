# /cv.invite <stakeholder>

Purpose
- Codify stakeholder viewpoints to consult during planning.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Artifacts
- `.cv/stakeholders/<slug>.md`

Template
```md
# Stakeholder: <Name>

## Goals
-

## Pain points
-

## Must-not-break
-

## What “good” looks like
-
```

Behavior
- Ask for 2–4 bullets.
- Propose FILE block to create/update the file.
- Recommend when to consult them (scaffold/feature/design).

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


